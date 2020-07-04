const User = require("../models/User");
const Admin = require("../models/Admin")
const Payment = require("../models/Payment")
const Dispatcher = require("../models/Dispatcher")
const Address = require("../models/Address")
const Remark = require("../models/Remark")
const Category = require("../models/Category")
const Product = require("../models/Product")
const ProductBrand = require("../models/ProductBrand")
const ProductImages = require("../models/ProductImages")
const Order = require("../models/Order")
const {calculateDistance} = require("../middleware/helpers")
const sharp = require("sharp")
const shortid = require('shortid');
const path = require("path");
const fs = require("fs");
const _ = require('lodash')
const Fawn = require("fawn");
const task = Fawn.Task();
const perPage = 10;

exports.order = async(req,res,next) => {
    const order = await Order.findById(req.params.order_id)
        .populate('user','-password -salt -resetPasswordLink -emailVerifyLink')
        .populate('payment','-user -order')
        .populate('product','_id slug name slug category brand return isVerified isDeleted warranty quantity')
        .populate({
            path: 'soldBy',
            select: 'name shopName address isVerified isBlocked holidayMode photo email',
            populate: {
                path: 'adminWareHouse',
                model: 'adminwarehouse'
            }
        })
        .populate('address')
        .populate({
            path: 'status.cancelledDetail.remark',
            model: 'remark'
        })
        //not working..
        // .populate({
        //     path: 'status.cancelledDetail.cancelledBy',
        //     model: 'admin',
        //     select: 'name email phoneno'
        // })
        .populate({
            path: 'status.cancelledDetail.cancelledBy',
            model: 'user',
            select: 'name email'
        })
        .populate({
            path: 'status.dispatchedDetail.dispatchedBy',
            model: 'dispatcher',
            select:'name email address phone'
        })
        .populate({
            path: 'status.returnedDetail.returneddBy',
            model: 'dispatcher',
            select: 'name email address phone'
        })
        .populate({
            path: 'status.returnedDetail.remark',
            model: 'remark',
        })
    if (!order) {
        return res.status(404).json({error:"Order not found"})
    }
    req.order = order
    next();
}

exports.userOrder = (req,res) => {
    let order = req.order
    if (order.user._id.toString() !== req.user._id.toString()) {
        return res.status(401).json({error:"Unauthorized User."})
    }
    order.soldBy = undefined
    order.status.returnedDetail.returneddBy = undefined
    order.status.dispatchedDetail.dispatchedBy = undefined
    order.product.isVerified = undefined
    order.product.isDeleted = undefined
    res.json(order)
}

exports.adminOrder = (req, res) => {
    let order = req.order
    if (order.soldBy._id.toString() !== req.profile._id.toString()) {
        return res.status(401).json({ error: "Unauthorized Admin." })
    }
    order.soldBy = undefined
    res.json(order)
}

exports.dispatcherOrder = (req, res) => {
    let order = req.order
    res.json(order)
}

exports.calculateShippingCharge = async(req,res) => {
    const superadmin = await Admin.findOne({ role: 'superadmin' })
    if (!superadmin) {
        return res.status(404).json({ error: 'Cannot find shipping rate' })
    }
    const shippingRate = superadmin.shippingRate
    const systemGeoCoordinates = superadmin.geolocation.coordinates
    const userGeoCoordinates = req.user.geolocation.coordinates
    const distance = calculateDistance(
        systemGeoCoordinates[0],
        systemGeoCoordinates[1],
        userGeoCoordinates[0],
        userGeoCoordinates[1])
    let shippingCharge = distance * shippingRate
    shippingCharge = Math.round(shippingCharge)
    if (shippingCharge < 10) {
        return res.json(0)
    }
    let rem = shippingCharge % 10
    if (rem < 3) return res.json(shippingCharge - rem)
    if (rem < 7) return res.json(shippingCharge - rem + 5)
    if (rem >= 7) return res.json(shippingCharge + (10 - rem))
    
}

