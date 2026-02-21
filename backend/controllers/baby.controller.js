import Baby from "../models/baby.model.js";
import BabyWeightLog from "../models/babyWeightLog.model.js";
import BreastfeedingLog from "../models/breastfeedingLog.model.js";
import Vaccination, { VACCINATION_SCHEDULE } from "../models/vaccination.model.js";
import BabyReminder from "../models/babyReminder.model.js";
import User from "../models/user.model.js";
import { generateAIResponse } from "../lib/ai.service.js";

/**
 * CRITICAL: Do not edit without reviewing related modules.
 * This affects pregnancy/baby lifecycle logic.
 * All baby APIs are fully isolated from pre-pregnancy logic.
 */

// ==============================
// BABY CREATION (Delivery Confirmation)
// ==============================

/**
 * POST /api/baby
 * Create a baby record after delivery confirmation.
 * Also auto-generates vaccination schedule from DOB.
 */
export const createBaby = async (req, res) => {
    try {
        const { dob, timeOfBirth, gender, birthWeight } = req.body;

        if (!dob || !timeOfBirth || !gender || birthWeight === undefined) {
            return res.status(400).json({ message: "All fields are required: dob, timeOfBirth, gender, birthWeight" });
        }

        if (birthWeight <= 0 || birthWeight > 10) {
            return res.status(400).json({ message: "Birth weight must be between 0.1 and 10 kg" });
        }

        // Check for existing baby for this mother (allow multiple but warn)
        const existingBabyCount = await Baby.countDocuments({ mother: req.user._id });

        const user = await User.findById(req.user._id);

        const baby = await Baby.create({
            mother: req.user._id,
            dob: new Date(dob),
            timeOfBirth,
            gender,
            birthWeight,
            linkedAnganwadi: user.linkedAnganwadi || undefined,
        });

        // Auto-generate vaccination schedule from DOB
        // CRITICAL: Do not edit vaccination schedule without reviewing related modules.
        const vaccinations = VACCINATION_SCHEDULE.map((v) => {
            const dueDate = new Date(dob);
            dueDate.setDate(dueDate.getDate() + v.weeksDue * 7);
            return {
                baby: baby._id,
                vaccineName: v.name,
                dueDate,
                description: v.description,
                status: "pending",
            };
        });

        await Vaccination.insertMany(vaccinations);

        // Update user model to indicate post-pregnancy mode (nullable new field)
        await User.findByIdAndUpdate(req.user._id, {
            $set: { postPregnancy: true, activeBabyId: baby._id },
        });

        // CRITICAL: Notify linked Anganwadi center about delivery
        // This triggers the "Baby" tab notification in the Anganwadi portal.
        if (user.linkedAnganwadi) {
            try {
                const Notification = (await import("../models/notification.model.js")).default;
                await Notification.create({
                    recipientAnganwadi: user.linkedAnganwadi,
                    type: "delivery",
                    message: `${user.name || "A beneficiary"} has confirmed delivery. Baby (${gender}) registered on ${new Date(dob).toLocaleDateString()}.`,
                });
            } catch (notifErr) {
                // Non-blocking: notification failure should not break baby creation
                console.error("Delivery notification error:", notifErr.message);
            }
        }

        res.status(201).json({
            baby,
            vaccinationCount: vaccinations.length,
            message: `Baby registered! ${vaccinations.length} vaccinations scheduled.`,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * GET /api/baby
 * Get all babies for the logged-in mother.
 */
export const getBabies = async (req, res) => {
    try {
        const babies = await Baby.find({ mother: req.user._id }).sort({ createdAt: -1 });
        res.json(babies);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * GET /api/baby/:babyId
 * Get a specific baby's details.
 */
export const getBabyById = async (req, res) => {
    try {
        const baby = await Baby.findOne({ _id: req.params.babyId, mother: req.user._id });
        if (!baby) return res.status(404).json({ message: "Baby not found" });
        res.json(baby);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==============================
// WEIGHT TRACKING
// ==============================

/**
 * POST /api/baby/:babyId/weight
 */
export const logBabyWeight = async (req, res) => {
    try {
        const { weight, date } = req.body;
        const baby = await Baby.findOne({ _id: req.params.babyId, mother: req.user._id });
        if (!baby) return res.status(404).json({ message: "Baby not found" });

        const log = await BabyWeightLog.create({
            baby: baby._id,
            weight,
            date: date ? new Date(date) : new Date(),
        });

        res.status(201).json(log);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * GET /api/baby/:babyId/weight?range=weekly|monthly
 */
export const getBabyWeightLogs = async (req, res) => {
    try {
        const range = req.query.range || "weekly";
        const baby = await Baby.findOne({ _id: req.params.babyId, mother: req.user._id });
        if (!baby) return res.status(404).json({ message: "Baby not found" });

        let logs;
        if (range === "monthly") {
            logs = await BabyWeightLog.aggregate([
                { $match: { baby: baby._id } },
                {
                    $group: {
                        _id: { month: { $month: "$date" }, year: { $year: "$date" } },
                        avgWeight: { $avg: "$weight" },
                        latestWeight: { $last: "$weight" },
                        count: { $sum: 1 },
                    },
                },
                { $sort: { "_id.year": 1, "_id.month": 1 } },
            ]);
        } else {
            logs = await BabyWeightLog.aggregate([
                { $match: { baby: baby._id } },
                {
                    $group: {
                        _id: { week: { $isoWeek: "$date" }, year: { $isoWeekYear: "$date" } },
                        avgWeight: { $avg: "$weight" },
                        latestWeight: { $last: "$weight" },
                        count: { $sum: 1 },
                    },
                },
                { $sort: { "_id.year": 1, "_id.week": 1 } },
            ]);
        }

        // Growth trend indicator
        const allLogs = await BabyWeightLog.find({ baby: baby._id }).sort({ date: 1 });
        let trend = "stable";
        if (allLogs.length >= 2) {
            const diff = allLogs[allLogs.length - 1].weight - allLogs[allLogs.length - 2].weight;
            trend = diff > 0 ? "gaining" : diff < 0 ? "losing" : "stable";
        }

        // Age-based weight reference (WHO simplified)
        const ageWeeks = Math.floor((new Date() - new Date(baby.dob)) / (1000 * 60 * 60 * 24 * 7));
        const latestWeight = allLogs.length > 0 ? allLogs[allLogs.length - 1].weight : baby.birthWeight;
        let warning = null;

        // Simplified WHO reference thresholds for first year
        if (ageWeeks <= 4 && latestWeight < 2.5) warning = "underweight";
        else if (ageWeeks <= 12 && latestWeight < 3.5) warning = "underweight";
        else if (ageWeeks <= 26 && latestWeight < 5.0) warning = "underweight";
        else if (ageWeeks <= 52 && latestWeight < 7.0) warning = "underweight";
        if (ageWeeks <= 52 && latestWeight > 12) warning = "overweight";

        res.json({
            logs,
            rawLogs: allLogs,
            trend,
            warning,
            ageWeeks,
            latestWeight,
            birthWeight: baby.birthWeight,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==============================
// BREASTFEEDING TRACKING
// ==============================

/**
 * POST /api/baby/:babyId/breastfeeding
 */
export const logBreastfeeding = async (req, res) => {
    try {
        const { date, morning, afternoon, evening, notes } = req.body;
        const baby = await Baby.findOne({ _id: req.params.babyId, mother: req.user._id });
        if (!baby) return res.status(404).json({ message: "Baby not found" });

        const logDate = date ? new Date(date) : new Date();
        const startOfDay = new Date(logDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(logDate);
        endOfDay.setHours(23, 59, 59, 999);

        // Upsert: one log per day
        const log = await BreastfeedingLog.findOneAndUpdate(
            { baby: baby._id, date: { $gte: startOfDay, $lte: endOfDay } },
            {
                $set: {
                    baby: baby._id,
                    date: startOfDay,
                    morning: !!morning,
                    afternoon: !!afternoon,
                    evening: !!evening,
                    notes: notes || "",
                },
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        res.json(log);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * GET /api/baby/:babyId/breastfeeding?range=daily|weekly|monthly
 */
export const getBreastfeedingLogs = async (req, res) => {
    try {
        const range = req.query.range || "daily";
        const baby = await Baby.findOne({ _id: req.params.babyId, mother: req.user._id });
        if (!baby) return res.status(404).json({ message: "Baby not found" });

        let logs;
        if (range === "monthly") {
            logs = await BreastfeedingLog.aggregate([
                { $match: { baby: baby._id } },
                {
                    $group: {
                        _id: { month: { $month: "$date" }, year: { $year: "$date" } },
                        totalMorning: { $sum: { $cond: ["$morning", 1, 0] } },
                        totalAfternoon: { $sum: { $cond: ["$afternoon", 1, 0] } },
                        totalEvening: { $sum: { $cond: ["$evening", 1, 0] } },
                        days: { $sum: 1 },
                    },
                },
                { $sort: { "_id.year": 1, "_id.month": 1 } },
            ]);
        } else if (range === "weekly") {
            logs = await BreastfeedingLog.aggregate([
                { $match: { baby: baby._id } },
                {
                    $group: {
                        _id: { week: { $isoWeek: "$date" }, year: { $isoWeekYear: "$date" } },
                        totalMorning: { $sum: { $cond: ["$morning", 1, 0] } },
                        totalAfternoon: { $sum: { $cond: ["$afternoon", 1, 0] } },
                        totalEvening: { $sum: { $cond: ["$evening", 1, 0] } },
                        days: { $sum: 1 },
                    },
                },
                { $sort: { "_id.year": 1, "_id.week": 1 } },
            ]);
        } else {
            logs = await BreastfeedingLog.find({ baby: baby._id }).sort({ date: -1 }).limit(30);
        }

        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==============================
// VACCINATIONS
// ==============================

/**
 * GET /api/baby/:babyId/vaccinations
 */
export const getVaccinations = async (req, res) => {
    try {
        const baby = await Baby.findOne({ _id: req.params.babyId, mother: req.user._id });
        if (!baby) return res.status(404).json({ message: "Baby not found" });

        const vaccinations = await Vaccination.find({ baby: baby._id }).sort({ dueDate: 1 });

        // Auto-mark overdue
        const now = new Date();
        const updated = vaccinations.map((v) => {
            const obj = v.toObject();
            if (obj.status === "pending" && obj.dueDate < now) {
                obj.status = "overdue";
            }
            return obj;
        });

        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * PUT /api/baby/:babyId/vaccinations/:vaccinationId
 */
export const updateVaccination = async (req, res) => {
    try {
        const { status, notes } = req.body;
        const baby = await Baby.findOne({ _id: req.params.babyId, mother: req.user._id });
        if (!baby) return res.status(404).json({ message: "Baby not found" });

        const vacc = await Vaccination.findOneAndUpdate(
            { _id: req.params.vaccinationId, baby: baby._id },
            {
                $set: {
                    status: status || "completed",
                    completedAt: status === "completed" ? new Date() : undefined,
                    notes: notes || "",
                },
            },
            { new: true }
        );

        if (!vacc) return res.status(404).json({ message: "Vaccination not found" });
        res.json(vacc);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==============================
// REMINDERS
// ==============================

/**
 * POST /api/baby/:babyId/reminders
 */
export const createBabyReminder = async (req, res) => {
    try {
        const { title, description, date } = req.body;
        const baby = await Baby.findOne({ _id: req.params.babyId, mother: req.user._id });
        if (!baby) return res.status(404).json({ message: "Baby not found" });

        const reminder = await BabyReminder.create({
            baby: baby._id,
            createdBy: "mother",
            createdByUser: req.user._id,
            title,
            description,
            date: new Date(date),
        });

        res.status(201).json(reminder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * GET /api/baby/:babyId/reminders
 */
export const getBabyReminders = async (req, res) => {
    try {
        const baby = await Baby.findOne({ _id: req.params.babyId, mother: req.user._id });
        if (!baby) return res.status(404).json({ message: "Baby not found" });

        const reminders = await BabyReminder.find({ baby: baby._id }).sort({ date: 1 });
        res.json(reminders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * PUT /api/baby/:babyId/reminders/:reminderId
 */
export const updateBabyReminder = async (req, res) => {
    try {
        const { status, title, date } = req.body;
        const baby = await Baby.findOne({ _id: req.params.babyId, mother: req.user._id });
        if (!baby) return res.status(404).json({ message: "Baby not found" });

        const updates = {};
        if (status) updates.status = status;
        if (title) updates.title = title;
        if (date) updates.date = new Date(date);

        const reminder = await BabyReminder.findOneAndUpdate(
            { _id: req.params.reminderId, baby: baby._id },
            { $set: updates },
            { new: true }
        );

        if (!reminder) return res.status(404).json({ message: "Reminder not found" });
        res.json(reminder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==============================
// HEALTH REMARKS (from Anganwadi or Mother)
// ==============================

/**
 * POST /api/baby/:babyId/remarks
 */
export const addHealthRemark = async (req, res) => {
    try {
        const { remark } = req.body;
        const baby = await Baby.findOne({ _id: req.params.babyId, mother: req.user._id });
        if (!baby) return res.status(404).json({ message: "Baby not found" });

        baby.healthRemarks.push({ remark, addedBy: "mother", date: new Date() });
        await baby.save();

        res.json(baby);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==============================
// MONTHLY CURATED SUMMARY (AI)
// ==============================

/**
 * GET /api/baby/:babyId/monthly-summary
 */
export const getMonthlySummary = async (req, res) => {
    try {
        const baby = await Baby.findOne({ _id: req.params.babyId, mother: req.user._id });
        if (!baby) return res.status(404).json({ message: "Baby not found" });

        const ageWeeks = Math.floor((new Date() - new Date(baby.dob)) / (1000 * 60 * 60 * 24 * 7));
        const weightLogs = await BabyWeightLog.find({ baby: baby._id }).sort({ date: -1 }).limit(4);
        const feedingLogs = await BreastfeedingLog.find({ baby: baby._id }).sort({ date: -1 }).limit(30);
        const vaccinations = await Vaccination.find({ baby: baby._id, status: { $in: ["pending", "overdue"] } }).sort({ dueDate: 1 }).limit(5);

        const latestWeight = weightLogs.length > 0 ? weightLogs[0].weight : baby.birthWeight;
        const feedingDays = feedingLogs.length;
        const pendingVaccines = vaccinations.map((v) => v.vaccineName).join(", ");

        const prompt = `Generate a monthly health summary for a ${ageWeeks}-week-old ${baby.gender} baby.
Birth weight: ${baby.birthWeight} kg, Current weight: ${latestWeight} kg.
Feeding logged ${feedingDays} days this month.
Pending vaccines: ${pendingVaccines || "None"}.
Respond ONLY in valid JSON:
{
  "growthSummary": "...",
  "feedingSummary": "...",
  "vaccinationStatus": "...",
  "suggestions": ["...", "..."],
  "disclaimer": "These are predictive and informational insights. For serious medical concerns, please consult a qualified gynecologist or pediatrician."
}`;

        let summary;
        try {
            const aiResponse = await generateAIResponse(prompt);
            const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
            summary = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(aiResponse);
        } catch {
            summary = {
                growthSummary: `Baby is ${ageWeeks} weeks old. Current weight: ${latestWeight} kg.`,
                feedingSummary: `Breastfeeding logged for ${feedingDays} days recently.`,
                vaccinationStatus: pendingVaccines ? `Pending: ${pendingVaccines}` : "All vaccinations up to date.",
                suggestions: ["Continue regular feeding", "Track weight weekly", "Follow vaccination schedule"],
                disclaimer: "These are predictive and informational insights. For serious medical concerns, please consult a qualified gynecologist or pediatrician.",
            };
        }

        res.json(summary);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==============================
// KUNDALI & NAME GENERATOR (AI)
// ==============================

/**
 * POST /api/baby/:babyId/kundali
 * Generates Kundali summary using DOB, time of birth, gender.
 */
export const generateKundali = async (req, res) => {
    try {
        const baby = await Baby.findOne({ _id: req.params.babyId, mother: req.user._id });
        if (!baby) return res.status(404).json({ message: "Baby not found" });

        const user = await User.findById(req.user._id);

        const prompt = `You are an expert Indian astrologer.
Given:
- Date of Birth: ${new Date(baby.dob).toISOString().split("T")[0]}
- Time of Birth: ${baby.timeOfBirth}
- Gender: ${baby.gender}
- Mother's Region/State: ${user.currentDistrict || "India"}

Generate a Kundali summary. Respond ONLY in valid JSON:
{
  "nakshatra": "...",
  "rashi": "...",
  "recommended_letters": ["A", "B"],
  "names": [
    { "name": "...", "meaning": "...", "origin": "...", "style": "Modern" },
    { "name": "...", "meaning": "...", "origin": "...", "style": "Traditional" }
  ],
  "kundaliSummary": "Brief astrology summary...",
  "disclaimer": "These are predictive and informational insights. For serious medical concerns, please consult a qualified gynecologist or pediatrician."
}
Generate exactly 10 unique names that start with the recommended letters.
Include a mix of Modern and Traditional styles.
Respect the gender and cultural context.`;

        let result;
        try {
            const aiResponse = await generateAIResponse(prompt);
            const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
            result = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(aiResponse);
        } catch {
            result = {
                nakshatra: "Unable to calculate",
                rashi: "Unable to calculate",
                recommended_letters: [],
                names: [],
                kundaliSummary: "AI could not generate Kundali at this time. Please try again later.",
                disclaimer: "These are predictive and informational insights. For serious medical concerns, please consult a qualified gynecologist or pediatrician.",
            };
        }

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==============================
// DELIVERY STATUS CHECK
// ==============================

/**
 * GET /api/baby/delivery-status
 * Check if the mother has confirmed delivery.
 */
export const getDeliveryStatus = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const babies = await Baby.find({ mother: req.user._id });
        res.json({
            hasDelivered: babies.length > 0,
            postPregnancy: user.postPregnancy || false,
            babyCount: babies.length,
            activeBabyId: user.activeBabyId || (babies.length > 0 ? babies[0]._id : null),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
