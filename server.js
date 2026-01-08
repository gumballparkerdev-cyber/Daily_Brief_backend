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