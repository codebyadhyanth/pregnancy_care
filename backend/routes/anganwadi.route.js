import express from "express";
import {
    registerCenter,
    loginCenter,
    logoutCenter,
    getCenterProfile,
    linkMother,
    releaseMother,
    claimMother,
    generateMomId,
    registerBeneficiary,
    getDashboardStats,
    getBeneficiaries,
    getBeneficiaryDetail,
    getBeneficiaryActivity,
    scheduleVisit,
    getVisits,
    getMigrationRequests,
    getMotherDetails,
    getCenterReports,
    getCenterNotifications,
    updateVisitStatus,
    updateFacilities,
    getNearbyCenters,
    getJoinRequests,
    processJoinRequest,
    createJoinRequest,
    createGuidance,
    getGuidance,
    deleteGuidance,
    getGuidanceForMom,
    createPublicPost,
    getPublicPosts,
    createPersonalSuggestion,
    getPersonalSuggestions,
    getMyPersonalSuggestions,
    markSuggestionComplete,
    createSchemeSupportRequest,
    getBabiesForCenter,
    addBabyHealthRemarkFromCenter,
    setBabyVaccinationReminder,
    createBabyAppointmentFromCenter,
    getBabyGrowthNotes
} from "../controllers/anganwadi.controller.js";
import { protectAnganwadiRoute } from "../middleware/anganwadi.middleware.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public Auth
router.post("/register", registerCenter);
router.post("/login", loginCenter);
router.post("/logout", logoutCenter);

// Public & Nearby
router.get("/nearby", getNearbyCenters);

// Mom-side routes (protected by user auth, NOT anganwadi auth)
router.post("/join-request", protectRoute, createJoinRequest);
router.get("/guidance-for-mom", protectRoute, getGuidanceForMom);
router.post("/scheme-request", protectRoute, createSchemeSupportRequest);

// Public Posts (readable by any authenticated mother)
router.get("/public-posts", protectRoute, getPublicPosts);

// Personal Suggestions (Mom side)
router.get("/personal-suggestions/me", protectRoute, getMyPersonalSuggestions);
router.post("/personal-suggestion/complete/:id", protectRoute, markSuggestionComplete);

// Protected Routes (Anganwadi center auth from here on)
router.use(protectAnganwadiRoute);

router.get("/profile", getCenterProfile);
router.get("/dashboard-stats", getDashboardStats);

// Facilities
router.put("/facilities", updateFacilities);

// Join Requests (Anganwadi Side)
router.get("/join-requests", getJoinRequests);
router.post("/process-join-request", processJoinRequest);


// Beneficiaries
router.get("/mothers", getBeneficiaries);
router.get("/beneficiaries", getBeneficiaries); // Alias for frontend
router.get("/beneficiaries/:momId", getBeneficiaryDetail); // Detailed profile
router.get("/beneficiaries/:momId/activity", getBeneficiaryActivity); // Activity data
router.post("/generate-mom-id", generateMomId); // Admin tool
router.post("/generate-mcp", registerBeneficiary); // New registration with full form
router.post("/link-mother", linkMother);
router.post("/release-mother", releaseMother);
router.post("/claim-mother", claimMother);
router.get("/migration-requests", getMigrationRequests);

// Detailed Views & Reports
router.get("/mother/:id", getMotherDetails);
router.get("/reports", getCenterReports);
router.get("/notifications", getCenterNotifications);

// Visits
router.post("/visit", scheduleVisit);
router.patch("/update-visit-status", updateVisitStatus);
router.get("/visits", getVisits);

// Guidance & Announcements
router.post("/guidance", createGuidance);
router.get("/guidance", getGuidance);
router.delete("/guidance/:id", deleteGuidance);

// Public Posts (Anganwadi creates)
router.post("/public-post", createPublicPost);

// Personal Suggestions (Anganwadi creates & views)
router.post("/personal-suggestion", createPersonalSuggestion);
router.get("/personal-suggestion/:motherId", getPersonalSuggestions);

// Baby Tab (Anganwadi manages babies for linked mothers)
router.get("/babies", getBabiesForCenter);
router.post("/babies/:babyId/remarks", addBabyHealthRemarkFromCenter);
router.post("/babies/:babyId/vaccination-reminder", setBabyVaccinationReminder);
router.post("/babies/:babyId/appointments", createBabyAppointmentFromCenter);
router.get("/babies/:babyId/growth-notes", getBabyGrowthNotes);

export default router;
