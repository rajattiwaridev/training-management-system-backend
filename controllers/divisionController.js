const Division = require("../models/Division");
const State = require("../models/State");

const addDivision = async (req, res) => {
  try {
    const { divisionCode, name, state } = req.body;
    const existing = await Division.findOne({ divisionCode });
    if (existing) {
      return res.status(400).json({ msg: "Division code already exists" });
    }
    const nameExists = await Division.findOne({ name });
    if (nameExists) {
      return res.status(400).json({ msg: "Division name already exists" });
    }
    const division = new Division({ divisionCode, name,state });
    await division.save();

    res.status(201).json({ msg: "Division added successfully", division });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// 🔹 Update
const updateDivision = async (req, res) => {
  try {
    const { id } = req.params;
    const { divisionCode, name,state } = req.body;
    const existing = await Division.findOne({ _id: { $ne: id }, divisionCode });
    if (existing) {
      return res.status(400).json({ msg: "Division code already exists" });
    }
    const nameExists = await Division.findOne({ _id: { $ne: id }, name });
    if (nameExists) {
      return res.status(400).json({ msg: "Division name already exists" });
    }
    if (!divisionCode || !name) {
      return res
        .status(400)
        .json({ msg: "Division code and name are required" });
    }
    // Update the division
    const division = await Division.findById(id);
    if (!division) {
      return res.status(404).json({ msg: "Division not found" });
    }
    // Update fields
    division.divisionCode = divisionCode;
    division.name = name;
    division.state = state
    // Save the updated division
    await division.save();
    // Find the updated division
    // to return the updated data
    const updatedDivision = await Division.findById(id);
    if (!updatedDivision) {
      return res.status(404).json({ msg: "Division not found" });
    }
    // Return the updated division
    res.status(200).json({
      msg: "Division updated successfully",
      division: updatedDivision,
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const getDivisionById = async (req, res) => {
  try {
    const { id } = req.params;
    const division = await Division.findById(id);
    if (!division) {
      return res.status(404).json({ msg: "Division not found" });
    }
    res.status(200).json(division);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const getAllDivisions = async (req, res) => {
  try {
    const divisions = await Division.find();
    res.status(200).json(divisions);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const getDivisionByState = async (req, res) => {
  try {
    const { stateId } = req.params;

    // Check if division exists
    const stateExists = await State.findById(stateId);
    if (!stateExists) {
      return res.status(404).json({ msg: "State not found" });
    }

    const division = await Division.find({ state: stateId }).populate(
      "state"
    );
    res.status(200).json(division);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

module.exports = {
  addDivision,
  updateDivision,
  getDivisionById,
  getAllDivisions,
  getDivisionByState,
};
