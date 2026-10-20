
const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

// Allow Express to read JSON request bodies
app.use(express.json());

// Location of our data file
const FILE = path.join(__dirname, "students.json");

// Read students from the file
function readStudents() {
    if (!fs.existsSync(FILE)) {
        fs.writeFileSync(FILE, "[]");
    }

    const data = fs.readFileSync(FILE, "utf8");
    return JSON.parse(data);
}

// Save students to the file
function saveStudents(students) {
    fs.writeFileSync(FILE, JSON.stringify(students, null, 2));
}

// Validate student data
function validateStudent(student) {
    if (
        !student ||
        typeof student.name !== "string" ||
        !student.name.trim() ||
        typeof student.email !== "string" ||
        !student.email.includes("@") ||
        typeof student.program !== "string" ||
        !student.program.trim()
    ) {
        return "Please provide a name, a valid email containing @, and a program.";
    }

    return null;
}

// GET /students - Get all students
// Bonus: GET /students?program=BSCS
app.get("/students", (req, res) => {
    let students = readStudents();

    if (req.query.program) {
        students = students.filter(
            student =>
                student.program.toLowerCase() ===
                req.query.program.toLowerCase()
        );
    }

    res.status(200).json(students);
});

// GET /students/:id - Get one student
app.get("/students/:id", (req, res) => {
    const students = readStudents();
    const id = Number(req.params.id);

    const student = students.find(s => s.id === id);

    if (!student) {
        return res.status(404).json({
            message: "Student not found"
        });
    }

    res.status(200).json(student);
});

// POST /students - Create a student
app.post("/students", (req, res) => {
    const error = validateStudent(req.body);

    if (error) {
        return res.status(400).json({ message: error });
    }

    const students = readStudents();

    const nextId = students.length > 0
        ? Math.max(...students.map(s => s.id)) + 1
        : 1;

    const newStudent = {
        id: nextId,
        name: req.body.name.trim(),
        email: req.body.email.trim(),
        program: req.body.program.trim()
    };

    students.push(newStudent);
    saveStudents(students);

    res.status(201).json({
        message: "Student created successfully",
        student: newStudent
    });
});

// PUT /students/:id - Update a student
app.put("/students/:id", (req, res) => {
    const students = readStudents();
    const id = Number(req.params.id);

    const index = students.findIndex(s => s.id === id);

    if (index === -1) {
        return res.status(404).json({
            message: "Student not found"
        });
    }

    const error = validateStudent(req.body);

    if (error) {
        return res.status(400).json({ message: error });
    }

    students[index] = {
        id: students[index].id,
        name: req.body.name.trim(),
        email: req.body.email.trim(),
        program: req.body.program.trim()
    };

    saveStudents(students);

    res.status(200).json({
        message: "Student updated successfully",
        student: students[index]
    });
});

// DELETE /students/:id - Delete a student
app.delete("/students/:id", (req, res) => {
    const students = readStudents();
    const id = Number(req.params.id);

    const index = students.findIndex(s => s.id === id);

    if (index === -1) {
        return res.status(404).json({
            message: "Student not found"
        });
    }

    const deletedStudent = students.splice(index, 1)[0];

    saveStudents(students);

    res.status(200).json({
        message: "Student deleted successfully",
        student: deletedStudent
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
