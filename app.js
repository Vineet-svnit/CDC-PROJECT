//Require Packages
const dotenv = require("dotenv");
dotenv.config();
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
const axios = require('axios');
const { connectDB } = require("./config/db.js")
const MongoStore = require("connect-mongo")

//node-schedule can schedule the task, but cant iteract with the front-end by itself. So we use socket.io
const schedule = require("node-schedule");

//to send backend request to frontend
const socketIo = require("socket.io");
const http = require("http");
const server = http.createServer(app); // Use HTTP server
const io = socketIo(server); // Initialize socket.io with the server
const PORT = process.env.PORT || 5000;
// server.listen(8080);

//Require Schemas
const User = require('./models/user.js');
const Test = require("./models/test.js");
const Admin = require('./models/admin.js');
const Announcement = require("./models/announcement.js");
const Question = require("./models/question.js");

// const mongoURL = 'mongodb://127.0.0.1:27017/CDCproject';

//Middlewares
app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap/dist')));//to use bootstrap
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "/public")));
app.use(methodOverride("_method"));

const store = MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    touchAfter: 24 * 60 * 60, // tells that if there has been no change in data then don't save until a day atleast to prevent unecessary saves
    crypto: {
        secret: process.env.SECRET
    }
})

const sessionOptions = {
    store,
    secret: process.env.SECRET,
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
    res.locals.currentPath = req.path;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    req.isAdmin = req.session.isAdmin || false;
    next();
});

const checkValidity = async (req, res, next) => {
    let { id } = req.params;
    let test = await Test.findById(id);
    let currentTime = new Date(
        new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );
    let { startTime, endTime } = test;
    if (currentTime < startTime) {
        console.log(currentTime, startTime, endTime);
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

const checkSubmit = async (req, res, next) => {
    const id = req.user._id;
    const user = await User.findById(id);
    const testId = req.params.id;
    if (user) {
        const check = user.submissions.find(s => s.test_id.equals(testId));
        if (check) {
            req.flash('error', 'Test already submitted!!');
            return res.redirect('/');
        }
    }
    else
        return res.redirect('/');
    next();
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

//local host
// main()
//     .then(() => {
//         console.log("Connected to DB");
//     })
//     .catch((err) => {
//         console.log(err);
//     });

// async function main() {
//     await mongoose.connect(mongoURL);
// }

const scheduledJobs = new Set(); // store globally, outside route

const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'Please Login First!');
        return res.redirect('/login');
    }
    next();
}

const isAdmin = (req, res, next) => {
    if (req.isAdmin)
        return next();
    req.flash('error', 'You are not authorized');
    res.redirect('/');
}

const storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
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

app.get("/admin/login", (req, res) => {
    res.render('register_login/AdminLogin');
})

app.get('/logout', (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Logged out Successfully!');
        res.redirect('/login');
    })
})

app.get('/admin/logout', (req, res, next) => {
    req.session.destroy((err) => {
        if (err) {
            console.log('Error logging admin out', err);
            return res.redirect('/dashboard');
        }
        res.redirect('/admin/login');
    })
})

app.post('/register', async (req, res) => {
    try {
        // console.log(req.body);
        const { username, password, email, name, phone, branch, year } = req.body;
        const user = new User({ username, email, name, phone, branch, year });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'User registered successfully');
            res.redirect('/');
        })
    } catch (e) {
        if (e) {
            req.flash('error', e.message || 'Registration Failed!!');
            // console.log(e);
        }
        res.redirect('/register');
    }
})

app.post('/login', storeReturnTo, passport.authenticate('local', {
    failureFlash: true,
    failureRedirect: '/login'
}), async (req, res) => {
    const { name } = req.user;
    req.flash('success', `Welcome Back ${name}`);
    const redirectUrl = res.locals.returnTo || '/';
    // Then redirect the browser
    res.redirect(redirectUrl);
});

app.post('/admin/login', async (req, res) => {
    const { adminUsername, password } = req.body;
    const admin = await Admin.findOne({ adminUsername });
    if (!admin) {
        req.flash("error", "Invalid credentials");
        return res.redirect("/admin/login");
    }
    const isValid = await admin.validatePassword(password);
    if (!isValid) {
        req.flash("error", "Invalid credentials");
        return res.redirect("/admin/login");
    }
    req.session.isAdmin = admin._id;
    res.redirect('/dashboard');
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
    res.render("user/home.ejs", { allTests, user: req.user, page: "home" });
});

app.get("/history", isLoggedIn, async (req, res) => {
    const userId = req.user._id;
    const user = await User.findById(userId).populate('submissions.test_id');
    const submissions = user.submissions;
    // console.log(submissions);
    submissions.reverse();
    // console.log(submissions[0]);
    res.render('history', { submissions, page: "history" });
});

app.get("/announcement", isLoggedIn, async (req, res) => {
    let allAnnouncements = await Announcement.find({});
    allAnnouncements.reverse();
    res.render("user/announcement.ejs", { allAnnouncements, page: "announcement" });
});

