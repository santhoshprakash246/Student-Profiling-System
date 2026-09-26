const jwt = require("jsonwebtoken");

const SECRET =
    process.env.JWT_SECRET ||
    "student-profiling-secret-key";


// ===============================
// AUTHENTICATION
// ===============================

function requireAuth(req, res, next) {

    const authorization =
        req.headers.authorization || "";

    if (!authorization.startsWith("Bearer ")) {

        return res.status(401).json({
            success: false,
            message: "Authentication required"
        });

    }

    const token =
        authorization.substring(7);

    try {

        const decoded =
            jwt.verify(token, SECRET);

        req.user = decoded;

        next();

    } catch (error) {

        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });

    }

}


// ===============================
// ROLE AUTHORIZATION
// ===============================

function requireRole(...roles) {

    return (req, res, next) => {

        if (
            !req.user ||
            !roles.includes(req.user.role)
        ) {

            return res.status(403).json({
                success: false,
                message: "Access denied"
            });

        }

        next();

    };

}


// ===============================
// FACULTY AUTHORIZATION
// ===============================

const requireFaculty = requireRole("faculty");


// ===============================
// STUDENT AUTHORIZATION
// ===============================

const requireStudent = requireRole("student");


// ===============================
// EXPORT MIDDLEWARE
// ===============================

module.exports = {
    requireAuth,
    requireRole,
    requireFaculty,
    requireStudent,
    SECRET
};