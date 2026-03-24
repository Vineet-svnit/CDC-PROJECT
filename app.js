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
const MongoStore = require("connect-mongo");
const multer = require('multer');
const xlsx = require('xlsx');
const crypto = require("crypto")
// const sebOnly = require("./middleware/sebOnly");
const { sebOnly, sha256Hex, getAbsoluteUrl } = require("./middleware/sebOnly");


//node-schedule can schedule the task, but cant iteract with the front-end by itself. So we use socket.io
const schedule = require("node-schedule");
const storage = multer.memoryStorage();
const upload = multer({ storage });

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
const OtpVerification = require('./models/otpVerification.js');

// Import OTP service - Using Postmark
const { generateOTP, sendOTPEmail } = require('./utils/postmarkService.js');

// Import time utilities
const {
    getCurrentUTC,
    convertISTToUTC,
    hasTestStarted,
    hasTestEnded,
    isTestActive,
    isInBufferPeriod,
    canAccessTest,
    getTestStatus,
    getAnnouncementDate,
    getCurrentAcademicYear,
    getAcademicYearFromEmail,
    calculateYearLevel
} = require('./utils/timeUtils.js');

// Import template helpers
const templateHelpers = require('./utils/templateHelpers.js');
// const Question = require("./models/question.js");
const {
    Question,
    AiDepartment,
    ChemicalDepartment,
    ChemistryDepartment,
    CivilDepartment,
    ComputerScienceDepartment,
    ElectricalDepartment,
    ElectronicsCommunicationDepartment,
    HumanitiesSocialSciencesDepartment,
    ManagementStudiesDepartment,
    MathematicsDepartment,
    MechanicalDepartment,
    PhysicsDepartment
} = require("./models/question.js");

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

// const sessionOptions = {
//     store,
//     secret: process.env.SECRET,
//     resave: false,
//     saveUninitialized: true,
//     cookie: {
//         expires: Date.now() + 60 * 60 * 24 * 1000 * 7,
//         maxAge: 60 * 60 * 24 * 1000 * 7,
//         httpOnly: true
//     }
// };

const sessionOptions = {
    store,
    // name: "exam.sid", // custom name (good practice)
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
        httpOnly: true,
        sameSite: "lax", // REQUIRED for Chrome → SEB
        // expires: Date.now() + 60 * 60 * 24 * 1000 * 7,
        maxAge: 1000 * 60 * 60 * 3 // 3 hours
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
    // console.log(req.session);
    // Make time helpers available to all templates
    Object.assign(res.locals, templateHelpers);

    next();
});

const checkValidity = async (req, res, next) => {
    let { id } = req.params;
    let test = await Test.findById(id);

    if (hasTestEnded(test.endTime)) {
        req.flash("error", "The test is completed!");
        return res.redirect("/");
    }
    else if (!canAccessTest(test.startTime, test.endTime)) {
        req.flash("error", "The test cannot be started yet!");
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

// app.get("/session-test", (req, res) => {
//   res.send({
//     sessionID: req.sessionID,
//     property: req.session.testExists
//   });
// });

app.get("/register", (req, res) => {
    res.render("register_login/register.ejs");
});

app.get("/login", (req, res) => {
    res.render("register_login/login.ejs");
});

app.get("/admin/login", (req, res) => {
    res.render('register_login/AdminLogin',);
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

// Settings Routes
app.get('/settings', isLoggedIn, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.render('user/settings', { user, page: 'settings' });
    } catch (err) {
        req.flash('error', 'Error loading settings');
        res.redirect('/');
    }
});

app.post('/settings/update', isLoggedIn, async (req, res) => {
    try {
        const { name } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { name },
            { new: true, runValidators: true }
        );
        req.flash('success', 'Profile updated successfully!');
        res.redirect('/settings');
    } catch (err) {
        req.flash('error', err.message || 'Error updating profile');
        res.redirect('/settings');
    }
});

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
        const { email, password, name, branch } = req.body;

        // Extract username from email
        const username = email.split('@')[0].toLowerCase();

        // Extract admission academic year from email using utility function
        const admissionYear = getAcademicYearFromEmail(email);

        // Extract program from email pattern
        let program = '';
        if (username.match(/^[ub]\d{2}[a-z]{2,5}\d{3}$/)) {
            program = 'btech';
        } else if (username.match(/^[p]\d{2}[a-z]{2,5}\d{3}$/)) {
            program = 'mtech';
        } else if (username.match(/^[i]\d{2}[a-z]{2,5}\d{3}$/)) {
            program = 'msc';
        } else if (username.match(/^[m]\d{2}[b][a]\d{3}$/)) {
            program = 'mba';
        } else {
            req.flash('error', 'Invalid email format - unable to detect program');
            return res.redirect('/register');
        }

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            req.flash('error', 'User with this username or email already exists');
            return res.redirect('/register');
        }

        // Generate OTP
        const otp = generateOTP();

        // Calculate expiration time (3 minutes from now)
        const expiresAt = new Date(Date.now() + 3 * 60 * 1000); // 3 minutes

        // Store user data and OTP temporarily
        await OtpVerification.findOneAndUpdate(
            { email },
            {
                email,
                otp,
                expiresAt,
                userData: { username, password, email, name, program, branch, year: admissionYear }
            },
            { upsert: true, new: true }
        );

        // Send OTP email
        const emailResult = await sendOTPEmail(email, otp, name);

        if (!emailResult.success) {
            req.flash('error', 'Failed to send verification email. Please try again.');
            return res.redirect('/register');
        }

        req.flash('success', 'Verification code sent to your email. Please check your inbox.');
        res.render('register_login/otpVerification.ejs', { email, expiresAt: expiresAt.getTime() });

    } catch (e) {
        console.error('Registration error:', e);
        req.flash('error', e.message || 'Registration Failed!!');
        res.redirect('/register');
    }
})

