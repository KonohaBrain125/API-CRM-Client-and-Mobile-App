const Admin = require("../models/Admin");
const BusinessInfo = require("../models/BusinessInfo")
const AdminBank = require("../models/AdminBank")
const AdminWarehouse = require("../models/AdminWarehouse")
const ProductBrand = require("../models/ProductBrand")
const Category = require("../models/Category")
const Product = require("../models/Product")
const Remark = require("../models/Remark")
const shortid = require('shortid');
const sharp = require("sharp")
const path = require("path");
const fs = require("fs");
const _ = require('lodash');
const Fawn = require("fawn");
const task = Fawn.Task();
const perPage = 10;

exports.getAllAdmins = async (req, res) => {
    const page = req.query.page || 1;
    const admins = await Admin.find({})
        .select("-password -salt").skip(perPage * page - perPage)
        .limit(perPage)
        .lean()
    if (!admins.length) {
        return res.status(404).json({ error: 'No Admins are Available' })
    }
    res.json(admins)
}

exports.flipAdminBusinessApproval = async (req, res) => {
    let businessInfo = await BusinessInfo.findById(req.params.b_id)
    if (!businessInfo) {
        return res.status(404).json({ error: "No business information available" })
    }
    if (businessInfo.isVerified) {
        const results = await task
            .update(businessInfo, { isVerified: null })
            .update(Admin, { _id: businessInfo.admin }, { isVerified: null })
            .run({ useMongoose: true })
        return res.json(results[0])
    }
    businessInfo.isVerified = Date.now()
    await businessInfo.save()
    res.json(businessInfo)
}

exports.flipAdminBankApproval = async (req, res) => {
    let bankInfo = await AdminBank.findById(req.params.bank_id)
    if (!bankInfo) {
        return res.status(404).json({ error: "No bank information available" })
    }
    if (bankInfo.isVerified) {
        // bankInfo.isVerified = null
        // await task
        //      
        //     .update("Admin", { _id: bankInfo.admin }, { isVerified: null })
        //     .run({ useMongoose: true })
        const results = await task
            .update(bankInfo, { isVerified: null })
            .update(Admin, { _id: bankInfo.admin }, { isVerified: null })
            .run({ useMongoose: true })
        return res.json(results[0])
    }
    bankInfo.isVerified = Date.now()
    await bankInfo.save()
    res.json(bankInfo)
}

exports.flipAdminWarehouseApproval = async (req, res) => {
    let warehouse = await AdminWarehouse.findById(req.params.w_id)
    if (!warehouse) {
        return res.status(404).json({ error: "No warehouse information available" })
    }
    if (warehouse.isVerified) {
        const results = await task
            .update(warehouse, { isVerified: null })
            .update(Admin, { _id: warehouse.admin }, { isVerified: null })
            .run({ useMongoose: true })
        return res.json(results[0])
    }
    warehouse.isVerified = Date.now()
    await warehouse.save()
    res.json(warehouse)
}

exports.flipAdminAccountApproval = async (req, res) => {
    let adminAccount = await await Admin.findById(req.params.a_id)
        .select('-password -salt -resetPasswordLink -emailVerifyLink')
        .populate('businessInfo', 'isVerified')
        .populate('adminBank', 'isVerified')
        .populate('adminWareHouse', 'isVerified')
    if (!adminAccount) {
        return res.status(404).json({ error: "Account has not been created." })
    }
    if (adminAccount.isBlocked) {
        return res.status(403).json({ error: "Admin is blocked." })
    }
    if (adminAccount.emailVerifyLink) {
        return res.status(403).json({ error: "Admin's email has not been verified." })
    }
    if (!adminAccount.businessInfo.isVerified) {
        return res.status(403).json({ error: "Admin's business information has not been verified." })
    }
    if (!adminAccount.adminBank.isVerified) {
        return res.status(403).json({ error: "Admin's bank information has not been verified." })
    }
    if (!adminAccount.adminWareHouse.isVerified) {
        return res.status(403).json({ error: "Admin's warehouse information has not been verified." })
    }
    if (adminAccount.isVerified) {
        adminAccount.isVerified = null
        await adminAccount.save()
        return res.json(adminAccount)
    }
    adminAccount.isVerified = Date.now()
    await adminAccount.save()
    res.json(adminAccount)
}

