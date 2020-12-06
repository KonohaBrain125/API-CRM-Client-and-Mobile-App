const User = require("../models/User");
const Admin = require("../models/Admin")
const Payment = require("../models/Payment")
const Remark = require("../models/Remark")
const Review = require("../models/Review")
const Cart = require("../models/Cart")
const Wishlist = require('../models/WishList')
const Category = require("../models/Category")
const Product = require("../models/Product")
const ProductBrand = require("../models/ProductBrand")
const ProductImages = require("../models/ProductImages")
const userHas = require("../middleware/user_actions/userHas")
const getRatingInfo = require("../middleware/user_actions/getRatingInfo")
const Order = require("../models/Order")
const { calculateDistance } = require("../middleware/helpers")
const sharp = require("sharp")
const shortid = require('shortid');
const path = require("path");
const fs = require("fs");
const _ = require('lodash')
const Fawn = require("fawn");
const task = Fawn.Task();
const perPage = 10;

exports.addCart = async (req, res) => {
    const product = req.product
    if (req.query.quantity < 1) {
        return res.status(403).json({ error: 'Quantity is required' })
    }
    let cart = await Cart.findOne({user:req.user._id, product: product._id})
    if (cart && cart.isDeleted===null) {
        return res.status(403).json({error:'Cart already exist.'})
    }
    if (cart.isDeleted) {
        cart.isDeleted = null
        cart.quantity = req.body.quantity
        cart.productAttributes = req.body.productAttributes
        await cart.save()
        return res.json(cart)
    }
    let newCart = {
        user: req.user._id,
        product: product._id,
        quantity: req.body.quantity,
        productAttributes: req.body.productAttributes
    };
    newCart = new Cart(newCart);
    await newCart.save();
    res.json(newCart);
}

const searchCarts = async (keyword = '', id, populateImages,populateSoldBy) => {
    let carts = await Cart.find({ user: id, isDeleted: null })
        .populate(populateImages)
        .populate({
            path: 'product',
            match: {
                name: { $regex: keyword, $options: "i" }
            },
            select: 'name slug images soldBy discountRate price quantity',
            populate: populateSoldBy
        })
        .lean()
    carts = carts.filter(c => c.product !== null)
    let totalCount = carts.length
    // carts = _.drop(carts, perPage * page - perPage)
    // carts = _.take(carts, perPage)
    return ({carts,totalCount})
}

exports.getCarts = async (req, res) => {
    const page = +req.query.page || 1
    const perPage = +req.query.perPage || 10;
    const keyword = req.query.keyword
    const populateImages = {
        path: 'product',
        populate: {
            path: 'images',
            model: 'productimages'
        }
    }
    const populateSoldBy = {
        path: 'soldBy',
        model: 'admin',
        select: 'name shopName address'
    }
    let searchedCarts 
    let manualCarts
    if (keyword) searchedCarts = await searchCarts(keyword, req.user._id,populateImages,populateSoldBy)
    if(!keyword) {
        manualCarts = await Cart.find({ user: req.user._id, isDeleted: null })
        .populate(populateImages)
        .populate({
            path: 'product',
            select: 'name slug images soldBy discountRate price quantity',
            populate: populateSoldBy
        })
        .lean()
    }
    const totalCount = (manualCarts && manualCarts.length) || (searchedCarts && searchedCarts.totalCount)
    let carts = manualCarts || searchedCarts.carts
    let totalAmount = 0
    carts.forEach(c=>{
        totalAmount += parseFloat(c.product.price)
    })
    
    // carts = _.drop(carts, perPage * page - perPage)
    // carts = _.take(carts, perPage)
    //user's action on each product
    carts = carts.map(async c => {
        //user's action on this product
        const { hasOnWishlist } = await userHas(c.product, req.user, 'carts')
        c.hasOnWishlist = hasOnWishlist
        //ratings of this product
        c.stars = await getRatingInfo(c.product)
        return c
    })
    carts = await Promise.all(carts)
    res.json({ carts, totalCount ,totalAmount})

}


exports.deleteCart = async (req, res) => {
    let cart = await Cart.findOne({ _id: req.params.cart_id, user: req.user._id })
    if (!cart) {
        return res.status(404).json({ error: 'Cart not found.' })
    }
    cart.isDeleted = Date.now()
    await cart.save()
    res.json(cart)
}
exports.editCart = async (req, res) => {
    let cart = await Cart.findOne({ _id: req.params.cart_id, user: req.user._id, isDeleted: null })
    if (!cart) {
        return res.status(404).json({ error: 'Cart not found.' })
    }
    cart.quantity = req.query.quantity
    await cart.save()
    res.json(cart)
}

exports.addWishlist = async (req, res) => {
    const product = req.product
    if (req.query.quantity < 1) {
        return res.status(403).json({ error: 'Quantity is required' })
    }
    
    let wishlist = await Wishlist.findOne({user:req.user._id, product: product._id })
    if (wishlist && wishlist.isDeleted===null) {
        return res.status(403).json({ error: 'Wishlist already exist.' })
    }
    if (wishlist.isDeleted) {
        wishlist.isDeleted = null
        wishlist.quantity = req.body.quantity
        await wishlist.save()
        return res.json(wishlist)
    }
    let newWishlist = {
        user: req.user._id,
        product: product._id,
        quantity: req.body.quantity
    };
    newWishlist = new Wishlist(newWishlist);
    await newWishlist.save();
    res.json(newWishlist);
}

