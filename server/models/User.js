const mongoose = require("mongoose");
const crypto = require("crypto");
const Schema = mongoose.Schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true,
        maxlength: 32
    },
    email: {
        type: String,
        trim: true,
        unique:true
    },
    password: {
        type: String,
        required: true
    },
    location: [{
        type: Schema.Types.ObjectId,
        ref: "address"
    }],
    photo: {
        type: String
    },
    resetPasswordLink: {
        type: String,
        default: ""
    },
    emailVerifyLink: {
        type: String,
        default: ""
    },
    salt: String,
    isBlocked: {
        type: Date,
        default: null
    }
}, { timestamps: true });
userSchema.index({ geolocation: "2dsphere" });

const sha512 = function (password, salt) {
    let hash = crypto.createHmac('sha512', salt);
    hash.update(password);
    let value = hash.digest('hex');
    return {
        passwordHash: value
    };
};
userSchema.pre('save', function (next) {
    let user = this;
    if (user.isModified('password')) {
        // salt
        const ranStr = function (n) {
            return crypto.randomBytes(Math.ceil(8))
                .toString('hex')
                .slice(0, n);
        };
        // applying sha512 alogrithm
        let salt = ranStr(16);
        let passwordData = sha512(user.password, salt);
        user.password = passwordData.passwordHash;
        user.salt = salt;
        next();
    } else {
        next();
    }
})
userSchema.statics.findByCredentials = async function (email, password) {
    let User = this;
    const user = await User.findOne({ email })
    if (!user) return ''
    let passwordData = sha512(password, user.salt)
    if (passwordData.passwordHash == user.password) {
        return user
    }
}

module.exports = mongoose.model("user", userSchema);