exports.blockUnblockAdmin = async (req, res) => {
    let admin = await await Admin.findById(req.params.id)
    if (!admin) {
        return res.status(404).json({ error: "Admin not found" })
    }
    if (admin.isBlocked) {
        admin.isBlocked = null
        await admin.save()
        return res.json(admin)
    }
    admin.isBlocked = Date.now()
    admin.isVerified = null
    await admin.save()
    res.json(admin)
}
exports.getBlockedAdmins = async (req, res) => {
    const page = req.query.page || 1
    let admins = await Admin.find({ isBlocked: { "$ne": null } })
        .select('-password -salt')
        .skip(perPage * page - perPage)
        .limit(perPage)
        .lean()
    if (!admins.length) {
        return res.status(404).json({ error: "No admins are blocked" })
    }
    res.json(admins)
}
exports.getNotBlockedAdmins = async (req, res) => {
    const page = req.query.page || 1
    let admins = await Admin.find({ isBlocked: null })
        .select('-password -salt')
        .skip(perPage * page - perPage)
        .limit(perPage)
        .lean()
    if (!admins.length) {
        return res.status(404).json({ error: "Every admins are blocked" })
    }
    res.json(admins)
}
exports.getVerifiedAdmins = async (req, res) => {
    const page = req.query.page || 1
    let admins = await Admin.find({ isVerified: { "$ne": null } })
        .select('-password -salt')
        .skip(perPage * page - perPage)
        .limit(perPage)
        .lean()
    if (!admins.length) {
        return res.status(404).json({ error: "No admins are verified" })
    }
    res.json(admins)
}
exports.getUnverifiedAdmins = async (req, res) => {
    const page = req.query.page || 1
    let admins = await Admin.find({ isVerified: null })
        .select('-password -salt')
        .skip(perPage * page - perPage)
        .limit(perPage)
        .lean()
    if (!admins.length) {
        return res.status(404).json({ error: "All admins are verified" })
    }
    res.json(admins)
}

exports.category = async (req, res) => {
    const { displayName, parent_id, category_id } = req.body
    const systemName = shortid.generate()
    let updateCategory;
    if (category_id) {
        updateCategory = await Category.findById(category_id)
        if (!updateCategory) {
            return res.status(404).json({ error: "Category not found." })
        }
    }
    if (updateCategory) {
        // then update
        updateCategory.displayName = displayName
        updateCategory.parent = parent_id
        await updateCategory.save()
        return res.json(updateCategory)
    }
    let category = await Category.findOne({ displayName })
    if (category) {
        return res.status(403).json({ error: "Category already exist" })
    }
    category = new Category({ systemName, displayName, parent: parent_id })
    await category.save()
    res.json(category)
}
exports.getCategories = async (req, res) => {
    let categories = await Category.find()
    if (!categories.length) {
        return res.status(404).json({ error: "No categories are available" })
    }
    res.json(categories)
}

exports.flipCategoryAvailablity = async (req, res) => {
    let category = await Category.findById(req.query.category_id)
    if (!category) {
        return res.status(404).json({ error: "Category not found" })
    }
    if (category.isDisabled) {
        category.isDisabled = null
        await category.save()
        return res.json(category)
    }
    category.isDisabled = Date.now()
    await category.save()
    res.json(category)
}
exports.approveProduct = async (req, res) => {
    const product = await Product.findOne({ slug: req.params.p_slug })
    if (!product) {
        return res.status(404).json({ error: "Product not found" })
    }
    if (!product.remark) {
        product.isVerified = Date.now()
        await product.save()
        return res.json(product)
    }
    const results = await task
        .update(Remark, { _id: product.remark }, { isDeleted: Date.now() })
        .update(product, { isVerified: null, remark: newRemark._id })
        .run({ useMongoose: true })
    console.log(results);
    return res.json(results[0])

}
exports.disApproveProduct = async (req, res) => {
    const product = await Product.findOne({ slug: req.params.p_slug })
    if (!product) {
        return res.status(404).json({ error: "Product not found" })
    }
    const newRemark = new Remark(req.body)
    const results = await task
        .save(newRemark)
        .update(product, { isVerified: null, remark: newRemark._id })
        .run({ useMongoose: true })
    console.log(results);
    return res.json(results[0])
}

