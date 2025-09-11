import express from "express";
import cors from "cors";
import session from "express-session";
import MongoStore from "connect-mongo";
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import apiRoutes from "./routes/api.js";
import Comment from "./models/Comment.js";
import User from "./models/User.js";
import Playlist from "./models/Playlist.js";
import Share from "./models/Share.js";

// Connect to MongoDB
connectDB();

// Clear all data and reset database IDs for testing when server starts
const resetDatabaseForTesting = async () => {
  try {
    console.log('🔄 Resetting database for testing...');
    
    // Drop all collections to reset IDs completely AND clear indexes
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    for (const collection of collections) {
      // Skip system collections and session store
      if (!collection.name.startsWith('system.') && collection.name !== 'sessions') {
        await mongoose.connection.db.dropCollection(collection.name);
        console.log(`   ✅ Dropped collection: ${collection.name}`);
      }
    }
    
    console.log('🗑️  All data and indexes cleared for testing');
    console.log('📝 Database is now in fresh state with reset ObjectIds');
  } catch (error) {
    // If collections don't exist, that's fine for first run
    if (error.message.includes('ns not found')) {
      console.log('📝 Database already clean (first run)');
    } else {
      console.error('❌ Error resetting database:', error);
    }
  }
};

// Call the function after DB connection
mongoose.connection.once('open', async () => {
  console.log('MongoDB connected successfully');
  
  try {
    // Reset database for testing first
    await resetDatabaseForTesting();
    
    // Ensure all indexes are created for optimal performance
    console.log('🔧 Creating database indexes...');
    
    // Create indexes with better error handling
    try {
      await Comment.init(); // Creates all Comment model indexes
      console.log('✅ Comment indexes created');
    } catch (error) {
      console.error('⚠️  Comment index creation warning:', error.message);
    }

    try {
      await User.init(); // Creates all User model indexes  
      console.log('✅ User indexes created');
    } catch (error) {
      console.error('⚠️  User index creation warning:', error.message);
    }

    try {
      await Playlist.init(); // Creates all Playlist model indexes
      console.log('✅ Playlist indexes created');
    } catch (error) {
      console.error('⚠️  Playlist index creation warning:', error.message);
    }

    try {
      await Share.init(); // Creates all Share model indexes
      console.log('✅ Share indexes created');
    } catch (error) {
      console.error('⚠️  Share index creation warning:', error.message);
    }
    
    console.log('✅ All database indexes created successfully');
    console.log('🚀 Server ready for testing with fresh database');
  } catch (error) {
    console.error('❌ Error setting up database:', error);
  }
});

const app = express();

// Middleware
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
app.use(express.json());

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