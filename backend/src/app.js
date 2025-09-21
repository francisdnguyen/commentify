import express from "express";
import cors from "cors";
import session from "express-session";
import MongoStore from "connect-mongo";
import mongoose from "mongoose";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { body, validationResult } from "express-validator";
import morgan from "morgan";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import apiRoutes from "./routes/api.js";

// Connect to MongoDB
connectDB();

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Allow React app to work
  crossOriginEmbedderPolicy: false
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Logging
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

// CORS middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Input validation middleware
const validateInput = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    ttl: 24 * 60 * 60 // Session TTL (1 day)
  }),
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));

// Routes
app.use("/auth", authRoutes);
app.use("/api", apiRoutes);

// Test route for database connection
app.get("/api/test-db", async (req, res) => {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    res.json({ 
      status: "Connected to MongoDB",
      database: mongoose.connection.db.databaseName,
      collections: collections.map(c => c.name)
    });
  } catch (error) {
    res.status(500).json({ 
      error: "Database connection error",
      details: error.message
    });
  }
});

export default app;