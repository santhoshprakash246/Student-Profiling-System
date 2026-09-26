const mongoose = require("mongoose");

// Semester details
const semesterSchema = new mongoose.Schema({
    semester: {
        type: Number,
        required: true,
        min: 1,
        max: 12
    },

    sgpa: {
        type: Number,
        default: 0,
        min: 0,
        max: 10
    },

    cgpa: {
        type: Number,
        default: 0,
        min: 0,
        max: 10
    },

    attendance: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },

    arrears: {
        type: Number,
        default: 0,
        min: 0
    }
}, { _id: false });


// Career details
const careerSchema = new mongoose.Schema({
    skills: {
        type: [String],
        default: []
    },

    certifications: {
        type: [String],
        default: []
    },

    projects: {
        type: [String],
        default: []
    },

    github: {
        type: String,
        default: ""
    },

    linkedin: {
        type: String,
        default: ""
    },

    careerGoal: {
        type: String,
        default: ""
    }
}, { _id: false });


// Main Student Schema
const studentSchema = new mongoose.Schema({

    // Personal Details
    name: {
        type: String,
        required: true,
        trim: true
    },

    registerNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    department: {
        type: String,
        required: true,
        trim: true
    },

    year: {
        type: Number,
        required: true,
        min: 1,
        max: 6
    },

    // Student Category
    studentCategory: {
        type: String,
        required: true,
        enum: ["Hosteller", "Day Scholar"]
    },

    section: {
        type: String,
        required: true,
        enum: ["A", "B", "C", "D"]
    },

    // Career Goal
    careerGoal: {
        primary: {
            type: String,
            required: true,
            enum: [
                "Placement",
                "Higher Studies",
                "Entrepreneurship",
                "Not Decided"
            ],
            default: "Not Decided"
        }
    },

    // Academic Records
    semesters: {
        type: [semesterSchema],
        default: []
    },

    // Arrears
    arrears: {
        type: [{
            subject: {
                type: String,
                default: ""
            },
            subjectCode: {
                type: String,
                default: ""
            },
            semester: {
                type: Number,
                default: 1
            },
            status: {
                type: String,
                enum: ["Pending", "Cleared"],
                default: "Pending"
            }
        }],
        default: []
    },

    // Technical and Career Profile
    career: {
        type: careerSchema,
        default: () => ({})
    },

    // Personal Details
    personalDetails: {
        dateOfBirth: {
            type: Date,
            default: null
        },
        gender: {
            type: String,
            default: ""
        },
        email: {
            type: String,
            default: ""
        },
        phone: {
            type: String,
            default: ""
        },
        address: {
            type: String,
            default: ""
        }
    },

    // Family Details
    familyDetails: {
        fatherName: {
            type: String,
            default: ""
        },
        motherName: {
            type: String,
            default: ""
        },
        guardianPhone: {
            type: String,
            default: ""
        }
    },

    // Hosteller Details
    hostelDetails: {
        hostelName: {
            type: String,
            default: ""
        },
        roomNumber: {
            type: String,
            default: ""
        }
    },

    // Self Evaluation
    selfEvaluation: {
        strengths: {
            type: [String],
            default: []
        },
        weaknesses: {
            type: [String],
            default: []
        },
        mentorSupport: {
            type: String,
            default: ""
        }
    }

}, {
    timestamps: true,
    strict: true
});


// Prevent model overwrite error
module.exports =
    mongoose.models.Student ||
    mongoose.model("Student", studentSchema);