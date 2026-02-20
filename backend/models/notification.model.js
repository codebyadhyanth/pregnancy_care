import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    recipientUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    recipientAnganwadi: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AnganwadiCenter"
    },
    type: {
        type: String,
        enum: ["visit", "notice", "migration", "alert", "scheme-request", "document-upload"],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    read: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
