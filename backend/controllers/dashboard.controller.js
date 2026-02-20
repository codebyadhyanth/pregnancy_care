import User from "../models/user.model.js";
import Tracking from "../models/tracking.model.js";
import Nutrition from "../models/nutrition.model.js";
import Exercise from "../models/exercise.model.js";
import Yoga from "../models/yoga.model.js";
import Medication from "../models/medication.model.js";
import Appointment from "../models/appointment.model.js";
import { generateAIResponse } from "../lib/ai.service.js";
import { getBabyGrowth } from "../lib/babyGrowthUtils.js";
import { calcPregnancyWeek } from "./user.controller.js";

// --- Onboarding ---
export const completeOnboarding = async (req, res) => {
    try {
        const { pregnancyStartDate, age } = req.body;

        // Age validation: must be between 20 and 40 (inclusive)
        if (age !== undefined) {
            const ageNum = Number(age);
            if (Number.isNaN(ageNum) || ageNum < 20 || ageNum > 40) {
                return res.status(400).json({ message: "Age must be between 20 and 40 years" });
            }
        }

        let dueDate = null;
        if (pregnancyStartDate) {
            const start = new Date(pregnancyStartDate);
            const due = new Date(start);
            due.setDate(due.getDate() + 280);
            dueDate = due;
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            {
                profile: req.body,
                pregnancyStartDate,
                dueDate,
                isOnboarded: true
            },
            { new: true }
        );
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- Tracking ---
// --- Tracking ---
export const updateTracking = async (req, res) => {
    try {
        const { weight, motherWeight, steps, distanceKm, waterIntakeLiters, symptoms, notes } = req.body;

        const user = await User.findById(req.user._id);

        // PERMANENT FIX: Use centralized UTC-normalized week calculation
        const { week: currentWeek } = calcPregnancyWeek(user.pregnancyStartDate);

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        // Prepare Update Object
        const updateOps = {
            $set: {
                week: currentWeek,
                date: startOfDay // Normalized Date
            },
            $inc: {},
            $push: {}
        };

        // Fields to SET (Latest value overwrites)
        if (motherWeight || weight) updateOps.$set.motherWeight = parseFloat(motherWeight || weight);
        if (symptoms) updateOps.$set.symptoms = symptoms;
        if (notes) updateOps.$set.notes = notes;

        // Fields to INC (Accumulate)
        if (steps) updateOps.$inc.steps = parseInt(steps);
        if (distanceKm) updateOps.$inc.distanceKm = parseFloat(distanceKm);
        if (waterIntakeLiters) updateOps.$inc.waterIntakeLiters = parseFloat(waterIntakeLiters);

        // Fields to PUSH
        if (weight) updateOps.$push.weightLog = parseFloat(weight);

        // Cleanup empty ops
        if (Object.keys(updateOps.$inc).length === 0) delete updateOps.$inc;
        if (Object.keys(updateOps.$push).length === 0) delete updateOps.$push;
        if (!Object.keys(updateOps.$set).length) delete updateOps.$set; // Safety

        const tracking = await Tracking.findOneAndUpdate(
            {
                user: req.user._id,
                // Using range query as requested to be safe against slight time variations if any,
                // though usually createdAt drives this. We want to find IF a doc exists for today.
                date: { $gte: startOfDay, $lte: endOfDay }
            },
            updateOps,
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        res.json(tracking);
    } catch (error) {
        console.error("Update Tracking Error:", error);
        res.status(500).json({ message: error.message });
    }
};

export const getTracking = async (req, res) => {
    try {
        const range = req.query.range || 'daily';
        const user = await User.findById(req.user._id);

        // Progress Stats
        let progressStats = {
            pregnancyWeek: user.pregnancyWeek || 1,
            dueDate: user.dueDate,
            progressPercentage: 0,
            daysRemaining: 0
        };

        // PERMANENT FIX: Use centralized UTC-normalized week calculation
        if (user.pregnancyStartDate) {
            const { week, dueDate: due } = calcPregnancyWeek(user.pregnancyStartDate);
            progressStats.pregnancyWeek = week;
            progressStats.dueDate = due || user.dueDate;
            progressStats.progressPercentage = Math.min((week / 40) * 100, 100);

            const remainingTime = (due || user.dueDate) - new Date();
            progressStats.daysRemaining = Math.max(Math.ceil(remainingTime / (1000 * 60 * 60 * 24)), 0);
        }

        // --- Today's Specific Stats (Accumulated) ---
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const todayAggregation = await Tracking.aggregate([
            {
                $match: {
                    user: req.user._id,
                    date: { $gte: startOfDay, $lte: endOfDay }
                }
            },
            {
                $group: {
                    _id: null,
                    totalSteps: { $sum: "$steps" },
                    totalWater: { $sum: "$waterIntakeLiters" },
                    latestWeight: { $last: "$motherWeight" } // Using motherWeight as per schema usage
                }
            }
        ]);

        const todayStats = todayAggregation.length > 0 ? todayAggregation[0] : {
            totalSteps: 0,
            totalWater: 0,
            latestWeight: null
        };

        // --- Historical Data (for Charts) ---
        let enrichedData = [];

        if (range === 'weekly') {
            const weeklyData = await Tracking.aggregate([
                { $match: { user: req.user._id } },
                {
                    $group: {
                        _id: { week: { $isoWeek: "$date" }, year: { $isoWeekYear: "$date" } }, // Use normalized date
                        avgWeight: { $avg: "$motherWeight" },
                        totalSteps: { $sum: "$steps" },
                        totalDistance: { $sum: "$distanceKm" },
                        totalWater: { $sum: "$waterIntakeLiters" },
                        docWeek: { $first: "$week" }
                    }
                },
                { $sort: { "_id.year": 1, "_id.week": 1 } }
            ]);
            enrichedData = weeklyData.map(w => ({
                _id: w.docWeek || w._id.week,
                label: `Wk ${w._id.week}`,
                avgWeight: w.avgWeight ? parseFloat(w.avgWeight.toFixed(1)) : null,
                totalSteps: w.totalSteps || 0,
                totalDistance: w.totalDistance || 0,
                totalWater: w.totalWater || 0,
                babyStats: getBabyGrowth(w.docWeek || w._id.week)
            }));
        } else if (range === 'monthly') {
            const monthlyData = await Tracking.aggregate([
                { $match: { user: req.user._id } },
                {
                    $group: {
                        _id: { month: { $month: "$date" }, year: { $year: "$date" } },
                        avgWeight: { $avg: "$motherWeight" },
                        totalSteps: { $sum: "$steps" },
                        totalDistance: { $sum: "$distanceKm" },
                        totalWater: { $sum: "$waterIntakeLiters" }
                    }
                },
                { $sort: { "_id.year": 1, "_id.month": 1 } }
            ]);
            enrichedData = monthlyData.map(m => ({
                _id: m._id.month,
                label: `${m._id.month}/${m._id.year}`,
                avgWeight: m.avgWeight ? parseFloat(m.avgWeight.toFixed(1)) : null,
                totalSteps: m.totalSteps || 0,
                totalWater: m.totalWater || 0
            }));
        } else {
            // Daily History
            const tracking = await Tracking.find({ user: req.user._id }).sort({ date: -1 }).limit(30);
            enrichedData = tracking.map(t => {
                const baby = getBabyGrowth(t.week);
                return {
                    ...t.toObject(),
                    estimatedBabyWeight: baby ? baby.weightGrams : null,
                    estimatedBabyLength: baby ? baby.lengthCm : null
                };
            });
        }

        res.json({
            stats: progressStats,
            data: enrichedData,
            today: todayStats // Return specific today stats
        });

    } catch (error) {
        console.error("Get Tracking Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// --- Nutrition (AI) ---
export const logNutrition = async (req, res) => {
    try {
        const { foodEntry, isSuggestion, suggestionItem } = req.body;
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        let nutritionLog = await Nutrition.findOne({
            user: req.user._id,
            createdAt: { $gte: startOfDay, $lte: endOfDay }
        });

        if (!nutritionLog) {
            nutritionLog = new Nutrition({
                user: req.user._id,
                date: new Date(),
                items: [],
                totals: { calories: 0, protein: 0, carbs: 0, fats: 0, iron: 0, calcium: 0, water: 0 }
            });
        }

        if (isSuggestion && suggestionItem) {
            // Log from suggestion click
            nutritionLog.items.push(suggestionItem);
            nutritionLog.totals.calories += suggestionItem.calories || 0;
            nutritionLog.totals.protein += suggestionItem.protein || 0;
            nutritionLog.totals.carbs += suggestionItem.carbs || 0;
            nutritionLog.totals.fats += suggestionItem.fats || 0;
            nutritionLog.totals.iron += suggestionItem.iron || 0;
            nutritionLog.totals.calcium += suggestionItem.calcium || 0;
        } else {
            // Manual Entry Analysis
            const prompt = `Analyze this food intake for a pregnant woman: "${foodEntry}". 
        Respond ONLY in valid JSON format.
        Fields: "name", "calories" (number), "protein" (g), "carbs" (g), "fats" (g), "iron" (mg), "calcium" (mg), "healthRating" (Good/Moderate/Poor), "feedback" (short string).`;

            let aiResponse = await generateAIResponse(prompt);
            let feedbackData = {};

            try {
                const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    feedbackData = JSON.parse(jsonMatch[0]);
                } else {
                    feedbackData = JSON.parse(aiResponse);
                }
            } catch (e) {
                console.error("AI JSON Parse Error (Nutrition):", e);
                feedbackData = {
                    name: foodEntry,
                    calories: 0,
                    protein: 0, carbs: 0, fats: 0, iron: 0, calcium: 0,
                    healthRating: "Unknown",
                    feedback: "Could not analyze."
                };
            }

            const newItem = {
                name: feedbackData.name || foodEntry,
                calories: feedbackData.calories || 0,
                protein: feedbackData.protein || 0,
                carbs: feedbackData.carbs || 0,
                fats: feedbackData.fats || 0,
                iron: feedbackData.iron || 0,
                calcium: feedbackData.calcium || 0
            };

            nutritionLog.items.push(newItem);
            nutritionLog.totals.calories += newItem.calories;
            nutritionLog.totals.protein += newItem.protein;
            nutritionLog.totals.carbs += newItem.carbs;
            nutritionLog.totals.fats += newItem.fats;
            nutritionLog.totals.iron += newItem.iron;
            nutritionLog.totals.calcium += newItem.calcium;

            // Legacy field support for recent logs view compatibility
            nutritionLog.foodEntry = foodEntry;
            nutritionLog.aiFeedback = feedbackData.feedback;
        }

        await nutritionLog.save();
        res.json(nutritionLog);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getNutrition = async (req, res) => {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const log = await Nutrition.findOne({
            user: req.user._id,
            createdAt: { $gte: startOfDay, $lte: endOfDay }
        });

        // Default goals (can be dynamic based on trimester/weight later)
        const goals = {
            calories: 2200,
            protein: 75, // g
            carbs: 175, // g
            iron: 27, // mg
            calcium: 1000, // mg
            water: 3 // L
        };

        const tracking = await Tracking.findOne({
            user: req.user._id,
            createdAt: { $gte: startOfDay, $lte: endOfDay }
        });

        const waterIntake = tracking ? tracking.waterIntakeLiters : 0;

        let summary = {
            totals: log ? log.totals : { calories: 0, protein: 0, carbs: 0, fats: 0, iron: 0, calcium: 0 },
            waterIntake,
            goals
        };

        res.json({
            log, // Today's detailed log
            summary
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getNutritionSuggestions = async (req, res) => {
    try {
        const { trimester, weight, nutritionGoals, deficiencies, region } = req.body;

        const prompt = `Suggest 3 nutritious Indian rural meals/snacks for a pregnant woman (Trimester: ${trimester}, Region: ${region || 'India'}).
        Include 3 specific fruits.
        Format: JSON ONLY.
        {
            "suggestions": [
              { "name": "", "calories": 0, "protein": 0, "carbs": 0, "fats": 0, "iron": 0, "calcium": 0, "benefits": ["bullet 1", "bullet 2"] }
            ],
            "fruits": ["fruit1", "fruit2", "fruit3"]
        }
        NO MARKDOWN. Strict JSON.`;

        const aiResponse = await generateAIResponse(prompt);
        let data = { suggestions: [], fruits: [] };

        try {
            const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                data = JSON.parse(jsonMatch[0]);
            } else {
                data = JSON.parse(aiResponse);
            }
        } catch (e) {
            console.error("AI Suggestion Parse Error", e);
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- Alerts ---
export const getAlertStatus = async (req, res) => {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        // Fetch today's data (Nutrition, Tracking, Meds)
        const nutritionLog = await Nutrition.findOne({ user: req.user._id, createdAt: { $gte: startOfDay, $lte: endOfDay } });
        const tracking = await Tracking.findOne({ user: req.user._id, createdAt: { $gte: startOfDay, $lte: endOfDay } });

        // Fetch Next Appointment
        const nextAppointment = await Appointment.findOne({
            user: req.user._id,
            date: { $gte: startOfDay }
        }).sort({ date: 1 });

        // Goals (Mocked or from User profile if available)
        const goals = {
            calories: 2200, protein: 75, water: 3, steps: 6000
        };

        const current = {
            calories: nutritionLog ? nutritionLog.totals.calories : 0,
            protein: nutritionLog ? nutritionLog.totals.protein : 0,
            water: tracking ? tracking.waterIntakeLiters : 0,
            steps: tracking ? tracking.steps : 0
        };

        // Status Logic
        const status = {
            tracking: {
                water: `${current.water.toFixed(1)}L / ${goals.water}L`,
                steps: `${current.steps} / ${goals.steps}`,
                protein: `${Math.round(current.protein)}g / ${goals.protein}g`,
                calories: `${Math.round(current.calories)} / ${goals.calories}`
            },
            nextAppointment: nextAppointment
                ? `${new Date(nextAppointment.date).toLocaleDateString()} at ${nextAppointment.time}`
                : "No upcoming visits",
            alerts: []
        };

        if (current.water < goals.water) status.alerts.push("Hydration low. Drink more water.");
        if (current.protein < goals.protein) status.alerts.push("Protein intake is below goal.");
        if (current.steps < goals.steps) status.alerts.push("Step count low. Try a short walk.");

        // Check if appointment is today
        if (nextAppointment) {
            const apptDate = new Date(nextAppointment.date);
            // Simple check if same day
            if (apptDate.toDateString() === new Date().toDateString()) {
                status.alerts.unshift(`You have a doctor visit today at ${nextAppointment.time}`);
            }
        }

        res.json(status);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// --- Exercise (AI) ---
export const logExercise = async (req, res) => {
    try {
        const { activity, duration } = req.body;

        const prompt = `You are a prenatal exercise specialist. Analyze: "${activity}" for ${duration} minutes.
    Respond ONLY in valid JSON. 
    Format:
    {
      "insights": [
        "bullet point 1 (max 12 words)",
        "bullet point 2",
        "bullet point 3"
      ]
    }
    Max 5 bullets. No paragraphs.`;

        let aiResponse = await generateAIResponse(prompt);
        let aiRecommendation = {};

        try {
            const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                aiRecommendation = JSON.parse(jsonMatch[0]);
            } else {
                aiRecommendation = JSON.parse(aiResponse);
            }
        } catch (e) {
            console.error("AI JSON Parse Error (Exercise):", e);
            aiRecommendation = { insights: ["Safe movement is key.", "Listen to your body."] };
        }

        const exercise = await Exercise.create({
            user: req.user._id,
            activity,
            duration,
            aiRecommendation
        });

        res.json(exercise);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getExercise = async (req, res) => {
    try {
        const logs = await Exercise.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- Yoga (AI) ---
export const generateYogaPlan = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        // PERMANENT FIX: Use centralized UTC-normalized week calculation
        const { week: routineWeek } = calcPregnancyWeek(user.pregnancyStartDate);

        const { medicalConditions } = user.profile;

        const prompt = `You are a prenatal yoga specialist. Generate safe yoga routine for week ${routineWeek}.
    Conditions: ${medicalConditions && medicalConditions.length ? medicalConditions.join(', ') : 'None'}.
    Respond ONLY in valid JSON.
    Fields: week, 
    poses (array of {name, durationMinutes, benefits (array of strings), steps (array of strings), youtubeSearch (string compatible with query)}), 
    generalAdvice.`;

        let aiResponse = await generateAIResponse(prompt);
        let plan = {};

        try {
            const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                plan = JSON.parse(jsonMatch[0]);
            } else {
                plan = JSON.parse(aiResponse);
            }
        } catch (e) {
            return res.status(500).json({ message: "Failed to generate a valid yoga plan." });
        }

        const yoga = await Yoga.create({
            user: req.user._id,
            generatedPlan: plan,
            week: routineWeek
        });

        res.json(yoga);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getYogaPlans = async (req, res) => {
    try {
        const plans = await Yoga.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(plans);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- Medication ---
export const addMedication = async (req, res) => {
    try {
        const medication = await Medication.create({
            user: req.user._id,
            ...req.body
        });
        res.json(medication);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getMedications = async (req, res) => {
    try {
        const meds = await Medication.find({ user: req.user._id });
        res.json(meds);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteMedication = async (req, res) => {
    try {
        await Medication.findByIdAndDelete(req.params.id);
        res.json({ message: "Medication deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- Appointments ---
export const addAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.create({
            user: req.user._id,
            ...req.body
        });
        res.json(appointment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({ user: req.user._id }).sort({ date: 1 });
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteAppointment = async (req, res) => {
    try {
        await Appointment.findByIdAndDelete(req.params.id);
        res.json({ message: "Appointment deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- Updates Slider (5th Card Aggregator) ---
export const getUpdatesSlider = async (req, res) => {
    try {
        const userId = req.user._id;
        const now = new Date();
        const updates = [];

        // 1. Pending Medications (active reminders)
        const meds = await Medication.find({ user: userId, reminderEnabled: true });
        meds.forEach(med => {
            updates.push({
                type: "medication",
                title: `💊 ${med.medicineName}`,
                message: med.dosage ? `${med.dosage} — ${med.time || "As scheduled"}` : (med.time || "Take as prescribed"),
                priority: 2,
                sourceId: med._id,
                createdAt: med.createdAt
            });
        });

        // 2. Upcoming Appointments (next 7 days)
        const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const appointments = await Appointment.find({
            user: userId,
            date: { $gte: now, $lte: weekFromNow }
        }).sort({ date: 1 });

        appointments.forEach(appt => {
            const apptDate = new Date(appt.date);
            const isToday = apptDate.toDateString() === now.toDateString();
            updates.push({
                type: "appointment",
                title: `📅 ${appt.title}`,
                message: `${isToday ? "TODAY" : apptDate.toLocaleDateString()} at ${appt.time} — ${appt.hospitalName}`,
                priority: isToday ? 1 : 3,
                sourceId: appt._id,
                createdAt: appt.createdAt
            });
        });

        // 3. Pending Personal Suggestions
        try {
            const PersonalSuggestion = (await import("../models/personalSuggestion.model.js")).default;
            const suggestions = await PersonalSuggestion.find({
                motherId: userId,
                status: "pending",
                isActive: true
            }).populate("anganwadiId", "centerName").sort({ createdAt: -1 }).limit(10);

            suggestions.forEach(sug => {
                updates.push({
                    type: "suggestion",
                    title: `🏥 ${sug.title}`,
                    message: sug.message,
                    category: sug.category,
                    priority: 2,
                    sourceId: sug._id,
                    centerName: sug.anganwadiId?.centerName,
                    createdAt: sug.createdAt
                });
            });
        } catch (err) {
            // PersonalSuggestion model may not exist yet
            console.log("PersonalSuggestion import skipped:", err.message);
        }

        // 4. Pending Reminders
        try {
            const Reminder = (await import("../models/reminder.model.js")).default;
            const reminders = await Reminder.find({
                user: userId,
                status: "pending",
                dueAt: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) } // include overdue by 1 day
            }).sort({ dueAt: 1 }).limit(10);

            reminders.forEach(rem => {
                const isOverdue = new Date(rem.dueAt) < now;
                updates.push({
                    type: "reminder",
                    title: `🔔 ${rem.title}`,
                    message: rem.description || (isOverdue ? "Overdue!" : `Due: ${new Date(rem.dueAt).toLocaleDateString()}`),
                    priority: isOverdue ? 1 : 3,
                    sourceId: rem._id,
                    createdAt: rem.createdAt
                });
            });
        } catch (err) {
            console.log("Reminder import skipped:", err.message);
        }

        // Sort by priority (lower = more urgent), then by date
        updates.sort((a, b) => a.priority - b.priority || new Date(b.createdAt) - new Date(a.createdAt));

        res.json({ updates, count: updates.length });
    } catch (error) {
        console.error("Updates slider error:", error);
        res.status(500).json({ message: error.message });
    }
};