exports.createOrder = async (req, res) => {
    const product = await Product.findOne({ 
        slug: req.body.p_slug, 
        isVerified: { "$ne": null }, 
        isDeleted: null
    }).populate('soldBy','isBlocked isVerified holidayMode')
    const isAdminOnHoliday = (first, last) => {
        let week = [0, 1, 2, 3, 4, 5, 6]
        let firstIndex = week.indexOf(first);
        week = week.concat(week.splice(0, firstIndex))//Shift array so that first day is index 0
        let lastIndex = week.indexOf(last)//Find last day
        //Cut from first day to last day nd check with today day
        return week.slice(0, lastIndex + 1).some(d => d === new Date().getDay());

    }
    if (!product || product.soldBy.isBlocked || !product.soldBy.isVerified || isAdminOnHoliday(product.soldBy.holidayMode.start, product.soldBy.holidayMode.end)) {
        return res.status(404).json({ error: "Product not found." })
    }
    if (product.quantity === 0 ) {
        return res.status(403).json({error:"Product is out of the stock."})
    }
    if (product.quantity < req.body.quantity) {
        return res.status(403).json({error:`There are only ${product.quantity} products available.`})
    }
    let address = await Address.findOne({ user: req.user._id, label:'ship-to'})
    if (!address) {
        return res.status(404).json({error:"Shipping address is not available."})
    }
    // new order
    const newOrder = new Order()
    newOrder.user = req.user._id
    newOrder.product = product._id
    newOrder.soldBy = product.soldBy
    newOrder.quantity = req.body.quantity
    newOrder.productAttributes = req.body.productAttributes
    newOrder.address = address._id
    const status = {
        currentStatus: 'active',
        activeDate: Date.now()
    }
    newOrder.status = status

    // new payment
    const newPayent = new Payment({
        user: req.user._id,
        order: newOrder._id,
        method: req.body.method,
        shippingCharge: req.body.shippingCharge,
        transactionCode: shortid.generate(),
        amount: Math.round((product.price - (product.price * (product.discountRate / 100))) * newOrder.quantity),
        from: req.user.phone
    })
    newOrder.payment = newPayent._id

    // update product 
    const updateProduct = product.toObject()
    updateProduct.quantity = updateProduct.quantity - newOrder.quantity
    const results = await task
        .save(newOrder)
        .save(newPayent)
        .update(product,updateProduct)
        .options({viaSave:true})
        .run({ useMongoose: true })
    res.json({order:results[0],payment:results[1]})
}

exports.userOrders = async(req,res) => {
    const page = +req.query.page || 1
    const perPage = +req.query.perPage || 10
    let orders = await Order.find({user:req.user._id})
        .populate('product', 'name slug')
        .skip(perPage * page - perPage)
        .limit(perPage)
        .lean()
        .sort({ created: -1 })
    // if (!orders.length) {
    //     return res.status(404).json({error: "No orders found"})
    // }
    const totalCount = await Order.countDocuments({ user: req.user._id })
    res.json({orders,totalCount})
}
exports.userActiveOrders = async (req, res) => {
    const page = +req.query.page || 1
    const perPage = +req.query.perPage || 10
    let orders = await Order.find({ user: req.user._id ,'status.currentStatus':'active'})
        .select('product quantity status')
        .populate('product', 'name slug')
        .skip(perPage * page - perPage)
        .limit(perPage)
        .lean()
        .sort({ created: -1 })
    // if (!orders.length) {
    //     return res.status(404).json({ error: "No active orders found" })
    // }
    const totalCount = await Order.countDocuments({ user: req.user._id, 'status.currentStatus': 'active' })
    res.json({ orders, totalCount })
}