//Show test 
app.get("/tests/:id/:user_id", isLoggedIn, checkValidity, checkSubmit, async (req, res) => {
    try {
        let { id, user_id } = req.params;

        // Populate the 'questions' field (which should be an array of ObjectIds)
        let test = await Test.findById(id).populate("questions");

        res.render("question.ejs", { test, user_id });
    } catch (err) {
        console.error("Error fetching test:", err);
        res.status(500).send("Internal Server Error");
    }
});

//Show submission page

app.get("/submission/:id", isLoggedIn, async (req, res) => {
    // console.log('called get');
    const testId = req.params.id;
    const test = await Test.findById(testId).populate('questions');
    const user = await User.findById(req.user._id);
    const submission = user.submissions.find(s => s.test_id.equals(testId));
    // console.log(submission);
    res.render("submission", { test, submission, page: "submission" });
})

app.post("/submission/:id", isLoggedIn, checkSubmit, async (req, res) => {
    // const { submissions, questions } = req.body; // Array from frontend
    const { submissions } = req.body; // Array from frontend
    const testId = req.params.id;
    const id = req.user._id;
    // 1. Transform submissions into the correct schema format
    const formattedSubmissions = submissions.map(sub => ({
        answer: sub.answer || "",
        question: sub.question,
        isMarked: sub.isMarked || false
    }));

    formattedSubmissions.sort((a, b) => a.question.toString().localeCompare(b.question.toString()));

    // 2. Find the user first (to avoid overwriting existing submissions)
    const user = await User.findById(id);

    if (!user) {
        return res.status(404).send("User not found");
    }
    user.submissions.push({
        test_id: testId,
        submittedAns: formattedSubmissions
    });        // 3. Check if the user already submitted this test

    // 4. Save the updated user
    await user.save();

    const submission = user.submissions.find(s => s.test_id.equals(testId));
    if (!submission)
        return res.status(404).send("Submission not found");
    const test = await Test.findOne({ _id: testId }).populate("questions");
    const answers = submission.submittedAns;
    const questions = test.questions;
    let score = 0;
    for (let i = 0; i < questions.length; i++) {
        if (questions[i]._type === "SCQ") {
            if (questions[i].answer === answers[i].answer) {
                score += 3;
                answers[i].score = 3;
            }
        }
        else if (questions[i]._type === "MCQ" && answers[i].answer.length > 0) {
            const correctAns = questions[i].answer;
            const givenAns = answers[i].answer;
            let count = 0;
            let falseAns = false;
            for (const a of givenAns) {
                if (correctAns.indexOf(a) === -1) {
                    score -= 2;
                    answers[i].score = -2;
                    falseAns = true;
                    break;
                }
                else count++;
            }
            if (!falseAns && count === correctAns.length) {
                score += 4;
                answers[i].score = 4;
            }
            else if (!falseAns) {
                score += count;
                answers[i].score = count;
            }
        }
    }
    submission.score = score;
    submission.questions = questions;
    await user.save();
    res.redirect(`/submission/${testId}`);
});

//Show Test Form 
app.get("/test/new", isAdmin, (req, res) => {
    res.render("testForm.ejs");
});

// Create Test Route
app.post("/test/questions/new", isAdmin, async (req, res) => {
    let { testName, date, time, duration, numberOfQues } = req.body;

    // Combine into ISO string
    const isoString = `${date}T${time}:00`;

    // Convert to Date object (for MongoDB)
    const startTime = new Date(isoString);
    const endTime = new Date(isoString);
    endTime.setMinutes(endTime.getMinutes() + Number(duration));

    const questions = await Question.aggregate([
        { $sample: { size: Number(numberOfQues) } },
    ]);
    // console.log(questions);
    let randomIds = questions.map((q) => q._id.toString());

    randomIds.sort((a, b) => a.localeCompare(b));

    let totalMarks = 0;
    for (const question of questions) {
        if (question._type === 'SCQ')
            totalMarks += 3;
        else if (question._type === 'MCQ')
            totalMarks += 4;
    }
    // console.log('totalmarks', totalMarks);
    const newTest = new Test({
        testName, startTime, endTime, duration, numberOfQues, questions: randomIds
    });

    newTest.totalMarks = totalMarks;


    await newTest.save()
        .then((response) => {
            // const id = response._id;
            res.redirect("/dashboard");
        })
        .catch((err) => console.log(err));
});

//Create Ques Route
// app.post("/test/questions/:id", isAdmin, async (req, res) => {
//     const { id } = req.params;
//     const questions = req.body.questions;
//     const test = await Test.findById(id);
//     test.questions = questions;
//     let totalMarks = 0;
//     for (const question of questions) {
//         if (question._type === 'SCQ')
//             totalMarks += 3;
//         else if (question._type === 'MCQ')
//             totalMarks += 4;
//     }
//     test.totalMarks = totalMarks;
//     await test.save();
//     res.redirect("/dashboard");
// })