// OTP Verification Route
app.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;

        // Find OTP verification record
        const otpRecord = await OtpVerification.findOne({ email });

        if (!otpRecord) {
            req.flash('error', 'Verification session not found. Please register again.');
            return res.redirect('/register');
        }

        // Check if OTP has expired (backend validation)
        if (otpRecord.isExpired()) {
            req.flash('error', 'OTP has expired. Please click "Resend OTP" to get a new code.');
            return res.render('register_login/otpVerification.ejs', {
                email,
                expiresAt: otpRecord.expiresAt.getTime()
            });
        }

        // Verify OTP
        if (otpRecord.otp !== otp) {
            req.flash('error', 'Invalid OTP. Please try again.');
            return res.render('register_login/otpVerification.ejs', {
                email,
                expiresAt: otpRecord.expiresAt.getTime()
            });
        }

        // OTP is correct, create user account
        const { username, password, name, program, branch, year } = otpRecord.userData;
        const user = new User({ username, email, name, program, branch, year });
        const registeredUser = await User.register(user, password);

        // Delete OTP record after successful registration
        await OtpVerification.deleteOne({ email });

        // Log in the user
        req.login(registeredUser, err => {
            if (err) {
                console.error('Login error after registration:', err);
                req.flash('error', 'Registration successful but login failed. Please login manually.');
                return res.redirect('/login');
            }
            req.flash('success', 'Registration successful! Welcome to CDC.');
            res.redirect('/');
        });

    } catch (e) {
        console.error('OTP verification error:', e);
        req.flash('error', 'Verification failed. Please try again.');
        res.redirect('/register');
    }
});

// Resend OTP Route
app.post('/resend-otp', async (req, res) => {
    try {
        const { email } = req.body;

        // Find existing OTP record
        const otpRecord = await OtpVerification.findOne({ email });

        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message: 'No pending verification found. Please register again.'
            });
        }

        // Generate new OTP (works even if old OTP expired)
        const newOtp = generateOTP();

        // Calculate new expiration time (3 minutes from now)
        const expiresAt = new Date(Date.now() + 3 * 60 * 1000); // 3 minutes

        // Update OTP record with new OTP and expiration time
        otpRecord.otp = newOtp;
        otpRecord.createdAt = new Date(); // Reset creation time for TTL
        otpRecord.expiresAt = expiresAt;
        await otpRecord.save();

        // Send new OTP email
        const emailResult = await sendOTPEmail(email, newOtp, otpRecord.userData.name);

        if (!emailResult.success) {
            return res.status(500).json({
                success: false,
                message: 'Failed to send email. Please try again.'
            });
        }

        res.json({
            success: true,
            message: 'OTP resent successfully',
            expiresAt: expiresAt.getTime()
        });

    } catch (e) {
        console.error('Resend OTP error:', e);
        res.status(500).json({
            success: false,
            message: 'Failed to resend OTP. Please try again.'
        });
    }
});
// res.status(500).json({ success: false, message: 'Failed to resend OTP' });
//     }
// });

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
    const { adminUserName, password } = req.body;
    const admin = await Admin.findOne({ adminUserName });
    if (!admin) {
        req.flash("error", "Invalid credentials");
        return res.redirect("/admin/login");
    }
    const isValid = await admin.validatePassword(password);
    if (!isValid) {
        req.flash("error", "Invalid credentials");
        return res.redirect("/admin/login");
    }
    req.session.isAdmin = true;
    res.redirect('/dashboard');
})


