import express from "express";
import cors from "cors";
import { igdl } from "aetherz-downloader";

const app = express();
const API_KEY = "1234"; // API key for authentication

const allowedOrigins = [
  "https://reel-save.netlify.app",
  "http://reel-save.netlify.app",
  "https://reel-save.netlify.app",
  "https://www.reel-save.netlify.app",
  "http://localhost:4000",
  "http://127.0.0.1:4000"
];


app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, origin); // Dynamically allow the requesting origin
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Allow cookies & authentication headers if needed
  })
);

app.use(express.json());

// API key middleware for the main endpoint only
const apiKeyAuth = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey || apiKey !== API_KEY) {
    return res.status(401).json({ error: "Unauthorized - Invalid API key" });
  }

  next();
};

// Apply API key middleware to the main endpoint
app.post("/", apiKeyAuth, async (req, res) => {
  try {
    let { url } = req.body;
    if (!url) return res.status(400).json({ error: "URL is required" });

    const data = await igdl(url);
    console.log(data);
    console.log(url);

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong", details: error.message });
  }
});

// Ping endpoint without API key requirement
app.get("/ping", (req, res) => {
  res.send(".");
});

app.listen(3000, () => console.log("Server is running on port 3000"));