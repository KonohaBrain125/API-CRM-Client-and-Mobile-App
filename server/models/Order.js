const mongoose = require("mongoose");
const Schema = mongoose.Schema
const orderSchema = new mongoose.Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    product: {
        type: Schema.Types.ObjectId,
        ref: "product",
        required: true
    },
    payment: {
        type: Schema.Types.ObjectId,
        ref: "payment",
    },
    quantity: {
        type: Number
    },
    status: {
        currentStatus: {
            type: String,
            enum: ["active","cancel","complete"]
        },
        activeDate: {
            type: Date,
            default: null
        },
        cancelledDate: {
            type: Date,
            default: null
        },
        completedDate: {
            type: Date,
            default: null
        }
    },
    isPaid:{
        type: Boolean
    },
    isDeleted: {
        type: Date,
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model("order", orderSchema);