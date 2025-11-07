const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

// ===== Base URL =====
const BASE_URL = process.env.BASE_URL || `http://localhost:${port}`;

// ===== Middleware =====
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
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
const client = new MongoClient(uri, {
  serverApi: { version: ServerApiVersion.v1 },
});

let userCollection, userPrescription, userReports;

async function connectDB() {
  try {
    await client.connect();
    const db = client.db("MedHBook");
    userCollection = db.collection("userdata");
    userPrescription = db.collection("userPrescription");
    userReports = db.collection("userReports");
    console.log("✅ Connected to MongoDB!");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
  }
}

// ===== USERS =====

// Create user
app.post("/userdata", upload.single("img"), async (req, res) => {
  try {
    const { name, email, mobileNo, role } = req.body;
    const imgPath = req.file
      ? `${BASE_URL}/uploads/${req.file.filename}`
      : null;

    const lastUser = await userCollection
      .find({})
      .sort({ uid: -1 })
      .limit(1)
      .toArray();
    const uid = lastUser.length > 0 ? lastUser[0].uid + 1 : 1;

    const user = {
      name,
      email,
      mobileNo,
      role: role || "user",
      uid,
      img: imgPath,
    };

    const result = await userCollection.insertOne(user);
    res.status(201).json({ success: true, userId: result.insertedId, uid });
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get all users
app.get("/user", async (req, res) => {
  try {
    const users = await userCollection
      .find({}, { projection: { name: 1, email: 1, uid: 1, img: 1 } })
      .toArray();
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: err.message });
  }
});

// ===== PRESCRIPTIONS =====

// Upload prescriptions
app.post("/prescriptions", upload.array("files"), async (req, res) => {
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
});

// Fetch prescriptions (by email or uid)
app.get("/prescriptions", async (req, res) => {
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
app.delete("/prescriptions/:id", async (req, res) => {
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

// ===== REPORTS =====

// Upload reports
app.post("/reports", upload.array("files"), async (req, res) => {
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
app.get("/reports", async (req, res) => {
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
app.delete("/reports/:id", async (req, res) => {
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

// ===== Root =====
app.get("/", (req, res) => res.send("🚀 MedHBook Server is running!"));

// ===== Start server =====
connectDB();
app.listen(port, () => console.log(`✅ Server running at ${BASE_URL}`));
