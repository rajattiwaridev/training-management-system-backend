const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require('fs');
const {
  registerUser,
  loginUser,
  checkVehicleDetails,
  loginSRMDRM,
  updateLoginLogStatus,
} = require("../controllers/authController");
const {
  authMiddleware,
  onlySuperAdmin,
} = require("../middleware/authMiddleware");
const {
  addHeader,
  getHeaderData,
} = require("../controllers/headersController");
const { createBot, triggerBot } = require("../controllers/chatBotController");
const { createBotNew, getBot } = require("../controllers/botController");
const {
  startConversation,
  handleReply,
} = require("../controllers/conversationController");
const {
  getDistrictsByDivision,
  getDistrictById,
  getAllDistricts,
  updateDistrict,
  addDistrict,
} = require("../controllers/districtController");
const {
  addDivision,
  updateDivision,
  getDivisionById,
  getAllDivisions,
  getDivisionByState,
} = require("../controllers/divisionController");
const {
  addEmployees,
  updateEmployee,
  getAllEmployees,
  getSingleEmployee,
  getEmployeeByDesignation,
  toggleEmployeeStatus,
} = require("../controllers/employeesController");
const {
  addState,
  updateState,
  getStateById,
  getAllStates,
} = require("../controllers/statesController");
const {
  createTraining,
  getTrainings,
  getTraining,
  updateTraining,
  getDRMTrainings,
  updateTrainingStatus,
  addAttendance,
  getTrainingAttendance,
} = require("../controllers/trainingController");
const {
  getAllCounts,
  getTodayAndUpComingTrainings,
  getEmployeesByLocation,
} = require("../controllers/dashboardController");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "../uploads/headers"); // Ensure this directory exists or create it beforehand
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); // Extract file extension
    const uniqueName = `${Date.now()}-${file.fieldname}${ext}`;
    cb(null, uniqueName);
  },
});

// Multer upload instance
const upload = multer({ storage: storage });

// Middleware for multiple fields
const addHeaderMiddleware = upload.fields([
  { name: "logoLeft", maxCount: 1 },
  { name: "logoRight", maxCount: 1 },
]);

const storageTraining = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "../uploads/trainings");
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

// Initialize Multer with configuration
const uploadTraining = multer({
  storage: storageTraining,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Middleware to handle multiple files
const handleMultipleFiles = uploadTraining.array("photos", 10); // 'photos' field, max 10 files

// Route using the middleware
router.post("/add-header", authMiddleware, addHeaderMiddleware, addHeader);
router.get("/get-vehicle-details/:id", checkVehicleDetails);
router.post("/add-chatbot", createBot);
router.post("/trigger-chatbot", triggerBot);
router.post("/create-bot", createBotNew);
router.get("/getbot/:id", getBot);
router.post("/conversations/:botId/start", startConversation);
router.post("/conversations/:conversationId/reply", handleReply);

//State Routes
router.post("/states", authMiddleware, onlySuperAdmin, addState);
router.put("/states/:id", authMiddleware, onlySuperAdmin, updateState);
router.get("/states/:id", authMiddleware, getStateById);
router.get("/states", authMiddleware, getAllStates);

// Division Routes
router.post("/divisions", authMiddleware, onlySuperAdmin, addDivision);
router.put("/divisions/:id", authMiddleware, onlySuperAdmin, updateDivision);
router.get("/divisions/:id", authMiddleware, getDivisionById);
router.get("/divisions", authMiddleware, getAllDivisions);
router.get("/state/:stateId/divisions", getDivisionByState);

// District Routes
router.post("/districts", authMiddleware, onlySuperAdmin, addDistrict);
router.put("/districts/:id", authMiddleware, onlySuperAdmin, updateDistrict);
router.get("/districts", authMiddleware, getAllDistricts);
router.get("/district/:id", authMiddleware, getDistrictById);
router.get("/division/:divisionId/districts", getDistrictsByDivision);

//Employee Routes
router.post("/employees", authMiddleware, addEmployees);
router.put("/employees/:id", authMiddleware, updateEmployee);
router.get("/employees", authMiddleware, getAllEmployees);
router.get("/employees/:id", authMiddleware, getSingleEmployee);
router.get(
  "/employees/designation/:type",
  authMiddleware,
  getEmployeeByDesignation
);
router.get("/employees/status/:id", authMiddleware, toggleEmployeeStatus);

//Training Routes
router.post("/trainings/:id", authMiddleware, createTraining);
router.put("/trainings/:id", authMiddleware, updateTraining);
router.get("/trainings/:id", authMiddleware, getTraining);
router.get("/trainings", authMiddleware, getTrainings);
router.get("/drm-trainings/:id", authMiddleware, getDRMTrainings);
router.patch(
  "/trainings/:id/status",
  authMiddleware,
  (req, res, next) => {
    // Handle file upload first
    handleMultipleFiles(req, res, (err) => {
      if (err) {
        // Handle Multer errors
        if (err instanceof multer.MulterError) {
          if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({ error: "File too large (max 5MB)" });
          }
          if (err.code === "LIMIT_FILE_COUNT") {
            return res.status(400).json({ error: "Too many files (max 10)" });
          }
        }
        return res.status(400).json({ error: err.message });
      }
      // Proceed to controller if no errors
      next();
    });
  },
  updateTrainingStatus
);

//SRM/DRM login
router.post("/employee-login", loginSRMDRM);
router.get("/logout/:id", updateLoginLogStatus);

//Training Attendance
router.post("/training/attendance", addAttendance);
router.get("/training/attendance/:id", authMiddleware, getTrainingAttendance);

//Dashboard API's
router.get("/get-allcounts/:id", authMiddleware, getAllCounts);
router.get(
  "/get-today-trainings",
  authMiddleware,
  getTodayAndUpComingTrainings
);
router.get("/get-filter-employees", authMiddleware, getEmployeesByLocation);

//Open APi For Website
router.get("/get-header", getHeaderData);

module.exports = router;
