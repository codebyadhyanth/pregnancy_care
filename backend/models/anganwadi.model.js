import mongoose from "mongoose";

const anganwadiSchema = new mongoose.Schema(
    {
        centerName: {
            type: String,
            required: true
        },
        district: {
            type: String,
            required: true
            // Removed unique: true — multiple centres per district allowed
        },
        state: {
            type: String,
            required: true
        },
        officialEmail: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true
        },
        anganwadiCenterId: {
            type: String,
            unique: true,
            sparse: true  // Allow multiple docs without this field (null) without unique conflict
        },
        isActive: {
            type: Boolean,
            default: true
        },
        contactNumber: {
            type: String
        },
        facilities: {
            type: [String],
            default: []
        },
        services: {
            type: [String],
            default: []
        },
        address: {
            type: String
        }
    },
    { timestamps: true }
);

// Compound index: unique centre name within a district
anganwadiSchema.index({ centerName: 1, district: 1 }, { unique: true });

// Pre-save hook to generate center ID: ANG-<DISTCODE>-<SEQ>
// NOTE: async hooks in Mongoose 7+ must NOT call next() — the returned promise controls flow.
anganwadiSchema.pre('save', async function () {
    if (!this.anganwadiCenterId && this.district) {
        // Safe uppercase truncate
        const distCode = (this.district || "UNK").replace(/\s+/g, '').substring(0, 3).toUpperCase();

        const AnganwadiModel = mongoose.model("AnganwadiCenter");
        // Count existing IDs with the same district prefix to build a sequence
        const prefix = `ANG-${distCode}-`;
        const count = await AnganwadiModel.countDocuments({
            anganwadiCenterId: { $regex: new RegExp(`^${prefix}`) }
        });

        const seq = (count + 1).toString().padStart(3, '0');
        this.anganwadiCenterId = `${prefix}${seq}`;
    }
    // No next() call — Mongoose awaits this async function automatically
});

const AnganwadiCenter = mongoose.model("AnganwadiCenter", anganwadiSchema);
export default AnganwadiCenter;
