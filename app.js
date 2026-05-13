const express = require("express");
const path = require("path");
const session = require("express-session");
const cloud =  require("dotenv").config();
const app = express();

const isLoggedIn = require("./middleware/authmiddleware");

const login = require("./routes/login");
const signup = require("./routes/signup");
const loaddata = require("./routes/loaddata");
const request = require("./routes/request");
const medical = require("./routes/medical");
const advanced = require("./routes/advanced");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    session({
        secret: process.env.SESSION_SECRET || "mednexus_hms_secret",
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            sameSite: "lax",
        },
    })
);

app.use(express.static(path.join(__dirname, "public")));

app.use("/login", login);
app.use("/signup", signup);
app.use("/loaddata", isLoggedIn, loaddata);
app.use("/request", isLoggedIn, request);
app.use("/medical", isLoggedIn, medical);
app.use("/advanced", isLoggedIn, advanced);

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.use((req, res) => {
    return res.status(404).json({
        message: "Route not found",
        path: req.originalUrl,
    });
});

app.use((err, req, res, next) => {
    console.error("Unhandled server error:", err);

    return res.status(500).json({
        message: "Internal server error",
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
