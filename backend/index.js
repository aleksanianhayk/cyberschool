// /backend/index.js

//  Imports 
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

dotenv.config();

const app = express();

const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [];
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
};
app.use(cors(corsOptions));
app.use(express.json());

// Database Connection
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
}).promise();


// ===================================================================
// === SECURITY MIDDLEWARE ===========================================
// ===================================================================

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

const isSuperAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'superadmin') {
        next();
    } else {
        res.status(403).json({ message: "Access denied. Super Admin privileges required." });
    }
};

const isAdminOrSuperAdmin = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'superadmin')) {
        req.userRole = req.user.role; // Pass role for further checks
        next();
    } else {
        res.status(403).json({ message: "Access denied. Admin privileges required." });
    }
};

// ===================================================================
// === USER AUTHENTICATION & PROFILE APIS ============================
// ===================================================================

app.post("/api/register", async (req, res) => {
    try {
        const { name, email, password, phone, gender, school_name, role, grade } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const query = "INSERT INTO users (name, email, password, phone, gender, school_name, role, grade) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        const values = [name, email, hashedPassword, phone, gender, school_name, role, grade];
        await db.query(query, values);
        res.status(201).json({ message: "User registered successfully!" });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: "Email or phone already exists." });
        res.status(500).json({ message: "Internal server error." });
    }
});

app.post("/api/login", async (req, res) => {
    try {
        const { identifier, password } = req.body;
        const [results] = await db.query("SELECT * FROM users WHERE email = ? OR phone = ?", [identifier, identifier]);
        if (results.length === 0) return res.status(404).json({ message: "Հաշիվը չգտնվեց։" });
        
        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Սխալ ներմուծված տվյալներ։" });

        if (user.is_two_factor_enabled) {
            return res.status(200).json({ twoFactorRequired: true, userId: user.id });
        }
        const payload = { 
            id: user.id, 
            name: user.name, 
            role: user.role,
            email: user.email,
            phone: user.phone,
            school_name: user.school_name,
            grade: user.grade,
            is_two_factor_enabled: !!user.is_two_factor_enabled
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '3h' });
        res.status(200).json({ message: "Login successful!", token });
    } catch (error) {
        res.status(500).json({ message: "Database error." });
    }
});


app.post("/api/login/2fa/verify", async (req, res) => {
    try {
        const { userId, token } = req.body;
        const [userRows] = await db.query("SELECT * FROM users WHERE id = ?", [userId]);
        if (userRows.length === 0 || !userRows[0].two_factor_secret) return res.status(400).json({ message: "User not found or 2FA not set up." });
        
        const user = userRows[0];
        const verified = speakeasy.totp.verify({ secret: user.two_factor_secret, encoding: 'base32', token });
        if (verified) {
            const payload = { 
                id: user.id, 
                name: user.name, 
                role: user.role,
                email: user.email,
                phone: user.phone,
                school_name: user.school_name,
                grade: user.grade,
                is_two_factor_enabled: !!user.is_two_factor_enabled
            };
            const jwtToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '3h' });
            res.status(200).json({ message: "Login successful!", token: jwtToken });
        } else {
            res.status(401).json({ message: "Invalid 2FA token." });
        }
    } catch (error) {
        res.status(500).json({ message: "Internal server error." });
    }
});

app.post("/api/users/change-password", verifyToken, async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const [userRows] = await db.query("SELECT * FROM users WHERE id = ?", [req.user.id]);
        if (userRows.length === 0) return res.status(404).json({ message: "Հաշիվը չգտնվեց։" });
        const user = userRows[0];
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) return res.status(401).json({ message: "Սխալ հին գաղտնաբառ։" });
        const salt = await bcrypt.genSalt(10);
        const hashedNewPassword = await bcrypt.hash(newPassword, salt);
        await db.query("UPDATE users SET password = ? WHERE id = ?", [hashedNewPassword, req.user.id]);
        res.status(200).json({ message: "Գաղտնաբառը հաջողությամբ փոխվեց։" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error." });
    }
});

