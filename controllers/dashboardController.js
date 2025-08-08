const employees = require("../models/employees");
const LoginLog = require("../models/LoginLog");
const Training = require("../models/Training");
const userModel = require("../models/userModel");

const getAllCounts = async (req, res) => {
  try {
    const { id } = req.params;
    let user = await userModel.findById(id);
    if (!user) {
      user = await employees.findById(id);
    }
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    const role =
      user?.designation === "SRM" || user?.designation === "DRM"
        ? user?.designation
        : "SUPERADMIN";

    if (role === "SUPERADMIN") {
      const srmCount = await employees.countDocuments({ designation: "SRM" });
      const drmCount = await employees.countDocuments({ designation: "DRM" });
      const trainingCount = await Training.countDocuments();
      const trainingCountScheduled = await Training.countDocuments({
        status: "scheduled",
      });
      const trainingCountCompleted = await Training.countDocuments({
        status: "completed",
      });
      const trainingCountCancelled = await Training.countDocuments({
        status: "cancelled",
      });
      return res.status(200).json({
        srmCount,
        drmCount,
        trainingCount,
        trainingCountScheduled,
        trainingCountCompleted,
        trainingCountCancelled,
      });
    }
    if (role === "SRM" || role === "DRM") {
      const getEmpoloyeeDetails = await employees.findById(id);
      const selfTrainingCount = await Training.countDocuments({
        createdBy: id,
      });
      const selfTrainingCountScheduled = await Training.countDocuments({
        createdBy: id,
        status: "scheduled",
      });
      const selfTrainingCountCompleted = await Training.countDocuments({
        createdBy: id,
        status: "completed",
      });
      const selfTrainingCountCancelled = await Training.countDocuments({
        createdBy: id,
        status: "cancelled",
      });
      const drmCount = await employees.countDocuments({
        state: getEmpoloyeeDetails.state,
        designation: "DRM",
      });
      const getAllDrms = await employees.find({
        state: getEmpoloyeeDetails.state,
        designation: "DRM",
      });
      const drmIds = getAllDrms.map((drm) => drm._id);
      const trainingCount = await Training.countDocuments({
        createdBy: { $in: drmIds },
      });
      const trainingCountScheduled = await Training.countDocuments({
        createdBy: { $in: drmIds },
        status: "scheduled",
      });
      const trainingCountCompleted = await Training.countDocuments({
        createdBy: { $in: drmIds },
        status: "completed",
      });
      const trainingCountCancelled = await Training.countDocuments({
        createdBy: { $in: drmIds },
        status: "cancelled",
      });
      return res.status(200).json({
        selfTrainingCount,
        selfTrainingCountScheduled,
        selfTrainingCountCompleted,
        selfTrainingCountCancelled,
        drmCount,
        trainingCount,
        trainingCountScheduled,
        trainingCountCompleted,
        trainingCountCancelled,
      });
    }
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

const getTodayAndUpComingTrainings = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingTrainings = await Training.find({
      date: { $gt: today },
      status: "scheduled",
    }).sort({ date: 1 });

    const todayTrainings = await Training.find({
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
      status: "scheduled",
    })
      .sort({ date: 1 })
      .populate({
        path: "createdBy",
        select: "name state division district",
        populate: [
          {
            path: "state",
            select: "stateName",
          },
          {
            path: "division",
            select: "name",
          },
          {
            path: "district",
            select: "districtNameEng",
          },
        ],
      });

    res.status(200).json({
      todayTrainings,
      upcomingTrainings,
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

const getEmployeesByLocation = async (req, res) => {
  try {
    const { type, state, division, district } = req.query;
    const filter = {};
    if (type) filter.designation = type;
    if (state) filter.state = state;
    if (division) filter.division = division;
    if (district) filter.district = district;

    const employeeList = await employees.find(filter);
    res.status(200).json(employeeList);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

module.exports = {
  getAllCounts,
  getTodayAndUpComingTrainings,
  getEmployeesByLocation,
};
