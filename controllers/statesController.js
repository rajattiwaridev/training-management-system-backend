const State = require("../models/State");

const addState = async (req, res) => {
  try {
    const { stateName } = req.body;
    const existing = await State.findOne({ stateName });
    if (existing) {
      return res.status(400).json({ msg: "State code already exists" });
    }
    const nameExists = await State.findOne({ stateName });
    if (nameExists) {
      return res.status(400).json({ msg: "State name already exists" });
    }
    const state = new State({ stateName});
    await state.save();

    res.status(201).json({ msg: "State added successfully", State });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// 🔹 Update
const updateState = async (req, res) => {
  try {
    const { id } = req.params;
    const { stateName } = req.body;
    const nameExists = await State.findOne({ _id: { $ne: id }, stateName });
    if (nameExists) {
      return res.status(400).json({ msg: "State name already exists" });
    }
    if (!stateName) {
      return res
        .status(400)
        .json({ msg: "State code and name are required" });
    }
    // Update the State
    const state = await State.findById(id);
    if (!state) {
      return res.status(404).json({ msg: "State not found" });
    }
    // Update fields
    state.stateName = stateName;
    // Save the updated State
    await state.save();
    // Find the updated State
    // to return the updated data
    const updatedState = await State.findById(id);
    if (!updatedState) {
      return res.status(404).json({ msg: "State not found" });
    }
    // Return the updated State
    res.status(200).json({
      msg: "State updated successfully",
      State: updatedState,
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const getStateById = async (req, res) => {
  try {
    const { id } = req.params;
    const state = await State.findById(id);
    if (!state) {
      return res.status(404).json({ msg: "State not found" });
    }
    res.status(200).json(state);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const getAllStates = async (req, res) => {
  try {
    const state = await State.find();
    res.status(200).json(state);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

module.exports = {
  addState,
  updateState,
  getStateById,
  getAllStates,
};