app.post("/api/users/2fa/generate", verifyToken, async (req, res) => {
    try {
        const secret = speakeasy.generateSecret({ name: `CyberStorm (${req.user.name})` });
        await db.query("UPDATE users SET two_factor_secret = ? WHERE id = ?", [secret.base32, req.user.id]);
        const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);
        res.json({ secret: secret.base32, qrCodeUrl });
    } catch (error) {
        res.status(500).json({ message: "Չհաջողվեց ստեղծել 2FA բանալի։" });
    }
});

app.post("/api/users/2fa/verify", verifyToken, async (req, res) => {
    try {
        const { token } = req.body;
        const [userRows] = await db.query("SELECT two_factor_secret FROM users WHERE id = ?", [req.user.id]);
        if (userRows.length === 0 || !userRows[0].two_factor_secret) return res.status(400).json({ message: "2FA secret not found." });
        const verified = speakeasy.totp.verify({ secret: userRows[0].two_factor_secret, encoding: 'base32', token });
        if (verified) {
            await db.query("UPDATE users SET is_two_factor_enabled = TRUE WHERE id = ?", [req.user.id]);
            res.status(200).json({ message: "2FA հաջողությամբ ակտիվացվեց։" });
        } else {
            res.status(400).json({ message: "Սխալ թոքեն։" });
        }
    } catch (error) {
        res.status(500).json({ message: "Internal server error." });
    }
});

app.post("/api/users/2fa/disable", verifyToken, async (req, res) => {
    try {
        await db.query("UPDATE users SET is_two_factor_enabled = FALSE, two_factor_secret = NULL WHERE id = ?", [req.user.id]);
        res.status(200).json({ message: "2FA disabled successfully." });
    } catch (error) {
        res.status(500).json({ message: "Failed to disable 2FA." });
    }
});

// ===================================================================
// === AI CHAT API ===================================================
// ===================================================================
app.post("/api/ask-ai", verifyToken, async (req, res) => {
    // placeholder AI logic
    const { prompt } = req.body;
    res.status(200).json({ response: `This is a placeholder response to your prompt: "${prompt}"` });
});

// ===================================================================
// === PUBLIC/STUDENT-FACING APIS ====================================
// ===================================================================

app.get("/api/sections-with-courses", verifyToken, async (req, res) => {
    try {
        const userRole = req.user.role; // Get role from the verified JWT
        
        const [sections] = await db.query("SELECT * FROM sections ORDER BY order_index ASC, title ASC");
        
        let coursesQuery = `
            SELECT c.*, COUNT(p.id) as page_count 
            FROM courses c 
            LEFT JOIN pages p ON c.id = p.course_id 
            WHERE c.is_active = true 
        `;

        if (userRole !== 'admin' && userRole !== 'superadmin') {

            const roleCheckClause = ` AND (JSON_CONTAINS(c.allowed_roles, '"${userRole}"') OR c.allowed_roles IS NULL OR JSON_LENGTH(c.allowed_roles) = 0)`;
            coursesQuery += roleCheckClause;
        }

        coursesQuery += " GROUP BY c.id ORDER BY c.title ASC";
        
        const [courses] = await db.query(coursesQuery);
        const coursesBySection = {};
        courses.forEach(course => {
            const sectionId = course.section_id || 'uncategorized';
            if (!coursesBySection[sectionId]) coursesBySection[sectionId] = [];
            coursesBySection[sectionId].push(course);
        });
        const sectionsWithCourses = sections.map(section => ({ ...section, courses: coursesBySection[section.id] || [] })).filter(section => section.courses.length > 0);
        res.status(200).json(sectionsWithCourses);

    } catch (error) {
        console.error("Error fetching sections with courses:", error);
        res.status(500).json({ message: "Failed to fetch data." });
    }
});


