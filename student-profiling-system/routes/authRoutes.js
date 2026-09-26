const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();

const User =
    require("../models/User");

const Student =
    require("../models/Student");

const {
    requireAuth,
    SECRET
} = require("../middleware/auth");


// =====================================================
// LOGIN
// =====================================================

router.post(
    "/login",
    async (req, res) => {

        try {

            console.log(
                "LOGIN REQUEST:",
                req.body
            );

            const {
                username,
                password,
                role
            } = req.body;


            // Validate input

            if (
                !username ||
                !password ||
                !role
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Username, password and role are required"

                });

            }


            // Find user

            const user =
                await User.findOne({

                    username:
                        username.trim(),

                    role: role,

                    active: true

                });


            if (!user) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Invalid username, password or role"

                });

            }


            // Check password

            const passwordCorrect =
                await bcrypt.compare(
                    password,
                    user.passwordHash
                );


            if (!passwordCorrect) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Invalid username, password or role"

                });

            }


            // Create JWT

            const token =
                jwt.sign(

                    {
                        id:
                            user._id.toString(),

                        username:
                            user.username,

                        role:
                            user.role,

                        studentRegisterNumber:
                            user.studentRegisterNumber ||
                            null
                    },

                    SECRET,

                    {
                        expiresIn: "4h"
                    }

                );


            console.log(
                "LOGIN SUCCESS:",
                user.username,
                user.role
            );


            // Send response

            return res.json({

                success: true,

                message:
                    "Login successful",

                token: token,

                user: {

                    username:
                        user.username,

                    role:
                        user.role,

                    studentRegisterNumber:
                        user.studentRegisterNumber ||
                        null

                }

            });

        }

        catch (error) {

            console.error(
                "LOGIN ERROR:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Login failed",

                error:
                    error.message

            });

        }

    }
);


// =====================================================
// CURRENT USER
// =====================================================

router.get(
    "/me",
    requireAuth,
    async (req, res) => {

        try {

            let student = null;


            if (
                req.user.role === "student" &&
                req.user.studentRegisterNumber
            ) {

                student =
                    await Student.findOne({

                        registerNumber:
                            req.user
                                .studentRegisterNumber

                    }).lean();

            }


            return res.json({

                success: true,

                user: req.user,

                student: student

            });

        }

        catch (error) {

            return res.status(500).json({

                success: false,

                message:
                    error.message

            });

        }

    }
);


// =====================================================
// CHANGE PASSWORD
// =====================================================

router.post(
    "/change-password",
    requireAuth,
    async (req, res) => {

        try {

            const {
                currentPassword,
                newPassword
            } = req.body;


            if (
                !currentPassword ||
                !newPassword
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Current and new passwords are required"

                });

            }


            if (
                newPassword.length < 6
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "New password must contain at least 6 characters"

                });

            }


            const UserModel =
                require("../models/User");


            const user =
                await UserModel.findById(
                    req.user.id
                );


            if (!user) {

                return res.status(404).json({

                    success: false,

                    message:
                        "User not found"

                });

            }


            const correct =
                await bcrypt.compare(
                    currentPassword,
                    user.passwordHash
                );


            if (!correct) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Current password is incorrect"

                });

            }


            user.passwordHash =
                await bcrypt.hash(
                    newPassword,
                    10
                );


            await user.save();


            return res.json({

                success: true,

                message:
                    "Password changed successfully"

            });

        }

        catch (error) {

            return res.status(500).json({

                success: false,

                message:
                    error.message

            });

        }

    }
);


module.exports = router;