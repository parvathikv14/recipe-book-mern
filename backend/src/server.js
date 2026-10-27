import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import recipeRoutes from "./routes/recipes.js";

const app = express();
const port = process.env.PORT || 5000;
const allowedOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

app.use(cors({
  origin: (origin, callback) => {
    // Allow command-line tools and local requests with no Origin header.
    if (!origin || allowedOrigin === "*" || origin === allowedOrigin) return callback(null, true);
    return callback(new Error("This origin is not allowed by CORS"));
  },
}));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", database: mongoose.connection.readyState === 1 ? "connected" : "disconnected" });
});
app.use("/api/recipes", recipeRoutes);

app.use((err, _req, res, _next) => {
  console.error(err.message);
  if (err.name === "ValidationError") return res.status(400).json({ message: err.message });
  if (err.name === "CastError") return res.status(400).json({ message: "Invalid value supplied" });
  if (err.message?.includes("CORS")) return res.status(403).json({ message: "Request origin is not allowed" });
  res.status(500).json({ message: "Something went wrong on the server" });
});

async function start() {
  if (!process.env.MONGODB_URI || process.env.MONGODB_URI === "YOUR_ATLAS_CONNECTION_STRING") {
    console.error("Set MONGODB_URI in backend/.env before starting the server.");
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("MongoDB connected");
  app.listen(port, () => console.log(`Recipe Book API running on http://localhost:${port}`));
}
start().catch((error) => {
  console.error("Could not start server:", error.message);
  process.exit(1);
});
