const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { MongoClient, ServerApiVersion } = require("mongodb");

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.1atxbvs.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let userCollection;

async function connectDB() {
  try {
    await client.connect();
    const db = client.db("MedHBook");
    userCollection = db.collection("userdata");
    await db.command({ ping: 1 });
    console.log("✅ Connected to MongoDB!");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
  }
}

app.post("/userdata", async (req, res) => {
  try {
    if (!userCollection) {
      return res
        .status(503)
        .json({ success: false, message: "DB not connected yet." });
    }

    console.log("📩 Incoming data:", req.body);
    const user = req.body;
    const result = await userCollection.insertOne(user);

    return res.status(201).json({
      success: true,
      message: "User saved successfully!",
      insertedId: result.insertedId,
    });
  } catch (err) {
    console.error("Error inserting user:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/", (req, res) => {
  res.send("🚀 Server is running...");
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal Server Error" });
});

connectDB();
app.listen(port, () => console.log(`Server running on port ${port}`));
