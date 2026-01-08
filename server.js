// CORE MODULES
const path = require("path");
const briefRoutes = require('./routes/briefRouter');
const actionRoutes = require("./routes/actionRouter");

// EXTERNAL MODULES
const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");
const cors = require("cors");

// LOAD ENV VARIABLES
dotenv.config({ path: path.join(__dirname, "/.env") });

// CONNECT TO DATABASE (with better error handling for Vercel)
const connectToDatabase = async () => {
  try {
    await connectDB();
    console.log('✅ Database connected successfully');
    
    // Inline seeding to avoid import issues
    const mongoose = require('mongoose');
    
    const briefSchema = new mongoose.Schema({
      text: { type: String, required: true },
      difficulty: { type: String, enum: ["easy", "normal", "hard"], required: true },
      active: { type: Boolean, default: true },
    });
    
    const Brief = mongoose.models.Brief || mongoose.model("Brief", briefSchema);
    
    const sampleBriefs = [
      { text: "Take a 10-minute walk outside", difficulty: "easy" },
      { text: "Write down 3 things you're grateful for", difficulty: "easy" },
      { text: "Do 20 push-ups", difficulty: "normal" },
      { text: "Read for 30 minutes", difficulty: "normal" },
      { text: "Meditate for 15 minutes", difficulty: "normal" },
      { text: "Run for 30 minutes", difficulty: "hard" },
      { text: "Write a 500-word journal entry", difficulty: "hard" },
    ];
    
    const existingBriefs = await Brief.countDocuments();
    if (existingBriefs === 0) {
      await Brief.insertMany(sampleBriefs);
      console.log(`✅ Seeded ${sampleBriefs.length} sample briefs`);
    } else {
      console.log(`ℹ️ Database already has ${existingBriefs} briefs`);
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    // Don't exit in serverless environment
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  }
};

connectToDatabase();
// INITIALIZE EXPRESS APP
const app = express();
const PORT = process.env.PORT || 5000;

// MIDDLEWARE
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:3001',
    'https://daily-brief-zeta.vercel.app'  // Your Vercel domain
  ],
  credentials: true // Allow cookies
}));
app.use(express.json());
app.use(cookieParser());
// ROUTES

app.use('/api/brief', briefRoutes);
app.use("/api/action", actionRoutes);


app.get("/", (req, res) => {
  res.send("API is running...");
});

// START SERVER
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});