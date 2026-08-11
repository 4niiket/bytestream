import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/auth.routes.js";
import videoRoutes from "./routes/video.routes.js";
import userRoutes from "./routes/user.routes.js";
import interactionRoutes from "./routes/interaction.routes.js";
import watchLaterRoutes from "./routes/watchlater.routes.js";
import submissionRoutes from "./routes/submission.routes.js";
import { checkPistonHealth } from "./modules/judge/health.check.js";
import { initializeRedis, preloadVideos } from "./lib/redis.js";
import { prisma } from "./lib/prisma.js";

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const configured = process.env.FRONTEND_URL;
      if (configured) {
        const cleanConfigured = configured.trim().replace(/\/+$/, "");
        const cleanOrigin = origin.trim().replace(/\/+$/, "");
        if (cleanOrigin === cleanConfigured) return callback(null, true);
      }
      if (
        origin.includes("localhost") ||
        origin.includes("127.0.0.1")
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "128kb" }));

// ── Rate limiting for code execution endpoints ──────────────────────────────
// Prevents abuse of the Piston sandbox (guests and logged-in users alike)
const runLimiter = rateLimit({
  windowMs: 60_000,       // 1-minute window
  max: 20,                // 20 runs per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many run requests. Please wait a moment before trying again." },
});

const submitLimiter = rateLimit({
  windowMs: 60_000,       // 1-minute window
  max: 10,                // 10 submits per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many submissions. Please wait a moment before trying again." },
});

app.use("/api/run",    runLimiter);
app.use("/api/execute", runLimiter);
app.use("/api/submit", submitLimiter);

// Health check
app.get("/api/health", async (_req: Request, res: Response) => {
  res.status(200).json({ status: "ByteStream API live and working." });
});

// Root route (helps avoid "Cannot GET /")
app.get("/", (_req: Request, res: Response) => {
  res.status(200).send("ByteStream API is running. Try /api/health");
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/users", userRoutes);
app.use("/api/interactions", interactionRoutes);
app.use("/api/watchlater", watchLaterRoutes);
app.use("/api", submissionRoutes); // covers /api/run, /api/submit, /api/submissions, /api/languages

// ── Global error handler ────────────────────────────────────────────────────
// Catches any unhandled error thrown inside a route or middleware.
// Without this, Express sends a raw HTML error page or hangs the request.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("[Unhandled Error]", err);
  res.status(500).json({ error: "Internal server error. Please try again later." });
});

async function startServer() {
  const PORT = Number(process.env.PORT) || 3001;

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 ByteStream API listening on 0.0.0.0:${PORT}`);
  });

  // Non-blocking background initializations
  initializeRedis().catch((err) => {
    console.error("Failed to connect to Redis:", err);
  });

  prisma.video
    .findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true },
    })
    .then((recentVideos) => {
      const videoIds = recentVideos ? recentVideos.map((v) => v.id) : [];
      return preloadVideos(videoIds);
    })
    .catch((err) => {
      console.warn("Failed to preload videos:", err);
    });

  checkPistonHealth().catch(console.error);
}

void startServer();

export default app;
