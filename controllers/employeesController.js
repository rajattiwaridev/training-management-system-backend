const District = require("../models/District");
const Employee = require("../models/employees");
const { generatePassword } = require("../utils/passwordGenerator");
const crypto = require("crypto");

// Generates a random alphanumeric string of given length
function generateRandomAlphaNumeric(length) {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, chars.length);
    result += chars[randomIndex];
  }
  return result;
}

// Adds a new employee
const addEmployees = async (req, res) => {
  try {
    const district = await District.findById(req.body.district);
    if (!district) {
      return res.status(400).json({ message: "District not found" });
    }
    if (district.division.toString() !== req.body.division) {
      return res.status(400).json({ message: "Invalid district-division mapping" });
    }
    const generateString = generateRandomAlphaNumeric(8);
    const password = generatePassword(generateString);
    const body = { ...req.body, password };
    const newEmployee = new Employee(body);
    await newEmployee.save();
    const employee = await Employee.findById(newEmployee._id)
      .populate("division", "name")
      .populate("district", "districtNameEng");
    res.status(201).json(employee);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Duplicate value",
        field: Object.keys(error.keyPattern)[0],
      });
    }
    res.status(400).json({ message: error.message });
  }
};

// Updates an existing employee
const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    if (updateData.district && updateData.division) {
      const district = await District.findById(updateData.district);
      if (!district) {
        return res.status(400).json({ message: "District not found" });
      }
      if (district.division.toString() !== updateData.division) {
        return res.status(400).json({
          message: "Invalid district-division mapping 1",
          details: `The selected district doesn't belong to the specified division`,
        });
      }
    } else if (updateData.district && !updateData.division) {
      const existingEmployee = await Employee.findById(id);
      if (!existingEmployee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      const district = await District.findById(updateData.district);
      if (!district) {
        return res.status(400).json({ message: "District not found" });
      }
      if (district.division.toString() !== existingEmployee.division.toString()) {
        return res.status(400).json({
          message: "Invalid district-division mapping",
          details: `The selected district doesn't belong to the employee's current division`,
        });
      }
    }
    const updatedUser = await Employee.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("state", "stateName")
      .populate("division", "name")
      .populate("district", "districtNameEng");
    if (!updatedUser) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.json(updatedUser);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Duplicate value",
        field: Object.keys(error.keyPattern)[0],
        value: error.keyValue[Object.keys(error.keyPattern)[0]],
      });
    }
    res.status(400).json({
      message: "Update failed",
      error: error.message,
    });
  }
};

// Gets all employees
const getAllEmployees = async (req, res) => {
  try {
    const users = await Employee.find()
      .populate("state", "stateName")
      .populate("division", "name code")
      .populate("district", "districtNameEng sName")
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Gets a single employee by ID
const getSingleEmployee = async (req, res) => {
  try {
    const user = await Employee.findById(req.params.id)
      .populate("division", "name code")
      .populate("district", "name code");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Gets employees by designation
const getEmployeeByDesignation = async (req, res) => {
  try {
    const users = await Employee.find({
      designation: req.params.type.toUpperCase(),
    })
      .populate("division", "name")
      .populate("district", "name");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Toggles the status of an employee
const toggleEmployeeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    employee.status = !employee.status;
    await employee.save();
    res.json({ message: "Employee status updated", status: employee.status });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addEmployees,
  updateEmployee,
  getAllEmployees,
  getSingleEmployee,
  getEmployeeByDesignation,
  toggleEmployeeStatus,
};
