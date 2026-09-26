
const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const Student = require("../models/Student");
const User = require("../models/User");

const {
    requireAuth,
    requireFaculty
} = require("../middleware/auth");

const router = express.Router();

// ==========================================
// PASSWORD GENERATOR
// ==========================================

function generateStudentPassword() {
    const digits = "23456789";
    const symbols = "@#$!";
    const letters =
        "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

    const pick = (chars) =>
        chars[crypto.randomInt(0, chars.length)];

    return (
        "St" +
        pick(digits) +
        pick(symbols) +
        pick(letters) +
        pick(letters)
    );
}

// ==========================================
// CSV REPORT HELPERS
// ==========================================

function flattenObject(obj, prefix = "", result = {}) {
    for (const key in obj) {
        const value = obj[key];

        // Ignore MongoDB internal fields
        if (key === "__v") {
            continue;
        }

        const newKey = prefix
            ? `${prefix}_${key}`
            : key;

        if (
            value &&
            typeof value === "object" &&
            !Array.isArray(value) &&
            !(value instanceof Date)
        ) {
            flattenObject(value, newKey, result);
        } else {
            result[newKey] = value;
        }
    }

    return result;
}

function escapeCSV(value) {
    if (value === null || value === undefined) {
        return '""';
    }

    let text;

    if (typeof value === "object") {
        text = JSON.stringify(value);
    } else {
        text = String(value);
    }

    return `"${text.replace(/"/g, '""')}"`;
}

function sendCSV(res, students, filename) {
    const records = students.map(student => {
        const data = student.toObject
            ? student.toObject()
            : { ...student };

        // Never include authentication information
        delete data.password;
        delete data.passwordHash;
        delete data.__v;

        return flattenObject(data);
    });

    const headers = [
        ...new Set(
            records.flatMap(record => Object.keys(record))
        )
    ];

    const rows = [];

    rows.push(
        headers.map(header => escapeCSV(header)).join(",")
    );

    for (const record of records) {
        const row = headers.map(header =>
            escapeCSV(record[header])
        );

        rows.push(row.join(","));
    }

    const csvContent = "\uFEFF" + rows.join("\r\n");

    res.setHeader(
        "Content-Type",
        "text/csv; charset=utf-8"
    );

    res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
    );

    return res.send(csvContent);
}

// ==========================================
// AUTHENTICATION
// ==========================================

router.use(requireAuth);

// ==========================================
// STUDENT: DOWNLOAD OWN REPORT
// GET /api/students/my-profile/download
// ==========================================

router.get("/my-profile/download", async (req, res) => {
    try {
        if (req.user.role !== "student") {
            return res.status(403).json({
                success: false,
                message: "Student access required"
            });
        }

        const student = await Student.findOne({
            registerNumber: req.user.studentRegisterNumber
        });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student profile not found"
            });
        }

        return sendCSV(
            res,
            [student],
            `my_report_${student.registerNumber}.csv`
        );

    } catch (error) {
        console.error("Student report error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to download your report"
        });
    }
});

// ==========================================
// STUDENT: VIEW OWN PROFILE
// GET /api/students/my-profile
// ==========================================

router.get("/my-profile", async (req, res) => {
    try {
        if (req.user.role !== "student") {
            return res.status(403).json({
                success: false,
                message: "Student access required"
            });
        }

        const student = await Student.findOne({
            registerNumber: req.user.studentRegisterNumber
        });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student profile not found"
            });
        }

        return res.json({
            success: true,
            student
        });

    } catch (error) {
        console.error("View profile error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load student profile"
        });
    }
});

// ==========================================
// FACULTY: DOWNLOAD ALL STUDENT REPORTS
// GET /api/students/reports/download
// ==========================================

router.get(
    "/reports/download",
    requireFaculty,
    async (req, res) => {
        try {
            const students = await Student.find()
                .sort({ registerNumber: 1 });

            if (!students.length) {
                return res.status(404).json({
                    success: false,
                    message: "No student records found"
                });
            }

            return sendCSV(
                res,
                students,
                "all_student_reports.csv"
            );

        } catch (error) {
            console.error("All reports error:", error);

            return res.status(500).json({
                success: false,
                message: "Unable to download student reports"
            });
        }
    }
);

// ==========================================
// FACULTY: DOWNLOAD INDIVIDUAL REPORT
// GET /api/students/reports/:id/download
// ==========================================

router.get(
    "/reports/:id/download",
    requireFaculty,
    async (req, res) => {
        try {
            const student = await Student.findById(
                req.params.id
            );

            if (!student) {
                return res.status(404).json({
                    success: false,
                    message: "Student not found"
                });
            }

            return sendCSV(
                res,
                [student],
                `student_${student.registerNumber}_report.csv`
            );

        } catch (error) {
            console.error("Individual report error:", error);

            return res.status(500).json({
                success: false,
                message: "Unable to download student report"
            });
        }
    }
);

// ==========================================
// FACULTY: GET ALL STUDENTS
// GET /api/students
// ==========================================

router.get("/", requireFaculty, async (req, res) => {
    try {
        const students = await Student.find()
            .sort({ registerNumber: 1 });

        return res.json({
            success: true,
            students
        });

    } catch (error) {
        console.error("Get students error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch students"
        });
    }
});

