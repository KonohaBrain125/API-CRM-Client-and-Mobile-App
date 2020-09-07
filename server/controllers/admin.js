const Admin = require("../models/Admin");
const BusinessInfo = require("../models/BusinessInfo")
const AdminBank = require("../models/AdminBank")
const AdminWarehouse = require("../models/AdminWarehouse")
const sharp = require("sharp")
const path = require("path");
const fs = require("fs");
const _ = require('lodash');
const Fawn = require("fawn");
const task = Fawn.Task();

exports.profile = async (req, res, next) => {
    const admin = await Admin.findById(req.params.id).select("-password -salt")
    if (!admin) {
        return res.status(404).json({ error: 'Admin not found with this id' })
    }
    req.profile = admin
    next();
}

// getProfile
exports.getProfile = async (req, res) => {
    req.profile.resetPasswordLink = undefined
    req.profile.emailVerifyLink = undefined
    res.json(req.profile)
}

// update or complete profile
exports.updateProfile = async (req, res) => {
    let profile = req.profile
    // password update
    if (req.body.oldPassword && req.body.newPassword) {
        let admin = await Admin.findByCredentials(profile.email, req.body.oldPassword)
        if (!admin) {
            return res.status(403).json({
                error: "Wrong Password."
            });
        }
        profile.password = req.body.newPassword
    }
    
    profile.holidayMode.start = req.body.holidayStart && req.body.holidayStart
    profile.holidayMode.end = req.body.holidayEnd && req.body.holidayEnd
    
    profile = _.extend(profile, req.body)
    profile.isVerified = null
    await profile.save();
    profile.password = undefined
    profile.salt = undefined
    res.json(profile);
}

exports.uploadPhoto = async (req, res) => {
    let profile = req.profile
    if (req.file == undefined) {
        return res.status(400).json({ error: 'Image is required.' })
    }
    const { filename: image } = req.file;
    //Compress image
    await sharp(req.file.path)
        .resize(300)
        .jpeg({ quality: 100 })
        .toFile(path.resolve(req.file.destination, "admin", image))
    fs.unlinkSync(req.file.path);//remove from public/uploads
    // if update then remove old photo
    if (profile.photo) fs.unlinkSync(`public/uploads/${profile.photo}`)
    profile.photo = "admin/" + image;
    await profile.save()
    res.json({ photo: profile.photo })
}
const run = async() => {
    let File = require('../models/AdminFiles')
    let admins = await Admin.find({role:'admin'}).populate('businessInfo').populate('adminBank')
    // console.log(admins);
    admins = admins.map(async admin => {
        let cheque = new File({fileUri:admin.adminBank.chequeCopy})
        // let bank = await AdminBank.findById(admin.adminBank._id)
        // bank.chequeCopy = cheque._id

        let cfront = new File({ fileUri: admin.businessInfo.citizenshipFront})
        // let businessinfo = await BusinessInfo.findById(admin.businessInfo._id)
        // businessinfo.citizenshipFront = cfront._id

        let cback = new File({ fileUri: admin.businessInfo.citizenshipBack })
        // businessinfo.citizenshipBack = cback._id

        let businessLicence = new File({ fileUri: admin.businessInfo.businessLicence })
        // businessinfo.businessLicence = businessLicence._id

        await cheque.save()
        await cfront.save()
        await cback.save()
        return await businessLicence.save()

    })
    admins = await Promise.all(admins)
    console.log(admins);
}
// run()
exports.getBusinessInfo = async (req, res) => {
    let businessinfo = await BusinessInfo.findOne({ admin: req.profile._id })
    if (!businessinfo) {
        return res.status(404).json({ error: "No business information." })
    }
    res.json(businessinfo)
}

