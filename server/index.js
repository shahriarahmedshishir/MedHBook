const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const http = require("http");
const socketIO = require("socket.io");
const jwt = require("jsonwebtoken");

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: ["http://localhost:5173"],
    credentials: true,
  },
});

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key";

// ===== JWT Middleware =====
const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Attach user info to request
    next();
  } catch {
    return res
      .status(403)
      .json({ error: "Forbidden: Invalid or expired token" });
  }
};

const verifyAdmin = async (req, res, next) => {
  try {
    if (!req.user?.email) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const requester = await userCollection.findOne(
      { email: req.user.email },
      { projection: { role: 1 } },
    );

    if (!requester || requester.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    next();
  } catch (err) {
    return res.status(500).json({ error: "Admin authorization failed" });
  }
};

app.use(express.json());
const port = process.env.PORT || 3000;

// ===== Base URL =====
const BASE_URL = process.env.BASE_URL || `http://localhost:${port}`;

// ===== UTILITY FUNCTIONS =====
const MIN_APPOINTMENT_GAP_MINUTES = 5;

// Generate 6-digit secret code
const generateSecretCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Check if secret code needs regeneration and regenerate if needed
const ensureValidSecretCode = async (user) => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // 12:00 AM today

  // If code doesn't exist or was generated before today's 12 AM, regenerate
  if (
    !user.secretCode ||
    !user.secretCodeGeneratedAt ||
    new Date(user.secretCodeGeneratedAt) < todayStart
  ) {
    return {
      secretCode: generateSecretCode(),
      secretCodeGeneratedAt: new Date(),
      needsUpdate: true,
    };
  }

  return {
    secretCode: user.secretCode,
    secretCodeGeneratedAt: user.secretCodeGeneratedAt,
    needsUpdate: false,
  };
};

// ===== Middleware =====
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  }),
);
app.use(express.json());

// ===== Serve uploads folder =====
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use("/uploads", express.static(uploadsDir));

// ===== Multer config =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + unique + ext);
  },
});
const upload = multer({ storage });