app.get("/api/courses/:courseIdString", verifyToken, async (req, res) => {
    try {
        const { courseIdString } = req.params;
        const [courseRows] = await db.query("SELECT * FROM courses WHERE course_id_string = ? AND is_active = true", [courseIdString]);
        if (courseRows.length === 0) return res.status(404).json({ message: "Course not found." });
        const course = courseRows[0];
        const [pages] = await db.query("SELECT * FROM pages WHERE course_id = ? ORDER BY page_number", [course.id]);
        const pagesWithComponents = await Promise.all(pages.map(async (page) => {
            const [components] = await db.query("SELECT * FROM course_components WHERE page_id = ? ORDER BY order_index", [page.id]);
            return { ...page, components };
        }));
        res.status(200).json({ ...course, pages: pagesWithComponents });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch course data." });
    }
});

app.get("/api/progress/:userId/:courseId", verifyToken, async (req, res) => {
    try {
        const { userId, courseId } = req.params;
        const [progressRows] = await db.query("SELECT highest_page_index FROM user_progress WHERE user_id = ? AND course_id = ?", [userId, courseId]);
        const highestPageIndex = progressRows.length > 0 ? progressRows[0].highest_page_index : -1;
        res.status(200).json({ highestPageIndex });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch progress." });
    }
});

app.get("/api/progress/:userId", verifyToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const [progressRows] = await db.query("SELECT course_id, highest_page_index FROM user_progress WHERE user_id = ?", [userId]);
        const progressMap = progressRows.reduce((acc, row) => {
            acc[row.course_id] = row.highest_page_index;
            return acc;
        }, {});
        res.status(200).json(progressMap);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch progress." });
    }
});

app.post("/api/progress", verifyToken, async (req, res) => {
    try {
        const { courseId, pageIndex } = req.body;
        const query = `INSERT INTO user_progress (user_id, course_id, highest_page_index) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE highest_page_index = GREATEST(highest_page_index, VALUES(highest_page_index))`;
        await db.query(query, [req.user.id, courseId, pageIndex]);
        res.status(200).json({ message: "Progress saved." });
    } catch (error) {
        res.status(500).json({ message: "Failed to save progress." });
    }
});

app.delete("/api/progress/:userId/:courseId", verifyToken, async (req, res) => {
    try {
        const { userId, courseId } = req.params;
        await db.query("DELETE FROM user_progress WHERE user_id = ? AND course_id = ?", [userId, courseId]);
        res.status(200).json({ message: "Progress reset successfully." });
    } catch (error) {
        res.status(500).json({ message: "Failed to reset progress." });
    }
});

app.get("/api/meetups", async (req, res) => {
    try {
        const [meetups] = await db.query("SELECT * FROM meetups WHERE is_active = true ORDER BY meetup_datetime DESC");
        res.status(200).json(meetups);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch meetups." });
    }
});
app.get("/api/meetups/:meetupIdString", async (req, res) => {
    try {
        const { meetupIdString } = req.params;
        const { userId } = req.query; // userId is optional

        const [meetupRows] = await db.query("SELECT * FROM meetups WHERE meetup_id_string = ?", [meetupIdString]);
        if (meetupRows.length === 0) return res.status(404).json({ message: "Meetup not found." });
        const meetup = meetupRows[0];

        const [speakers] = await db.query("SELECT * FROM meetup_speakers WHERE meetup_id = ?", [meetup.id]);
        const [comments] = await db.query("SELECT c.*, u.name as author_name FROM meetup_comments c JOIN users u ON c.user_id = u.id WHERE c.meetup_id = ? ORDER BY c.created_at DESC", [meetup.id]);
        
        let isRegistered = false;
        if (userId) {
            const [regRows] = await db.query("SELECT id FROM meetup_registrations WHERE user_id = ? AND meetup_id = ?", [userId, meetup.id]);
            isRegistered = regRows.length > 0;
        }

        if (!isRegistered) delete meetup.join_url;
        
        res.status(200).json({ ...meetup, speakers, comments, isRegistered });
    } catch (error) {
        console.error("Error fetching meetup details:", error);
        res.status(500).json({ message: "Failed to fetch meetup details." });
    }
});