exports.businessinfo = async (req, res) => {
    //make req.files to array of objs
    let files = []
    if (req.files) for (const file in req.files) {
        files.push(req.files[file][0]);
    }
    files.forEach(async file => {
        const { filename, fieldname, destination, path: filepath } = file;
        await sharp(filepath)
            .resize(400)
            .toFile(path.resolve(destination, fieldname === 'businessLicence' ? "businessLicence" : "citizenship", filename))//add file from uploads to doc folder
        fs.unlinkSync(filepath);//and remove file from public/uploads
    })
    let profile = req.profile.toObject()
    const { businessInfo } = profile
    if (businessInfo) {
        let docs = await BusinessInfo.findById(businessInfo)
        //remove old file and update with new one
        docs = _.extend(docs, req.body)
        files.forEach(file => {
            const { filename, fieldname } = file
            const filePath = `public/uploads/${docs[fieldname]}`
            fs.unlinkSync(filePath)//remove old file from respective folders
            docs[fieldname] = `${fieldname === 'businessLicence' ? "businessLicence" : "citizenship"}/${filename}`;//updating docs
        })
        docs.isVerified = null
        docs = await docs.save()
        //db transaction gareko chaina 
        profile.isVerified = null
        await profile.save()
        return res.json(docs)
    }
    //if !businessInfo then create new one
    //first check if files are empty or not
    if (files.length < 3) {
        files.forEach(file => {
            const { filename, fieldname } = file
            const filePath = `public/uploads/${fieldname === 'businessLicence' ? "businessLicence" : "citizenship"}/${filename}`;
            fs.unlinkSync(filePath)
        })
        return res.status(400).json({ error: `${3 - files.length} documents are missing` })
    }
    let docs = new BusinessInfo()
    docs = _.extend(docs, req.body)
    files.forEach(async file => {
        const { filename, fieldname } = file
        docs[fieldname] = `${fieldname === 'businessLicence' ? "businessLicence" : "citizenship"}/${filename}`;
    })
    docs.admin = profile._id
    profile.businessInfo = docs._id
    await task
        .save(docs)
        .update(req.profile, profile)
        .options({ viaSave: true })
        .run({ useMongoose: true })
    res.json(docs)
}


exports.getBankInfo = async (req, res) => {
    let bankinfo = await AdminBank.findOne({ admin: req.profile._id })
    if (!bankinfo) {
        return res.status(404).json({ error: "No bank information." })
    }
    res.json(bankinfo)
}

exports.bankinfo = async (req, res) => {
    if (req.file) {
        const { filename, destination, path: filepath } = req.file;
        await sharp(filepath)
            .resize(400)
            .toFile(path.resolve(destination, "bank", filename))//add file from uploads to doc folder
        fs.unlinkSync(filepath);//and remove file from public/uploads
    }
    let profile = req.profile.toObject()
    const { adminBank } = profile
    if (adminBank) {
        let docs = await AdminBank.findById(adminBank)
        //remove old file and update with new one
        docs = _.extend(docs, req.body)
        // update cheque file
        if (req.file) {
            const { filename } = req.file
            const filePath = `public/uploads/${docs["chequeCopy"]}`
            fs.unlinkSync(filePath)//remove old file from respective folders
            docs["chequeCopy"] = `bank/${filename}`;//updating docs
        }
        docs.isVerified = null
        await docs.save()
        //db transaction gareko chaina 
        profile.isVerified = null
        await profile.save()
        return res.json(docs)
    }
    //first check if cheque is empty or not
    if (!req.file) return res.status(400).json({ error: "Cheque copy is required" })

    let docs = new AdminBank()
    docs = _.extend(docs, req.body)
    const { filename } = req.file
    docs["chequeCopy"] = `bank/${filename}`;
    docs.admin = profile._id
    profile.adminBank = docs._id
    await task
        .save(docs)
        .update(req.profile, profile)
        .options({ viaSave: true })
        .run({ useMongoose: true })
    res.json(docs)
}

exports.getWareHouse = async (req, res) => {
    let warehouseinfo = await AdminWarehouse.findOne({ admin: req.profile._id })
    if (!warehouseinfo) {
        return res.status(404).json({ error: "No warehouse information available." })
    }
    res.json(warehouseinfo)
}

exports.warehouse = async (req, res) => {
    let profile = req.profile.toObject()
    const { adminWareHouse } = profile
    if (adminWareHouse) {
        let warehouseInfo = await AdminWarehouse.findById(adminWareHouse)
        warehouseInfo = _.extend(warehouseInfo, req.body)
        warehouseInfo.isVerified = null
        await warehouseInfo.save()
        //db transaction gareko chaina 
        profile.isVerified = null
        await profile.save()
        return res.json(warehouseInfo)
    }
    let newWareHouse = new AdminWarehouse(req.body)
    newWareHouse.admin = profile._id
    profile.adminWareHouse = newWareHouse._id
    await task
        .save(newWareHouse)
        .update(req.profile, profile)
        .options({ viaSave: true })
        .run({ useMongoose: true })
    res.json(newWareHouse)
}