const employees = require("../models/employees");
const Training = require("../models/Training");
const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");
const TrainingAttendance = require("../models/TrainingAttendance");
const trainingEmitter = require("../emitter/eventEmitter");

const createTraining = async (req, res) => {
  try {
    const { id } = req.params;
    const trainings = req.body;

    if (!Array.isArray(trainings) || trainings.length === 0) {
      res.status(400);
      throw new Error("Request body must be a non-empty array of trainings");
    }

    // find employee once
    const employee = await employees.findOne({ mobile: id });
    if (!employee) {
      res.status(404);
      throw new Error(`No employee found with mobile ${id}`);
    }

    // validate each entry
    for (let i = 0; i < trainings.length; i++) {
      const t = trainings[i];
      const {
        title,
        trainerName,
        trainingType,
        location,
        date,
        startTime,
        endTime,
      } = t;

      // all fields required
      if (
        !title ||
        !trainerName ||
        !location ||
        !date ||
        !startTime ||
        !endTime
      ) {
        res.status(400);
        throw new Error(`Training at index ${i} is missing required fields`);
      }

      // time logic
      if (startTime >= endTime) {
        res.status(400);
        throw new Error(
          `In training at index ${i}, endTime must be after startTime`
        );
      }
    }

    // map to add createdBy & status
    const docs = trainings.map((t) => ({
      ...t,
      createdBy: employee._id,
      status: "scheduled",
    }));

    // bulk insert
    const created = await Training.insertMany(docs);

    // Ensure uploads/qrCodes directory exists
    const qrCodeDir = path.join(__dirname, "../uploads/qrCodes");
    if (!fs.existsSync(qrCodeDir)) {
      fs.mkdirSync(qrCodeDir, { recursive: true });
    }

    // Generate tiny links and QR codes for each training
    const trainingsWithQR = await Promise.all(
      created.map(async (training) => {
        const baseUrl = "https://cgtransport.gov.in/training/attendance";
        const tinyLink = `${baseUrl}?trainingId=${training._id}`;
        const sanitizedTitle = training.title.replace(/[^a-zA-Z0-9]/g, "_");
        const fileName = `${sanitizedTitle}_${training._id}.png`;
        const filePath = path.join(qrCodeDir, fileName);
        await QRCode.toFile(filePath, tinyLink);
        const relativePath = `uploads/qrCodes/${fileName}`;
        const updatedTraining = await Training.findByIdAndUpdate(
          training._id,
          {
            attendanceLink: tinyLink,
            qrCodeImg: relativePath,
          },
          { new: true }
        );

        return updatedTraining;
      })
    );

    res.status(200).json(trainingsWithQR);
  } catch (error) {
    const status = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(status).json({ message: error.message });
  }
};

