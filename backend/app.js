const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const connectDB = require("./config/db");
require("dotenv").config({ path: "./.env" });
const validateToken = require("./middleware/validateToken");
const multer = require("multer"); 
const path = require("path");

const app = express();

app.use(express.json());
app.use(morgan("tiny"));
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage: storage });

app.use("/api", require("./routes/auth"));
app.use("/api", require("./routes/contactRoute"));


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ error: "Something went wrong!" });
});


const PORT = process.env.PORT || 8000;
app.listen(PORT, async () => {
  try {
    await connectDB();
    console.log(`Server is running on port ${PORT}`);
  } catch (error) {
    console.log("Error connecting to the database:", error);
  }
});