// exports.getWishlists = async (req, res) => {
//     const page = +req.query.page || 1
//     const perPage = +req.query.perPage || 10;
//     let wishlists = await Wishlist.find({ user: req.user._id, isDeleted: null })
//         .populate({
//             path: 'product',
//             populate: {
//                 path: 'images',
//                 model: 'productimages'
//             }
//         })
//         .populate({
//             path: 'product',
//             select: 'name slug images soldBy discountRate price quantity',
//             populate: {
//                 path: 'soldBy',
//                 model: 'admin',
//                 select: 'name shopName address'
//             }
//         })
//         .skip(perPage * page - perPage)
//         .limit(perPage)
//         .lean()
//     //user's action on each product
//     wishlists = wishlists.map(async c => {
//         //user's action on this product
//         const { hasOnCart } = await userHas(c.product, req.user, 'wishlists')
//         //ratings of this product
//         c.stars = await getRatingInfo(c.product)
//         c.hasOnCart = hasOnCart
//         return c
//     })
//     wishlists = await Promise.all(wishlists)
//     const totalCount = await Wishlist.countDocuments({ user: req.user._id, isDeleted: null })
//     res.json({ wishlists, totalCount })

// }
const searchWishlists = async (keyword = '', id, populateImages, populateSoldBy) => {
    let wishlists = await Wishlist.find({ user: id })
        .populate(populateImages)
        .populate({
            path: 'product',
            match: {
                name: { $regex: keyword, $options: "i" }
            },
            select: 'name slug images soldBy discountRate price quantity',
            populate: populateSoldBy
        })
        .lean()

    wishlists = wishlists.filter(c => c.product !== null)
    let totalCount = wishlists.length
    // wishlists = _.drop(wishlists, perPage * page - perPage)
    // wishlists = _.take(wishlists, perPage)
    return ({ wishlists, totalCount })
}

exports.getWishlists = async (req, res) => {
    const page = +req.query.page || 1
    const perPage = +req.query.perPage || 10;
    const keyword = req.query.keyword
    const populateImages = {
        path: 'product',
        populate: {
            path: 'images',
            model: 'productimages'
        }
    }
    const populateSoldBy = {
        path: 'soldBy',
        model: 'admin',
        select: 'name shopName address'
    }
    let searchedWishlists
    let manualWishlists
    if (keyword) searchedWishlists = await searchWishlists(keyword, req.user._id, populateImages, populateSoldBy)
    if (!keyword) {
        manualWishlists = await Wishlist.find({ user: req.user._id, isDeleted: null })
            .populate(populateImages)
            .populate({
                path: 'product',
                select: 'name slug images soldBy discountRate price quantity',
                populate: populateSoldBy
            })
            .lean()
    }
    const totalCount = (manualWishlists && manualWishlists.length) || (searchedWishlists && searchedWishlists.totalCount)
    let wishlists = manualWishlists || searchedWishlists.wishlists
    let totalAmount = 0
    wishlists.forEach(c => {
        totalAmount += parseFloat(c.product.price)
    })

    wishlists = _.drop(wishlists, perPage * page - perPage)
    wishlists = _.take(wishlists, perPage)
    //user's action on each product
    wishlists = wishlists.map(async c => {
        //user's action on this product
        const { hasOnWishlist } = await userHas(c.product, req.user, 'wishlists')
        //ratings of this product
        c.stars = await getRatingInfo(c.product)
        c.hasOnWishlist = hasOnWishlist
        return c
    })
    wishlists = await Promise.all(wishlists)
    res.json({ wishlists, totalCount, totalAmount })

}

exports.deleteWishlist = async (req, res) => {
    let wishlist = await Wishlist.findOne({ _id: req.params.wishlist_id, user: req.user._id })
    if (!wishlist) {
        return res.status(404).json({ error: 'Wishlist not found.' })
    }
    wishlist.isDeleted = Date.now()
    await wishlist.save()
    res.json(wishlist)
}

exports.editWishlist = async (req, res) => {
    let wishlist = await Wishlist.findOne({ _id: req.params.wishlist_id, user: req.user._id, isDeleted: null })
    if (!wishlist) {
        return res.status(404).json({ error: 'Wishlist not found.' })
    }
    wishlist.quantity = req.query.quantity
    await wishlist.save()
    res.json(wishlist)
}



// exports.searchWishlists = async (req, res) => {
//     const page = +req.query.page || 1;
//     const perPage = +req.query.perPage || 10;
//     const { keyword = '' } = req.query
//     let wishlists = await Wishlist.find({ user: req.user._id })
//         .populate({
//             path: 'product',
//             match: {
//                 name: { $regex: keyword, $options: "i" }
//             },
//             select: 'name slug'
//         })
//         .lean()

//     wishlists = wishlists.filter(c => c.product !== null)
//     let totalCount = wishlists.length
//     wishlists = _.drop(wishlists, perPage * page - perPage)
//     wishlists = _.take(wishlists, perPage)
//     return res.json({ wishlists, totalCount });
// }