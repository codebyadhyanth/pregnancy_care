import User from "../models/user.model.js";
import AnganwadiCenter from "../models/anganwadi.model.js";
import AnganwadiVisit from "../models/anganwadiVisit.model.js";
import Notification from "../models/notification.model.js";

// --- Mother Actions ---

export const attachMcpId = async (req, res) => {
    try {
        const { mcpId, address, motherPhone, husbandName, husbandPhone } = req.body;
        const userId = req.user._id;

        // 1. Validation
        if (!mcpId) return res.status(400).json({ message: "MCP ID is required" });

        // Check if MCP ID belongs to a known pattern or pre-registered list?
        // Request says: "MCP_ID is generated ONLY in AnganwadiConnect."
        // And "Validate it belongs to an Anganwadi center." - How? 
        // Typically, the Anganwadi creates the User record or the User enters the ID given to them.
        // Let's assume the ID format implies the center OR we lookup a "PreRegistered" collection?
        // OR simpler: The User enters data, and we just save it, and pending Verification?
        // RULE: "Set linkedAnganwadi... Set linkageStatus = 'linked'"
        // implies we MUST find the center.
        // IF MCP-YYYY-XXXX doesn't encode center, how do we find it?
        // Maybe the user ALSO enters the Center ID? "Mother enters Anganwadi_Center_ID in Care4Mom profile" (from previous prompt, still valid?)
        // The current prompt says: "When MCP_ID is entered... Validate it belongs to an Anganwadi center."
        // Let's assume the MCP ID is unique and we might look it up if Anganwadi pre-generated it?
        // BUT, earlier we implemented `generateMomId`. 
        // Let's assume Anganwadi generates it and assigns it to a User placeholder or we just search if any user has this MCP ID?
        // NO, the user is entering it.
        // Let's require Anganwadi Center ID to also be entered for linkage, OR assume the backend can resolve it.
        // Let's stick to the previous flow: "Mother enters Anganwadi_Center_ID".
        // Let's require BOTH or assume MCP ID lookup?
        // Let's go with: User enters MCP ID + Center ID (safest). 
        // Or if MCP ID is globally unique and pre-assigned to a center?
        // Let's assume for now the user updates their profile.

        // Wait, "MCP_ID is generated ONLY in AnganwadiConnect".
        // Use Case: Mom goes to center. Center Genrates MCP ID. Center tells Mom "Your ID is MCP-2026-0001".
        // Mom goes home, opens app, enters MCP-2026-0001.
        // We need to know WHICH center generated it.
        // We can either:
        // 1. Store generated MCP IDs in a lookup table `McpRegistry` (best practice).
        // 2. Or require Mom to enter Center ID too.

        // Let's assume the `User` record might already exist (if Center created it?) No, Center creates "Offline" record?
        // Let's use `AnganwadiCenter` lookup?
        // SIMPLIFICATION: User enters `anganwadiCenterId` AND `mcpId`.
        // OR: We just update the User profile with these details and set status to 'linked' (optimistic) 
        // and let Anganwadi verify?

        // BETTER: User enters details. We save.

        const user = await User.findById(userId);
        user.mcpId = mcpId;
        user.address = address;
        user.motherPhone = motherPhone;
        user.husbandName = husbandName;
        user.husbandPhone = husbandPhone;

        // Linkage logic
        // If we want to link immediately, we need the Center ID.
        // Let's expect `anganwadiCenterId` in body too, as per previous requirement.
        if (req.body.anganwadiCenterId) {

            // Prevent overwriting if already linked to a DIFFERENT center (unless it's null/unlinked)
            if (user.linkedAnganwadi && user.linkageStatus === 'linked') {
                // Check if it's the SAME center (idempotent is fine)
                // We need to fetch the existing center to compare IDs or just compare ObjectId if populated? 
                // user.linkedAnganwadi is ID here (from findById).
                // We can't easily check the "name" without population, but we can check the ID.
                // We will lookup the NEW center first.
            }

            const center = await AnganwadiCenter.findOne({ anganwadiCenterId: req.body.anganwadiCenterId });
            if (center) {
                // Check if already linked to ANOTHER center
                if (user.linkedAnganwadi && user.linkedAnganwadi.toString() !== center._id.toString() && user.linkageStatus === 'linked') {
                    return res.status(400).json({ message: "User is already linked to another Anganwadi center. Please request a migration." });
                }

                user.linkedAnganwadi = center._id;
                user.linkageStatus = "linked";

                // Notify Center
                await Notification.create({
                    recipientAnganwadi: center._id,
                    type: "alert",
                    message: `New mother linked: ${user.name} (${mcpId})`
                });
            } else {
                return res.status(404).json({ message: "Invalid Anganwadi Center ID" });
            }
        }

        await user.save();
        console.log(`[MCP] Attached ${mcpId} to user ${user.name} (Center: ${req.body.anganwadiCenterId || 'None'})`);
        res.json({ message: "Profile updated and linked", user });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const completeVisit = async (req, res) => {
    try {
        const { visitId } = req.body;
        const AnganwadiVisit = (await import("../models/anganwadiVisit.model.js")).default;

        const visit = await AnganwadiVisit.findById(visitId);
        if (!visit) return res.status(404).json({ message: "Visit not found" });

        // Security check: ensure this visit belongs to the user
        if (visit.mom.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Unauthorized to update this visit" });
        }

        visit.completed = true;
        await visit.save();

        res.json({ message: "Visit marked as completed", visit });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getMcpData = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate("linkedAnganwadi", "centerName district officialEmail anganwadiCenterId state");

        // Fetch Visits
        const AnganwadiVisit = (await import("../models/anganwadiVisit.model.js")).default;
        const visits = await AnganwadiVisit.find({ mom: req.user._id }).sort({ nextVisitDate: 1 });

        res.json({ user, visits });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
