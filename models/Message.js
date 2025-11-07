import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    chatRoomId: {
        type: String,
        required: true
    },

    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    message: {
        type: String,
        required: true
    },
    read: {
        type: Boolean,
        default: false
    },

    // delete filds 
    deletedBy: { type: [mongoose.Schema.Types.ObjectId], default: [] }, // who deleted this message
    isDeleted: { type: Boolean, default: false },

},   { timestamps: true })

export default mongoose.model("Message", messageSchema);