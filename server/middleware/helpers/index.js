module.exports = {
    errorHandler: require("./dbErrorHandler").errorHandler,
    uploadAdminPhoto: require("./multer").uploadAdminPhoto,
    uploadUserPhoto: require("./multer").uploadUserPhoto,
    uploadAdminDoc: require("./multer").uploadAdminDoc,
    // uploadCheque: require("./multer").uploadCheque,
    uploadProductImages: require("./multer").uploadProductImages,
    uploadBannerPhoto: require("./multer").uploadBannerPhoto,
    sendEmail: require("./mailer").sendEmail,
    dbConnection: require("./dbConnection"),
    calculateDistance: require("./geoDistance"),
    createNotification: require("./createNotification"),
    waterMarker: require("./waterMarker"),
    fileRemover: require("./fileRemover"),
    imageCompressor: require('./imageCompressor')
}