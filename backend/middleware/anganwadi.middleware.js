import jwt from "jsonwebtoken";
import AnganwadiCenter from "../models/anganwadi.model.js";

export const protectAnganwadiRoute = async (req, res, next) => {
    try {
        let token = req.cookies.anganwadi_jwt; // Separate cookie name

        // Fallback to Bearer token for mobile apps
        if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        }



        

        if (!token) {
            return res.status(401).json({ message: "Unauthorised - No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

        if (!decoded || !decoded.anganwadiId) {
            return res.status(401).json({ message: "Unauthorised - Invalid token" });
        }

        const center = await AnganwadiCenter.findById(decoded.anganwadiId).select("-password");

        if (!center) {
            return res.status(401).json({ message: "Unauthorised - Center not found" });
        }

        if (!center.isActive) {
            return res.status(403).json({ message: "Access Denied - Center inactive" });
        }

        req.center = center;
        next();
    } catch (error) {
        console.error("Error in protectAnganwadiRoute middleware", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