exports.userCompleteOrders = async (req, res) => {
    const page = +req.query.page || 1
    const perPage = +req.query.perPage || 10
    let orders = await Order.find({ user: req.user._id, 'status.currentStatus': 'complete' })
        .select('product quantity status isPaid')
        .populate('product', 'name slug')
        .skip(perPage * page - perPage)
        .limit(perPage)
        .lean()
        .sort({ created: -1 })
    // if (!orders.length) {
    //     return res.status(404).json({ error: "No complete orders found" })
    // }
    const totalCount = await Order.countDocuments({ user: req.user._id, 'status.currentStatus': 'complete' })
    res.json({ orders, totalCount })
}

exports.userCancelOrders = async (req, res) => {
    const page = +req.query.page || 1
    const perPage = +req.query.perPage || 10
    let orders = await Order.find({ user: req.user._id, 'status.currentStatus': 'cancel' })
        .select('product quantity status')
        .populate('product', 'name slug')
        .skip(perPage * page - perPage)
        .limit(perPage)
        .lean()
        .sort({ created: -1 })
    // if (!orders.length) {
    //     return res.status(404).json({ error: "No cancel orders found" })
    // }
    const totalCount = await Order.countDocuments({ user: req.user._id, 'status.currentStatus': 'cancel' })
    res.json({ orders, totalCount })
}

exports.userReturnOrders = async (req, res) => {
    const page = +req.query.page || 1
    const perPage = +req.query.perPage || 10
    let orders = await Order.find({ user: req.user._id, 'status.currentStatus': 'return' })
        .select('product quantity status')
        .populate('product', 'name slug')
        .skip(perPage * page - perPage)
        .limit(perPage)
        .lean()
        .sort({ created: -1 })
    // if (!orders.length) {
    //     return res.status(404).json({ error: "No return orders found" })
    // }
    const totalCount = await Order.countDocuments({ user: req.user._id, 'status.currentStatus': 'return' })
    res.json({ orders, totalCount })
}

exports.adminOrders = async (req, res) => {
    const page = +req.query.page || 1
    const perPage = +req.query.perPage || 10
    let orders = await Order.find({ soldBy: req.profile._id })
        .select('product quantity status')
        .populate('product', 'name slug')
        .skip(perPage * page - perPage)
        .limit(perPage)
        .lean()
        .sort({ created: -1 })
    // if (!orders.length) {
    //     return res.status(404).json({ error: "No orders found" })
    // }
    const totalCount = await Order.countDocuments({ soldBy: req.profile._id })
    res.json({ orders, totalCount })
}

exports.adminActiveOrders = async (req, res) => {
    const page = +req.query.page || 1
    const perPage = +req.query.perPage || 10
    let orders = await Order.find({ soldBy: req.profile._id, 'status.currentStatus':'active' })
        .select('product quantity status')
        .populate('product', 'name slug')
        .skip(perPage * page - perPage)
        .limit(perPage)
        .lean()
        .sort({ created: -1 })
    // if (!orders.length) {
    //     return res.status(404).json({ error: "No active orders found" })
    // }
    const totalCount = await Order.countDocuments({ soldBy: req.profile._id, 'status.currentStatus': 'active' })
    res.json({ orders, totalCount })
}

exports.adminApproveOrders = async (req, res) => {
    const page = +req.query.page || 1
    const perPage = +req.query.perPage || 10
    let orders = await Order.find({ soldBy: req.profile._id, 'status.currentStatus': 'approve' })
        .select('product quantity status')
        .populate('product', 'name slug')
        .skip(perPage * page - perPage)
        .limit(perPage)
        .lean()
        .sort({ created: -1 })
    // if (!orders.length) {
    //     return res.status(404).json({ error: "No approve orders found" })
    // }
    const totalCount = await Order.countDocuments({ soldBy: req.profile._id, 'status.currentStatus': 'approve' })
    res.json({ orders, totalCount })
}

exports.adminDispatchOrders = async (req, res) => {
    const page = +req.query.page || 1
    const perPage = +req.query.perPage || 10
    let orders = await Order.find({ soldBy: req.profile._id, 'status.currentStatus': 'dispatch' })
        .select('product quantity status')
        .populate('product', 'name slug')
        .skip(perPage * page - perPage)
        .limit(perPage)
        .lean()
        .sort({ created: -1 })
    // if (!orders.length) {
    //     return res.status(404).json({ error: "No dispatch orders found" })
    // }
    const totalCount = await Order.countDocuments({ soldBy: req.profile._id, 'status.currentStatus': 'dispatch' })
    res.json({ orders, totalCount })
}

