require("dotenv").config();

const express = require("express");
const cors = require("cors");

const interviewRoutes = require("./routes/interview");

const app = express();

const PORT = process.env.PORT || 5000;

/*
 * CORS
 */
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests without an Origin header
      if (!origin) {
        return callback(null, true);
      }

      // Allow configured frontend URLs
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // In production, block unknown origins
      if (
        process.env.NODE_ENV === "production" &&
        process.env.CLIENT_URL
      ) {
        return callback(
          new Error("Not allowed by CORS")
        );
      }

      // Local development
      return callback(null, true);
    },

    credentials: true,
  })
);

/*
 * JSON body parser
 */
app.use(express.json());

/*
 * Health check
 */
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "InterviewAI server is running",
    environment:
      process.env.NODE_ENV || "development",
  });
});

/*
 * Interview routes
 */
app.use("/api/interview", interviewRoutes);

/*
 * API 404 handler
 *
 * We intentionally use a normal middleware instead
 * of "/api/*" because newer Express/router versions
 * reject that wildcard syntax.
 */
app.use((req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({
      success: false,
      message: "API route not found.",
    });
  }

  next();
});

/*
 * Global error handler
 */
app.use((error, req, res, next) => {
  console.error(
    "Unhandled server error:",
    error
  );

  if (
    error?.message ===
    "Not allowed by CORS"
  ) {
    return res.status(403).json({
      success: false,
      message: "Request blocked by CORS.",
    });
  }

  res.status(500).json({
    success: false,
    message: "Internal server error.",
  });
});

/*
 * Start server
 *
 * 0.0.0.0 is required for most production
 * hosting platforms.
 */
const server = app.listen(
  PORT,
  "0.0.0.0",
  () => {
    console.log(
      `InterviewAI server running on port ${PORT}`
    );

    console.log(
      `Environment: ${
        process.env.NODE_ENV ||
        "development"
      }`
    );
  }
);

/*
 * Server error handling
 */
server.on("error", (error) => {
  console.error(
    "InterviewAI server error:",
    error
  );
});

/*
 * Graceful shutdown
 */
function shutdown(signal) {
  console.log(
    `${signal} received. Shutting down InterviewAI server...`
  );

  server.close(() => {
    console.log(
      "InterviewAI server stopped."
    );

    process.exit(0);
  });
}

process.on("SIGTERM", () => {
  shutdown("SIGTERM");
});

process.on("SIGINT", () => {
  shutdown("SIGINT");
});