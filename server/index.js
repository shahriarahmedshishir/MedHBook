const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const http = require("http");
const socketIO = require("socket.io");

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: ["http://localhost:5173"],
    credentials: true,
  },
});

app.use(express.json());
const port = process.env.PORT || 3000;

// ===== Base URL =====
const BASE_URL = process.env.BASE_URL || `http://localhost:${port}`;

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
const client = new MongoClient(uri, {
  serverApi: { version: ServerApiVersion.v1 },
});

let userCollection,
  userPrescription,
  userReports,
  doctorCollection,
  messageCollection,
  blogCollection;

async function connectDB() {
  try {
    await client.connect();
    const db = client.db("MedHBook");
    userCollection = db.collection("userdata");
    userPrescription = db.collection("userPrescription");
    userReports = db.collection("userReports");
    doctorCollection = db.collection("doctorCollection");
    messageCollection = db.collection("messages");
    blogCollection = db.collection("blogs");
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

    // Only send relative path
    const imgPath = req.file ? `/uploads/${req.file.filename}` : null;

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

// 🔵 SEARCH doctors (GET)
app.get("/search/doctors", async (req, res) => {
  try {
    const { name, specialty } = req.query;
    let filter = {};

    if (name) {
      filter.name = { $regex: name, $options: "i" }; // Case-insensitive search
    }

    if (specialty) {
      // Check if multiple specialties are provided (comma-separated)
      if (specialty.includes(",")) {
        const specialties = specialty.split(",").map((s) => s.trim());
        // Match any of the specialties using $or
        filter.$or = specialties.map((s) => ({
          $or: [
            { specialty: { $regex: s, $options: "i" } },
            { doctorType: { $regex: s, $options: "i" } },
            { specialization: { $regex: s, $options: "i" } },
          ],
        }));
      } else {
        // Single specialty search - search in specialty, doctorType, and specialization fields
        filter.$or = [
          { specialty: { $regex: specialty, $options: "i" } },
          { doctorType: { $regex: specialty, $options: "i" } },
          { specialization: { $regex: specialty, $options: "i" } },
        ];
      }
    }

    // Only return from doctorCollection (not userCollection)
    const doctors = await doctorCollection.find(filter).toArray();
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
app.put("/doctor/:email", async (req, res) => {
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
app.post("/upload-doctor-image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const imagePath = `/uploads/${req.file.filename}`;
    res.json({ success: true, imagePath });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🟣 UPLOAD user image
app.post("/upload-user-image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const imagePath = `/uploads/${req.file.filename}`;
    res.json({ success: true, imagePath });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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
app.put("/user/:email", async (req, res) => {
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
// ===== Xrays =====

// Upload xrays
app.post("/xrays", upload.array("files"), async (req, res) => {
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
app.get("/xrays", async (req, res) => {
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
app.delete("/xrays/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await userPrescription.findOne({ _id: new ObjectId(id) });
    if (!doc) return res.status(404).json({ message: "Xrays not found" });

    if (doc.img) {
      const fileName = doc.img.split("/uploads/")[1];
      const filePath = path.join(uploadsDir, fileName);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await userPrescription.deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting Xrays:", err);
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

// ===== MESSAGING SYSTEM =====

// Send a message
app.post("/messages", async (req, res) => {
  try {
    const { senderEmail, senderName, recipientEmail, recipientName, message } =
      req.body;

    if (!senderEmail || !recipientEmail || !message) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newMessage = {
      senderEmail,
      senderName: senderName || "Unknown",
      recipientEmail,
      recipientName: recipientName || "Unknown",
      message,
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
app.get("/messages/conversation", async (req, res) => {
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
app.get("/messages/conversations", async (req, res) => {
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
app.put("/messages/:id/read", async (req, res) => {
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
      } = data;

      // Save to database
      const newMessage = {
        senderEmail,
        senderName,
        recipientEmail,
        recipientName,
        message,
        timestamp: new Date(),
        read: false,
      };

      await messageCollection.insertOne(newMessage);

      // Send to recipient if they're online
      const recipientSocketId = userSockets.get(recipientEmail);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("message:receive", newMessage);
      }

      // Send confirmation to sender
      socket.emit("message:sent", { success: true, data: newMessage });
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
connectDB();
server.listen(port, () => console.log(`✅ Server running at ${BASE_URL}`));