app.get("/", isLoggedIn, async (req, res) => {
    const userProgram = req.user.program;
    const userYear = req.user.year;
    const userBranch = req.user.branch;

    let allTests = await Test.find({
        branch: userBranch,
        program: userProgram,
        year: userYear,
        isTechnical: false
    });
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
    // console.log(req.session.testExists);
    // const ua = req.headers["user-agent"] || "";
    // const receivedHash =
    //     req.headers["x-safeexambrowser-configkeyhash"];

    // const configKey =
    //     process.env.NODE_ENV === "production"
    //         ? process.env.SEB_CONFIG_KEY
    //         : process.env.SEB_CONFIG_KEY_LOCAL;

    // const isSEB = ua.includes("SafeExamBrowser") || ua.includes("SEB");

    // let isValidSEB = false;

    // console.log(isSEB, receivedHash, configKey);


    // if (isSEB && receivedHash && configKey) {
    //     const absoluteUrl = getAbsoluteUrl(req);
    //     const expectedHash = sha256Hex(absoluteUrl + configKey);
    //     isValidSEB = (expectedHash === receivedHash);
    // }

    /* ------------------ REDIRECT LOGIC ------------------ */

    // if (isValidSEB && req.user.pendingTestId) {
    //     const pendingId = req.user.pendingTestId;
    //     req.user.pendingTestId = undefined;
    //     await req.user.save();
    //     return res.redirect(`/tests/${pendingId}`);
    // }

    const ua = req.headers["user-agent"] || "";
    const receivedHash =
        req.headers["x-safeexambrowser-configkeyhash"];

    const isSEB = ua.includes("SafeExamBrowser") || ua.includes("SEB");

    const isProd = process.env.NODE_ENV === "production";

    const configKey = process.env.SEB_CONFIG_KEY;

    const BASE_URL = isProd
        ? "https://cdc-project-w2zb.onrender.com"
        : "http://localhost:5000";

    let path = req.originalUrl.split("?")[0].split("#")[0];

    const absoluteUrl = BASE_URL + path;
    // console.log("eeeeeeeeeeeeeeeeeeeeeee", absoluteUrl);

    const expectedHash = sha256Hex(absoluteUrl + configKey);

    // console.log("aaaaaaaaaaaaaaaaaaa", isSEB, receivedHash, configKey, expectedHash);


    const isValid = isSEB && receivedHash && configKey && (expectedHash === receivedHash)

    if (isValid && req.user.pendingTestId) {
        const pendingId = req.user.pendingTestId;
        req.user.pendingTestId = undefined;
        await req.user.save();
        return res.redirect(`/tests/${pendingId}`);
    }

    // if (path.startsWith("/")) {
    //     path = path.slice(1);
    // }

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
    const user = req.user;

    // Build query to filter announcements
    // Show announcements that match user's program, branch, and year OR are for "all"
    const query = {
        $or: [
            // Announcements for all programs
            { program: 'all' },
            // Announcements for user's program
            {
                program: user.program,
                $or: [
                    // All branches in this program
                    { branch: 'all' },
                    // User's specific branch
                    {
                        branch: user.branch,
                        $or: [
                            // All years in this branch
                            { year: null },
                            // User's specific year
                            { year: user.year }
                        ]
                    }
                ]
            }
        ]
    };

    let allAnnouncements = await Announcement.find(query);
    allAnnouncements.reverse();
    res.render("user/announcement.ejs", { allAnnouncements, page: "announcement" });
});

app.get('/branchTests', isAdmin, async (req, res) => {
    const { branch_name, program, year, isTechnical } = req.query;
    const query = { branch: branch_name };

    if (program) query.program = program;
    if (year) query.year = parseInt(year);
    if (isTechnical !== undefined) query.isTechnical = (isTechnical === 'true');

    const allTests = await Test.find(query);
    res.send(allTests);
})

