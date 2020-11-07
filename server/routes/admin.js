const express = require("express");

const {
    getProfile, updateProfile, profile, businessinfo, bankinfo, warehouse, getBusinessInfo, getBankInfo, getWareHouse, uploadPhoto, adminFile, deleteFileById, getNotifications, readNotification
} = require("../controllers/admin");
const { auth, hasAuthorization } = require('../controllers/admin_auth')

const { uploadAdminPhoto, uploadAdminDoc } = require("../middleware/helpers");
const { validateAdminBankInfo, validateBusinessInfo, validateWareHouse, validateAdminProfile } = require("../middleware/validator")

const router = express.Router();

//notification..
router.get('/notifications',auth, getNotifications)
router.patch('/read-notification/:notification_id', auth, readNotification)

// admin profile..
router
    .route("/:id")
    .get(getProfile)
    .put(auth, hasAuthorization,validateAdminProfile, updateProfile)//update or create
    .patch(auth, hasAuthorization,uploadAdminPhoto, uploadPhoto)

//admin's file..
router
    .route("/file/:id")
    .post(auth, hasAuthorization, uploadAdminDoc, adminFile)//?filetype
    .delete(auth, hasAuthorization, deleteFileById)//?filetype&file_id


router.route('/businessinfo/:id')
    .put(auth, hasAuthorization, validateBusinessInfo, businessinfo)//update or create
    .get(auth, hasAuthorization, getBusinessInfo)

router.route('/bank/:id')
    .put(auth, hasAuthorization, validateAdminBankInfo, bankinfo)//update or create
    .get( auth, hasAuthorization, getBankInfo)

router.route('/warehouse/:id')
    .put(auth, hasAuthorization, validateWareHouse, warehouse)//update or create
    .get(auth, hasAuthorization, getWareHouse)
router.param('id', profile)


module.exports = router;