const express = require("express");
const app = express();
const path = require("path");
const session = require("express-session");
const bodyParser = require("body-parser");
const isLoggedIn = require("./middleware/authmiddleware");
//Body-parser is middleware in Express.js that parses incoming request bodies (like JSON or form data)
//into readable JavaScript objects accessible via req.body.
const login = require("./routes/login");
const signup = require("./routes/signup");
const loaddata = require("./routes/loaddata");
const request = require("./routes/request");
const medical = require("./routes/medical");
const advanced = require("./routes/advanced");
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//session setup
app.use(
	session({
		secret: "d7f8a9b2c1e4d5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2",
		resave: false,
		saveUninitialized: false,
		cookie: {
			maxAge: 1000 * 60 * 60,
			httpOnly: true,
		},
	}),
);

// Routes
app.use("/login", login);
app.use("/signup",signup);
app.use("/loaddata",isLoggedIn,loaddata);
app.use("/request",isLoggedIn,request);
app.use("/medical", isLoggedIn, medical);
app.use("/advanced", isLoggedIn, advanced);

app.listen(3000, () => {
	console.log("Server running at http://localhost:3000");
});
