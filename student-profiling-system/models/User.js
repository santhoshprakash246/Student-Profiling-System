const mongoose = require("mongoose");

const userSchema =
    new mongoose.Schema(

        {
            username: {
                type: String,
                required: true,
                unique: true,
                trim: true
            },

            passwordHash: {
                type: String,
                required: true
            },

            role: {
                type: String,
                enum: [
                    "faculty",
                    "student"
                ],
                required: true
            },

            studentRegisterNumber: {
                type: String,
                unique: true,
                sparse: true
            },

            active: {
                type: Boolean,
                default: true
            }
        },

        {
            timestamps: true
        }

    );

module.exports =
    mongoose.model(
        "User",
        userSchema
    );