//Delete Test
app.delete("/test/:id", isAdmin, async (req, res) => {
    let { id } = req.params;
    await Test.findByIdAndDelete(id);
    res.redirect("/dashboard");
});

//Show Test Edit Form
app.get("/test/:id", isAdmin, async (req, res, next) => {
    let { id } = req.params;
    let test = await Test.findById(id).populate("questions");
    res.render("testEditForm.ejs", { id, test });
});

//Update Test
app.put("/test/:id", isAdmin, async (req, res) => {
    let { id } = req.params;
    let { date, time, duration, testname, questions: changedQuestions } = req.body;
    // console.log(req.body);

    // Combine into ISO string
    const isoString = `${date}T${time}:00`;

    // Convert to Date object (for MongoDB)
    const startTime = new Date(isoString);
    const endTime = new Date(isoString);
    endTime.setMinutes(endTime.getMinutes() + Number(duration));

    const updatedPromises = changedQuestions.map(q => {
        const { _id, ...rest } = q;
        return Question.findByIdAndUpdate(_id, rest, { new: true });
    })

    await Promise.all(updatedPromises);

    const test = await Test.findByIdAndUpdate(id, { testname, duration, startTime, endTime }, { new: true }).populate("questions").exec();
    console.log(test.questions);
    const questions = test.questions;
    let totalMarks = 0;
    for (const question of questions) {
        if (question._type === 'SCQ')
            totalMarks += 3;
        else if (question._type === 'MCQ')
            totalMarks += 4;
    }
    test.totalMarks = totalMarks;
    await test.save();

    const users = await User.find();
    for (const user of users) {
        const submission = user.submissions.find(s => s.test_id.equals(id));
        if (submission) {
            let score = 0;
            const answers = submission.submittedAns;
            for (let i = 0; i < questions.length; i++) {
                answers[i].score = 0;
                if (questions[i]._type === "SCQ") {
                    if (questions[i].answer === answers[i].answer) {
                        score += 3;
                        answers[i].score = 3;
                    }
                }
                else if (questions[i]._type === "MCQ" && answers[i].answer.length > 0) {
                    const correctAns = questions[i].answer;
                    const givenAns = answers[i].answer;
                    let count = 0;
                    let falseAns = false;
                    for (const a of givenAns) {
                        if (correctAns.indexOf(a) === -1) {
                            score -= 2;
                            answers[i].score = -2;
                            falseAns = true;
                            break;
                        }
                        else count++;
                    }
                    if (!falseAns && count === correctAns.length) {
                        score += 4;
                        answers[i].score = 4;
                    }
                    else if (!falseAns) {
                        score += count;
                        answers[i].score = count;
                    }
                }
            }
            submission.score = score;
            user.markModified('submissions');
            await user.save();
        }
    }
    res.redirect("/dashboard");
});// _____________________________________________________________________

//Show Announcement Form
app.get("/announcement/new", isAdmin, (req, res) => {
    res.render("announcementForm.ejs");
});

//Create Announcement
app.post("/announcement/new", isAdmin, async (req, res) => {
    let announcement = req.body;
    let now = new Date();
    let date = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    newAnnouncement = new Announcement({ ...announcement, date });
    await newAnnouncement.save();
    res.redirect("/dashboard");
})

//Delete Announcement
app.delete("/announcement/:id", isAdmin, async (req, res) => {
    let { id } = req.params;
    await Announcement.findByIdAndDelete(id);
    res.redirect("/dashboard");
});

//Show Announcement Edit Form
app.get("/announcement/:id", isAdmin, async (req, res) => {
    let { id } = req.params;
    let announcement = await Announcement.findById(id);
    res.render("announcementEditForm.ejs", { id, announcement });
});

//Update Announcement
app.put("/announcement/:id", isAdmin, async (req, res) => {
    let { id } = req.params;
    let announcement = await Announcement.findById(id);
    await Announcement.findByIdAndUpdate(id, { ...req.body })
    res.redirect("/dashboard");
});

app.get("/dashboard", isAdmin, async (req, res) => {
    let allAnnouncements = await Announcement.find({});
    allAnnouncements.reverse();
    let allTests = await Test.find({});
    allTests.reverse();
    res.render("dashboard.ejs", { allAnnouncements, allTests });
})

// Error Handler
app.use((err, req, res, next) => {
    let { status = 500, message = "Sorry! Some error occurred." } = err;
    err.status = status;
    err.message = message;
    res.status(status).render("error", { err });
});
//.......

// Page not found error as middleware
app.use((req, res) => {
    res.status(404).send("Page not found")
});

// app.listen(PORT, () => {
//     console.log("Server is listening at http://localhost:8080");
// });
// 💡 DB connect and start server
connectDB()
    .then(() => {
        console.log("Database connected successfully");
        server.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Database connection failed:", error);
    });


