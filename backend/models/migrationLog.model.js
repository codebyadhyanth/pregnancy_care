import mongoose from "mongoose";

const migrationLogSchema = new mongoose.Schema({
    mom: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    fromCenter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AnganwadiCenter",
        required: true
    },
    toCenter: { // Can be null if released but not yet claimed
        type: mongoose.Schema.Types.ObjectId,
        ref: "AnganwadiCenter"
    },
    status: {
        type: String,
        enum: ["released", "claimed"],
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const MigrationLog = mongoose.model("MigrationLog", migrationLogSchema);
export default MigrationLog;