app.post("/api/meetups/register", verifyToken, async (req, res) => {
    try {
        const { meetupId } = req.body;
        await db.query("INSERT INTO meetup_registrations (user_id, meetup_id) VALUES (?, ?)", [req.user.id, meetupId]);
        res.status(201).json({ message: "Successfully registered!" });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: "You are already registered." });
        res.status(500).json({ message: "Registration failed." });
    }
});

app.post("/api/meetups/:meetupId/comments", verifyToken, async (req, res) => {
    try {
        const { meetupId } = req.params;
        const { comment_text } = req.body;
        const [result] = await db.query("INSERT INTO meetup_comments (user_id, meetup_id, comment_text) VALUES (?, ?, ?)", [req.user.id, meetupId, comment_text]);
        const [commentRows] = await db.query("SELECT c.*, u.name as author_name FROM meetup_comments c JOIN users u ON c.user_id = u.id WHERE c.id = ?", [result.insertId]);
        res.status(201).json(commentRows[0]);
    } catch (error) {
        res.status(500).json({ message: "Failed to post comment." });
    }
});

app.get("/api/teacher-guide", verifyToken, async (req, res) => {
    try {
        const [flatList] = await db.query("SELECT * FROM teacher_guide_content ORDER BY parent_id ASC, order_index ASC");
        const buildTree = (list, parentId = null) => list.filter(item => item.parent_id === parentId).map(item => ({ ...item, children: buildTree(list, item.id) }));
        res.status(200).json(buildTree(flatList));
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch teacher guide." });
    }
});


// --- NEW CHATBOT APIS ---
app.get("/api/chatbot/start", verifyToken, async (req, res) => {
    try {
        const [nodes] = await db.query("SELECT * FROM chatbot_nodes WHERE parent_id IS NULL ORDER BY order_index ASC");
        res.status(200).json(nodes);
    } catch (error) {
        res.status(500).json({ message: "Failed to start chat." });
    }
});

app.get("/api/chatbot/node/:id", verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const [nodes] = await db.query("SELECT * FROM chatbot_nodes WHERE parent_id = ? ORDER BY order_index ASC", [id]);
        res.status(200).json(nodes);
    } catch (error) {
        res.status(500).json({ message: "Failed to get next node." });
    }
});


// ===================================================================
// === ADMIN PANEL APIS ==============================================
// ===================================================================
app.use('/api/admin', verifyToken, isAdminOrSuperAdmin);

// --- User Management ---
app.get("/api/admin/users", async (req, res) => {
    try {
        const [results] = await db.query("SELECT id, name, email, phone, gender, school_name, role, grade FROM users");
        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ message: "Database error." });
    }
});

app.delete("/api/admin/users/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await db.query("DELETE FROM users WHERE id = ?", [id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: "Հաշիվը չգտնվեց։" });
        res.status(200).json({ message: "User deleted successfully." });
    } catch (error) {
        res.status(500).json({ message: "Database error." });
    }
});

// --- Section Management ---
app.get("/api/admin/sections", async (req, res) => {
    try {
        const [sections] = await db.query("SELECT * FROM sections ORDER BY order_index ASC, title ASC");
        res.status(200).json(sections);
    } catch (error) {
        console.error("Error fetching sections:", error);
        res.status(500).json({ message: "Failed to fetch sections." });
    }
});

