# Student Academic, Personal and Career Profiling System

A web-based student profiling and mentoring system designed to manage student academic performance, personal information, technical skills, self-evaluation and career goals. The system provides separate faculty and student logins, allowing faculty to manage student profiles and students to view their individual information and academic reports.

## Stack

HTML5, CSS3, Bootstrap 5, JavaScript, Node.js, Express.js, MongoDB and Mongoose.

## Features

* **Faculty Authentication:** Secure faculty login and logout to access student management features.
* **Student Authentication:** Individual student login using register number and password.
* **Student Profile Management:** Faculty can add, view, update and manage student profiles.
* **Academic Performance Tracking:** Maintain semester-wise academic information and student performance details.
* **Personal Information Management:** Store student personal and educational details.
* **Technical Skills:** Record programming skills, technical knowledge and professional interests.
* **Self-Evaluation:** Maintain student self-assessment information to support academic mentoring.
* **Career Guidance:** Record career goals, professional interests and future aspirations.
* **Student Dashboard:** Students can view their own profile and relevant academic information.
* **Word Report Download:** Students can download their individual profile and academic report in Microsoft Word (`.docx`) format.
* **MongoDB Database:** Store and retrieve student and user information using MongoDB and Mongoose.
* **Responsive Interface:** Bootstrap-based interface designed for desktop and mobile screens.
* **Role-Based Access:** Separate faculty and student access to restrict profile management and protect student information.


## Authentication

### Faculty Login

Faculty members can log in to manage student profiles, maintain academic information and access student mentoring features.

Username:faculty
Password:Fp!9Kq

### Student Login

Students can log in using their individual credentials to view their own profile and download their academic report.

Demo credentials should be configured according to the users available in the database. Do not publish actual passwords or database credentials in the repository.

Username:24BCS101
Password:St!7Px

## API

The application uses Express.js routes to handle authentication, student profile management and report generation.

* Authentication endpoints for faculty and student login.
* Student profile endpoints for retrieving and managing student information.
* Faculty operations for adding and updating student records.
* Student-specific profile retrieval.
* Word report download endpoint for generating individual `.docx` reports.

The exact endpoint paths depend on the routes configured in the project.

## Structure

```text
student-profiling-system/
│
├── server.js
├── package.json
├── package-lock.json
├── .env
│
├── models/
│   ├── Student.js
│   └── User.js
│
├── routes/
│   ├── authRoutes.js
│   └── studentRoutes.js
│
├── middleware/
│   └── authentication middleware
│
└── public/
    ├── index.html
    ├── student.html
    ├── app.js
    ├── style.css
    └── other frontend files
```

*Note: Adjust the structure above to match the actual files and folders in your NIMBUS workspace before publishing.*

## Privacy and Security

The system uses separate faculty and student authentication to manage access to student information. Students should only be able to view their own profile and academic report, while faculty members can perform authorised student management operations.

Sensitive information, passwords, and database connection strings should not be exposed in the public repository. Environment variables should be stored in `.env`, and the `.env` file should be excluded using `.gitignore`.

## Expected Outcome

The Student Academic, Personal and Career Profiling System provides a centralized platform for maintaining student profiles, monitoring academic progress, supporting faculty mentoring and helping students understand their career goals.

The system reduces manual record maintenance and makes individual student information and academic reports easier to access.