app.get("/categories/:branch", isAdmin, async (req, res) => {
    const { branch } = req.params;
    let model;
    switch (branch) {
        case 'lr': model = Question; break;
        case 'ai': model = AiDepartment; break;
        case 'che': model = ChemicalDepartment; break;
        case 'chm': model = ChemistryDepartment; break;
        case 'ce': model = CivilDepartment; break;
        case 'cse': model = ComputerScienceDepartment; break;
        case 'ee': model = ElectricalDepartment; break;
        case 'ece': model = ElectronicsCommunicationDepartment; break;
        case 'hss': model = HumanitiesSocialSciencesDepartment; break;
        case 'ms': model = ManagementStudiesDepartment; break;
        case 'math': model = MathematicsDepartment; break;
        case 'me': model = MechanicalDepartment; break;
        case 'phy': model = PhysicsDepartment; break;
        default: return res.status(400).json({ error: "Invalid branch" });
    }
    try {
        // Get categories with their question counts
        const categoriesWithCounts = await model.aggregate([
            {
                $group: {
                    _id: "$category",
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    category: "$_id",
                    count: 1
                }
            },
            {
                $sort: { category: 1 }
            }
        ]);

        res.json(categoriesWithCounts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/core", isLoggedIn, async (req, res) => {
    const userProgram = req.user.program;
    const userYear = req.user.year;
    const userBranch = req.user.branch;

    let allTests = await Test.find({
        branch: userBranch,
        program: userProgram,
        year: userYear,
        isTechnical: true
    });

    allTests.reverse();

    // req.session.check = 'abc';
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
    // console.log(req.user);
    res.render("user/core.ejs", { allTests, user: req.user, page: "home" });
});

//Show test 
app.get("/tests/:id", isLoggedIn, checkValidity, checkSubmit, sebOnly, async (req, res) => {
    try {
        let { id } = req.params;
        let user_id = req.user._id;
        // delete req.session.testExists;
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
    res.render("submission", { test, submission, page: "submission", isProd: process.env.NODE_ENV === 'production' });
})

app.post("/submission/:id", isLoggedIn, checkSubmit, async (req, res) => {
    // const { submissions, questions } = req.body; // Array from frontend
    const { submissions } = req.body; // Array from frontend
    // console.log(submissions);

    const testId = req.params.id;
    // console.log(testId);

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
                    // score -= 2;
                    answers[i].score = 0;
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

    // --- CUTOFF CALCULATION START ---
    const categoryStats = {};

    // Initialize stats from test definition to ensure we have cutoffs
    if (test.category && test.category.length > 0) {
        test.category.forEach(cat => {
            categoryStats[cat.category_name] = {
                score: 0,
                totalMarks: 0,
                cutoff: cat.cutoffPercentage || 0
            };
        });
    }

    // Aggregate scores from the processed answers
    for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        const category = question.category;
        const maxMarks = (question._type === 'MCQ') ? 4 : 3;
        const qScore = answers[i].score || 0; // The scoring loop above updated this

        if (category) {
            // Initialize if defined in question but not in test definition (fallback)
            if (!categoryStats[category]) {
                categoryStats[category] = { score: 0, totalMarks: 0, cutoff: 0 };
            }
            categoryStats[category].score += qScore;
            categoryStats[category].totalMarks += maxMarks;
        }
    }

    // Determine Qualification
    let allCategoriesQualified = true;
    const categoryResults = [];

    for (const [catName, stats] of Object.entries(categoryStats)) {
        let percentage = 0;
        if (stats.totalMarks > 0) {
            percentage = (stats.score / stats.totalMarks) * 100;
        }
        const isQualified = percentage >= stats.cutoff;
        if (!isQualified) allCategoriesQualified = false;

        categoryResults.push({
            category: catName,
            score: stats.score,
            percentage: percentage,
            isQualified: isQualified
        });
    }

    let totalPercentage = 0;
    if (test.totalMarks > 0) {
        totalPercentage = (score / test.totalMarks) * 100;
    }
    const totalCutoff = test.totalCutoffPercentage || 0;
    const isTotalQualified = totalPercentage >= totalCutoff;

    submission.categoryResults = categoryResults;
    submission.isQualified = allCategoriesQualified && isTotalQualified;
    // --- CUTOFF CALCULATION END ---

    await user.save();
    res.redirect(`/submission/${testId}`);
});

//Show Test Form 
app.get("/test/new", isAdmin, (req, res) => {
    res.render("testForm.ejs");
});

// Create Test Route
app.post("/test/questions/new", isAdmin, async (req, res) => {
    let { testName, date, time, duration, branch, isTechnical, category_name, catNumberOfQues, totalCutoffPercentage, catCutoffPercentage } = req.body;

    const technical = isTechnical === 'true';

    // Normalize categories from form input
    let categories = [];
    if (category_name) {
        const names = Array.isArray(category_name) ? category_name : [category_name];
        const counts = Array.isArray(catNumberOfQues) ? catNumberOfQues : [catNumberOfQues];
        const cutoffs = Array.isArray(catCutoffPercentage) ? catCutoffPercentage : [catCutoffPercentage];
        categories = names.map((name, i) => ({
            category_name: name,
            numberOfQues: Number(counts[i]),
            cutoffPercentage: Number(cutoffs[i] || 0)
        }));
    }

    // Convert IST input to UTC for storage
    const startTime = convertISTToUTC(date, time);
    const endTime = new Date(startTime.getTime() + (Number(duration) * 60 * 1000));

    // academic year from form is admission academic year (e.g., 2024)
    const admissionYear = parseInt(req.body.year);

    // Get questions from 'lr' model if non-technical, otherwise from branch model
    const sourceModelBranch = technical ? branch : 'lr';

    let Model;
    switch (sourceModelBranch) {
        case 'lr': Model = Question; break;
        case 'ai': Model = AiDepartment; break;
        case 'che': Model = ChemicalDepartment; break;
        case 'chm': Model = ChemistryDepartment; break;
        case 'ce': Model = CivilDepartment; break;
        case 'cse': Model = ComputerScienceDepartment; break;
        case 'ee': Model = ElectricalDepartment; break;
        case 'ece': Model = ElectronicsCommunicationDepartment; break;
        case 'hss': Model = HumanitiesSocialSciencesDepartment; break;
        case 'ms': Model = ManagementStudiesDepartment; break;
        case 'math': Model = MathematicsDepartment; break;
        case 'me': Model = MechanicalDepartment; break;
        case 'phy': Model = PhysicsDepartment; break;
        default: return res.status(400).send("Invalid branch");
    }

    if (!Model || categories.length === 0) {
        req.flash('error', 'Invalid branch or no categories selected!');
        return res.redirect("/dashboard");
    }

    // Validate question availability for each category
    const validationErrors = [];
    for (let cat of categories) {
        const availableCount = await Model.countDocuments({ category: cat.category_name });
        if (availableCount < cat.numberOfQues) {
            validationErrors.push(`Category "${cat.category_name}" has only ${availableCount} questions available, but ${cat.numberOfQues} requested.`);
        }
    }

    if (validationErrors.length > 0) {
        req.flash('error', validationErrors.join(' '));
        return res.redirect("/test/new");
    }

    let allQuestions = [];
    let totalNumberOfQues = 0;

    for (let cat of categories) {
        const catQuestions = await Model.aggregate([
            { $match: { category: cat.category_name } },
            { $sample: { size: Number(cat.numberOfQues) } }
        ]);
        allQuestions = allQuestions.concat(catQuestions);
        totalNumberOfQues += Number(cat.numberOfQues);
    }

    if (allQuestions.length === 0) {
        req.flash('error', 'No questions found for selected categories!');
        return res.redirect("/dashboard");
    }

    let randomIds = allQuestions.map((q) => q._id.toString());
    randomIds.sort((a, b) => a.localeCompare(b));

    let totalMarks = 0;
    for (const question of allQuestions) {
        if (question._type === 'SCQ')
            totalMarks += 3;
        else if (question._type === 'MCQ')
            totalMarks += 4;
    }

    const newTest = new Test({
        testName,
        startTime,
        endTime,
        duration,
        numberOfQues: totalNumberOfQues,
        totalMarks,
        totalCutoffPercentage: Number(req.body.totalCutoffPercentage || 0),
        category: categories,
        questions: randomIds,
        branch,
        isTechnical: technical,
        branchModel: Model.modelName,
        program: req.body.program,
        year: admissionYear
    });

    newTest.totalMarks = totalMarks;

    await newTest.save()
        .then(() => {
            req.flash('success', 'Test generated successfully!');
            res.redirect("/dashboard");
        })
        .catch((err) => {
            console.log(err);
            req.flash('error', 'Failed to save test!');
            res.redirect("/dashboard");
        });
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

app.post("/upload", isAdmin, upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        const branch = req.body.branch;

        const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });
        rows.shift(); // remove header row

        const questions = [];
        const errors = [];
        let existingQuestions = [];

        // const existingQuestions = await Question.find();
        switch (branch) {
            case 'lr':
                existingQuestions = await Question.find();
                break;

            case 'ai':
                existingQuestions = await AiDepartment.find();
                break;

            case 'che':
                existingQuestions = await ChemicalDepartment.find();
                break;

            case 'chm':
                existingQuestions = await ChemistryDepartment.find();
                break;

            case 'ce':
                existingQuestions = await CivilDepartment.find();
                break;

            case 'cse':
                existingQuestions = await ComputerScienceDepartment.find();
                break;

            case 'ee':
                existingQuestions = await ElectricalDepartment.find();
                break;

            case 'ece':
                existingQuestions = await ElectronicsCommunicationDepartment.find();
                break;

            case 'hss':
                existingQuestions = await HumanitiesSocialSciencesDepartment.find();
                break;

            case 'ms':
                existingQuestions = await ManagementStudiesDepartment.find();
                break;

            case 'math':
                existingQuestions = await MathematicsDepartment.find();
                break;

            case 'me':
                existingQuestions = await MechanicalDepartment.find();
                break;

            case 'phy':
                existingQuestions = await PhysicsDepartment.find();
                break;

            default:
                existingQuestions = [];
                break;
        }

        rows.forEach((row, index) => {
            // Skip completely empty rows
            if (!row || row.length === 0) return;

            // Must have 7 columns
            if (row.length < 7) {
                errors.push(`Row ${index + 2} has missing columns`);
                return;
            }

            const [_type, question, option1, option2, option3, option4, answer, category] = row;
            const normalizedType = _type.trim().toUpperCase();
            // Validate _type
            if (!_type || !["SCQ", "MCQ"].includes(normalizedType)) {
                errors.push(`Row ${index + 2}: Invalid _type '${_type}'`);
                return;
            }

            // Validate required fields
            if (!question || !answer || !category) {
                errors.push(`Row ${index + 2}: Missing question or answer or category`);
                return;
            }

            // Push valid question
            const isExisting = existingQuestions.find(e => e.question === question);
            if (!isExisting) {
                questions.push({
                    _type: normalizedType,
                    question,
                    option1: option1 || "",
                    option2: option2 || "",
                    option3: option3 || "",
                    option4: option4 || "",
                    answer,
                    category
                });
            }
        });

        // Insert only valid questions
        if (questions.length > 0) {
            switch (branch) {
                case 'lr':
                    await Question.insertMany(questions);
                    break;

                case 'ai':
                    await AiDepartment.insertMany(questions);
                    break;

                case 'che':
                    await ChemicalDepartment.insertMany(questions);
                    break;

                case 'chm':
                    await ChemistryDepartment.insertMany(questions);
                    break;

                case 'ce':
                    await CivilDepartment.insertMany(questions);
                    break;

                case 'cse':
                    await ComputerScienceDepartment.insertMany(questions);
                    break;

                case 'ee':
                    await ElectricalDepartment.insertMany(questions);
                    break;

                case 'ece':
                    await ElectronicsCommunicationDepartment.insertMany(questions);
                    break;

                case 'hss':
                    await HumanitiesSocialSciencesDepartment.insertMany(questions);
                    break;

                case 'ms':
                    await ManagementStudiesDepartment.insertMany(questions);
                    break;

                case 'math':
                    await MathematicsDepartment.insertMany(questions);
                    break;

                case 'me':
                    await MechanicalDepartment.insertMany(questions);
                    break;

                case 'phy':
                    await PhysicsDepartment.insertMany(questions);
                    break;

                default:
                    throw new Error("Invalid branch");
            }
        }

        res.render("uploadResult", {
            inserted: questions.length,
            errors
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to process file" });
    }
});

app.post("/download", isAdmin, async (req, res) => {
    const { test_id, branch_name, program, year } = req.body;
    if (!test_id) return res.status(400).send("Test ID is required");

    // year from form is the admission academic year (e.g., 2024)
    // Filter users by program, year, and branch
    const query = {
        'submissions.test_id': test_id,
        program: program,
        year: parseInt(year),
        branch: branch_name
    }

    const users = await User.find(query).lean();
    const test = await Test.findById(test_id).lean();
    const testName = test ? `Test Name: ${test.testName}` : "Test Name: Test";

    // Prepare headers dynamically based on categories
    const categories = test && test.category ? test.category.map(cat => cat.category_name) : [];
    const headers = ['Username', 'Name', 'Branch', 'Year'];

    categories.forEach(cat => {
        headers.push(`${cat} Score`);
        headers.push(`${cat} Verdict`);
    });

    headers.push('Total Score');
    headers.push('Final Verdict');

    // Prepare data array for xlsx
    const data = [
        [testName], // Test Name at top
        [], // blank row
        headers // headers
    ];

    // Add each user's data
    users.forEach(user => {
        const submission = user.submissions.find(sub => sub.test_id.toString() === test_id);
        const rowData = [
            user.username,
            user.name,
            user.branch,
            user.year
        ];

        if (submission) {
            // Add category scores and verdicts
            categories.forEach(catName => {
                const catResult = (submission.categoryResults || []).find(r => r.category === catName);
                if (catResult) {
                    rowData.push(catResult.score || 0);
                    rowData.push(catResult.isQualified ? "Qualified" : "Not-Qualified");
                } else {
                    rowData.push(0);
                    rowData.push("Not-Qualified");
                }
            });
            // Total Score and Final Verdict
            rowData.push(submission.score || 0);
            rowData.push(submission.isQualified ? "Qualified" : "Not-Qualified");
        } else {
            // Fill with empty/zero data if no submission
            categories.forEach(() => {
                rowData.push(0);
                rowData.push("N/A");
            });
            rowData.push(0);
            rowData.push("N/A");
        }

        data.push(rowData);
    });

    // Create worksheet and workbook
    const ws = xlsx.utils.aoa_to_sheet(data);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Results');

    // Write workbook to buffer
    const buf = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // Send as downloadable file
    res.setHeader(
        'Content-Disposition',
        `attachment; filename=${test.testName}_results.xlsx`
    );
    res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.send(buf);
})

//Delete Test
app.delete("/test/:id", isAdmin, async (req, res) => {
    let { id } = req.params;
    const test = await Test.findById(id);
    if (!hasTestStarted(test.startTime))
        await Test.findByIdAndDelete(id);
    res.redirect("/dashboard");
});

//Show Test Edit Form
app.get("/test/:id", isAdmin, async (req, res, next) => {
    let { id } = req.params;
    let test = await Test.findById(id).populate("questions");
    // console.log(test);
    res.render("testEditForm.ejs", { id, test });
});

//Update Test
app.put("/test/:id", isAdmin, async (req, res) => {
    let { id } = req.params;
    let { date, time, duration, testName, questions: changedQuestions, branch, isTechnical, category_name, catNumberOfQues, program, year } = req.body;

    const oldTest = await Test.findById(id);
    const started = hasTestStarted(oldTest.startTime);
    const ended = hasTestEnded(oldTest.endTime);

    if (ended) {
        req.flash("error", "Cannot edit a test that has already ended.");
        return res.redirect(`/test/${id}`);
    }

    const technical = isTechnical === 'true';

    if (started) {
        if (Number(duration) < oldTest.duration) {
            req.flash("error", "Duration can only be increased once the test has started.");
            return res.redirect(`/test/${id}`);
        }
        // If started, force critical metadata to remain unchanged
        program = oldTest.program;
        year = oldTest.year; // Keep original admission year
        branch = oldTest.branch;
        isTechnical = oldTest.isTechnical;
        // startTime remains oldTest.startTime, but we need date/time for the calculation below if we don't override startTime
    }

    const admissionYear = year ? parseInt(year) : oldTest.year;
    const finalProgram = program || oldTest.program;
    let newCategories = oldTest.category || [];
    if (category_name) {
        const names = Array.isArray(category_name) ? category_name : [category_name];
        const counts = Array.isArray(catNumberOfQues) ? catNumberOfQues : [catNumberOfQues];
        newCategories = names.map((name, i) => ({
            category_name: name,
            numberOfQues: Number(counts[i])
        }));
    }

    // Convert IST input to UTC for storage
    let startTime = oldTest.startTime;
    if (!started) {
        startTime = convertISTToUTC(date, time);
    }
    const endTime = new Date(startTime.getTime() + (Number(duration) * 60 * 1000));

    let questionsIds = oldTest.questions;
    let totalNumberOfQues = oldTest.numberOfQues;

    // Check if categories or counts have changed
    const categoriesChanged = JSON.stringify(oldTest.category) !== JSON.stringify(newCategories);

    // Determine branch and isTechnical for update
    const finalIsTechnical = started ? oldTest.isTechnical : technical;
    const finalBranch = started ? oldTest.branch : branch;
    const sourceModelBranch = finalIsTechnical ? finalBranch : 'lr';

    if (categoriesChanged && newCategories.length > 0) {
        // Resample questions
        let Model;
        switch (sourceModelBranch) {
            case 'lr': Model = Question; break;
            case 'ai': Model = AiDepartment; break;
            case 'che': Model = ChemicalDepartment; break;
            case 'chm': Model = ChemistryDepartment; break;
            case 'ce': Model = CivilDepartment; break;
            case 'cse': Model = ComputerScienceDepartment; break;
            case 'ee': Model = ElectricalDepartment; break;
            case 'ece': Model = ElectronicsCommunicationDepartment; break;
            case 'hss': Model = HumanitiesSocialSciencesDepartment; break;
            case 'ms': Model = ManagementStudiesDepartment; break;
            case 'math': Model = MathematicsDepartment; break;
            case 'me': Model = MechanicalDepartment; break;
            case 'phy': Model = PhysicsDepartment; break;
        }

        let allQuestions = [];
        totalNumberOfQues = 0;
        for (let cat of newCategories) {
            const catQuestions = await Model.aggregate([
                { $match: { category: cat.category_name } },
                { $sample: { size: Number(cat.numberOfQues) } }
            ]);
            allQuestions = allQuestions.concat(catQuestions);
            totalNumberOfQues += Number(cat.numberOfQues);
        }
        questionsIds = allQuestions.map(q => q._id);
        questionsIds.sort((a, b) => a.toString().localeCompare(b.toString()));
    } else if (changedQuestions) {
        // Update individual questions
        const updatedPromises = changedQuestions.map(q => {
            const { _id, ...rest } = q;
            switch (sourceModelBranch) {
                case 'lr': return Question.findByIdAndUpdate(_id, rest, { new: true });
                case 'ai': return AiDepartment.findByIdAndUpdate(_id, rest, { new: true });
                case 'che': return ChemicalDepartment.findByIdAndUpdate(_id, rest, { new: true });
                case 'chm': return ChemistryDepartment.findByIdAndUpdate(_id, rest, { new: true });
                case 'ce': return CivilDepartment.findByIdAndUpdate(_id, rest, { new: true });
                case 'cse': return ComputerScienceDepartment.findByIdAndUpdate(_id, rest, { new: true });
                case 'ee': return ElectricalDepartment.findByIdAndUpdate(_id, rest, { new: true });
                case 'ece': return ElectronicsCommunicationDepartment.findByIdAndUpdate(_id, rest, { new: true });
                case 'hss': return HumanitiesSocialSciencesDepartment.findByIdAndUpdate(_id, rest, { new: true });
                case 'ms': return ManagementStudiesDepartment.findByIdAndUpdate(_id, rest, { new: true });
                case 'math': return MathematicsDepartment.findByIdAndUpdate(_id, rest, { new: true });
                case 'me': return MechanicalDepartment.findByIdAndUpdate(_id, rest, { new: true });
                case 'phy': return PhysicsDepartment.findByIdAndUpdate(_id, rest, { new: true });
                default: throw new Error("Invalid branch");
            }
        });
        await Promise.all(updatedPromises);
    }

    const test = await Test.findByIdAndUpdate(id, {
        testName,
        duration,
        startTime,
        endTime,
        category: newCategories,
        questions: questionsIds,
        numberOfQues: totalNumberOfQues,
        program: finalProgram,
        year: admissionYear,
        branch: finalBranch,
        isTechnical: finalIsTechnical
    }, { new: true }).populate("questions").exec();

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
                            // score -= 2;
                            answers[i].score = 0; // -2
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
    let { title, body, issued_by, program, branch, year } = req.body;
    let date = getAnnouncementDate();

    // Convert empty year to null
    const announcementYear = year ? parseInt(year) : null;

    newAnnouncement = new Announcement({
        title,
        body,
        issued_by,
        date,
        program: program || 'all',
        branch: branch || 'all',
        year: announcementYear
    });
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
    let { title, body, issued_by, program, branch, year } = req.body;

    // Convert empty year to null
    const announcementYear = year ? parseInt(year) : null;

    await Announcement.findByIdAndUpdate(id, {
        title,
        body,
        issued_by,
        program: program || 'all',
        branch: branch || 'all',
        year: announcementYear
    });
    res.redirect("/dashboard");
});

app.get("/dashboard", isAdmin, async (req, res) => {
    let allAnnouncements = await Announcement.find({});
    allAnnouncements.reverse();
    let allTests = await Test.find({});
    allTests.reverse();
    res.render("dashboard.ejs", { allAnnouncements, allTests });
});

app.get("/leaderboard", isAdmin, async (req, res) => {
    try {
        const { program, branch, year, testId } = req.query;

        if (!program || !branch || !year || !testId || testId === 'undefined') {
            return res.status(200).json([]);
        }

        const parsedYear = parseInt(year, 10);
        if (Number.isNaN(parsedYear) || !mongoose.Types.ObjectId.isValid(testId)) {
            return res.status(200).json([]);
        }

        const testObjectId = new mongoose.Types.ObjectId(testId);
        const query = {
            program: program,
            branch: branch,
            year: parsedYear,
            submissions: { $elemMatch: { test_id: testObjectId } }
        };

        const users = await User.find(query)
            .populate({
                path: "submissions.test_id",
                model: "Test",
                select: "_id testName branch program year totalMarks isTechnical"
            })
            .lean();

        const filteredUsers = users
            .map(user => ({
                ...user,
                submissions: (user.submissions || []).filter(sub => {
                    if (!sub?.test_id) return false;
                    const subTestId = sub.test_id._id ? sub.test_id._id.toString() : sub.test_id.toString();
                    return subTestId === testId;
                })
            }))
            .filter(user => user.submissions.length > 0);

        res.status(200).json(filteredUsers);
    } catch (err) {
        console.error("[Leaderboard] API Error:", err);
        res.status(500).json({ error: err.message });
    }
});

app.get("/stats", isAdmin, async (req, res) => {
    try {
        const now = getCurrentUTC();

        // Count users
        const totalUsers = await User.countDocuments();

        // Fetch all tests once for efficiency
        const tests = await Test.find({}, "startTime endTime");

        // Calculate counts
        let activeTests = 0;
        let completedTests = 0;
        let upcomingTests = 0;

        tests.forEach(test => {
            const status = getTestStatus(test.startTime, test.endTime);

            if (status === 'active' || status === 'buffer') {
                activeTests++;
            } else if (status === 'completed') {
                completedTests++;
            } else if (status === 'upcoming') {
                upcomingTests++;
            }
        });

        res.status(200).json({
            success: true,
            totalUsers,
            activeTests,
            completedTests,
            upcomingTests
        });
    } catch (err) {
        console.error("Error fetching stats:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get("/admin/qualification-stats", isAdmin, async (req, res) => {
    try {
        const { program, year, branch, type } = req.query;

        if (!program || !year || !branch || !type) {
            return res.status(400).json({ success: false, error: "Missing required parameters" });
        }

        // academic year is admission academic year (e.g., 2024)
        const query = {
            program: program,
            branch: branch,
            year: parseInt(year)
        };

        const users = await User.find(query).populate('submissions.test_id');

        let qualifiedCount = 0;
        let notQualifiedCount = 0;

        users.forEach(user => {
            user.submissions.forEach(sub => {
                if (!sub.test_id) return;

                const isTechRequested = type === 'technical';
                const test = sub.test_id;

                // Robustly get Test ID and fields (handle populated or unpopulated)
                const testId = test._id ? test._id.toString() : test.toString();
                const testIsTechnical = test.isTechnical;
                const testBranch = test.branch;
                const testProgram = test.program;
                const testYear = test.year;

                // Match criteria strictly
                const matchesCriteria = (testIsTechnical === isTechRequested) &&
                    (testBranch === branch) &&
                    (testProgram === program) &&
                    (testYear !== undefined && parseInt(testYear) === parseInt(year));

                if (matchesCriteria) {
                    if (sub.isQualified) {
                        qualifiedCount++;
                    } else {
                        notQualifiedCount++;
                    }
                }
            });
        });

        res.json({
            success: true,
            qualified: qualifiedCount,
            notQualified: notQualifiedCount,
            total: qualifiedCount + notQualifiedCount
        });
    } catch (err) {
        console.error("Error fetching qualification stats:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Error Handler
app.use((err, req, res, next) => {
    let { status = 500, message = "Sorry! Some error occurred." } = err;
    err.status = status;
    err.message = message;

    // Ensure currentPath is set for error template
    if (typeof res.locals.currentPath === 'undefined') {
        res.locals.currentPath = req.path || '/';
    }

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