app.get("/api/admin/sections-with-courses", async (req, res) => {
    try {
        const [sections] = await db.query("SELECT * FROM sections ORDER BY order_index ASC, title ASC");
        const [courses] = await db.query("SELECT id, title, course_id_string, is_active, section_id FROM courses ORDER BY title ASC");
        const coursesBySection = {};
        courses.forEach(course => {
            const sectionId = course.section_id || 'uncategorized';
            if (!coursesBySection[sectionId]) coursesBySection[sectionId] = [];
            coursesBySection[sectionId].push(course);
        });
        const sectionsWithCourses = sections.map(section => ({ ...section, courses: coursesBySection[section.id] || [] }));
        const response = { sections: sectionsWithCourses, uncategorized: coursesBySection['uncategorized'] || [] };
        res.status(200).json(response);
    } catch (error) {
        console.error("Error fetching sections with courses:", error);
        res.status(500).json({ message: "Failed to fetch data." });
    }
});

app.post("/api/admin/sections", async (req, res) => {
    try {
        const { title } = req.body;
        if (!title) return res.status(400).json({ message: "Title is required." });
        const [result] = await db.query("INSERT INTO sections (title) VALUES (?)", [title]);
        res.status(201).json({ id: result.insertId, title });
    } catch (error) {
        console.error("Error creating section:", error);
        res.status(500).json({ message: "Failed to create section." });
    }
});

app.put("/api/admin/sections/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { title } = req.body;
        await db.query("UPDATE sections SET title = ? WHERE id = ?", [title, id]);
        res.status(200).json({ message: "Section updated successfully." });
    } catch (error) {
        console.error("Error updating section:", error);
        res.status(500).json({ message: "Failed to update section." });
    }
});

app.delete("/api/admin/sections/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const [courseRows] = await db.query("SELECT COUNT(*) as course_count FROM courses WHERE section_id = ?", [id]);
        if (courseRows[0].course_count > 0) return res.status(400).json({ message: `Cannot delete section as it contains ${courseRows[0].course_count} courses.` });
        await db.query("DELETE FROM sections WHERE id = ?", [id]);
        res.status(200).json({ message: "Section deleted successfully." });
    } catch (error) {
        console.error("Error deleting section:", error);
        res.status(500).json({ message: "Failed to delete section." });
    }
});

// --- Course Management ---
app.get("/api/admin/courses", async (req, res) => {
    try {
        const [courses] = await db.query("SELECT * FROM courses ORDER BY created_at DESC");
        res.status(200).json(courses);
    } catch (error) {
        console.error("Error fetching courses:", error);
        res.status(500).json({ message: "Failed to fetch courses." });
    }
});

app.post("/api/admin/courses", async (req, res) => {
    try {
        const { title, course_id_string } = req.body;
        if (!title || !course_id_string) return res.status(400).json({ message: "Title and Course ID are required." });
        const [result] = await db.query("INSERT INTO courses (title, course_id_string) VALUES (?, ?)", [title, course_id_string]);
        res.status(201).json({ message: "Course created successfully!", courseId: result.insertId, course_id_string });
    } catch (error) {
        console.error("Error creating course:", error);
        if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: "This Course ID already exists." });
        res.status(500).json({ message: "Failed to create course." });
    }
});

app.get("/api/admin/courses/:courseIdString", async (req, res) => {
    try {
        const { courseIdString } = req.params;
        const [courseRows] = await db.query("SELECT * FROM courses WHERE course_id_string = ?", [courseIdString]);
        if (courseRows.length === 0) return res.status(404).json({ message: "Course not found." });
        const course = courseRows[0];
        const [pages] = await db.query("SELECT * FROM pages WHERE course_id = ? ORDER BY page_number", [course.id]);
        const pagesWithComponents = await Promise.all(pages.map(async (page) => {
            const [components] = await db.query("SELECT * FROM course_components WHERE page_id = ? ORDER BY order_index", [page.id]);
            return { ...page, components };
        }));
        res.status(200).json({ ...course, pages: pagesWithComponents });
    } catch (error) {
        console.error(`Error fetching course ${req.params.courseIdString}:`, error);
        res.status(500).json({ message: "Failed to fetch course data." });
    }
});

