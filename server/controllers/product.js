const Admin = require("../models/Admin");
const Category = require("../models/Category")
const Product = require("../models/Product")
const ProductBrand = require("../models/ProductBrand")
const ProductImages = require("../models/ProductImages")
const shortid = require('shortid');
const sharp = require("sharp")
const path = require("path");
const fs = require("fs");
const _ = require('lodash');
const Fawn = require("fawn");
const task = Fawn.Task();
const perPage = 10;

exports.product = async (req, res, next) => {
    const product = await Product.findOne({ slug: req.params.p_slug })
        .populate('images', '-createdAt -updatedAt -__v')
        .populate('soldBy', 'shopName address')
        .populate("brand")
        .populate("category")
    if (!product) {
        return res.status(404).json({ error: 'Product not found.' })
    }
    req.product = product
    next();
}

exports.getProduct = (req, res) => {
    res.json(req.product);
}

exports.createProduct = async (req, res) => {
    if (!req.profile.isVerified) return res.status(403).json({ error: "Admin is not verified" })
    let newProduct = new Product(req.body)
    newProduct.soldBy = req.profile._id
    // save the product
    newProduct = await newProduct.save()

    return res.json(newProduct)
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

exports.productImages = async (req, res) => {
    if (!req.files.length) {
        return res.status(400).error({ error: "Product images are required" })
    }
    if (!req.profile.isVerified) {
        req.files.forEach(file => {
            const { filename } = file;
            // remove image from public/uploads
            const Path = `public/uploads/${filename}`;
            fs.unlinkSync(Path);
        })
        return res.status(403).json({ error: "Admin is not verified" })
    }
    const compressImage = async (filename, size, filepath, destination, foldername) => {
        await sharp(filepath)
            .resize(size)
            .toFile(path.resolve(destination, `${foldername}`, filename))
        return `${foldername}/${filename}`
    }
    let images = req.files.map(async file => {
        const image = new ProductImages()
        const { filename, path: filepath, destination } = file
        image.thumbnail = await compressImage(filename, 80, filepath, destination, 'productThumbnail')
        image.medium = await compressImage(filename, 540, filepath, destination, 'productMedium')
        image.large = await compressImage(filename, 800, filepath, destination, 'productLarge')
        // remove image from public/uploads
        const Path = `public/uploads/${filename}`;
        fs.unlinkSync(Path);
        return await image.save()
    })
    images = await Promise.all(images)
    res.json(images)
}

exports.deleteImage = async (req, res) => {
    let product = req.product
    if (product.isVerified) {
        return res.status(403).json({ error: 'Cannot delete image. Product has already been verified.' })
    }
    let updateProduct = product.toObject()
    let imageURLS;
    updateProduct.images = product.images.filter(image => {
        if (image._id.toString() === req.query.image_id) imageURLS = image
        return image._id.toString() !== req.query.image_id
    })
    if (!imageURLS) {
        return res.status(404).json({ error: "Image not found" })
    }
    await task
        .update(product, updateProduct)
        .options({ viaSave: true })
        .remove(ProductImages, { _id: req.query.image_id })
        .run({ useMongoose: true })

    let Path = `public/uploads/${imageURLS.thumbnail}`;
    fs.unlinkSync(Path);
    Path = `public/uploads/${imageURLS.medium}`;
    fs.unlinkSync(Path)
    Path = `public/uploads/${imageURLS.large}`;
    fs.unlinkSync(Path)
    res.json(updateProduct.images)

}

exports.deleteImageById = async (req, res) => {
    let image = await ProductImages.findByIdAndRemove(req.query.image_id)
    let Path = `public/uploads/${image.thumbnail}`;
    fs.unlinkSync(Path);
    Path = `public/uploads/${image.medium}`;
    fs.unlinkSync(Path)
    Path = `public/uploads/${image.large}`;
    fs.unlinkSync(Path)
    res.json(image)

}

exports.updateProduct = async (req, res) => {
    let product = req.product
    if (product.isVerified) {
        return res.status(403).json({ error: 'Cannot update. Product has already been verified.' })
    }
    product = _.extend(product, req.body)
    console.log(product);
    await product.save()
    res.json(product)

}

exports.getProducts = async (req, res) => {
    const page = req.query.page || 1
    const products = await Product.find({ soldBy: req.profile._id })
        .populate("category", "displayName slug")
        .populate("brand", "brandName slug")
        .populate("images", "-createdAt -updatedAt -__v")
        .skip(perPage * page - perPage)
        .limit(perPage)
        .lean()
        .sort({ created: -1 })
    if (!products.length) {
        return res.status(404).json({ error: 'No products are available.' })
    }
    res.json(products);
}

exports.latestProducts = async (req, res) => {
    const products = await Product.find()
        .populate("category", "displayName slug")
        .populate("brand", "brandName slug")
        .populate("images", "-createdAt -updatedAt -__v")
        .limit(20)
        .lean()
        .sort({ created: -1 })
    if (!products.length) {
        return res.status(404).json({ error: 'No products are available.' })
    }
    res.json(products);
}

exports.getProductsByCategory = async (req, res) => {
    const page = req.query.page || 1
    let categories = await Category.find({ $or: [{ slug: req.query.cat_slug }, { parent: req.query.cat_id }] })
    if (!categories.length) {
        return res.status(404).json({ error: "Categories not found" })
    }
    categories = categories.map(c => c._id.toString())
    console.log(categories);
    const products = await Product.find({ category: { $in: categories } })
        .populate("category", "displayName slug")
        .populate("brand", "brandName slug")
        .populate("images", "-createdAt -updatedAt -__v")
        .skip(perPage * page - perPage)
        .limit(perPage)
        .lean()
        .sort({ created: -1 })
    if (!products.length) {
        return res.status(404).json({ error: 'No products are available.' })
    }
    res.json(products);
}

exports.outOfTheStockProducts = async (req, res) => {
    const page = req.query.page || 1
    const products = await Product.find({ soldBy: req.profile._id, quantity:0 })
        .populate("category", "displayName slug")
        .populate("brand", "brandName slug")
        .populate("images", "-createdAt -updatedAt -__v")
        .skip(perPage * page - perPage)
        .limit(perPage)
        .lean()
        .sort({ created: -1 })
    if (!products.length) {
        return res.status(404).json({ error: 'No products are out of stock.' })
    }
    res.json(products);
}
exports.verifiedProducts = async (req, res) => {
    const page = req.query.page || 1
    const products = await Product.find({ soldBy: req.profile._id, isVerified: { "$ne": null } })
        .populate("category", "displayName slug")
        .populate("brand", "brandName slug")
        .populate("images", "-createdAt -updatedAt -__v")
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
    const products = await Product.find({ soldBy: req.profile._id, isVerified: null })
        .populate("category", "displayName slug")
        .populate("brand", "brandName slug")
        .populate("images", "-createdAt -updatedAt -__v")
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
    const products = await Product.find({ soldBy: req.profile._id, isDeleted: { "$ne": null } })
        .populate("category", "displayName slug")
        .populate("brand", "brandName slug")
        .populate("images", "-createdAt -updatedAt -__v")
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
    const products = await Product.find({ soldBy: req.profile._id, isDeleted: null })
        .populate("category", "displayName slug")
        .populate("brand", "brandName slug")
        .populate("images", "-createdAt -updatedAt -__v")
        .skip(perPage * page - perPage)
        .limit(perPage)
        .lean()
        .sort({ created: -1 })
    if (!products.length) {
        return res.status(404).json({ error: 'No products are available.' })
    }
    res.json(products);
}