// Get all trainings with optional filters
const getTrainings = async (req, res) => {
  try {
    const { status, fromDate, toDate } = req.query;
    let query = {};
    if (status) {
      query.status = status;
    }
    if (fromDate && toDate) {
      query.date = {
        $gte: new Date(fromDate),
        $lte: new Date(toDate),
      };
    }
    const trainings = await Training.find(query).sort({
      date: 1,
      startTime: 1,
    });
    res.json(trainings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single training by ID
const getTraining = async (req, res) => {
  try {
    const getEmployees = await employees.findOne({ mobile: req.params.id });
    const training = await Training.find({ createdBy: getEmployees._id });
    if (!training) {
      res.status(404);
      throw new Error("Training not found");
    }
    res.json(training);
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({ message: error.message });
  }
};

// Update a training by ID
const updateTraining = async (req, res) => {
  try {
    const {
      title,
      trainerName,
      trainingType,
      location,
      date,
      startTime,
      endTime,
      status,
      description,
    } = req.body;
    const training = await Training.findById(req.params.id);
    if (!training) {
      res.status(404);
      throw new Error("Training not found");
    }
    if (training.createdBy.toString() !== req.user.id && !req.user.isAdmin) {
      res.status(401);
      throw new Error("Not authorized to update this training");
    }
    training.title = title || training.title;
    training.trainerName = trainerName || training.trainerName;
    training.trainingType = trainingType || training.trainingType;
    training.location = location || training.location;
    training.date = date || training.date;
    training.startTime = startTime || training.startTime;
    training.endTime = endTime || training.endTime;
    training.status = status || training.status;
    training.description = description || training.description;
    if (startTime && endTime && startTime >= endTime) {
      res.status(400);
      throw new Error("End time must be after start time");
    }
    const updatedTraining = await training.save();
    res.json(updatedTraining);
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({ message: error.message });
  }
};

// Update only the status of a training
const updateTrainingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const files = req.files;

    // Find training
    const training = await Training.findById(id);
    if (!training) {
      return res.status(404).json({ error: "Training not found" });
    }

    // Handle status change to "completed" separately
    if (status === "completed") {
      // Additional validation for completion
      const { attendanceCount } = req.body;

      if (!attendanceCount) {
        return res.status(400).json({ error: "Attendance count is required" });
      }

      if (!files || files.length < 2) {
        return res
          .status(400)
          .json({ error: "At least 2 photos are required" });
      }

      // Process file paths
      const photoPaths = files.map(
        (file) => `/uploads/trainings/${file.filename}`
      );

      // Update training with completion data
      training.status = status;
      training.attendanceCount = Number(attendanceCount);
      training.photos = photoPaths;
      training.completedAt = new Date();

      trainingEmitter.emit("trainingCompleted", training._id);
      await training.save();
      return res.json({
        message: "Training marked as completed",
        training,
      });
    }

    // Handle other status changes (scheduled, cancelled)
    training.status = status;

    // Set cancellation date if cancelled
    if (status === "cancelled") {
      training.cancelledAt = new Date();
    }

    await training.save();

    res.json(training);
  } catch (error) {
    console.error("Error updating training status:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Delete a training by ID
const deleteTraining = async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) {
      res.status(404);
      throw new Error("Training not found");
    }
    if (training.createdBy.toString() !== req.user.id && !req.user.isAdmin) {
      res.status(401);
      throw new Error("Not authorized to delete this training");
    }
    await training.remove();
    res.json({ message: "Training removed" });
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({ message: error.message });
  }
};

const getDRMTrainings = async (req, res) => {
  try {
    const training = await Training.find({ createdBy: req.params.id });
    if (!training) {
      res.status(404);
      throw new Error("Training not found");
    }
    res.json(training);
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({ message: error.message });
  }
};

//Traininig Attendance
const addAttendance = async (req, res) => {
  try {
    const checkTrainingIsCompleted = await Training.findOne({
      _id: req.body.trainingId,
      status: "scheduled",
    });
    if (checkTrainingIsCompleted) {
      const checkAttendanceExists = await TrainingAttendance.find({
        trainingId: req.body.trainingId,
        name: req.body.name,
        mobile: req.body.mobile,
      });
      if (checkAttendanceExists.length > 0) {
        res.status(201).json({ msg: "Attendance Already Given!" });
      } else {
        await TrainingAttendance.create(req.body);
        res.status(200).json({ msg: "Attendance Marked" });
      }
    } else {
      res.status(201).json({ msg: "Training Not Found!" });
    }
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({ message: error.message });
  }
};

const getTrainingAttendance = async (req, res) => {
  try {
    const getTrainingAttendance = await TrainingAttendance.find({
      trainingId: req.params.id,
    });
    if (getTrainingAttendance.length > 0) {
      res.status(200).json(getTrainingAttendance);
    } else {
      res.status(201).json({ msg: "No Attendance Found!" });
    }
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({ message: error.message });
  }
};

module.exports = {
  createTraining,
  getTrainings,
  getTraining,
  updateTraining,
  updateTrainingStatus,
  deleteTraining,
  getDRMTrainings,
  addAttendance,
  getTrainingAttendance,
};