app.put("/api/admin/courses/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { title, course_id_string, description, image_url, section_id, is_active, allowed_roles } = req.body;
        
        if (!title || !course_id_string) return res.status(400).json({ message: "Title and Course ID are required." });

        const query = `
            UPDATE courses 
            SET title = ?, course_id_string = ?, description = ?, image_url = ?, section_id = ?, is_active = ?, allowed_roles = ?
            WHERE id = ?
        `;
        const rolesJson = JSON.stringify(allowed_roles || []);
        
        const values = [title, course_id_string, description, image_url, section_id || null, is_active ? 1 : 0, rolesJson, id];
        
        await db.query(query, values);
        res.status(200).json({ message: "Course updated successfully!" });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: "This Course ID is already in use." });
        res.status(500).json({ message: "Failed to update course." });
    }
});


app.delete("/api/admin/courses/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await db.query("DELETE FROM courses WHERE id = ?", [id]);
        res.status(200).json({ message: "Course deleted successfully." });
    } catch (error) {
        console.error("Error deleting course:", error);
        res.status(500).json({ message: "Failed to delete course." });
    }
});

// --- Page & Component Management ---
app.post("/api/admin/pages", async (req, res) => {
    try {
        const { course_id } = req.body;
        if (!course_id) return res.status(400).json({ message: "Course ID is required." });
        const pageNumberQuery = "SELECT MAX(page_number) as max_page FROM pages WHERE course_id = ?";
        const [pageRows] = await db.query(pageNumberQuery, [course_id]);
        const newPageNumber = (pageRows[0].max_page || 0) + 1;
        const insertQuery = "INSERT INTO pages (course_id, page_number, title) VALUES (?, ?, ?)";
        const newPageTitle = `New Page ${newPageNumber}`;
        const [result] = await db.query(insertQuery, [course_id, newPageNumber, newPageTitle]);
        res.status(201).json({ id: result.insertId, course_id, page_number: newPageNumber, title: newPageTitle, components: [] });
    } catch (error) {
        console.error("Error creating new page:", error);
        res.status(500).json({ message: "Failed to create new page." });
    }
});

app.delete("/api/admin/pages/:pageId", async (req, res) => {
    try {
        const { pageId } = req.params;
        await db.query("DELETE FROM pages WHERE id = ?", [pageId]);
        res.status(200).json({ message: "Page deleted successfully." });
    } catch (error) {
        console.error("Error deleting page:", error);
        res.status(500).json({ message: "Failed to delete page." });
    }
});

app.put("/api/admin/pages/:pageId/components", async (req, res) => {
    const { pageId } = req.params;
    const { components } = req.body;
    if (!Array.isArray(components)) return res.status(400).json({ message: "Components must be an array." });
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        await connection.query("DELETE FROM course_components WHERE page_id = ?", [pageId]);
        if (components.length > 0) {
            const insertQuery = "INSERT INTO course_components (page_id, component_type, order_index, props) VALUES ?";
            const values = components.map((component, index) => [pageId, component.component_type, index, JSON.stringify(component.props)]);
            await connection.query(insertQuery, [values]);
        }
        await connection.commit();
        res.status(200).json({ message: "Page saved successfully!" });
    } catch (error) {
        await connection.rollback();
        console.error(`Error saving page ${pageId}:`, error);
        res.status(500).json({ message: "Failed to save page." });
    } finally {
        connection.release();
    }
});

// --- Meetup Management ---
app.get("/api/admin/meetups", async (req, res) => {
    try {
        const [meetups] = await db.query("SELECT * FROM meetups ORDER BY meetup_datetime DESC");
        res.status(200).json(meetups);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch meetups." });
    }
});

