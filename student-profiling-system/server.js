const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// ===============================
// MIDDLEWARE
// ===============================

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));

// Serve frontend
app.use(express.static(
    path.join(__dirname, "public")
));

// ===============================
// ROUTES
// ===============================

const authRoutes =
    require("./routes/authRoutes");

const studentRoutes =
    require("./routes/studentRoutes");

const insightRoutes =
    require("./routes/insightRoutes");

app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/students",
    studentRoutes
);

app.use(
    "/api/insights",
    insightRoutes
);

// ===============================
// HOME PAGE
// ===============================

app.get("/", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "public",
            "index.html"
        )
    );

});

// ===============================
// HEALTH CHECK
// ===============================

app.get("/api/health", (req, res) => {

    res.json({
        success: true,
        message: "Student Profiling System server is running",
        mongodb:
            mongoose.connection.readyState === 1
                ? "connected"
                : "not connected"
    });

});

// ===============================
// MONGODB CONNECTION
// ===============================

if (!process.env.MONGODB_URI) {

    console.error(
        "ERROR: MONGODB_URI is not defined in .env"
    );

} else {

    mongoose
        .connect(process.env.MONGODB_URI)

        .then(() => {

            console.log(
                "MongoDB connected successfully"
            );

        })

        .catch((error) => {

            console.error(
                "MongoDB connection failed:"
            );

            console.error(
                error.message
            );

        });
}

// ===============================
// START SERVER
// ===============================

app.listen(PORT, () => {

    console.log(
        "================================="
    );

    console.log(
        "Student Profiling System"
    );

    console.log(
        `Server running on port ${PORT}`
    );

    console.log(
        `http://localhost:${PORT}`
    );

    console.log(
        "================================="
    );

});