//Require Packages
const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const cookieParser = require('cookie-parser')
const methodOverride = require("method-override");
const passport = require('passport');
const LocalStrategy = require('passport-local');

//node-schedule can schedule the task, but cant iteract with the front-end by itself. So we use socket.io
const schedule = require("node-schedule");

//to send backend request to frontend
const socketIo = require("socket.io");
const http = require("http");
const server = http.createServer(app); // Use HTTP server
const io = socketIo(server); // Initialize socket.io with the server
server.listen(8080);

//Require Schemas
const User = require('./models/user.js');
const Test = require("./models/test.js");
const Announcement = require("./models/announcement.js");

const mongoURL = 'mongodb://127.0.0.1:27017/CDCproject';

//Middlewares
app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap/dist')));//to use bootstrap
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "/public")));
app.use(methodOverride("_method"));

const sessionOptions = {
    secret: "mysupersecret",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 60 * 60 * 24 * 1000 * 7,
        maxAge: 60 * 60 * 24 * 1000 * 7,
        httpOnly: true
    }
};
app.use(session(sessionOptions));
app.use(flash());
app.use(cookieParser())

// These must be below session middleware
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

const checkValidity = async (req, res, next) => {
    let { id } = req.params;
    let test = await Test.findById(id);
    let currentTime = new Date();
    let { startTime, endTime } = test;
    if (currentTime < startTime) {
        req.flash("error", "The test cannot be started!");
        return res.redirect("/");
    }
    else if (currentTime > endTime) {
        req.flash("error", "The test is completed!");
        return res.redirect("/");
    }
    else {
        next();
    }
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate); 

main()
    .then(() => {
        console.log("Connected to DB");
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(mongoURL);
}

const scheduledJobs = new Set(); // store globally, outside route

const isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'Please Login First!');
        return res.redirect('/login');
    }
    next();
}

const storeReturnTo = (req, res, next) => {
    if(req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}

app.get("/register", (req, res) => {
    res.render("register_login/register.ejs");
});

app.get("/login", (req, res) => {
    res.render("register_login/login.ejs");
});

app.get('/logout', (req, res, next) => {
    req.logout(function(err) {
        if(err) {
            return next(err);
        }
        req.flash('success', 'Logged out Successfully!');
        res.redirect('/login');
    })
})

app.post('/register', async (req, res) => {
    try {
        // console.log(req.body);
        const { username, password, email, name, phone, branch, year } = req.body;
        const user = new User({ username, email, name, phone, branch, year });
        const registeredUser = await User.register( user, password );
        req.login(registeredUser, err => {
            if(err) return next(err);
            req.flash('success', 'User registered successfully');
            res.redirect('/');
        })
    } catch(e) {
        if (e) {
            req.flash('error', e.message || 'Registration Failed!!');
            // console.log(e);
        }
        res.redirect('/register');
    }
})

app.post('/login', storeReturnTo, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), async (req, res) => {
    const { name } = req.user;
    req.flash('success', `Welcome Back ${ name }`);
    const redirectUrl = res.locals.returnTo || '/';
    res.redirect(redirectUrl);
})

app.get("/", isLoggedIn, async (req, res) => {
    let allTests = await Test.find({});
    allTests.reverse();
    allTests.forEach((test) => {
        if (!scheduledJobs.has(test._id.toString())) {
            const runAt = new Date(test.startTime);
            schedule.scheduleJob(runAt, () => {
                io.emit("task-complete", {
                    message: `You can start "${test.testName}"`,
                    id: test._id
                });
            });
            scheduledJobs.add(test._id.toString()); // mark as scheduled
        }
    });
    res.render("user/home.ejs", { currentPath: req.path, allTests });
});

app.get("/history", isLoggedIn, (req, res) => {
    res.render("user/history.ejs", { currentPath: req.path });
});

app.get("/announcement", isLoggedIn, async (req, res) => {
    let allAnnouncements = await Announcement.find({});
    allAnnouncements.reverse();
    res.render("user/announcement.ejs", { currentPath: req.path, allAnnouncements });
});

//Show test 
app.get("/tests/:id", isLoggedIn, checkValidity, async (req, res) => {
    let { id } = req.params;
    let test = await Test.findById(id);
    res.render("question.ejs", { test });
});