app.get("/api/admin/meetups/:meetupIdString", async (req, res) => {
    try {
        const { meetupIdString } = req.params;
        const [meetupRows] = await db.query("SELECT * FROM meetups WHERE meetup_id_string = ?", [meetupIdString]);
        if (meetupRows.length === 0) return res.status(404).json({ message: "Meetup not found." });
        const meetup = meetupRows[0];
        const [speakers] = await db.query("SELECT * FROM meetup_speakers WHERE meetup_id = ?", [meetup.id]);
        res.status(200).json({ ...meetup, speakers});
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch meetup details." });
    }
});

app.post("/api/admin/meetups", async (req, res) => {
    const { meetupData, speakers } = req.body;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const meetupQuery = "INSERT INTO meetups (title, meetup_id_string, description, image_url, meetup_datetime, join_url, video_url, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        const [meetupResult] = await connection.query(meetupQuery, [meetupData.title, meetupData.meetup_id_string, meetupData.description, meetupData.image_url, meetupData.meetup_datetime, meetupData.join_url, meetupData.video_url, meetupData.is_active ? 1 : 0]);
        const newMeetupId = meetupResult.insertId;
        if (speakers && speakers.length > 0) {
            const speakerQuery = "INSERT INTO meetup_speakers (meetup_id, name, title) VALUES ?";
            const speakerValues = speakers.map(s => [newMeetupId, s.name, s.title]);
            await connection.query(speakerQuery, [speakerValues]);
        }
        await connection.commit();
        res.status(201).json({ message: "Meetup created successfully!", meetupId: newMeetupId });
    } catch (error) {
        await connection.rollback();
        if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: "This Meetup ID already exists." });
        res.status(500).json({ message: "Failed to create meetup." });
    } finally {
        connection.release();
    }
});

app.put("/api/admin/meetups/:id", async (req, res) => {
    const { id } = req.params;
    const { meetupData, speakers } = req.body;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const meetupQuery = "UPDATE meetups SET title = ?, meetup_id_string = ?, description = ?, image_url = ?, meetup_datetime = ?, join_url = ?, video_url = ?, is_active = ? WHERE id = ?";
        await connection.query(meetupQuery, [meetupData.title, meetupData.meetup_id_string, meetupData.description, meetupData.image_url, meetupData.meetup_datetime, meetupData.join_url, meetupData.video_url, meetupData.is_active ? 1 : 0, id]);
        await connection.query("DELETE FROM meetup_speakers WHERE meetup_id = ?", [id]);
        if (speakers && speakers.length > 0) {
            const speakerQuery = "INSERT INTO meetup_speakers (meetup_id, name, title) VALUES ?";
            const speakerValues = speakers.map(s => [id, s.name, s.title]);
            await connection.query(speakerQuery, [speakerValues]);
        }
        await connection.commit();
        res.status(200).json({ message: "Meetup updated successfully!" });
    } catch (error) {
        await connection.rollback();
        if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: "This Meetup ID is already in use." });
        res.status(500).json({ message: "Failed to update meetup." });
    } finally {
        connection.release();
    }
});

app.delete("/api/admin/meetups/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await db.query("DELETE FROM meetups WHERE id = ?", [id]);
        res.status(200).json({ message: "Meetup deleted successfully." });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete meetup." });
    }
});

// --- Teacher's Guide Management ---
app.get("/api/admin/teacher-guide", async (req, res) => {
    try {
        const [content] = await db.query("SELECT * FROM teacher_guide_content ORDER BY parent_id ASC, order_index ASC");
        res.status(200).json(content);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch guide content." });
    }
});

app.post("/api/admin/teacher-guide", async (req, res) => {
    try {
        const { parent_id, content_type, title, content_body, order_index } = req.body;
        const query = "INSERT INTO teacher_guide_content (parent_id, content_type, title, content_body, order_index) VALUES (?, ?, ?, ?, ?)";
        const [result] = await db.query(query, [parent_id || null, content_type, title, content_body, order_index]);
        res.status(201).json({ id: result.insertId, ...req.body });
    } catch (error) {
        res.status(500).json({ message: "Failed to create content block." });
    }
});

