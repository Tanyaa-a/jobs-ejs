require("dotenv").config(); 
const express = require("express");
require("express-async-errors");
const csrf = require('host-csrf'); 
const app = express();
const auth = require('./middleware/auth'); 
const xss = require('xss-clean');


app.set("view engine", "ejs");
app.use(require("body-parser").urlencoded({ extended: true }));
app.use(xss());




// Cookie parser to sign cookies with the SESSION_SECRET
const cookieParser = require('cookie-parser');
app.use(cookieParser(process.env.SESSION_SECRET));
const session = require("express-session");
const jobs = require('./routes/jobs');
const Job = require('./models/Job');
const MongoDBStore = require("connect-mongodb-session")(session);

let mongoURL = process.env.MONGO_URI;
if (process.env.NODE_ENV == "test") {
  mongoURL = process.env.MONGO_URI_TEST;
}

const store = new MongoDBStore({
  uri: mongoURL,
  collection: "mySessions",
});
store.on("error", function (error) {
  console.log(error);
});

const sessionParms = {
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  store: store,
  cookie: { secure: false, sameSite: "strict" },
};

if (app.get("env") === "production") {
  app.set("trust proxy", 1); // Trust first proxy
  sessionParms.cookie.secure = true; // Serve secure cookies in production
}

// Apply session middleware before CSRF
app.use(session(sessionParms));

// CSRF protection configuration
const csrf_options = {
  protected_operations: ["POST", "PATCH"], // Protect POST and PATCH requests
  protected_content_types: ["application/x-www-form-urlencoded", "application/json"], // Common content types to protect
  development_mode: app.get("env") !== "production", // Disable __Host cookie in dev mode
};

const csrf_middleware = csrf(csrf_options); // Initialize CSRF middleware with options
app.use(csrf_middleware); // Apply CSRF middleware globally


const passport = require("passport");
const passportInit = require("./passport/passportInit");

passportInit();
app.use(passport.initialize());
app.use(passport.session());

app.use(require("connect-flash")());
app.use(require("./middleware/storeLocals"));

//Content-Type header middleware
app.use((req, res, next) => {
  if (req.path == "/multiply") {
    res.set("Content-Type", "application/json");
  } else {
    res.set("Content-Type", "text/html");
  }
  next();
});

// Routes
app.get("/", (req, res) => {
  res.render("index");
});
app.use("/sessions", require("./routes/sessionRoutes"));
app.use("/secretWord", require("./routes/secretWord")); 
app.use("/jobs", jobs);

//testing for API
app.get("/multiply", (req, res) => {
  const result = req.query.first * req.query.second;
  if (result.isNaN) {
    result = "NaN";
  } else if (result == null) {
    result = "null";
  }
  res.json({ result: result });
});

// 404 error handling
app.use((req, res) => {
  res.status(404).send(`That page (${req.url}) was not found.`);
});

// General error handling
app.use((err, req, res, next) => {
  res.status(500).send(err.message);
  console.log(err);
});

const port = process.env.PORT || 3000;

const start = () => {
  try {
    require("./db/connect")(mongoURL);
    return app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`),
    );
  } catch (error) {
    console.log(error);
  }
};

start();

module.exports = { app };
