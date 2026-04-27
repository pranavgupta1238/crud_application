import { useEffect, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const emptyAuthor = { name: "", bio: "" };
const emptyBook = { title: "", genre: "", publishedYear: "", author: "" };
const emptyStudent = { name: "", email: "" };
const emptyCourse = { title: "", code: "", description: "", students: [] };

async function api(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json"
    },
    ...options
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || "Request failed");
  }

  return response.json();
}

function SectionCard({ title, subtitle, children }) {
  return (
    <section className="card">
      <div className="card-head">
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function toggleSelection(list, value) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

export default function App() {
  const [authors, setAuthors] = useState([]);
  const [books, setBooks] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [authorForm, setAuthorForm] = useState(emptyAuthor);
  const [bookForm, setBookForm] = useState(emptyBook);
  const [studentForm, setStudentForm] = useState(emptyStudent);
  const [courseForm, setCourseForm] = useState(emptyCourse);
  const [assignmentForm, setAssignmentForm] = useState({ studentId: "", courseIds: [] });
  const [editingAuthor, setEditingAuthor] = useState(null);
  const [editingBook, setEditingBook] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [editingCourse, setEditingCourse] = useState(null);

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const [healthData, authorsData, booksData, studentsData, coursesData] = await Promise.all([
        api("/health"),
        api("/authors"),
        api("/books"),
        api("/students"),
        api("/courses")
      ]);

      setHealth(healthData);
      setAuthors(authorsData);
      setBooks(booksData);
      setStudents(studentsData);
      setCourses(coursesData);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function submitAuthor(event) {
    event.preventDefault();
    await api("/authors", {
      method: "POST",
      body: JSON.stringify(authorForm)
    });
    setAuthorForm(emptyAuthor);
    loadData();
  }

  async function submitBook(event) {
    event.preventDefault();
    await api("/books", {
      method: "POST",
      body: JSON.stringify({
        ...bookForm,
        publishedYear: Number(bookForm.publishedYear)
      })
    });
    setBookForm(emptyBook);
    loadData();
  }

  async function submitStudent(event) {
    event.preventDefault();
    await api("/students", {
      method: "POST",
      body: JSON.stringify(studentForm)
    });
    setStudentForm(emptyStudent);
    loadData();
  }

  async function submitCourse(event) {
    event.preventDefault();
    await api("/courses", {
      method: "POST",
      body: JSON.stringify(courseForm)
    });
    setCourseForm(emptyCourse);
    loadData();
  }

  async function removeItem(resource, id) {
    try {
      await api(`/${resource}/${id}`, { method: "DELETE" });
      loadData();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function updateAuthor(event) {
    event.preventDefault();
    await api(`/authors/${editingAuthor._id}`, {
      method: "PUT",
      body: JSON.stringify({
        name: editingAuthor.name,
        bio: editingAuthor.bio
      })
    });
    setEditingAuthor(null);
    loadData();
  }

  async function updateBook(event) {
    event.preventDefault();
    await api(`/books/${editingBook._id}`, {
      method: "PUT",
      body: JSON.stringify({
        title: editingBook.title,
        genre: editingBook.genre,
        publishedYear: Number(editingBook.publishedYear),
        author: editingBook.author
      })
    });
    setEditingBook(null);
    loadData();
  }

  async function updateStudent(event) {
    event.preventDefault();
    await api(`/students/${editingStudent._id}`, {
      method: "PUT",
      body: JSON.stringify({
        name: editingStudent.name,
        email: editingStudent.email,
        courses: editingStudent.courses || []
      })
    });
    setEditingStudent(null);
    loadData();
  }

  async function updateCourse(event) {
    event.preventDefault();
    await api(`/courses/${editingCourse._id}`, {
      method: "PUT",
      body: JSON.stringify({
        title: editingCourse.title,
        code: editingCourse.code,
        description: editingCourse.description,
        students: editingCourse.students
      })
    });
    setEditingCourse(null);
    loadData();
  }

  async function submitAssignment(event) {
    event.preventDefault();
    const selectedStudent = students.find((student) => student._id === assignmentForm.studentId);
    if (!selectedStudent) {
      setError("Select a student before assigning courses.");
      return;
    }

    await api(`/students/${assignmentForm.studentId}`, {
      method: "PUT",
      body: JSON.stringify({
        name: selectedStudent.name,
        email: selectedStudent.email,
        courses: assignmentForm.courseIds
      })
    });

    setAssignmentForm({ studentId: "", courseIds: [] });
    loadData();
  }

  function handleAssignmentStudentChange(studentId) {
    const selectedStudent = students.find((student) => student._id === studentId);
    setAssignmentForm({
      studentId,
      courseIds: selectedStudent ? selectedStudent.courses.map((course) => course._id) : []
    });
  }

  return (
    <main className="app-shell">
      <header className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Assignment Demonstration</span>
          <h1>React CRUD with MongoDB Relationships</h1>
          <p>
            A full-stack demo showing user-entered data stored in MongoDB, with one-to-many
            and many-to-many relationships.
          </p>
        </div>
        <div className="stats">
          <div className="stat">
            <strong>{health?.counts?.authors ?? 0}</strong>
            <span>Authors</span>
          </div>
          <div className="stat">
            <strong>{health?.counts?.books ?? 0}</strong>
            <span>Books</span>
          </div>
          <div className="stat">
            <strong>{health?.counts?.students ?? 0}</strong>
            <span>Students</span>
          </div>
          <div className="stat">
            <strong>{health?.counts?.courses ?? 0}</strong>
            <span>Courses</span>
          </div>
        </div>
      </header>

      <section className="relationship-strip">
        <div>
          <h3>One-to-many</h3>
          <p>One author can be linked to many books.</p>
        </div>
        <div>
          <h3>Many-to-many</h3>
          <p>Students can join many courses and each course can include many students.</p>
        </div>
      </section>

      {error ? <div className="alert error">{error}</div> : null}
      {loading ? <div className="alert">Loading data...</div> : null}

      <div className="grid two-col">
        <SectionCard
          title="Create Author"
          subtitle="This starts the one-to-many relationship."
        >
          <form onSubmit={submitAuthor} className="form-grid">
            <input
              placeholder="Author name"
              value={authorForm.name}
              onChange={(event) => setAuthorForm({ ...authorForm, name: event.target.value })}
              required
            />
            <textarea
              placeholder="Short author bio"
              value={authorForm.bio}
              onChange={(event) => setAuthorForm({ ...authorForm, bio: event.target.value })}
              rows="3"
            />
            <button type="submit">Add Author</button>
          </form>
        </SectionCard>

        <SectionCard
          title="Create Book"
          subtitle="Every book belongs to exactly one author."
        >
          <form onSubmit={submitBook} className="form-grid">
            <input
              placeholder="Book title"
              value={bookForm.title}
              onChange={(event) => setBookForm({ ...bookForm, title: event.target.value })}
              required
            />
            <input
              placeholder="Genre"
              value={bookForm.genre}
              onChange={(event) => setBookForm({ ...bookForm, genre: event.target.value })}
            />
            <input
              placeholder="Published year"
              type="number"
              value={bookForm.publishedYear}
              onChange={(event) =>
                setBookForm({ ...bookForm, publishedYear: event.target.value })
              }
              required
            />
            <select
              value={bookForm.author}
              onChange={(event) => setBookForm({ ...bookForm, author: event.target.value })}
              required
            >
              <option value="">Select author</option>
              {authors.map((author) => (
                <option key={author._id} value={author._id}>
                  {author.name}
                </option>
              ))}
            </select>
            <button type="submit" disabled={authors.length === 0}>
              Add Book
            </button>
          </form>
        </SectionCard>

        <SectionCard
          title="Create Student"
          subtitle="Students will be linked to courses in the many-to-many section."
        >
          <form onSubmit={submitStudent} className="form-grid">
            <input
              placeholder="Student name"
              value={studentForm.name}
              onChange={(event) => setStudentForm({ ...studentForm, name: event.target.value })}
              required
            />
            <input
              placeholder="Student email"
              type="email"
              value={studentForm.email}
              onChange={(event) => setStudentForm({ ...studentForm, email: event.target.value })}
              required
            />
            <button type="submit">Add Student</button>
          </form>
        </SectionCard>

        <SectionCard
          title="Create Course"
          subtitle="A course can include many students, and students can join many courses."
        >
          <form onSubmit={submitCourse} className="form-grid">
            <input
              placeholder="Course title"
              value={courseForm.title}
              onChange={(event) => setCourseForm({ ...courseForm, title: event.target.value })}
              required
            />
            <input
              placeholder="Course code"
              value={courseForm.code}
              onChange={(event) => setCourseForm({ ...courseForm, code: event.target.value })}
              required
            />
            <textarea
              placeholder="Course description"
              rows="3"
              value={courseForm.description}
              onChange={(event) =>
                setCourseForm({ ...courseForm, description: event.target.value })
              }
            />
            <div className="selector-block">
              <div className="selector-label">Assign students now (optional)</div>
              {students.length === 0 ? (
                <div className="empty-note">Create students first, or assign them later by editing a student.</div>
              ) : (
                <div className="check-grid">
                  {students.map((student) => (
                    <label key={student._id} className="check-item">
                      <input
                        type="checkbox"
                        checked={courseForm.students.includes(student._id)}
                        onChange={() =>
                          setCourseForm({
                            ...courseForm,
                            students: toggleSelection(courseForm.students, student._id)
                          })
                        }
                      />
                      <span>
                        {student.name} ({student.email})
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <button type="submit">Add Course</button>
          </form>
        </SectionCard>
      </div>

      <SectionCard
        title="Assign Existing Courses to Students"
        subtitle="Use this after both students and courses are already created."
      >
        <form onSubmit={submitAssignment} className="form-grid">
          <select
            value={assignmentForm.studentId}
            onChange={(event) => handleAssignmentStudentChange(event.target.value)}
            required
          >
            <option value="">Select student</option>
            {students.map((student) => (
              <option key={student._id} value={student._id}>
                {student.name} ({student.email})
              </option>
            ))}
          </select>
          <div className="selector-block">
            <div className="selector-label">Choose one or more existing courses</div>
            {courses.length === 0 ? (
              <div className="empty-note">Create courses first.</div>
            ) : (
              <div className="check-grid">
                {courses.map((course) => (
                  <label key={course._id} className="check-item">
                    <input
                      type="checkbox"
                      checked={assignmentForm.courseIds.includes(course._id)}
                      onChange={() =>
                        setAssignmentForm({
                          ...assignmentForm,
                          courseIds: toggleSelection(assignmentForm.courseIds, course._id)
                        })
                      }
                      disabled={!assignmentForm.studentId}
                    />
                    <span>
                      {course.title} ({course.code})
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={!assignmentForm.studentId || courses.length === 0}
          >
            Assign Courses
          </button>
        </form>
      </SectionCard>

      <div className="grid two-col">
        <SectionCard
          title="Authors and Books"
          subtitle="One author record controls a group of book records."
        >
          <div className="stack-list">
            {authors.map((author) => (
              <article key={author._id} className="item">
                {editingAuthor?._id === author._id ? (
                  <form onSubmit={updateAuthor} className="form-grid grow">
                    <input
                      value={editingAuthor.name}
                      onChange={(event) =>
                        setEditingAuthor({ ...editingAuthor, name: event.target.value })
                      }
                      required
                    />
                    <textarea
                      rows="3"
                      value={editingAuthor.bio}
                      onChange={(event) =>
                        setEditingAuthor({ ...editingAuthor, bio: event.target.value })
                      }
                    />
                    <div className="button-row">
                      <button type="submit">Save</button>
                      <button type="button" className="secondary" onClick={() => setEditingAuthor(null)}>
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div>
                      <h3>{author.name}</h3>
                      <p>{author.bio || "No bio added."}</p>
                      <small>
                        Books:{" "}
                        {author.books.length > 0
                          ? author.books.map((book) => book.title).join(", ")
                          : "None yet"}
                      </small>
                    </div>
                    <div className="button-row">
                      <button
                        type="button"
                        className="secondary"
                        onClick={() => setEditingAuthor(author)}
                      >
                        Edit
                      </button>
                      <button className="danger" onClick={() => removeItem("authors", author._id)}>
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </article>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Books"
          subtitle="Books store the author reference in MongoDB."
        >
          <div className="stack-list">
            {books.map((book) => (
              <article key={book._id} className="item">
                {editingBook?._id === book._id ? (
                  <form onSubmit={updateBook} className="form-grid grow">
                    <input
                      value={editingBook.title}
                      onChange={(event) =>
                        setEditingBook({ ...editingBook, title: event.target.value })
                      }
                      required
                    />
                    <input
                      value={editingBook.genre}
                      onChange={(event) =>
                        setEditingBook({ ...editingBook, genre: event.target.value })
                      }
                    />
                    <input
                      type="number"
                      value={editingBook.publishedYear}
                      onChange={(event) =>
                        setEditingBook({ ...editingBook, publishedYear: event.target.value })
                      }
                      required
                    />
                    <select
                      value={editingBook.author}
                      onChange={(event) =>
                        setEditingBook({ ...editingBook, author: event.target.value })
                      }
                      required
                    >
                      {authors.map((author) => (
                        <option key={author._id} value={author._id}>
                          {author.name}
                        </option>
                      ))}
                    </select>
                    <div className="button-row">
                      <button type="submit">Save</button>
                      <button type="button" className="secondary" onClick={() => setEditingBook(null)}>
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div>
                      <h3>{book.title}</h3>
                      <p>
                        {book.genre || "General"} | {book.publishedYear}
                      </p>
                      <small>Author: {book.author?.name}</small>
                    </div>
                    <div className="button-row">
                      <button
                        type="button"
                        className="secondary"
                        onClick={() =>
                          setEditingBook({
                            _id: book._id,
                            title: book.title,
                            genre: book.genre,
                            publishedYear: book.publishedYear,
                            author: book.author?._id
                          })
                        }
                      >
                        Edit
                      </button>
                      <button className="danger" onClick={() => removeItem("books", book._id)}>
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </article>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Students"
          subtitle="Students can appear in multiple courses, and you can assign courses later."
        >
          <div className="stack-list">
            {students.map((student) => (
              <article key={student._id} className="item">
                {editingStudent?._id === student._id ? (
                  <form onSubmit={updateStudent} className="form-grid grow">
                    <input
                      value={editingStudent.name}
                      onChange={(event) =>
                        setEditingStudent({ ...editingStudent, name: event.target.value })
                      }
                      required
                    />
                    <input
                      type="email"
                      value={editingStudent.email}
                      onChange={(event) =>
                        setEditingStudent({ ...editingStudent, email: event.target.value })
                      }
                      required
                    />
                    <div className="selector-block">
                      <div className="selector-label">Assign courses</div>
                      {courses.length === 0 ? (
                        <div className="empty-note">Create courses first.</div>
                      ) : (
                        <div className="check-grid">
                          {courses.map((course) => (
                            <label key={course._id} className="check-item">
                              <input
                                type="checkbox"
                                checked={(editingStudent.courses || []).includes(course._id)}
                                onChange={() =>
                                  setEditingStudent({
                                    ...editingStudent,
                                    courses: toggleSelection(editingStudent.courses || [], course._id)
                                  })
                                }
                              />
                              <span>
                                {course.title} ({course.code})
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="button-row">
                      <button type="submit">Save</button>
                      <button
                        type="button"
                        className="secondary"
                        onClick={() => setEditingStudent(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div>
                      <h3>{student.name}</h3>
                      <p>{student.email}</p>
                      <small>
                        Enrolled:{" "}
                        {student.courses?.length
                          ? student.courses.map((course) => course.code).join(", ")
                          : "No courses yet"}
                      </small>
                    </div>
                    <div className="button-row">
                      <button
                        type="button"
                        className="secondary"
                        onClick={() =>
                          setEditingStudent({
                            _id: student._id,
                            name: student.name,
                            email: student.email,
                            courses: (student.courses || []).map((course) => course._id)
                          })
                        }
                      >
                        Edit
                      </button>
                      <button className="danger" onClick={() => removeItem("students", student._id)}>
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </article>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Courses"
          subtitle="Courses hold arrays of student references for many-to-many mapping."
        >
          <div className="stack-list">
            {courses.map((course) => (
              <article key={course._id} className="item">
                {editingCourse?._id === course._id ? (
                  <form onSubmit={updateCourse} className="form-grid grow">
                    <input
                      value={editingCourse.title}
                      onChange={(event) =>
                        setEditingCourse({ ...editingCourse, title: event.target.value })
                      }
                      required
                    />
                    <input
                      value={editingCourse.code}
                      onChange={(event) =>
                        setEditingCourse({ ...editingCourse, code: event.target.value })
                      }
                      required
                    />
                    <textarea
                      rows="3"
                      value={editingCourse.description}
                      onChange={(event) =>
                        setEditingCourse({ ...editingCourse, description: event.target.value })
                      }
                    />
                    <div className="selector-block">
                      <div className="selector-label">Assigned students</div>
                      {students.length === 0 ? (
                        <div className="empty-note">Create students first.</div>
                      ) : (
                        <div className="check-grid">
                          {students.map((student) => (
                            <label key={student._id} className="check-item">
                              <input
                                type="checkbox"
                                checked={editingCourse.students.includes(student._id)}
                                onChange={() =>
                                  setEditingCourse({
                                    ...editingCourse,
                                    students: toggleSelection(editingCourse.students, student._id)
                                  })
                                }
                              />
                              <span>
                                {student.name} ({student.email})
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="button-row">
                      <button type="submit">Save</button>
                      <button type="button" className="secondary" onClick={() => setEditingCourse(null)}>
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div>
                      <h3>
                        {course.title} <span className="muted">({course.code})</span>
                      </h3>
                      <p>{course.description || "No description added."}</p>
                      <small>
                        Students:{" "}
                        {course.students?.length
                          ? course.students.map((student) => student.name).join(", ")
                          : "No enrolled students"}
                      </small>
                    </div>
                    <div className="button-row">
                      <button
                        type="button"
                        className="secondary"
                        onClick={() =>
                          setEditingCourse({
                            _id: course._id,
                            title: course.title,
                            code: course.code,
                            description: course.description,
                            students: course.students.map((student) => student._id)
                          })
                        }
                      >
                        Edit
                      </button>
                      <button className="danger" onClick={() => removeItem("courses", course._id)}>
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </article>
            ))}
          </div>
        </SectionCard>
      </div>
    </main>
  );
}
