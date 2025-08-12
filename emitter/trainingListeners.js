// Import both emitters
const { trainingEmitter, employeeEmitter } = require("../emitter/eventEmitter");
const TrainingAttendance = require("../models/TrainingAttendance");
const https = require("https");
const crypto = require("crypto");
const Feedback = require("../models/Feedback");
// Training events
trainingEmitter.on("trainingCompleted", async (trainingId) => {
  console.log("Training completed:", trainingId);
  try {
    const getTrainingAttendance = await TrainingAttendance.find({
      trainingId: trainingId,
    });
    if (getTrainingAttendance.length === 0) {
      console.error(
        "No training attendance found for training ID:",
        trainingId
      );
      return;
    }
    const baseUrl = "https://smsgw.sms.gov.in/failsafe/MLink";
    for (const attendance of getTrainingAttendance) {
      const token = crypto.randomBytes(16).toString("hex");
      const expiration = new Date();
      expiration.setDate(expiration.getDate() + 7);
      const feedbackUrl = `cgtransport.gov.in/training/feedback?token=${token}`;
      const body = {
        trainingId: trainingId,
        name: attendance.name,
        mobile: attendance.mobile,
        trainerRating: 0,
        contentRating: 0,
        suggestions: "",
        token: token,
        feedbackLink: feedbackUrl,
      };
      const feedback = new Feedback(body);
      await feedback.save();
      const queryParams = {
        username: "cgtc.sms",
        pin: "Qwer@123", // Use RAW password without encoding
        message: `Dear ${attendance.name}, Your Training Session has ended. It is requested to provide feedback here at : ${feedbackUrl}. Your feedback helps us improve and serve you better. - CGTRANSPORT`,
        mnumber: `91${attendance.mobile}`,
        signature: "TRPTCG",
        dlt_entity_id: "1401495300000048678",
        dlt_template_id: "1407175463986559155",
      };
      const queryString = Object.entries(queryParams)
        .map(([key, value]) => {
          // Special handling for PIN - don't double-encode!
          if (key === "pin") {
            return `${key}=${encodeURIComponent("Qwer@123")}`;
          }
          // Encode all other values normally
          return `${key}=${encodeURIComponent(value)}`;
        })
        .join("&");
      const url = `${baseUrl}?${queryString}`;
      await new Promise((resolve, reject) => {
        https
          .get(url, { rejectUnauthorized: false }, (res) => {
            let data = "";
            res.on("data", (chunk) => {
              data += chunk;
            });
            res.on("end", () => {
              if (res.statusCode === 200) {
                resolve(data);
              } else {
                reject(
                  `Error: Received status code ${res.statusCode} with message ${data}`
                );
              }
            });
          })
          .on("error", (err) => {
            reject(`Error making HTTPS request: ${err.message}`);
          });
      });
    }
  } catch (error) {
    console.error("Error handling training completion:", error.message);
  }
});

// Employee events
employeeEmitter.on(
  "employeeRegisterationMessage",
  async (employee, password) => {
    // console.log(mobile, username, password);
    const loginUrl = "cgtransport.gov.in/training";
    const baseUrl = "https://smsgw.sms.gov.in/failsafe/MLink";

    // Query parameters
    const queryParams = {
      username: "cgtc.sms",
      pin: "Qwer@123", // Use RAW password without encoding
      message: `Welcome ${employee.name}, Here are your login details. Username - ${employee.mobile}, Password - ${password} . You can log in at ${loginUrl} - CGTRANSPORT`,
      mnumber: `91${employee.mobile}`,
      signature: "TRPTCG",
      dlt_entity_id: "1401495300000048678",
      dlt_template_id: "1407175463963080854",
    };

    const queryString = Object.entries(queryParams)
      .map(([key, value]) => {
        // Special handling for PIN - don't double-encode!
        if (key === "pin") {
          return `${key}=${encodeURIComponent("Qwer@123")}`;
        }
        // Encode all other values normally
        return `${key}=${encodeURIComponent(value)}`;
      })
      .join("&");

    const url = `${baseUrl}?${queryString}`;
    console.log(url);
    return await new Promise((resolve, reject) => {
      https
        .get(url, { rejectUnauthorized: false }, (res) => {
          let data = "";
          res.on("data", (chunk) => {
            data += chunk;
          });
          res.on("end", () => {
            if (res.statusCode === 200) {
              resolve(data);
            } else {
              reject(
                `Error: Received status code ${res.statusCode} with message ${data}`
              );
            }
          });
        })
        .on("error", (err) => {
          reject(`Error making HTTPS request: ${err.message}`);
        });
    });
  }
);

// Employee events
employeeEmitter.on("resetPasswordMessage", async (name, password, mobile) => {
  console.log(mobile, name, password);
  const baseUrl = "https://smsgw.sms.gov.in/failsafe/MLink";

  // Query parameters
  const queryParams = {
    username: "cgtc.sms",
    pin: "Qwer@123", // Use RAW password without encoding
    message: `Dear ${name}, Your new password is:${password} for Training portal. - CGTRANSPORT`,
    mnumber: `91${mobile}`,
    signature: "TRPTCG",
    dlt_entity_id: "1401495300000048678",
    dlt_template_id: "1407175463969882637",
  };

  const queryString = Object.entries(queryParams)
    .map(([key, value]) => {
      // Special handling for PIN - don't double-encode!
      if (key === "pin") {
        return `${key}=${encodeURIComponent("Qwer@123")}`;
      }
      // Encode all other values normally
      return `${key}=${encodeURIComponent(value)}`;
    })
    .join("&");

  const url = `${baseUrl}?${queryString}`;
  console.log(url);
  return await new Promise((resolve, reject) => {
    https
      .get(url, { rejectUnauthorized: false }, (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          if (res.statusCode === 200) {
            resolve(data);
          } else {
            reject(
              `Error: Received status code ${res.statusCode} with message ${data}`
            );
          }
        });
      })
      .on("error", (err) => {
        reject(`Error making HTTPS request: ${err.message}`);
      });
  });
});

employeeEmitter.on("feedbackMessage", async (name, mobile) => {
  const baseUrl = "https://smsgw.sms.gov.in/failsafe/MLink";

  // Properly encode components
  const feedbackUrl = "https://cgtransport.gov.in";
  const encodedUrl = encodeURIComponent(feedbackUrl); // Becomes "https%3A%2F%2Fcgtransport.gov.in"

  const message = `Dear ${name}, Your Training Session has ended. It is requested to provide feedback here at: ${encodedUrl}. Your feedback helps us improve and serve you better. - CGTRANSPORT`;

  const queryParams = {
    username: "cgtc.sms",
    pin: "Qwer@123", // Will be automatically encoded
    message: message,
    mnumber: `91${mobile}`,
    signature: "TRPTCG",
    dlt_entity_id: "1401495300000048678",
    dlt_template_id: "1407175463986559155",
  };

  // Generate query string with proper encoding
  const queryString = Object.entries(queryParams)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");

  const url = `${baseUrl}?${queryString}`;
  console.log(url);
  return await new Promise((resolve, reject) => {
    https
      .get(url, { rejectUnauthorized: false }, (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          if (res.statusCode === 200) {
            resolve(data);
          } else {
            reject(
              `Error: Received status code ${res.statusCode} with message ${data}`
            );
          }
        });
      })
      .on("error", (err) => {
        reject(`Error making HTTPS request: ${err.message}`);
      });
  });
});
