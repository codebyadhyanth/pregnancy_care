export const checkOnboarding = async (req, res, next) => {
    try {
        if (!req.user.isOnboarded) {
            return res.status(403).json({
                message: "Onboarding incomplete",
                redirectTo: "/onboarding"
            });
        }
        next();
    } catch (error) {
        res.status(500).json({ message: "Server error checking onboarding status" });
    }
};