exports.adminCancelOrders = async (req, res) => {
    const page = +req.query.page || 1
    const perPage = +req.query.perPage || 10
    let orders = await Order.find({ soldBy: req.profile._id, 'status.currentStatus': 'cancel' })
        .select('product quantity status')
        .populate('product', 'name slug')
        .skip(perPage * page - perPage)
        .limit(perPage)
        .lean()
        .sort({ created: -1 })
    // if (!orders.length) {
    //     return res.status(404).json({ error: "No cancel orders found" })
    // }
    const totalCount = await Order.countDocuments({ soldBy: req.profile._id, 'status.currentStatus': 'cancel' })
    res.json({ orders, totalCount })
}

exports.adminCompleteOrders = async (req, res) => {
    const page = +req.query.page || 1
    const perPage = +req.query.perPage || 10
    let orders = await Order.find({ soldBy: req.profile._id, 'status.currentStatus': 'complete' })
        .select('product quantity status')
        .populate('product', 'name slug')
        .skip(perPage * page - perPage)
        .limit(perPage)
        .lean()
        .sort({ created: -1 })
    // if (!orders.length) {
    //     return res.status(404).json({ error: "No complete orders found" })
    // }
    const totalCount = await Order.countDocuments({ soldBy: req.profile._id, 'status.currentStatus': 'complete' })
    res.json({ orders, totalCount })
}

exports.adminToBeReturnOrders = async (req, res) => {
    const page = +req.query.page || 1
    const perPage = +req.query.perPage || 10
    let orders = await Order.find({ soldBy: req.profile._id, 'status.currentStatus': 'tobereturn' })
        .select('product quantity status')
        .populate('product', 'name slug')
        .skip(perPage * page - perPage)
        .limit(perPage)
        .lean()
        .sort({ created: -1 })
    // if (!orders.length) {
    //     return res.status(404).json({ error: "No to be return orders found" })
    // }
    const totalCount = await Order.countDocuments({ soldBy: req.profile._id, 'status.currentStatus': 'tobereturn' })
    res.json({ orders, totalCount })
}

exports.dispatcherToBeReturnOrders = async (req, res) => {
    const page = +req.query.page || 1
    const perPage = +req.query.perPage || 10
    let orders = await Order.find({'status.currentStatus': 'tobereturn' })
        .select('product quantity status')
        .populate('product', 'name slug')
        .skip(perPage * page - perPage)
        .limit(perPage)
        .lean()
        .sort({ created: -1 })
    // if (!orders.length) {
    //     return res.status(404).json({ error: "No to be return orders found" })
    // }
    const totalCount = await Order.countDocuments({ 'status.currentStatus': 'tobereturn' })
    res.json({ orders, totalCount })
}

exports.adminReturnOrders = async (req, res) => {
    const page = +req.query.page || 1
    const perPage = +req.query.perPage || 10
    let orders = await Order.find({ soldBy: req.profile._id, 'status.currentStatus': 'return' })
        .select('product quantity status')
        .populate('product', 'name slug')
        .skip(perPage * page - perPage)
        .limit(perPage)
        .lean()
        .sort({ created: -1 })
    // if (!orders.length) {
    //     return res.status(404).json({ error: "No return orders found" })
    // }
    const totalCount = await Order.countDocuments({ soldBy: req.profile._id, 'status.currentStatus': 'return' })
    res.json({ orders, totalCount })
}

