import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import path from "path";

import { connectDB } from "./lib/db.js";

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import contentRoutes from "./routes/content.route.js";
import trackerRoutes from "./routes/tracker.route.js";
import communityRoutes from "./routes/community.route.js";
import aiRoutes from "./routes/ai.route.js";
import dashboardRoutes from "./routes/dashboard.route.js";
import blogRoutes from "./routes/blog.route.js";
import anganwadiRoutes from "./routes/anganwadi.route.js";
import mcpRoutes from "./routes/mcp.route.js";
import reminderRoutes from "./routes/reminder.route.js";
import transactionRoutes from "./routes/transaction.route.js";
import babyRoutes from "./routes/baby.route.js";

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

/* =========================
   MIDDLEWARE
========================= */

// CORS Configuration
// Supports multiple origins: localhost for development and Vercel URL for production
// FRONTEND_URL can be a single URL or comma-separated list of URLs
const getAllowedOrigins = () => {
  const frontendUrl = process.env.FRONTEND_URL;

  if (!frontendUrl) {
    // Default: allow localhost for development
    return ["http://localhost:5173", "http://localhost:3000"];
  }

  // If FRONTEND_URL contains commas, split it into an array
  if (frontendUrl.includes(',')) {
    return frontendUrl.split(',').map(url => url.trim());
  }

  // Single URL
  return [frontendUrl];
};

app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = getAllowedOrigins();

      // Allow requests with no origin (like mobile apps, Postman, or same-origin requests)
      if (!origin) {
        return callback(null, true);
      }

      // Check if the origin is in the allowed list
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        // In development, be more permissive for easier debugging
        if (process.env.NODE_ENV === 'development') {
          console.warn(`CORS: Origin ${origin} not in allowed list, but allowing in development`);
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));

/* =========================
   ROUTES
========================= */
// app.use((req, res, next) => {
//   console.log("Incoming request:", req.method, req.url);
//   next();
// });


// app.get("/", (req, res) => {
//   res.status(200).json({
//     message: "Pregnancy Care API Running",
//   });
// });

// app.post("/test", (req, res) => {
//   console.log("Test route hit");
//   res.json({ message: "Test works" });
// });


app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/tracker", trackerRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/anganwadi", anganwadiRoutes);
app.use("/api/mcp", mcpRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/baby", babyRoutes);


/* =========================
   PRODUCTION STATIC SERVING
========================= */

// Fixed: was fully commented out — frontend would never load in production.
// Placed AFTER all /api routes so API calls are not intercepted by the static handler.
// app.get("*") is the SPA fallback: allows React Router to handle client-side routes
// on hard refresh (e.g., refreshing /dashboard returns index.html, not 404).
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

/* =========================
   404 HANDLER
========================= */

app.use((req, res) => {
  res.status(404).json({
    message: "Route Not Found",
  });
});

/* =========================
   GLOBAL ERROR HANDLER
========================= */

app.use((err, req, res, next) => {
  console.error("Server Error:", err.message);

  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});


const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
