import mongoose from "mongoose";

const nutritionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        date: {
            type: Date,
            default: Date.now
        },
        items: [
            {
                name: String,
                calories: Number,
                protein: Number,
                carbs: Number,
                fats: Number,
                iron: Number,
                calcium: Number,
                addedAt: { type: Date, default: Date.now }
            }
        ],
        totals: {
            calories: { type: Number, default: 0 },
            protein: { type: Number, default: 0 },
            carbs: { type: Number, default: 0 },
            fats: { type: Number, default: 0 },
            iron: { type: Number, default: 0 },
            calcium: { type: Number, default: 0 },
            water: { type: Number, default: 0 }
        },
        // Legacy support / Single Entry
        foodEntry: String,
        aiFeedback: String
    },
    { timestamps: true }
);

// Index for quick daily lookups
nutritionSchema.index({ user: 1, date: 1 });

const Nutrition = mongoose.model("Nutrition", nutritionSchema);
export default Nutrition;
