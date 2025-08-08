const User = require("../models/userModel");

const LoginLog = require("../models/LoginLog");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const xml2js = require("xml2js");

const generateToken = (id) => {
  return jwt.sign({ id }, "CGTRANSPORT_SECRET", {
    expiresIn: "1d",
  });
};

const registerUser = async (req, res) => {
  const email = "rajattiwari@gmail.com";
  const password = "Rajat123";
  const role = "SUPERADMIN";
  const existing = await User.findOne({ email });
  if (existing) {
    console.log("ℹ️ Default user already exists.");
    return;
  }

  const user = new User({ email, password, role }); // ⚠️ Should hash password in production
  await user.save();
  console.log("✅ Default user created.");
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ msg: "Invalid credentials" });
    } else {
      const token = generateToken(user._id);
      createLoginLogs(user, token);
      res.json({
        id: user._id,
        user: user.email,
        role: "SUPERADMIN",
        token: token,
      });
    }
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// controllers/vehicleController.js
const { XMLParser } = require("fast-xml-parser");
const employees = require("../models/employees");
const {
  generatePassword,
  validatePassword,
} = require("../utils/passwordGenerator");
function maskName(fullName) {
  return fullName
    .split(" ")
    .map((part) => {
      if (part.length <= 2) return part; // skip very short names
      const first = part[0];
      const last = part[part.length - 1];
      const masked = "*".repeat(part.length - 2);
      return first + masked + last;
    })
    .join(" ");
}
// Convert "12-Dec-2012" → "12-12-2012"
function convertDate(str) {
  if (!str) return "";
  const MONTHS = {
    Jan: "01",
    Feb: "02",
    Mar: "03",
    Apr: "04",
    May: "05",
    Jun: "06",
    Jul: "07",
    Aug: "08",
    Sep: "09",
    Oct: "10",
    Nov: "11",
    Dec: "12",
  };
  const m = str.match(/^(\d{1,2})-([A-Za-z]+)-(\d{4})$/);
  if (!m) return str;
  const [, d, mon, y] = m;
  return `${d.padStart(2, "0")}-${MONTHS[mon.slice(0, 3)]}-${y}`;
}

async function checkVehicleDetails(req, res) {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ msg: "Registration number is required" });
  }

  try {
    // 1) Fetch raw XML
    const apiUrl = `https://cgtransport.gov.in/apitesting/FetchVehicleDetails.asmx/GetRegistrationDetails?RegId=${id.toUpperCase()}`;
    const apiRes = await axios.get(apiUrl, { responseType: "text" });

    // 2) Parse XML → JS
    const parser = new xml2js.Parser({
      explicitArray: false,
      ignoreAttrs: true,
    });
    const parsed = await parser.parseStringPromise(apiRes.data);
    const parser1 = new XMLParser();
    const jsonObj = parser1.parse(parsed.string);
    const v = jsonObj.VehicleDetails;
    const transformed = {
      regNo: v.rc_regn_no || "",
      state: v.state_cd,
      rto: v.rto_cd,
      taxUpto: v.rc_tax_upto || "",
      taxMode: v.rc_tax_mode || "",
      pucc: v.rc_pucc_upto || "",
      category: v.rc_vch_catg || "",
      vClass: v.rc_vh_class || "",
      rcStatus: v.rc_status || "",
      ownerName: `${maskName(v.rc_owner_name)} S/O ${v.rc_f_name}` || "",
      registrationValidity: v.rc_regn_upto,
      hsrpStatus: v.rc_hsrp_affixed,
      vehicleClass: (v.rc_vh_class_desc || "")
        .replace(/\(.*\)/, "")
        .trim()
        .toUpperCase(),
      fuelType: v.rc_fuel_desc || "",
      engineNo: v.rc_eng_no || "",
      chassisNo: v.rc_chasi_no || "",
      registrationDate: convertDate(v.rc_regn_dt),
      fitnessExpiry: convertDate(v.rc_fit_upto),
      insuranceExpiry: convertDate(v.rc_insurance_upto),
      taxValidity: convertDate(v.rc_tax_upto),
      financialStatus: v.rc_hp,
    };

    return res.json({ success: true, data: transformed });
  } catch (err) {
    console.error("Error in checkVehicleDetails:", err);
    if (err.response) {
      const status = err.response.status || 502;
      const msg =
        status === 404 ? "Registration number not found" : "Upstream API error";
      return res.status(status).json({ success: false, msg });
    }
    return res.status(500).json({ success: false, msg: err.message });
  }
}

const loginSRMDRM = async (req, res) => {
  const { mobile, password } = req.body;
  try {
    // Find employee and populate the 'state' field with 'name'
    const employee = await employees
      .findOne({ mobile: mobile, status: true })
      .populate("state", "stateName"); // Populate only the 'name' field of the state

    if (!employee) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    const isValid = validatePassword(password, employee.password); // Hash comparison
    if (!isValid) {
      return res.status(401).json({ msg: "Invalid credentials" });
    } else {
      const token = generateToken(employee._id);
      createLoginLogs(employee, token);
      // Prepare the response with populated state details
      res.json({
        id: employee._id,
        user: employee.mobile,
        role: employee.designation,
        token: token,
        state: {
          id: employee.state._id, // State ID (from reference)
          name: employee.state.stateName, // Populated state name
        },
      });
    }
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

async function createLoginLogs(user, token) {
  try {
    const body = {
      userId: user._id,
      user: user?.email || user?.mobile,
      role: user.designation || "SUPERADMIN",
      status: "SUCCESS",
      token: token,
    };
    const checkLoginLogs = await LoginLog.findOne({
      userId: user._id,
      status: "SUCCESS",
      token: token,
    });
    if (checkLoginLogs) {
      await LoginLog.findByIdAndUpdate(
        checkLoginLogs._id,
        { status: "CLOSED" },
        { new: true }
      );
      await LoginLog.create(body);
    } else {
      await LoginLog.create(body);
    }
  } catch (error) {
    console.log(error.message);
  }
}

const updateLoginLogStatus = async (req, res) => {
  try {
    const userId = req.params.id;
    const token = req.headers.authorization?.replace('Bearer ', '');
    await LoginLog.findOneAndUpdate(
      { userId: userId, token: token },
      { logoutTime: Date.now(), status: "CLOSED" }
    ).sort({ createdAt: -1 });
    return res.status(200).json({ msg: "Logout Successfully" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  checkVehicleDetails,
  loginSRMDRM,
  updateLoginLogStatus,
};