app.put("/api/admin/teacher-guide/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content_body } = req.body;
        const query = "UPDATE teacher_guide_content SET title = ?, content_body = ? WHERE id = ?";
        await db.query(query, [title, content_body, id]);
        res.status(200).json({ message: "Content updated successfully." });
    } catch (error) {
        res.status(500).json({ message: "Failed to update content." });
    }
});

app.delete("/api/admin/teacher-guide/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await db.query("DELETE FROM teacher_guide_content WHERE id = ?", [id]);
        res.status(200).json({ message: "Content deleted successfully." });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete content." });
    }
});




// === NEW ENDPOINT to update a user's role (protected by isAdmin middleware) ===
app.put("/api/admin/users/:id/role", verifyToken, isSuperAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!role) return res.status(400).json({ message: "Role is required." });

        // Prevent a superadmin from demoting themselves
        if (id == req.body.adminUserId && role !== 'superadmin') {
            return res.status(403).json({ message: "Cannot remove your own super admin privileges." });
        }

        await db.query("UPDATE users SET role = ? WHERE id = ?", [role, id]);
        res.status(200).json({ message: "User role updated successfully." });
    } catch (error) {
        console.error("Error updating user role:", error);
        res.status(500).json({ message: "Failed to update user role." });
    }
});


app.delete("/api/admin/users/:id",verifyToken, isAdminOrSuperAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const adminRole = req.userRole; // Get the admin's role from the middleware

        // Get the role of the user to be deleted
        const [targetUserRows] = await db.query("SELECT role FROM users WHERE id = ?", [id]);
        if (targetUserRows.length === 0) return res.status(404).json({ message: "Հաշիվը չգտնվեց։" });
        
        const targetUserRole = targetUserRows[0].role;

        // Enforce security rules
        if (targetUserRole === 'superadmin') {
            return res.status(403).json({ message: "Super admins cannot be deleted." });
        }
        if (adminRole === 'admin' && targetUserRole === 'admin') {
            return res.status(403).json({ message: "Admins cannot delete other admins." });
        }

        await db.query("DELETE FROM users WHERE id = ?", [id]);
        res.status(200).json({ message: "User deleted successfully." });
    } catch (error) {
        res.status(500).json({ message: "Database error." });
    }
});

// --- NEW ADMIN CHATBOT APIS ---
app.get("/api/admin/chatbot", async (req, res) => {
    try {
        const [flatList] = await db.query("SELECT * FROM chatbot_nodes ORDER BY parent_id ASC, order_index ASC");
        const buildTree = (list, parentId = null) => {
            return list
                .filter(item => item.parent_id === parentId)
                .map(item => ({ ...item, children: buildTree(list, item.id) }));
        };
        const nestedTree = buildTree(flatList);
        res.status(200).json(nestedTree);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch chatbot tree." });
    }
});

app.post("/api/admin/chatbot", async (req, res) => {
    try {
        const { parent_id, node_type, content, order_index } = req.body;
        const query = "INSERT INTO chatbot_nodes (parent_id, node_type, content, order_index) VALUES (?, ?, ?, ?)";
        const [result] = await db.query(query, [parent_id || null, node_type, content, order_index]);
        res.status(201).json({ id: result.insertId, ...req.body });
    } catch (error) {
        res.status(500).json({ message: "Failed to create chatbot node." });
    }
});

app.put("/api/admin/chatbot/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        await db.query("UPDATE chatbot_nodes SET content = ? WHERE id = ?", [content, id]);
        res.status(200).json({ message: "Node updated successfully." });
    } catch (error) {
        res.status(500).json({ message: "Failed to update node." });
    }
});

app.delete("/api/admin/chatbot/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await db.query("DELETE FROM chatbot_nodes WHERE id = ?", [id]);
        res.status(200).json({ message: "Node deleted successfully." });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete node." });
    }
});



// --- Start Server ---
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