// ===== MongoDB setup =====
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.1atxbvs.mongodb.net/?retryWrites=true&w=majority`;
let userCollection,
  userPrescription,
  userXrays,
  userReports,
  doctorCollection,
  doctorApplicationCollection,
  messageCollection,
  blogCollection,
  digitalPrescriptionCollection,
  appointmentCollection;
const client = new MongoClient(uri, {
  serverApi: { version: ServerApiVersion.v1 },
});

async function connectDB() {
  try {
    await client.connect();
    const db = client.db("MedHBook");
    userCollection = db.collection("userdata");
    userPrescription = db.collection("userPrescription");
    userXrays = db.collection("userXrays");
    userReports = db.collection("userReports");
    doctorCollection = db.collection("doctorCollection");
    doctorApplicationCollection = db.collection("doctorApplications");
    messageCollection = db.collection("messages");
    blogCollection = db.collection("blogs");
    digitalPrescriptionCollection = db.collection("digitalPrescriptions");
    appointmentCollection = db.collection("appointments");
    console.log("✅ Connected to MongoDB!");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
  }
}
// ===== Appointment Endpoints =====
// Delete appointment (user cancel before doctor accepts)
app.delete("/appointments/:id", verifyJWT, async (req, res) => {
  try {
    const { id } = req.params;
    // Only allow delete if status is pending
    const result = await appointmentCollection.deleteOne({
      _id: new ObjectId(id),
      status: "pending",
    });
    if (result.deletedCount === 0) {
      return res.status(400).json({
        message: "Cannot cancel: appointment not found or already processed.",
      });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// Create appointment
app.post("/appointments", verifyJWT, async (req, res) => {
  try {
    const {
      doctorEmail,
      doctorName,
      doctorSpecialty,
      chamber,
      chamberAddress,
      chamberTime,
      patientEmail,
      patientName,
      appointmentDate,
      appointmentTime,
      status,
    } = req.body;

    if (
      !doctorEmail ||
      !patientEmail ||
      !appointmentDate ||
      !appointmentTime ||
      !chamber
    ) {
      return res
        .status(400)
        .json({ message: "Missing required fields (need date and time)" });
    }

    // Parse appointment time (format: "HH:MM")
    const parseTime = (timeStr) => {
      let [hours, minutes] = timeStr.split(":").map(Number);
      return hours * 60 + minutes; // Convert to minutes for easier comparison
    };

    const appointmentTimeInMinutes = parseTime(appointmentTime);

    // Enforce a minimum gap between appointments on the same date/chamber.
    const conflictingAppointment = await appointmentCollection.findOne({
      doctorEmail,
      chamber,
      appointmentDate, // Must be same date
      $expr: {
        $lt: [
          {
            $abs: {
              $subtract: [
                {
                  $add: [
                    {
                      $multiply: [
                        {
                          $toInt: {
                            $substr: ["$appointmentTime", 0, 2],
                          },
                        },
                        60,
                      ],
                    },
                    {
                      $toInt: {
                        $substr: ["$appointmentTime", 3, 2],
                      },
                    },
                  ],
                },
                appointmentTimeInMinutes,
              ],
            },
          },
          MIN_APPOINTMENT_GAP_MINUTES,
        ],
      },
      status: { $in: ["pending", "confirmed", "approved"] },
    });

    if (conflictingAppointment) {
      return res.status(409).json({
        message:
          "This time slot is not available. Please keep at least a 5-minute gap between appointments.",
        conflictTime: conflictingAppointment.appointmentTime,
      });
    }

    const appointment = {
      doctorEmail,
      doctorName,
      doctorSpecialty,
      chamber,
      chamberAddress,
      chamberTime,
      patientEmail,
      patientName,
      appointmentDate,
      appointmentTime,
      status: status || "pending",
      createdAt: new Date(),
    };

    const result = await appointmentCollection.insertOne(appointment);
    res
      .status(201)
      .json({ success: true, appointmentId: result.insertedId, appointment });
  } catch (err) {
    console.error("Error creating appointment:", err);
    res.status(500).json({ message: err.message });
  }
});

// Get appointments for a doctor
app.get("/appointments/doctor/:doctorEmail", verifyJWT, async (req, res) => {
  try {
    const { doctorEmail } = req.params;
    const appointments = await appointmentCollection
      .find({ doctorEmail })
      .sort({ createdAt: -1 })
      .toArray();
    res.json({ success: true, appointments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get appointments for a patient
app.get("/appointments/patient/:patientEmail", verifyJWT, async (req, res) => {
  try {
    const { patientEmail } = req.params;
    const appointments = await appointmentCollection
      .find({ patientEmail })
      .sort({ createdAt: -1 })
      .toArray();
    res.json({ success: true, appointments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Check booked time slots for a doctor and chamber
app.get("/appointments/booked/slots", verifyJWT, async (req, res) => {
  try {
    const { doctorEmail, chamber, appointmentDate } = req.query;

    if (!doctorEmail || !chamber || !appointmentDate) {
      return res
        .status(400)
        .json({ message: "Missing doctorEmail, chamber, or appointmentDate" });
    }

    // Get all active appointments for this doctor and chamber
    const bookedAppointments = await appointmentCollection
      .find({
        doctorEmail,
        chamber,
        appointmentDate,
        status: { $in: ["pending", "confirmed", "approved"] },
      })
      .project({ appointmentTime: 1 })
      .toArray();

    // Extract times and calculate blocked windows (minimum 5-minute gap)
    const blockedSlots = new Set();
    bookedAppointments.forEach((apt) => {
      // Parse time to minutes
      const parseTime = (timeStr) => {
        const [time, period] = timeStr.trim().split(" ");
        let [hours, minutes] = time.split(":").map(Number);
        if (period === "PM" && hours !== 12) hours += 12;
        if (period === "AM" && hours === 12) hours = 0;
        return hours * 60 + minutes;
      };

      try {
        const timeInMinutes = parseTime(apt.appointmentTime);
        // Any slot within 5 minutes of an existing appointment is blocked.
        for (let i = timeInMinutes - 4; i <= timeInMinutes + 4; i++) {
          if (i >= 0 && i < 24 * 60) blockedSlots.add(i);
        }
      } catch (e) {
        console.error("Error parsing time:", apt.appointmentTime, e);
      }
    });

    res.json({
      success: true,
      bookedAppointments,
      blockedSlots: Array.from(blockedSlots),
      message:
        "Each appointment enforces a minimum 5-minute gap from nearby time slots.",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Approve or reject appointment (doctor only)
app.patch("/appointments/:id", verifyJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // "approved" or "rejected"
    if (!status || !["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const result = await appointmentCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status } },
    );
    res.json({ success: true, updated: result.modifiedCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===== AUTHENTICATION =====

// Login endpoint - generates JWT token
app.post("/api/login", async (req, res) => {
  try {
    const { email, firebaseUid, isAdmin } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Check if user exists in database
    let user = await userCollection.findOne({ email });
    let isDoctor = false;

    // If not in user collection, check doctor collection
    if (!user) {
      user = await doctorCollection.findOne({ email });
      isDoctor = true;
    }

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.blocked) {
      return res.status(403).json({
        error: "This account is blocked. Please contact an administrator.",
      });
    }

    // If user is admin (from Firebase claims), update their role in the database
    if (isAdmin && user.role !== "admin") {
      await userCollection.updateOne({ email }, { $set: { role: "admin" } });
      user.role = "admin";
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        email: user.email,
        uid: user.uid,
        role: user.role || (isDoctor ? "doctor" : "user"),
        firebaseUid: firebaseUid,
      },
      JWT_SECRET,
      { expiresIn: "7d" }, // Token expires in 7 days
    );

    res.json({
      success: true,
      token,
      user: {
        email: user.email,
        name: user.name,
        uid: user.uid,
        role: user.role || (isDoctor ? "doctor" : "user"),
        img: user.img,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Verify token endpoint
app.get("/api/verify-token", verifyJWT, (req, res) => {
  res.json({ valid: true, user: req.user });
});

// ===== USERS =====

// Create user
app.post("/userdata", upload.single("img"), async (req, res) => {
  try {
    const { name, email, mobileNo, role } = req.body;

    // Only send relative path
    const imgPath = req.file ? `/uploads/${req.file.filename}` : null;

    console.log("📷 Creating user with image:", imgPath);
    console.log("📁 File info:", req.file);

    // Get the maximum UID by converting to numbers
    const allUsers = await userCollection
      .find({}, { projection: { uid: 1 } })
      .toArray();
    let maxUid = 0;

    if (allUsers.length > 0) {
      maxUid = Math.max(...allUsers.map((u) => Number(u.uid) || 0));
    }

    const uid = maxUid + 1;

    const user = {
      name,
      email,
      mobileNo,
      role: role || "user",
      uid,
      img: imgPath,
      secretCode: generateSecretCode(),
      secretCodeGeneratedAt: new Date(),
    };

    const result = await userCollection.insertOne(user);
    console.log(
      "✅ User created with UID:",
      uid,
      "Secret Code:",
      user.secretCode,
    );
    res.status(201).json({
      success: true,
      userId: result.insertedId,
      uid,
      secretCode: user.secretCode,
    });
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get all users
app.get("/user", async (req, res) => {
  try {
    const { role } = req.query;
    let filter = {};

    // If role is "patient" or "user", exclude doctors/admins
    if (role === "patient" || role === "user") {
      filter.role = "user";
    } else if (role) {
      filter.role = role;
    }
    // When no role is specified, return all users (needed for login)

    const users = await userCollection
      .find(filter, {
        projection: { name: 1, email: 1, uid: 1, img: 1, role: 1 },
      })
      .toArray();

    console.log(`Fetched ${users.length} users with filter:`, filter);
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: err.message });
  }
});

// Get single user by email
app.get("/user/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const user = await userCollection.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ message: err.message });
  }
});

// ===== SECRET CODE ENDPOINTS =====

// Get current secret code for logged-in patient
app.get("/patient/me/secret-code", verifyJWT, async (req, res) => {
  try {
    const userEmail = req.user.email;
    const user = await userCollection.findOne({ email: userEmail });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const codeInfo = await ensureValidSecretCode(user);

    // Update if regeneration was needed
    if (codeInfo.needsUpdate) {
      await userCollection.updateOne(
        { email: userEmail },
        {
          $set: {
            secretCode: codeInfo.secretCode,
            secretCodeGeneratedAt: codeInfo.secretCodeGeneratedAt,
          },
        },
      );
    }

    res.json({
      success: true,
      secretCode: codeInfo.secretCode,
      generatedAt: codeInfo.secretCodeGeneratedAt,
      expiresAt: new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        new Date().getDate() + 1,
      ), // Tomorrow at 12 AM
    });
  } catch (err) {
    console.error("Error getting secret code:", err);
    res.status(500).json({ message: err.message });
  }
});

// Manually regenerate secret code for patient
app.post("/patient/me/secret-code/regenerate", verifyJWT, async (req, res) => {
  try {
    const userEmail = req.user.email;
    const newCode = generateSecretCode();
    const now = new Date();

    const result = await userCollection.updateOne(
      { email: userEmail },
      {
        $set: {
          secretCode: newCode,
          secretCodeGeneratedAt: now,
        },
      },
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      success: true,
      secretCode: newCode,
      message: "Secret code regenerated successfully",
      expiresAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
    });
  } catch (err) {
    console.error("Error regenerating secret code:", err);
    res.status(500).json({ message: err.message });
  }
});

// Verify secret code before accessing patient details
app.post("/patient/verify-code", verifyJWT, async (req, res) => {
  try {
    const { patientEmail, providedCode } = req.body;

    if (!patientEmail || !providedCode) {
      return res.status(400).json({ message: "Missing patient email or code" });
    }

    const patient = await userCollection.findOne({ email: patientEmail });

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const codeInfo = await ensureValidSecretCode(patient);

    // Update if regeneration was needed
    if (codeInfo.needsUpdate) {
      await userCollection.updateOne(
        { email: patientEmail },
        {
          $set: {
            secretCode: codeInfo.secretCode,
            secretCodeGeneratedAt: codeInfo.secretCodeGeneratedAt,
          },
        },
      );
    }

    // Verify the code
    if (codeInfo.secretCode === providedCode.trim()) {
      res.json({
        success: true,
        message: "Code verified successfully",
        patient: {
          name: patient.name,
          email: patient.email,
          uid: patient.uid,
          mobileNo: patient.mobileNo,
          img: patient.img,
          role: patient.role,
        },
      });
    } else {
      res.status(401).json({
        success: false,
        message: "Invalid or expired secret code",
      });
    }
  } catch (err) {
    console.error("Error verifying code:", err);
    res.status(500).json({ message: err.message });
  }
});

app.post("/doctor", async (req, res) => {
  try {
    const email = req.body.email;

    const exists = await doctorCollection.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Doctor already exists" });
    }

    // Create doctor profile
    await doctorCollection.insertOne(req.body);

    // Update user role to "doctor" in userCollection
    await userCollection.updateOne(
      { email: email },
      { $set: { role: "doctor" } },
    );

    res.json({ message: "Doctor profile created", doctor: req.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔵 READ doctor by email (GET)

app.get("/doctor/:email", async (req, res) => {
  try {
    const doctor = await doctorCollection.findOne({ email: req.params.email });
    // If no profile, just return null
    return res.json(doctor || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔵 READ doctor by ID (GET)
app.get("/doctors/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await doctorCollection.findOne({ _id: new ObjectId(id) });
    return res.json(doctor || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔵 SEARCH doctors (GET)
app.get("/search/doctors", async (req, res) => {
  try {
    const { name, specialty } = req.query;
    let filter = {};

    // Build an array of conditions to combine with $or
    const orConditions = [];

    // Add name search condition
    if (name) {
      orConditions.push({ name: { $regex: name, $options: "i" } });
      // Also search in chamber addresses for area/city search
      orConditions.push({
        "chambers.address": { $regex: name, $options: "i" },
      });
      orConditions.push({ "chambers.name": { $regex: name, $options: "i" } });
    }

    // Add specialty search conditions
    if (specialty) {
      // Check if multiple specialties are provided (comma-separated)
      if (specialty.includes(",")) {
        const specialties = specialty.split(",").map((s) => s.trim());
        // Match any of the specialties
        specialties.forEach((s) => {
          orConditions.push({ specialty: { $regex: s, $options: "i" } });
          orConditions.push({ doctorType: { $regex: s, $options: "i" } });
          orConditions.push({ specialization: { $regex: s, $options: "i" } });
          // Also search in chamber addresses
          orConditions.push({
            "chambers.address": { $regex: s, $options: "i" },
          });
        });
      } else {
        // Single specialty search
        orConditions.push({ specialty: { $regex: specialty, $options: "i" } });
        orConditions.push({ doctorType: { $regex: specialty, $options: "i" } });
        orConditions.push({
          specialization: { $regex: specialty, $options: "i" },
        });
        // Also search in chamber addresses
        orConditions.push({
          "chambers.address": { $regex: specialty, $options: "i" },
        });
      }
    }

    // Combine all conditions with $or (matches if ANY condition is true)
    if (orConditions.length > 0) {
      filter.$or = orConditions;
    }

    // Only return from doctorCollection (not userCollection)
    let doctors = await doctorCollection.find(filter).toArray();

    // Filter out admin accounts by checking their actual role in userCollection
    doctors = await Promise.all(
      doctors.map(async (d) => {
        const user = await userCollection.findOne({ email: d.email });
        return { ...d, actualRole: user?.role };
      }),
    );

    // Exclude any doctor whose actual user role is admin or superadmin
    doctors = doctors.filter(
      (d) => d.actualRole !== "admin" && d.actualRole !== "superadmin",
    );
    console.log(
      "Search results:",
      doctors.map((d) => ({
        name: d.name,
        specialty: d.specialty,
        doctorType: d.doctorType,
      })),
    );
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🟡 UPDATE doctor by email (PUT)
app.put("/doctor/:email", verifyJWT, async (req, res) => {
  try {
    const updated = await doctorCollection.findOneAndUpdate(
      { email: req.params.email },
      { $set: req.body },
      { returnDocument: "after" },
    );

    if (!updated.value) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Also update the img field in userCollection if provided
    if (req.body.img) {
      await userCollection.updateOne(
        { email: req.params.email },
        { $set: { img: req.body.img } },
      );
    }

    res.json({
      message: "Doctor profile updated",
      doctor: updated.value,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🟣 UPLOAD doctor image
app.post(
  "/upload-doctor-image",
  verifyJWT,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image uploaded" });
      }

      const imagePath = `/uploads/${req.file.filename}`;
      res.json({ success: true, imagePath });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

// 🟣 UPLOAD user image
app.post(
  "/upload-user-image",
  verifyJWT,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image uploaded" });
      }

      const imagePath = `/uploads/${req.file.filename}`;
      res.json({ success: true, imagePath });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

// 🟣 Sync doctor images from userCollection to doctorCollection
app.post("/sync-doctor-images", async (req, res) => {
  try {
    const doctors = await doctorCollection.find({}).toArray();
    let synced = 0;

    for (const doctor of doctors) {
      const user = await userCollection.findOne({ email: doctor.email });
      if (user && user.img) {
        await doctorCollection.updateOne(
          { email: doctor.email },
          { $set: { img: user.img } },
        );
        synced++;
      }
    }

    res.json({ success: true, message: `Synced ${synced} doctor images` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🟣 UPDATE user profile
app.put("/user/:email", verifyJWT, async (req, res) => {
  try {
    const { email } = req.params;
    const updateData = req.body;

    // Remove email from update data to prevent changing it
    delete updateData.email;

    const result = await userCollection.updateOne(
      { email },
      { $set: updateData },
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ success: true, message: "User profile updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== ADMIN STATISTICS =====

// Get admin statistics
app.get("/admin/statistics", verifyJWT, async (req, res) => {
  try {
    // Count total users (role: "user")
    const totalUsers = await userCollection.countDocuments({ role: "user" });

    // Count total doctors (role: "doctor")
    const totalDoctors = await userCollection.countDocuments({
      role: "doctor",
    });

    // Count pending applications
    const pendingApplications =
      await doctorApplicationCollection.countDocuments({ status: "pending" });

    // Count total admins (role: "admin")
    const totalAdmins = await userCollection.countDocuments({ role: "admin" });

    res.json({
      totalUsers,
      totalDoctors,
      pendingApplications,
      totalAdmins,
    });
  } catch (err) {
    console.error("Error fetching statistics:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get doctor activities (completed, upcoming, cancelled appointments count for each doctor)
app.get(
  "/admin/doctor-activities",
  verifyJWT,
  verifyAdmin,
  async (req, res) => {
    try {
      const appointments = await appointmentCollection.find({}).toArray();

      // Group appointments by doctor and calculate counts
      const doctorActivityMap = {};

      appointments.forEach((appt) => {
        const doctorEmail = appt.doctorEmail;
        const doctorName = appt.doctorName || "Unknown Doctor";

        if (!doctorActivityMap[doctorEmail]) {
          doctorActivityMap[doctorEmail] = {
            doctorEmail,
            doctorName,
            completedCount: 0,
            upcomingCount: 0,
            cancelledCount: 0,
          };
        }

        const status = appt.status?.toLowerCase();
        if (status === "completed") {
          doctorActivityMap[doctorEmail].completedCount++;
        } else if (status === "approved" || status === "pending") {
          doctorActivityMap[doctorEmail].upcomingCount++;
        } else if (status === "cancelled") {
          doctorActivityMap[doctorEmail].cancelledCount++;
        }
      });

      // Convert map to array and sort by total appointments
      const activities = Object.values(doctorActivityMap).sort((a, b) => {
        const aTotal = a.completedCount + a.upcomingCount + a.cancelledCount;
        const bTotal = b.completedCount + b.upcomingCount + b.cancelledCount;
        return bTotal - aTotal;
      });

      res.json(activities);
    } catch (err) {
      console.error("Error fetching doctor activities:", err);
      res.status(500).json({ error: err.message });
    }
  },
);

// Search accounts by email/name/uid and role (admin only)
app.get("/admin/accounts", verifyJWT, verifyAdmin, async (req, res) => {
  try {
    const { query = "", role = "all" } = req.query;
    const normalizedQuery = query.trim();
    const filter = { role: { $in: ["user", "doctor"] } };

    if (role === "user" || role === "doctor") {
      filter.role = role;
    } else if (role !== "all") {
      return res.status(400).json({ error: "Invalid role filter" });
    }

    if (normalizedQuery) {
      const searchConditions = [
        { email: { $regex: normalizedQuery, $options: "i" } },
        { name: { $regex: normalizedQuery, $options: "i" } },
      ];

      const asNumber = Number(normalizedQuery);
      if (!Number.isNaN(asNumber)) {
        searchConditions.push({ uid: asNumber });
      }

      filter.$or = searchConditions;
    }

    const accounts = await userCollection
      .find(filter, {
        projection: {
          name: 1,
          email: 1,
          uid: 1,
          role: 1,
          img: 1,
          blocked: 1,
          blockedAt: 1,
          mobileNo: 1,
        },
      })
      .sort({ role: 1, name: 1, email: 1 })
      .toArray();

    res.json({ success: true, accounts });
  } catch (err) {
    console.error("Error searching admin accounts:", err);
    res.status(500).json({ error: err.message });
  }
});

// Block or unblock an account (admin only)
app.patch(
  "/admin/accounts/:id/block",
  verifyJWT,
  verifyAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { blocked } = req.body;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid account ID" });
      }

      if (typeof blocked !== "boolean") {
        return res.status(400).json({ error: "blocked must be true or false" });
      }

      const account = await userCollection.findOne({ _id: new ObjectId(id) });
      if (!account) {
        return res.status(404).json({ error: "Account not found" });
      }

      if (account.role === "admin") {
        return res
          .status(400)
          .json({ error: "Admin accounts cannot be managed here" });
      }

      if (blocked && account.email === req.user.email) {
        return res
          .status(400)
          .json({ error: "You cannot block your own account" });
      }

      await userCollection.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            blocked,
            blockedAt: blocked ? new Date() : null,
          },
        },
      );

      res.json({
        success: true,
        message: blocked
          ? "Account blocked successfully"
          : "Account unblocked successfully",
      });
    } catch (err) {
      console.error("Error blocking account:", err);
      res.status(500).json({ error: err.message });
    }
  },
);

// Delete an account (admin only)
app.delete("/admin/accounts/:id", verifyJWT, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid account ID" });
    }

    const account = await userCollection.findOne({ _id: new ObjectId(id) });
    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }

    if (account.role === "admin") {
      return res
        .status(400)
        .json({ error: "Admin accounts cannot be managed here" });
    }

    if (account.email === req.user.email) {
      return res
        .status(400)
        .json({ error: "You cannot delete your own account" });
    }

    await userCollection.deleteOne({ _id: new ObjectId(id) });

    if (account.role === "doctor") {
      await doctorCollection.deleteOne({ email: account.email });
    }

    await doctorApplicationCollection.deleteMany({ email: account.email });

    res.json({ success: true, message: "Account deleted successfully" });
  } catch (err) {
    console.error("Error deleting account:", err);
    res.status(500).json({ error: err.message });
  }
});

// ===== DOCTOR APPLICATIONS =====

// Submit doctor application
app.post("/doctor-applications", verifyJWT, async (req, res) => {
  try {
    const applicationData = req.body;

    // Check if user already has a pending or approved application
    const existingApplication = await doctorApplicationCollection.findOne({
      email: applicationData.email,
      status: { $in: ["pending", "approved"] },
    });

    if (existingApplication) {
      return res.status(400).json({
        message: "You already have a pending or approved application",
      });
    }

    const result = await doctorApplicationCollection.insertOne(applicationData);
    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      applicationId: result.insertedId,
    });
  } catch (err) {
    console.error("Error submitting application:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get doctor applications (admin only)
app.get("/doctor-applications", verifyJWT, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const applications = await doctorApplicationCollection
      .find(filter)
      .sort({ appliedAt: -1 })
      .toArray();

    res.json(applications);
  } catch (err) {
    console.error("Error fetching applications:", err);
    res.status(500).json({ error: err.message });
  }
});

// Approve doctor application (admin only)
app.post("/doctor-applications/:id/approve", verifyJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;

    // Update application status
    await doctorApplicationCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: "approved",
          approvedAt: new Date().toISOString(),
        },
      },
    );

    // Update user role to doctor
    await userCollection.updateOne(
      { email: email },
      { $set: { role: "doctor" } },
    );

    // Get application data to create doctor profile
    const application = await doctorApplicationCollection.findOne({
      _id: new ObjectId(id),
    });

    // Create doctor profile if it doesn't exist
    const existingDoctor = await doctorCollection.findOne({ email: email });
    if (!existingDoctor) {
      await doctorCollection.insertOne({
        name: application.name,
        email: application.email,
        phone: application.phone,
        specialty: application.specialization,
        qualification: application.qualification,
        experience: application.experience,
        hospital: application.hospital,
        licenseNumber: application.licenseNumber,
        aboutMe: application.aboutMe,
        createdAt: new Date().toISOString(),
      });
    }

    res.json({
      success: true,
      message: "Application approved and user promoted to doctor",
    });
  } catch (err) {
    console.error("Error approving application:", err);
    res.status(500).json({ error: err.message });
  }
});

// Reject doctor application (admin only)
app.post("/doctor-applications/:id/reject", verifyJWT, async (req, res) => {
  try {
    const { id } = req.params;

    await doctorApplicationCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: "rejected",
          rejectedAt: new Date().toISOString(),
        },
      },
    );

    res.json({ success: true, message: "Application rejected" });
  } catch (err) {
    console.error("Error rejecting application:", err);
    res.status(500).json({ error: err.message });
  }
});

// ===== PRESCRIPTIONS =====

// Upload prescriptions
app.post(
  "/prescriptions",
  verifyJWT,
  upload.array("files"),
  async (req, res) => {
    try {
      const { doctorName, email, uid } = req.body;

      if (!email || !doctorName || !uid)
        return res
          .status(400)
          .json({ message: "Email, doctorName, and uid are required" });

      if (!req.files || req.files.length === 0)
        return res.status(400).json({ message: "No files uploaded" });

      const docs = req.files.map((file) => ({
        email,
        uid: parseInt(uid),
        doctorName,
        img: `/uploads/${file.filename}`,
        createdAt: new Date(),
      }));

      await userPrescription.insertMany(docs);
      res.status(201).json({ success: true, data: docs });
    } catch (err) {
      console.error("Error uploading prescriptions:", err);
      res.status(500).json({ message: err.message });
    }
  },
);

// Fetch prescriptions (by email or uid)
app.get("/prescriptions", verifyJWT, async (req, res) => {
  try {
    const { email, uid } = req.query;
    if (!email && !uid)
      return res.status(400).json({ message: "Email or UID required" });

    const filter = uid ? { uid: parseInt(uid) } : { email };
    const prescriptions = await userPrescription
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    res.json(prescriptions);
  } catch (err) {
    console.error("Error fetching prescriptions:", err);
    res.status(500).json({ message: err.message });
  }
});

// Delete prescription
app.delete("/prescriptions/:id", verifyJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await userPrescription.findOne({ _id: new ObjectId(id) });
    if (!doc)
      return res.status(404).json({ message: "Prescription not found" });

    if (doc.img) {
      const fileName = doc.img.split("/uploads/")[1];
      const filePath = path.join(uploadsDir, fileName);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await userPrescription.deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting prescription:", err);
    res.status(500).json({ message: err.message });
  }
});

// ===== DIGITAL PRESCRIPTIONS =====

// Create digital prescription
app.post("/digital-prescriptions", verifyJWT, async (req, res) => {
  try {
    console.log("📝 Digital prescription request received");
    console.log("User from token:", req.user);
    console.log("Request body:", req.body);

    const {
      patientEmail,
      patientName,
      doctorEmail,
      doctorName,
      doctorSpecialty,
      chamber,
      chamberPhone,
      medicines,
    } = req.body;

    if (!patientEmail || !doctorEmail || !medicines) {
      console.error("❌ Missing required fields:", {
        patientEmail,
        doctorEmail,
        medicines,
      });
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!Array.isArray(medicines) || medicines.length === 0) {
      console.error("❌ Invalid medicines array");
      return res
        .status(400)
        .json({ message: "At least one medicine is required" });
    }

    const prescription = {
      patientEmail,
      patientName,
      doctorEmail,
      doctorName,
      doctorSpecialty,
      chamber,
      chamberPhone,
      medicines,
      createdAt: new Date(),
    };

    console.log("💾 Saving prescription:", prescription);

    const result = await digitalPrescriptionCollection.insertOne(prescription);

    console.log("✅ Prescription saved successfully:", result.insertedId);

    res.status(201).json({
      success: true,
      prescriptionId: result.insertedId,
      prescription,
    });
  } catch (err) {
    console.error("❌ Error creating digital prescription:", err);
    res.status(500).json({ message: err.message });
  }
});

// Get digital prescriptions for a patient
app.get("/digital-prescriptions", verifyJWT, async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const filter = { patientEmail: email };

    const prescriptions = await digitalPrescriptionCollection
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    res.json(prescriptions);
  } catch (err) {
    console.error("Error fetching digital prescriptions:", err);
    res.status(500).json({ message: err.message });
  }
});

// Get single digital prescription by ID
app.get("/digital-prescriptions/:id", verifyJWT, async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid prescription ID" });
    }
    const prescription = await digitalPrescriptionCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found" });
    }

    res.json(prescription);
  } catch (err) {
    console.error("Error fetching prescription:", err);
    res.status(500).json({ message: err.message });
  }
});

// Delete digital prescription (no auth for dev)
app.delete("/digital-prescriptions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    // Validate ObjectId
    if (!id || !/^[a-fA-F0-9]{24}$/.test(id)) {
      return res.status(400).json({ message: "Invalid prescription ID" });
    }
    const prescription = await digitalPrescriptionCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found" });
    }

    await digitalPrescriptionCollection.deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true, message: "Prescription deleted successfully" });
  } catch (err) {
    console.error("Error deleting digital prescription:", err);
    res.status(500).json({ message: err.message });
  }
});

// ===== REPORTS =====
// ===== Xrays =====

// Upload xrays
app.post("/xrays", verifyJWT, upload.array("files"), async (req, res) => {
  try {
    const { doctorName, email, uid } = req.body;

    if (!email || !doctorName || !uid)
      return res
        .status(400)
        .json({ message: "Email, doctorName, and uid are required" });

    if (!req.files || req.files.length === 0)
      return res.status(400).json({ message: "No files uploaded" });

    const docs = req.files.map((file) => ({
      email,
      uid: parseInt(uid),
      doctorName,
      img: `/uploads/${file.filename}`,
      createdAt: new Date(),
    }));

    await userXrays.insertMany(docs);
    res.status(201).json({ success: true, data: docs });
  } catch (err) {
    console.error("Error uploading xrays:", err);
    res.status(500).json({ message: err.message });
  }
});

// Fetch xrays (by email or uid)
app.get("/xrays", verifyJWT, async (req, res) => {
  try {
    const { email, uid } = req.query;
    if (!email && !uid)
      return res.status(400).json({ message: "Email or UID required" });

    const filter = uid ? { uid: parseInt(uid) } : { email };
    const xrays = await userXrays
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    res.json(xrays);
  } catch (err) {
    console.error("Error fetching xrays:", err);
    res.status(500).json({ message: err.message });
  }
});

// Delete xray
app.delete("/xrays/:id", verifyJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await userXrays.findOne({ _id: new ObjectId(id) });
    if (!doc) return res.status(404).json({ message: "Xrays not found" });

    if (doc.img) {
      const fileName = doc.img.split("/uploads/")[1];
      const filePath = path.join(uploadsDir, fileName);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await userXrays.deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting Xrays:", err);
    res.status(500).json({ message: err.message });
  }
});

// ===== REPORTS =====

// Upload reports
app.post("/reports", verifyJWT, upload.array("files"), async (req, res) => {
  try {
    const { doctorName, email, uid } = req.body;

    if (!email || !doctorName || !uid)
      return res
        .status(400)
        .json({ message: "Email, doctorName, and uid are required" });

    if (!req.files || req.files.length === 0)
      return res.status(400).json({ message: "No files uploaded" });

    const docs = req.files.map((file) => ({
      email,
      uid: parseInt(uid),
      doctorName,
      img: `/uploads/${file.filename}`,
      createdAt: new Date(),
    }));

    await userReports.insertMany(docs);
    res.status(201).json({ success: true, data: docs });
  } catch (err) {
    console.error("Error uploading reports:", err);
    res.status(500).json({ message: err.message });
  }
});

// Fetch reports (by email or uid)
app.get("/reports", verifyJWT, async (req, res) => {
  try {
    const { email, uid } = req.query;
    if (!email && !uid)
      return res.status(400).json({ message: "Email or UID required" });

    const filter = uid ? { uid: parseInt(uid) } : { email };
    const reports = await userReports
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    res.json(reports);
  } catch (err) {
    console.error("Error fetching reports:", err);
    res.status(500).json({ message: err.message });
  }
});

// Delete report
app.delete("/reports/:id", verifyJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await userReports.findOne({ _id: new ObjectId(id) });
    if (!doc) return res.status(404).json({ message: "Report not found" });

    if (doc.img) {
      const fileName = doc.img.split("/uploads/")[1];
      const filePath = path.join(uploadsDir, fileName);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await userReports.deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting report:", err);
    res.status(500).json({ message: err.message });
  }
});

// ===== MESSAGING SYSTEM =====
// Upload chat attachment (image/pdf)
app.post(
  "/messages/upload",
  verifyJWT,
  upload.single("attachment"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      // Only allow image files
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/jpg",
      ];
      if (!allowedTypes.includes(req.file.mimetype)) {
        // Delete the uploaded file if not allowed
        fs.unlinkSync(req.file.path);
        return res
          .status(400)
          .json({ message: "Only image files are allowed" });
      }
      const filePath = `/uploads/${req.file.filename}`;
      res.json({ success: true, filePath });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

// Send a message
app.post("/messages", verifyJWT, async (req, res) => {
  try {
    const {
      senderEmail,
      senderName,
      recipientEmail,
      recipientName,
      message,
      attachment,
    } = req.body;

    if (!senderEmail || !recipientEmail || (!message && !attachment)) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newMessage = {
      senderEmail,
      senderName: senderName || "Unknown",
      recipientEmail,
      recipientName: recipientName || "Unknown",
      message,
      attachment: attachment || null,
      timestamp: new Date(),
      read: false,
    };

    const result = await messageCollection.insertOne(newMessage);
    res
      .status(201)
      .json({ success: true, messageId: result.insertedId, data: newMessage });
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(500).json({ message: err.message });
  }
});

// Fetch conversation between two users
app.get("/messages/conversation", verifyJWT, async (req, res) => {
  try {
    const { userEmail, otherEmail } = req.query;

    if (!userEmail || !otherEmail) {
      return res
        .status(400)
        .json({ message: "userEmail and otherEmail required" });
    }

    const messages = await messageCollection
      .find({
        $or: [
          { senderEmail: userEmail, recipientEmail: otherEmail },
          { senderEmail: otherEmail, recipientEmail: userEmail },
        ],
      })
      .sort({ timestamp: 1 })
      .toArray();

    res.json(messages);
  } catch (err) {
    console.error("Error fetching conversation:", err);
    res.status(500).json({ message: err.message });
  }
});

// Fetch all conversations for a user
app.get("/messages/conversations", verifyJWT, async (req, res) => {
  try {
    const { userEmail } = req.query;

    if (!userEmail) {
      return res.status(400).json({ message: "userEmail required" });
    }

    // Get all unique conversations
    const messages = await messageCollection
      .find({
        $or: [{ senderEmail: userEmail }, { recipientEmail: userEmail }],
      })
      .sort({ timestamp: -1 })
      .toArray();

    // Extract unique conversation partners
    const conversationMap = new Map();

    messages.forEach((msg) => {
      const otherEmail =
        msg.senderEmail === userEmail ? msg.recipientEmail : msg.senderEmail;
      const otherName =
        msg.senderEmail === userEmail ? msg.recipientName : msg.senderName;

      if (!conversationMap.has(otherEmail)) {
        conversationMap.set(otherEmail, {
          otherEmail,
          otherName,
          lastMessage: msg.message,
          timestamp: msg.timestamp,
          unreadCount: msg.recipientEmail === userEmail && !msg.read ? 1 : 0,
        });
      } else {
        const conv = conversationMap.get(otherEmail);
        if (msg.recipientEmail === userEmail && !msg.read) {
          conv.unreadCount += 1;
        }
      }
    });

    const conversations = Array.from(conversationMap.values());
    res.json(conversations);
  } catch (err) {
    console.error("Error fetching conversations:", err);
    res.status(500).json({ message: err.message });
  }
});

// Mark message as read
app.put("/messages/:id/read", verifyJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await messageCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { read: true } },
      { returnDocument: "after" },
    );

    if (!updated.value) {
      return res.status(404).json({ message: "Message not found" });
    }

    res.json({ success: true, data: updated.value });
  } catch (err) {
    console.error("Error marking message as read:", err);
    res.status(500).json({ message: err.message });
  }
});

// Mark all messages in a conversation as read for current user
app.put("/messages/read-conversation", verifyJWT, async (req, res) => {
  try {
    const { userEmail, otherEmail } = req.body;

    if (!userEmail || !otherEmail) {
      return res
        .status(400)
        .json({ message: "userEmail and otherEmail required" });
    }

    if (req.user.email !== userEmail) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const result = await messageCollection.updateMany(
      {
        senderEmail: otherEmail,
        recipientEmail: userEmail,
        read: false,
      },
      { $set: { read: true } },
    );

    const senderSocketId = userSockets.get(otherEmail);
    if (senderSocketId && result.modifiedCount > 0) {
      io.to(senderSocketId).emit("messages:seen", {
        readerEmail: userEmail,
        otherEmail,
      });
    }

    res.json({ success: true, modifiedCount: result.modifiedCount });
  } catch (err) {
    console.error("Error marking conversation as read:", err);
    res.status(500).json({ message: err.message });
  }
});

// Delete message (sender only)
app.delete("/messages/:id", verifyJWT, async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid message ID" });
    }

    const message = await messageCollection.findOne({ _id: new ObjectId(id) });
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (message.senderEmail !== req.user.email) {
      return res
        .status(403)
        .json({ message: "Only sender can delete message" });
    }

    await messageCollection.deleteOne({ _id: new ObjectId(id) });

    if (message.attachment && message.attachment.startsWith("/uploads/")) {
      const fileName = message.attachment.split("/uploads/")[1];
      const filePath = path.join(uploadsDir, fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    const recipientSocketId = userSockets.get(message.recipientEmail);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("message:deleted", {
        messageId: id,
      });
    }

    res.json({ success: true, messageId: id });
  } catch (err) {
    console.error("Error deleting message:", err);
    res.status(500).json({ message: err.message });
  }
});

// ===== BLOGS =====

// Create a blog post (doctors only)
app.post("/blogs", upload.single("image"), async (req, res) => {
  try {
    const { title, content, authorEmail, authorName } = req.body;

    if (!title || !content || !authorEmail || !authorName) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    const newBlog = {
      title,
      content,
      authorEmail,
      authorName,
      image: imagePath,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await blogCollection.insertOne(newBlog);
    res
      .status(201)
      .json({ success: true, blogId: result.insertedId, blog: newBlog });
  } catch (err) {
    console.error("Error creating blog:", err);
    res.status(500).json({ message: err.message });
  }
});

// Get all blogs
app.get("/blogs", async (req, res) => {
  try {
    const blogs = await blogCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    res.json(blogs);
  } catch (err) {
    console.error("Error fetching blogs:", err);
    res.status(500).json({ message: err.message });
  }
});

// Get a single blog by ID
app.get("/blogs/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await blogCollection.findOne({ _id: new ObjectId(id) });

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.json(blog);
  } catch (err) {
    console.error("Error fetching blog:", err);
    res.status(500).json({ message: err.message });
  }
});

// Update a blog
app.put("/blogs/:id", upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    const updateData = {
      title,
      content,
      updatedAt: new Date(),
    };

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const updated = await blogCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: "after" },
    );

    if (!updated.value) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.json({ success: true, blog: updated.value });
  } catch (err) {
    console.error("Error updating blog:", err);
    res.status(500).json({ message: err.message });
  }
});

// Delete a blog
app.delete("/blogs/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await blogCollection.findOne({ _id: new ObjectId(id) });

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // Delete image file if exists
    if (blog.image) {
      const fileName = blog.image.split("/uploads/")[1];
      const filePath = path.join(uploadsDir, fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await blogCollection.deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true, message: "Blog deleted successfully" });
  } catch (err) {
    console.error("Error deleting blog:", err);
    res.status(500).json({ message: err.message });
  }
});

// ===== Root =====
app.get("/", (req, res) => res.send("🚀 MedHBook Server is running!"));

// ===== SOCKET.IO REAL-TIME MESSAGING =====
const userSockets = new Map(); // Map to store user email -> socket id

io.on("connection", (socket) => {
  console.log(`📱 User connected: ${socket.id}`);

  // User joins with their email
  socket.on("user:join", (userEmail) => {
    userSockets.set(userEmail, socket.id);
    console.log(`✅ User registered: ${userEmail} -> ${socket.id}`);
    io.emit("users:online", Array.from(userSockets.keys()));
  });

  // Send real-time message
  socket.on("message:send", async (data) => {
    try {
      const {
        senderEmail,
        senderName,
        recipientEmail,
        recipientName,
        message,
        attachment,
      } = data;

      // Save to database
      const newMessage = {
        senderEmail,
        senderName,
        recipientEmail,
        recipientName,
        message,
        attachment: attachment || null,
        timestamp: new Date(),
        read: false,
      };

      const result = await messageCollection.insertOne(newMessage);
      const messageWithId = {
        ...newMessage,
        _id: result.insertedId.toString(),
      };

      // Send to recipient if they're online
      const recipientSocketId = userSockets.get(recipientEmail);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("message:receive", messageWithId);
      }

      // Send confirmation to sender
      socket.emit("message:sent", { success: true, data: messageWithId });
      console.log(`💬 Message sent from ${senderEmail} to ${recipientEmail}`);
    } catch (err) {
      console.error("Error sending message:", err);
      socket.emit("message:error", { error: err.message });
    }
  });

  // User is typing
  socket.on("user:typing", (data) => {
    const { senderEmail, recipientEmail } = data;
    const recipientSocketId = userSockets.get(recipientEmail);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("user:typing", { senderEmail });
    }
  });

  // User stopped typing
  socket.on("user:stopped-typing", (data) => {
    const { senderEmail, recipientEmail } = data;
    const recipientSocketId = userSockets.get(recipientEmail);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("user:stopped-typing", { senderEmail });
    }
  });

  // Disconnect
  socket.on("disconnect", () => {
    for (const [email, socketId] of userSockets) {
      if (socketId === socket.id) {
        userSockets.delete(email);
        console.log(`❌ User disconnected: ${email}`);
        io.emit("users:online", Array.from(userSockets.keys()));
        break;
      }
    }
  });
});

// ===== Start server =====
async function startServer() {
  await connectDB();
  server.listen(port, () => console.log(`✅ Server running at ${BASE_URL}`));
}

startServer();
