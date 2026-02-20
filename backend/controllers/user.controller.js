import User from "../models/user.model.js";

// =======================================================================
// PERMANENT FIX: Pregnancy week calculation corrected on 2026-02-20.
// Do NOT modify without full regression testing.
// Related to bug: abnormal week increment issue.
//
// Root cause: Original code used local time (new Date()) which causes
// timezone-dependent drift and potential double-increments near midnight.
// Fix: Normalize both start and now to UTC midnight before computing
// the day difference. This prevents timezone drift, DST issues, and
// fractional-day rounding errors. Week is clamped to [1..42].
// =======================================================================

/**
 * Calculate pregnancy week from startDate using UTC-normalized dates.
 * Returns { week, dueDate } where week is clamped to [1..42].
 * CRITICAL: Do not edit without reviewing related modules.
 * This affects pregnancy/baby lifecycle logic.
 */
export const calcPregnancyWeek = (pregnancyStartDate) => {
  if (!pregnancyStartDate) return { week: 1, dueDate: null };

  // Normalize both dates to UTC midnight to eliminate timezone drift
  const startUtc = Date.UTC(
    new Date(pregnancyStartDate).getUTCFullYear(),
    new Date(pregnancyStartDate).getUTCMonth(),
    new Date(pregnancyStartDate).getUTCDate()
  );
  const nowUtc = Date.UTC(
    new Date().getUTCFullYear(),
    new Date().getUTCMonth(),
    new Date().getUTCDate()
  );

  const diffDays = Math.floor((nowUtc - startUtc) / (1000 * 60 * 60 * 24));
  // Weeks are always >= 0 (future start → 0, then clamp to 1)
  const rawWeek = Math.max(0, Math.floor(diffDays / 7));
  const week = Math.max(1, Math.min(rawWeek, 42));

  // Due date = start + 280 days (40 weeks)
  const due = new Date(pregnancyStartDate);
  due.setDate(due.getDate() + 280);

  return { week, dueDate: due };
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    // PERMANENT FIX: Use UTC-normalized week calculation
    const { week: dynamicWeek, dueDate: dynamicDueDate } = calcPregnancyWeek(user.pregnancyStartDate);

    const responseUser = user.toObject();
    responseUser.currentPregnancyWeek = dynamicWeek;
    responseUser.calculatedDueDate = dynamicDueDate || user.dueDate;

    res.json(responseUser);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const updates = req.body;

    // Prevent editing sensitive fields directly here if needed, 
    // but user requested "Update profile info, height, weight etc"

    // If pregnancyStartDate is being updated, warn? backend just updates it.

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Merge profile object
    if (updates.profile) {
      user.profile = { ...user.profile, ...updates.profile };
    }

    // Top level fields
    if (updates.name) user.name = updates.name;
    if (updates.pregnancyStartDate) user.pregnancyStartDate = updates.pregnancyStartDate;

    // Consent & Legal Updates
    if (typeof updates.aiConsent === 'boolean') user.aiConsent = updates.aiConsent;
    if (typeof updates.termsAccepted === 'boolean') {
      user.termsAccepted = updates.termsAccepted;
      if (updates.termsAccepted) user.termsAcceptedAt = new Date();
    }

    // If start date changed, update due date
    if (updates.pregnancyStartDate) {
      const start = new Date(updates.pregnancyStartDate);
      const due = new Date(start);
      due.setDate(due.getDate() + 280);
      user.dueDate = due;
    }

    await user.save();

    res.json({ success: true, user });

  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ message: "Update failed" });
  }
};
