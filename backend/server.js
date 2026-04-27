import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";

import { Author } from "./models/Author.js";
import { Book } from "./models/Book.js";
import { Course } from "./models/Course.js";
import { Student } from "./models/Student.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/react_mongo_demo";

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173"
  })
);
app.use(express.json());

app.get("/api/health", async (_req, res) => {
  const counts = await Promise.all([
    Author.countDocuments(),
    Book.countDocuments(),
    Student.countDocuments(),
    Course.countDocuments()
  ]);

  res.json({
    ok: true,
    counts: {
      authors: counts[0],
      books: counts[1],
      students: counts[2],
      courses: counts[3]
    }
  });
});

app.get("/api/authors", async (_req, res) => {
  const authors = await Author.find().sort({ createdAt: -1 }).lean();
  const books = await Book.find().populate("author", "name").lean();
  const booksByAuthor = books.reduce((map, book) => {
    const authorId = String(book.author?._id || book.author);
    if (!map[authorId]) {
      map[authorId] = [];
    }
    map[authorId].push(book);
    return map;
  }, {});

  res.json(
    authors.map((author) => ({
      ...author,
      books: booksByAuthor[String(author._id)] || []
    }))
  );
});

app.post("/api/authors", async (req, res) => {
  const author = await Author.create(req.body);
  res.status(201).json(author);
});

app.put("/api/authors/:id", async (req, res) => {
  const author = await Author.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!author) {
    return res.status(404).json({ message: "Author not found" });
  }
  res.json(author);
});

app.delete("/api/authors/:id", async (req, res) => {
  const booksUsingAuthor = await Book.countDocuments({ author: req.params.id });
  if (booksUsingAuthor > 0) {
    return res.status(400).json({
      message: "Delete the related books first. This author is used in the one-to-many relationship."
    });
  }

  const author = await Author.findByIdAndDelete(req.params.id);
  if (!author) {
    return res.status(404).json({ message: "Author not found" });
  }
  res.json({ message: "Author deleted" });
});

app.get("/api/books", async (_req, res) => {
  const books = await Book.find().populate("author", "name").sort({ createdAt: -1 });
  res.json(books);
});

app.post("/api/books", async (req, res) => {
  const book = await Book.create(req.body);
  const populated = await book.populate("author", "name");
  res.status(201).json(populated);
});

app.put("/api/books/:id", async (req, res) => {
  const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).populate("author", "name");
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }
  res.json(book);
});

app.delete("/api/books/:id", async (req, res) => {
  const book = await Book.findByIdAndDelete(req.params.id);
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }
  res.json({ message: "Book deleted" });
});

app.get("/api/students", async (_req, res) => {
  const students = await Student.find()
    .populate("courses", "title code")
    .sort({ createdAt: -1 });
  res.json(students);
});

app.post("/api/students", async (req, res) => {
  const student = await Student.create({
    name: req.body.name,
    email: req.body.email
  });
  res.status(201).json(student);
});

app.put("/api/students/:id", async (req, res) => {
  const studentIdsCourses = Array.isArray(req.body.courses) ? req.body.courses : null;
  const existingStudent = await Student.findById(req.params.id);

  if (!existingStudent) {
    return res.status(404).json({ message: "Student not found" });
  }

  if (studentIdsCourses) {
    const previousCourseIds = existingStudent.courses.map((id) => String(id));
    const nextCourseIds = studentIdsCourses.map((id) => String(id));

    await Course.updateMany(
      { _id: { $in: previousCourseIds.filter((id) => !nextCourseIds.includes(id)) } },
      { $pull: { students: existingStudent._id } }
    );

    await Course.updateMany(
      { _id: { $in: nextCourseIds } },
      { $addToSet: { students: existingStudent._id } }
    );

    existingStudent.courses = studentIdsCourses;
  }

  existingStudent.name = req.body.name;
  existingStudent.email = req.body.email;
  await existingStudent.save();

  const student = await Student.findById(existingStudent._id).populate("courses", "title code");
  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }
  res.json(student);
});

app.delete("/api/students/:id", async (req, res) => {
  const studentId = req.params.id;
  const student = await Student.findByIdAndDelete(studentId);
  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  await Course.updateMany({ students: studentId }, { $pull: { students: studentId } });
  res.json({ message: "Student deleted" });
});

app.get("/api/courses", async (_req, res) => {
  const courses = await Course.find()
    .populate("students", "name email")
    .sort({ createdAt: -1 });
  res.json(courses);
});

app.post("/api/courses", async (req, res) => {
  const studentIds = Array.isArray(req.body.students) ? req.body.students : [];

  const course = await Course.create({
    title: req.body.title,
    code: req.body.code,
    description: req.body.description,
    students: studentIds
  });

  if (studentIds.length > 0) {
    await Student.updateMany(
      { _id: { $in: studentIds } },
      { $addToSet: { courses: course._id } }
    );
  }

  const populated = await Course.findById(course._id).populate("students", "name email");
  res.status(201).json(populated);
});

app.put("/api/courses/:id", async (req, res) => {
  const studentIds = Array.isArray(req.body.students) ? req.body.students : [];
  const existingCourse = await Course.findById(req.params.id);

  if (!existingCourse) {
    return res.status(404).json({ message: "Course not found" });
  }

  const previousStudentIds = existingCourse.students.map((id) => String(id));
  const nextStudentIds = studentIds.map((id) => String(id));

  await Student.updateMany(
    { _id: { $in: previousStudentIds.filter((id) => !nextStudentIds.includes(id)) } },
    { $pull: { courses: existingCourse._id } }
  );

  await Student.updateMany(
    { _id: { $in: nextStudentIds } },
    { $addToSet: { courses: existingCourse._id } }
  );

  existingCourse.title = req.body.title;
  existingCourse.code = req.body.code;
  existingCourse.description = req.body.description;
  existingCourse.students = studentIds;
  await existingCourse.save();

  const updated = await Course.findById(existingCourse._id).populate("students", "name email");
  res.json(updated);
});

app.delete("/api/courses/:id", async (req, res) => {
  const courseId = req.params.id;
  const course = await Course.findByIdAndDelete(courseId);
  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  await Student.updateMany({ courses: courseId }, { $pull: { courses: courseId } });
  res.json({ message: "Course deleted" });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({
    message: error.message || "Server error"
  });
});

async function start() {
  await mongoose.connect(mongoUri);
  app.listen(port, () => {
    console.log(`API server running on port ${port}`);
  });
}

start().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
