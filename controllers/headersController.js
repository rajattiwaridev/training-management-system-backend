const headerModel = require("../models/Headers");

const addHeader = async (req, res) => {
  try {
    
    // Deactivate previous headers
    await headerModel.updateMany({ status: true }, { $set: { status: false } });
    const {
      headerTextOne,
      headerTextOneHindi,
      headerTextTwo,
      headerTextTwoHindi,
    } = req.body;

    // Access uploaded files
    const logoLeft = req.files?.logoLeft?.[0]?.filename || null;
    const logoRight = req.files?.logoRight?.[0]?.filename || null;

    // Check if both logos were uploaded
    if (!logoLeft || !logoRight) {
      return res.status(400).json({ message: "Both logos are required." });
    }

    // Check if all text fields are present
    if (
      !headerTextOne ||
      !headerTextOneHindi ||
      !headerTextTwo ||
      !headerTextTwoHindi
    ) {
      return res
        .status(400)
        .json({ message: "All header text parts are required." });
    }

    // Check if a header already exists
    const existingHeader = await headerModel.findOne({ status: true });
    if (existingHeader) {
      return res
        .status(409)
        .json({ message: "Header already exists. Please update it." });
    }


    // Create new header document
    const newHeader = await headerModel.create({
      headerTextOne,
      headerTextOneHindi,
      headerTextTwo,
      headerTextTwoHindi,
      logoLeft,
      logoRight,
      status: true,
    });

    if (newHeader) {
      return res.status(200).json({
        message: "Header added successfully.",
        data: newHeader,
      });
    } else {
      return res.status(500).json({
        message: "Failed to add header.",
      });
    }
  } catch (error) {
    console.error("addHeader error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};


const getHeaderData = async (req, res) => {
  try {
    const getHeaderData = await headerModel.findOne({status: true});
    if (getHeaderData) {
      res.status(200).json(getHeaderData);
    } else {
      res.status(201).json({ message: "Header Data Not Found!." });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = { addHeader, getHeaderData };