exports.toggleOrderApproval = async(req,res) => {
    let order = req.order
    if (order.soldBy._id.toString() !== req.profile._id.toString()) {
        return res.status(401).json({error:"Unauthorized Admin"})
    }
    if (order.status.currentStatus !== 'active' && order.status.currentStatus !== 'approve') {
        return res.status(403).json({error:`This order cannot be approve or activate. Order current status is ${order.status.currentStatus}`})
    }
    if (order.status.currentStatus === 'active') {
        order.status.currentStatus = 'approve'
        order.status.approvedDate = Date.now()
        await order.save()
        order.soldBy = undefined
        return res.json(order)
    }
    if (order.status.currentStatus === 'approve') {
        order.status.currentStatus = 'active'
        order.status.approvedDate = null
        await order.save()
        order.soldBy = undefined
        return res.json(order)
    }
}

exports.orderCancelByAdmin = async (req, res) => {
    let order = req.order
    if (order.soldBy._id.toString() !== req.profile._id.toString()) {
        return res.status(401).json({ error: "Unauthorized Admin" })
    }
    if (order.status.currentStatus === 'complete' || order.status.currentStatus === 'return') {
        return res.status(403).json({ error: `This order is in ${order.status.currentStatus} state, cannot be cancelled.` })
    }
    if (order.status.currentStatus === 'cancel') {
        return res.status(403).json({ error: "Order has already been cancelled." })
    }
    const newRemark = new Remark({comment:req.body.remark})
    let updateOrder = order.toObject()
    updateOrder.status.currentStatus = 'cancel'
    updateOrder.status.cancelledDetail.cancelledDate = Date.now()
    updateOrder.status.cancelledDetail.cancelledBy = req.profile._id,
    updateOrder.status.cancelledDetail.remark = newRemark._id
    let product = await Product.findById(order.product._id)
    let updateProduct = product.toObject()
    updateProduct.quantity = order.quantity + product.quantity

    let results = await task
        .save(newRemark)
        .update(order,updateOrder)
        .options({ viaSave: true })
        .update(product, updateProduct)
        .options({ viaSave: true })
        .run({ useMongoose: true })
    results[1].soldBy = undefined
    return res.json(results)
}

exports.orderCancelByUser = async (req, res) => {
    let order = req.order
    if (order.user._id.toString() !== req.user._id.toString()) {
        return res.status(401).json({ error: "Unauthorized User" })
    }
    if (order.status.currentStatus === 'complete' || order.status.currentStatus === 'return') {
        return res.status(403).json({ error: `This order is in ${order.status.currentStatus} state, cannot be cancelled.` })
    }
    if (order.status.currentStatus === 'cancel') {
        return res.status(403).json({error:"Order has already been cancelled."})
    }
    const newRemark = new Remark({ comment: req.body.remark })
    let updateOrder = order.toObject()
    updateOrder.status.currentStatus = 'cancel'
    updateOrder.status.cancelledDetail.cancelledDate = Date.now()
    updateOrder.status.cancelledDetail.cancelledBy = req.user._id,
    updateOrder.status.cancelledDetail.remark = newRemark._id

    let product = await Product.findById(order.product._id)
    let updateProduct = product.toObject()
    updateProduct.quantity = order.quantity + product.quantity

    let results = await task
        .save(newRemark)
        .update(order, updateOrder)
        .options({ viaSave: true })
        .update(product, updateProduct)
        .options({ viaSave: true })
        .run({ useMongoose: true })
    results[1].soldBy = undefined
    results[1].user = undefined
    return res.json(results)
}

exports.toggleDispatchOrder = async (req,res) => {
    let order = req.order
    if (order.status.currentStatus !== 'approve' && order.status.currentStatus !== 'dispatch') {
        return res.status(403).json({error:`This order cannot be dispatched or rollback to approve state. Order current status is ${order.status.currentStatus}`})
    }
    if (order.status.currentStatus === 'approve') {
        order.status.currentStatus = 'dispatch'
        order.status.dispatchedDetail = {
            dispatchedDate:Date.now(),
            dispatchedBy: req.dispatcher._id
        }
        await order.save()
        return res.json(order)
    }
    if (order.status.dispatchedDetail.dispatchedBy._id.toString() !== req.dispatcher._id.toString()) {
        return res.status(401).json({ error: `Unauthorized Dispatcher.` })
    }
    if (order.status.currentStatus === 'dispatch') {
        order.status.currentStatus = 'approve'
        order.status.dispatchedDetail = {
            dispatchedDate: null,
            dispatchedBy: undefined
        }
        await order.save()
        return res.json(order)
    }
}

