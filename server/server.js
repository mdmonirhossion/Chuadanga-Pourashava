const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = "chuadanga_pourashava_secret_key_change_this";
}

const connectDB = require("./config/db");

// Routes
const authRoutes = require("./routes/authRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const supplierRoutes = require("./routes/supplierRoutes");
const itemRoutes = require("./routes/itemRoutes");
const purchaseRoutes = require("./routes/purchaseRoutes");
const issueRoutes = require("./routes/issueRoutes");
const returnRoutes = require("./routes/returnRoutes");
const employeeLedgerRoutes = require("./routes/employeeLedgerRoutes");
const stockTransactionRoutes = require("./routes/stockTransactionRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const reportRoutes = require("./routes/reportRoutes");

const app = express();

// 1. CORS Middleware (Must be defined BEFORE all routes and DB connections)
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://chuadanga-pourashava-store.vercel.app",
  "https://chuadanga-pourashava-store-server.vercel.app"
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-CSRF-Token",
    "X-Requested-With",
    "Accept",
    "Accept-Version",
    "Content-Length",
    "Content-MD5",
    "Date",
    "X-Api-Version"
  ],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// 2. Connect Database Middleware for Serverless
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("Database connection error in middleware:", err);
    next();
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check API
app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Chuadanga Pourashava Store Server API is running successfully!",
  });
});

// Favicon 404 Error Suppress
app.get("/favicon.ico", (req, res) => res.status(204).end());

app.get("/api/health", (req, res) => {
  res.json({
    status: "success",
    message: "Server is healthy",
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/returns", returnRoutes);
app.use("/api/employee-ledger", employeeLedgerRoutes);
app.use("/api/stock-transactions", stockTransactionRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportRoutes);

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;