// ==========================================
// FACULTY: ADD NEW STUDENT
// POST /api/students
// ==========================================

router.post("/", requireFaculty, async (req, res) => {
    let createdStudentId = null;

    try {
        const studentData = { ...req.body };

        const registerNumber =
            String(studentData.registerNumber || "").trim();

        if (!registerNumber) {
            return res.status(400).json({
                success: false,
                message: "Register number is required"
            });
        }

        studentData.registerNumber = registerNumber;

        const existingStudent = await Student.findOne({
            registerNumber
        });

        if (existingStudent) {
            return res.status(409).json({
                success: false,
                message: "Student register number already exists"
            });
        }

        const existingUser = await User.findOne({
            username: registerNumber
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Login account already exists"
            });
        }

        // Generate a unique temporary password
        const generatedPassword = generateStudentPassword();

        // Hash the password
        const passwordHash = await bcrypt.hash(
            generatedPassword,
            10
        );

        // Create student profile
        const student = new Student(studentData);

        await student.validate();

        // Create individual login
        const user = new User({
            username: registerNumber,
            passwordHash: passwordHash,
            role: "student",
            studentRegisterNumber: registerNumber,
            active: true
        });

        await user.validate();

        await student.save();

        createdStudentId = student._id;

        try {
            await user.save();
        } catch (userError) {
            await Student.findByIdAndDelete(createdStudentId);
            throw userError;
        }

        return res.status(201).json({
            success: true,
            message: "Student added successfully",
            student,
            credentials: {
                username: registerNumber,
                password: generatedPassword
            }
        });

    } catch (error) {
        console.error("Add student error:", error);

        return res.status(400).json({
            success: false,
            message: error.message || "Unable to add student"
        });
    }
});

// ==========================================
// FACULTY: UPDATE STUDENT
// PUT /api/students/:id
// ==========================================

router.put("/:id", requireFaculty, async (req, res) => {
    try {
        const student = await Student.findById(
            req.params.id
        );

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        const studentData = { ...req.body };

        delete studentData.password;
        delete studentData.passwordHash;

        const oldRegisterNumber = student.registerNumber;

        const newRegisterNumber = String(
            studentData.registerNumber || oldRegisterNumber
        ).trim();

        if (!newRegisterNumber) {
            return res.status(400).json({
                success: false,
                message: "Register number is required"
            });
        }

        if (newRegisterNumber !== oldRegisterNumber) {
            const duplicateStudent = await Student.findOne({
                registerNumber: newRegisterNumber,
                _id: { $ne: student._id }
            });

            const duplicateUser = await User.findOne({
                username: newRegisterNumber
            });

            if (duplicateStudent || duplicateUser) {
                return res.status(409).json({
                    success: false,
                    message: "Register number already exists"
                });
            }
        }

        Object.assign(student, studentData);

        student.registerNumber = newRegisterNumber;

        await student.validate();

        const user = await User.findOne({
            studentRegisterNumber: oldRegisterNumber,
            role: "student"
        });

        if (user && newRegisterNumber !== oldRegisterNumber) {
            user.username = newRegisterNumber;
            user.studentRegisterNumber = newRegisterNumber;

            await user.save();
        }

        await student.save();

        return res.json({
            success: true,
            message: "Student updated successfully",
            student
        });

    } catch (error) {
        console.error("Update student error:", error);

        return res.status(400).json({
            success: false,
            message: error.message || "Unable to update student"
        });
    }
});

// ==========================================
// FACULTY: RESET STUDENT PASSWORD
// PUT /api/students/:id/password
// ==========================================

router.put(
    "/:id/password",
    requireFaculty,
    async (req, res) => {
        try {
            const student = await Student.findById(
                req.params.id
            );

            if (!student) {
                return res.status(404).json({
                    success: false,
                    message: "Student not found"
                });
            }

            const user = await User.findOne({
                studentRegisterNumber: student.registerNumber,
                role: "student"
            });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "Student login account not found"
                });
            }

            const generatedPassword =
                generateStudentPassword();

            // Store only the hashed password
            user.passwordHash = await bcrypt.hash(
                generatedPassword,
                10
            );

            await user.save();

            return res.json({
                success: true,
                message: "Student password reset successfully",
                credentials: {
                    username: user.username,
                    password: generatedPassword
                }
            });

        } catch (error) {
            console.error("Reset password error:", error);

            return res.status(500).json({
                success: false,
                message: "Unable to reset student password"
            });
        }
    }
);

// ==========================================
// FACULTY: DELETE STUDENT AND LOGIN
// DELETE /api/students/:id
// ==========================================

router.delete("/:id", requireFaculty, async (req, res) => {
    try {
        const student = await Student.findById(
            req.params.id
        );

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        await User.deleteOne({
            studentRegisterNumber: student.registerNumber,
            role: "student"
        });

        await Student.findByIdAndDelete(req.params.id);

        return res.json({
            success: true,
            message: "Student and login account deleted successfully"
        });

    } catch (error) {
        console.error("Delete student error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to delete student"
        });
    }
});

module.exports = router;