exports.approvedOrders = async(req,res) => {
    const page = +req.query.page || 1
    const perPage = +req.query.perPage || 10
    let orders = await Order.find({'status.currentStatus':'approve'})
        .skip(perPage * page - perPage)
        .limit(perPage)
        .lean()
        .sort({ created: -1 })
    // if (!orders.length) {
    //     return res.status(404).json({error: "No orders are ready to ship."})
    // }
    const totalCount = await Order.countDocuments({ 'status.currentStatus': 'approve' })
    res.json({ orders, totalCount })
}

exports.toggleCompleteOrder = async (req, res) => {
    let order = req.order
    if (order.status.currentStatus !== 'complete' && order.status.currentStatus !== 'dispatch') {
        return res.status(403).json({ error: `This order cannot be completed or rollback to dispatch state. Order current status is ${order.status.currentStatus}` })
    }
    if (order.status.currentStatus === 'dispatch') {
        order.status.currentStatus = 'complete'
        order.status.completedDate = Date.now()
        order.isPaid = true
        await order.save()
        return res.json(order)
    }
    if (order.status.currentStatus === 'complete') {
        order.status.currentStatus = 'dispatch'
        order.status.completedDate = null
        order.isPaid = false
        await order.save()
        return res.json(order)
    }
}

exports.returnOrder = async (req, res) => {
    let order = req.order
    if (order.status.currentStatus !== 'tobereturn') {
        return res.status(403).json({ error: `This order cannot be returned. Order current status is ${order.status.currentStatus}` })
    }
    const newRemark = new Remark({ comment: req.body.remark })

    let updateOrder = order.toObject()
    updateOrder.status.currentStatus = 'return'
    updateOrder.status.returnedDetail.returnedDate = Date.now()
    updateOrder.status.returnedDetail.remark = newRemark._id
    updateOrder.status.returnedDetail.returneddBy = req.dispatcher._id
    let product = await Product.findById(order.product._id)
    let updateProduct = product.toObject()

    let results = await task
        .save(newRemark)
        .update(order, updateOrder)
        .options({ viaSave: true })
        .update(product, updateProduct)
        .options({ viaSave: true })
        .run({ useMongoose: true })
    return res.json(results)
}

exports.toggletobeReturnOrder = async (req, res) => {
    let order = req.order
    if (order.status.currentStatus !== 'complete' && order.status.currentStatus !== 'tobereturn' ) {
        return res.status(403).json({ error: `This order is not ready to return or rollback to complete state. Order current status is ${order.status.currentStatus}` })
    }
    let updateOrder = order.toObject()
    let payment = await Payment.findById(order.payment._id)
    let updatePayment = payment.toObject()
    if (order.status.currentStatus === 'complete') {
        updateOrder.status.currentStatus = 'tobereturn'
        updateOrder.status.tobereturnedDate = Date.now()

        updatePayment.returnedAmount = req.body.returnedAmount

        let results = await task
            .update(order, updateOrder) 
            .options({ viaSave: true }) 
            .update(payment,updatePayment)
            .options({ viaSave: true })
            .run({ useMongoose: true })
        return res.json(results)
    }
    if (order.status.currentStatus === 'tobereturn') {
        updateOrder.status.currentStatus = 'complete'
        updateOrder.status.tobereturnedDate = null

        updatePayment.returnedAmount = undefined
        let results = await task
            .update(payment, updatePayment)
            .options({ viaSave: true })
            .update(order, updateOrder)
            .options({ viaSave: true })
            .run({ useMongoose: true })
        return res.json(results)
    }
}
