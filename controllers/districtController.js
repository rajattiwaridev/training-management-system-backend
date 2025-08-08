const District = require("../models/District");
const Division = require("../models/Division");

// 🔹 Add District
const addDistrict = async (req, res) => {
  try {
    const { sName, districtName, districtNameEng, LGDCode, division } =
      req.body;

    // Validate division exists
    const divisionExists = await Division.findById(division);
    if (!divisionExists) {
      return res.status(404).json({ msg: "Division not found" });
    }
    // Validate required fields
    if (!sName || !districtName || !districtNameEng || !LGDCode || !division) {
      return res.status(400).json({ msg: "All fields are required" });
    }
    // Check if LGDCode is a positive integer
    if (LGDCode <= 0) {
      return res
        .status(400)
        .json({ msg: "LGDCode must be a positive integer" });
    }
    // Check if sName, districtName, and districtNameEng are strings
    if (
      typeof sName !== "string" ||
      typeof districtName !== "string" ||
      typeof districtNameEng !== "string"
    ) {
      return res
        .status(400)
        .json({
          msg: "sName, districtName, and districtNameEng must be strings",
        });
    }
    // Check if sName, districtName, and districtNameEng are not empty
    if (!sName.trim() || !districtName.trim() || !districtNameEng.trim()) {
      return res
        .status(400)
        .json({
          msg: "sName, districtName, and districtNameEng cannot be empty",
        });
    }

    // Check for duplicate LGDCode
    const exists = await District.findOne({ LGDCode });
    if (exists) {
      return res
        .status(400)
        .json({ msg: "District with same LGDCode already exists" });
    }

    const district = new District({
      sName,
      districtName,
      districtNameEng,
      LGDCode,
      division,
    });
    await district.save();

    res.status(201).json({ msg: "District added successfully", district });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// 🔹 Update District by ID
const updateDistrict = async (req, res) => {
  try {
    const { id } = req.params;
    const { sName, districtName, districtNameEng, LGDCode, division } =
      req.body;

    // Validate required fields
    if (!sName || !districtName || !districtNameEng || !LGDCode || !division) {
      return res.status(400).json({ msg: "All fields are required" });
    }
    // Check if LGDCode is a number
    if (typeof LGDCode !== "number") {
      return res.status(400).json({ msg: "LGDCode must be a number" });
    }
    // Check if LGDCode is a positive integer
    if (LGDCode <= 0 || !Number.isInteger(LGDCode)) {
      return res
        .status(400)
        .json({ msg: "LGDCode must be a positive integer" });
    }
    // Check if sName, districtName, and districtNameEng are strings

    if (
      typeof sName !== "string" ||
      typeof districtName !== "string" ||
      typeof districtNameEng !== "string"
    ) {
      return res
        .status(400)
        .json({
          msg: "sName, districtName, and districtNameEng must be strings",
        });
    }

    // Validate division
    if (division) {
      const divisionExists = await Division.findById(division);
      if (!divisionExists) {
        return res.status(404).json({ msg: "Division not found" });
      }
    }

    const updated = await District.findByIdAndUpdate(
      id,
      { sName, districtName, districtNameEng, LGDCode, division },
      { new: true }
    );

    if (!updated) return res.status(404).json({ msg: "District not found" });

    res
      .status(200)
      .json({ msg: "District updated successfully", district: updated });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// 🔹 Get All Districts (with division info)
const getAllDistricts = async (req, res) => {
  try {
    const districts = await District.find().populate("division");
    res.status(200).json(districts);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// 🔹 Get District By ID (with division info)
const getDistrictById = async (req, res) => {
  try {
    const { id } = req.params;
    const district = await District.findById(id).populate("division");

    if (!district) return res.status(404).json({ msg: "District not found" });

    res.status(200).json(district);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// 🔹 Get All Districts for a Division
const getDistrictsByDivision = async (req, res) => {
  try {
    const { divisionId } = req.params;

    // Check if division exists
    const divisionExists = await Division.findById(divisionId);
    if (!divisionExists) {
      return res.status(404).json({ msg: "Division not found" });
    }

    const districts = await District.find({ division: divisionId }).populate(
      "division"
    );
    res.status(200).json(districts);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

module.exports = {
  addDistrict,
  updateDistrict,
  getAllDistricts,
  getDistrictById,
  getDistrictsByDivision,
};
