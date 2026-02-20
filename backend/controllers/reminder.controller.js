import Reminder from "../models/reminder.model.js";

// Get all reminders for the logged-in user (Care4Mom)
export const getMyReminders = async (req, res) => {
    try {
        const reminders = await Reminder.find({ user: req.user._id })
            .populate("createdBy", "centerName email")
            .sort({ dueAt: 1, status: 1 });

        res.json(reminders);
    } catch (error) {
        console.error("Error in getMyReminders:", error);
        res.status(500).json({ message: error.message });
    }
};

// Update reminder status (mark as completed/cancelled)
export const updateReminderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!["pending", "completed", "cancelled"].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const reminder = await Reminder.findById(id);

        if (!reminder) {
            return res.status(404).json({ message: "Reminder not found" });
        }

        // Verify ownership
        if (reminder.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        reminder.status = status;
        await reminder.save();

        res.json({ message: "Reminder updated", reminder });
    } catch (error) {
        console.error("Error in updateReminderStatus:", error);
        res.status(500).json({ message: error.message });
    }
};

// Get upcoming reminders (for dashboard widgets)
export const getUpcomingReminders = async (req, res) => {
    try {
        const now = new Date();
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        const reminders = await Reminder.find({
            user: req.user._id,
            status: "pending",
            dueAt: { $gte: now, $lte: nextWeek }
        })
            .populate("createdBy", "centerName")
            .sort({ dueAt: 1 })
            .limit(10);

        res.json(reminders);
    } catch (error) {
        console.error("Error in getUpcomingReminders:", error);
        res.status(500).json({ message: error.message });
    }
};