exports.deleteProduct = async (req, res) => {
    const product = await Product.findOne({ slug: req.params.p_slug })
    if (!product) {
        return res.status(404).json({ error: "Product not found" })
    }
    product.isDeleted = Date.now()
    await product.save()
    res.json(product)
}
exports.getProducts = async (req, res) => {
    const page = req.query.page || 1
    const products = await Product.find()
        .populate("category", "displayName")
        .populate("soldBy", "name shopName")
        .skip(perPage * page - perPage)
        .limit(perPage)
        .lean()
        .sort({ created: -1 })
    if (!products.length) {
        return res.status(404).json({ error: 'No products are available.' })
    }
    res.json(products);
}
exports.verifiedProducts = async (req, res) => {
    const page = req.query.page || 1
    const products = await Product.find({ isVerified: { "$ne": null } })
        .populate("category", "displayName")
        .populate("soldBy", "name shopName")
        .skip(perPage * page - perPage)
        .limit(perPage)
        .lean()
        .sort({ created: -1 })
    if (!products.length) {
        return res.status(404).json({ error: 'No products are available.' })
    }
    res.json(products);
}
exports.notVerifiedProducts = async (req, res) => {
    const page = req.query.page || 1
    const products = await Product.find({ isVerified: null })
        .populate("category", "displayName")
        .populate("soldBy", "name shopName")
        .skip(perPage * page - perPage)
        .limit(perPage)
        .lean()
        .sort({ created: -1 })
    if (!products.length) {
        return res.status(404).json({ error: 'No products are available.' })
    }
    res.json(products);
}
exports.deletedProducts = async (req, res) => {
    const page = req.query.page || 1
    const products = await Product.find({ isDeleted: { "$ne": null } })
        .populate("category", "displayName")
        .populate("soldBy", "name shopName")
        .skip(perPage * page - perPage)
        .limit(perPage)
        .lean()
        .sort({ created: -1 })
    if (!products.length) {
        return res.status(404).json({ error: 'No products are available.' })
    }
    res.json(products);
}
exports.notDeletedProducts = async (req, res) => {
    const page = req.query.page || 1
    const products = await Product.find({ isDeleted: null })
        .populate("category", "displayName")
        .populate("soldBy", "name shopName")
        .skip(perPage * page - perPage)
        .limit(perPage)
        .lean()
        .sort({ created: -1 })
    if (!products.length) {
        return res.status(404).json({ error: 'No products are available.' })
    }
    res.json(products);
}

exports.productBrand = async(req, res) => {
    const { brandName, brand_id } = req.body
    const systemName = shortid.generate()
    let updateBrand;
    if (brand_id) {
        updateBrand = await ProductBrand.findById(brand_id)
        if (!updateBrand) {
            return res.status(404).json({ error: "Product brand not found." })
        }
    }
    if (updateBrand) {
        // then update
        updateBrand.brandName = brandName
        await updateBrand.save()
        return res.json(updateBrand)
    }
    let newBrand = await ProductBrand.findOne({ brandName })
    if (newBrand) {
        return res.status(403).json({ error: "Product brand already exist" })
    }
    newBrand = new ProductBrand({ systemName, brandName})
    await newBrand.save()
    res.json(newBrand)
}

exports.getProductBrands = async (req,res) => {
    let productbrands = await ProductBrand.find()
    if (!productbrands.length) {
        return res.status(404).json({ error: "No product brands are available" })
    }
    res.json(productbrands)
}