//Show submission page
app.get("/submission", isLoggedIn, (req, res) => {
    res.send("This is submission page");
});

//Show Test Form 
app.get("/test/new", isLoggedIn, (req, res) => {
    res.render("testForm.ejs");
});

// Create Test Route
app.post("/test/questions/new", isLoggedIn, async (req, res) => {
    let { testName, date, time, duration, numberOfQues, totalMarks } = req.body;

    // Combine into ISO string
    const isoString = `${date}T${time}:00`;

    // Convert to Date object (for MongoDB)
    const startTime = new Date(isoString);
    const endTime = new Date(isoString);
    endTime.setMinutes(endTime.getMinutes() + Number(duration));

    const newTest = new Test({
        testName, startTime, endTime, duration, numberOfQues, totalMarks
    });

    await newTest.save()
        .then((response) => {
            const id = response._id;
            res.render("questionForm.ejs", { numberOfQues, id });
        })
        .catch((err) => console.log(err));
});

//Create Ques Route
app.post("/test/questions/:id", isLoggedIn, async (req, res) => {
    const { id } = req.params;
    await Test.findByIdAndUpdate(id, { questions: req.body.questions });
    res.redirect("/dashboard");
})

//Delete Test
app.delete("/test/:id", isLoggedIn, async (req, res) => {
    let { id } = req.params;
    await Test.findByIdAndDelete(id);
    res.redirect("/dashboard");
});

//Show Test Edit Form
app.get("/test/:id", isLoggedIn, async (req, res) => {
    let { id } = req.params;
    let test = await Test.findById(id);
    res.render("testEditForm.ejs", { id, test });
});

//Update Test
app.put("/test/:id", isLoggedIn, async (req, res) => {
    let { id } = req.params;
    let { date, time, duration } = req.body;

    // Combine into ISO string
    const isoString = `${date}T${time}:00`;

    // Convert to Date object (for MongoDB)
    const startTime = new Date(isoString);
    const endTime = new Date(isoString);
    endTime.setMinutes(endTime.getMinutes() + Number(duration));

    await Test.findByIdAndUpdate(id, { ...req.body, startTime, endTime });
    res.redirect("/dashboard");
});

// _____________________________________________________________________

//Show Announcement Form
app.get("/announcement/new", isLoggedIn, (req, res) => {
    res.render("announcementForm.ejs");
});

//Create Announcement
app.post("/announcement/new", isLoggedIn, async (req, res) => {
    let announcement = req.body;
    let now = new Date();
    let date = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    newAnnouncement = new Announcement({ ...announcement, date });
    await newAnnouncement.save();
    res.redirect("/dashboard");
})

//Delete Announcement
app.delete("/announcement/:id", isLoggedIn, async (req, res) => {
    let { id } = req.params;
    await Announcement.findByIdAndDelete(id);
    res.redirect("/dashboard");
});

//Show Announcement Edit Form
app.get("/announcement/:id", isLoggedIn, async (req, res) => {
    let { id } = req.params;
    let announcement = await Announcement.findById(id);
    res.render("announcementEditForm.ejs", { id, announcement });
});

//Update Announcement
app.put("/announcement/:id", isLoggedIn, async (req, res) => {
    let { id } = req.params;
    let announcement = await Announcement.findById(id);
    await Announcement.findByIdAndUpdate(id, { ...req.body })
    res.redirect("/dashboard");
});

app.get("/dashboard", isLoggedIn, async (req, res) => {
    let allAnnouncements = await Announcement.find({});
    allAnnouncements.reverse();
    let allTests = await Test.find({});
    allTests.reverse();
    res.render("dashboard.ejs", { allAnnouncements, allTests });
})

// Error Handler
app.use((err,req,res,next)=>{
    let {status=500,message="Sorry! Some error occurred."}=err;
    err.status = status;
    err.message = message;
    res.status(status).render("error", {err});
});
//.......

// Page not found error as middleware
app.use((req, res) => {
    res.status(404).send("Page not found")
});

app.listen(8080, () => {
    console.log("Server is listening at http://localhost:8080");
});