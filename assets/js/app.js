// ====== USER MANAGEMENT (localStorage) ======
const USERS_KEY = "edutrack_users";
const PROGRESS_KEY = "edutrack_progress";
const COURSES_KEY = "edutrack_courses";
const ENROLLMENTS_KEY = "edutrack_enrollments";
const QUIZ_RESULTS_KEY = "edutrack_quiz_results";
const API_BASE_URL = "http://127.0.0.1:4000";


// ====== ENROLLMENT MANAGEMENT ======

function loadEnrollments() {
    try {
        const data = localStorage.getItem(ENROLLMENTS_KEY);
        if (!data) return [];
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
}

function saveEnrollments(enrollments) {
    localStorage.setItem(ENROLLMENTS_KEY, JSON.stringify(enrollments));
}

function getUserEnrollments(email) {
    const all = loadEnrollments();
    return all.filter((e) => e.email.toLowerCase() === email.toLowerCase());
}

function isEnrolled(email, courseId) {
    const all = loadEnrollments();
    return all.some(
        (e) =>
        e.email.toLowerCase() === email.toLowerCase() && e.courseId === courseId
    );
}

function enrollInCourse(email, courseId) {
    const all = loadEnrollments();
    if (isEnrolled(email, courseId)) return;
    all.push({
        email,
        courseId,
        completedLessons: [], // future use
    });
    saveEnrollments(all);
}

function unenrollFromCourse(email, courseId) {
    let all = loadEnrollments();
    all = all.filter(
        (e) =>
        !(
            e.email.toLowerCase() === email.toLowerCase() && e.courseId === courseId
        )
    );
    saveEnrollments(all);
}

// Load courses (created by teachers)
function loadCourses() {
    try {
        const data = localStorage.getItem(COURSES_KEY);
        if (!data) return [];
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
}

// Save courses
function saveCourses(courses) {
    localStorage.setItem(COURSES_KEY, JSON.stringify(courses));
}

// Generate unique course id
function generateCourseId() {
    return "c_" + Date.now();
}

// Find course by id (search sampleCourses + teacher-created)
function findCourseById(courseId) {
    // 1) from sample courses
    let course = sampleCourses.find((c) => c.id === courseId);
    if (course) return course;

    // 2) from teacher-created courses
    const createdCourses = loadCourses();
    return createdCourses.find((c) => c.id === courseId) || null;
}

// Get ALL courses (sample + teacher-created)
function getAllCourses() {
    const createdCourses = loadCourses();
    return [...sampleCourses, ...createdCourses];
}


// Load users from localStorage
function loadUsers() {
    try {
        const data = localStorage.getItem(USERS_KEY);
        if (!data) return [];
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
}

// Save users
function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Find user by email
function findUserByEmail(email) {
    const users = loadUsers();
    return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

// Register new user
function registerUser(name, email, password, role) {
    const users = loadUsers();

    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
        return { ok: false, message: "Email already registered. Please login." };
    }

    if (password.length < 6) {
        return { ok: false, message: "Password must be at least 6 characters." };
    }

    const newUser = {
        name,
        email,
        password,
        role,
        createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    saveUsers(users);

    return { ok: true, message: "Registration successful. You can now login." };
}

// ====== CURRENT USER (session-like) ======

function setUser(name, role, email) {
    localStorage.setItem("currentUserName", name);
    localStorage.setItem("currentUserRole", role);
    localStorage.setItem("currentUserEmail", email);
}

function getUserName() {
    return localStorage.getItem("currentUserName") || "User";
}

function getUserRole() {
    return localStorage.getItem("currentUserRole");
}

function getUserEmail() {
    return localStorage.getItem("currentUserEmail");
}

function logout() {
    localStorage.removeItem("currentUserName");
    localStorage.removeItem("currentUserRole");
    localStorage.removeItem("currentUserEmail");
}

// Full current user object
function getCurrentUser() {
    const email = getUserEmail();
    if (!email) return null;
    const users = loadUsers();
    return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
}

// ====== PROGRESS MANAGEMENT ======

function loadProgress() {
    try {
        const data = localStorage.getItem(PROGRESS_KEY);
        if (!data) return {};
        return JSON.parse(data);
    } catch (e) {
        return {};
    }
}

function saveProgress(progress) {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

function getCourseProgress(courseId, defaultValue = 0) {
    const email = getUserEmail();
    if (!email) return defaultValue;
    const all = loadProgress();
    const userMap = all[email] || {};
    if (userMap[courseId] == null) return defaultValue;
    return userMap[courseId];
}

function getCourseProgressForUser(email, courseId, defaultValue = 0) {
    const all = loadProgress();
    const userMap = all[email] || {};
    if (userMap[courseId] == null) return defaultValue;
    return userMap[courseId];
}


function setCourseProgress(courseId, value) {
    const email = getUserEmail();
    if (!email) return;
    const all = loadProgress();
    const userMap = all[email] || {};
    userMap[courseId] = value;
    all[email] = userMap;
    saveProgress(all);
}
// ====== QUIZ RESULT MANAGEMENT ======

function loadQuizResults() {
    try {
        const data = localStorage.getItem(QUIZ_RESULTS_KEY);
        if (!data) return {};
        return JSON.parse(data);
    } catch (e) {
        return {};
    }
}

function saveQuizResults(results) {
    localStorage.setItem(QUIZ_RESULTS_KEY, JSON.stringify(results));
}

function setQuizResultForUser(email, courseId, score, total) {
    const all = loadQuizResults();
    const userMap = all[email] || {};
    userMap[courseId] = {
        score,
        total,
        date: new Date().toISOString(),
    };
    all[email] = userMap;
    saveQuizResults(all);
}

function getQuizResultForUser(email, courseId) {
    const all = loadQuizResults();
    const userMap = all[email] || {};
    return userMap[courseId] || null;
}

// ====== SAMPLE COURSE DATA ======

const sampleCourses = [{
        id: "web-dev",
        title: "Web Development Basics",
        level: "Beginner",
        description: "Learn HTML, CSS and basic JavaScript.",
        progress: 60,
        lessons: [
            { id: "l_web1", title: "Introduction to Web", description: "Overview of web technologies", url: null },
            { id: "l_web2", title: "HTML Basics", description: "Learn HTML tags and structure", url: null },
            { id: "l_web3", title: "CSS Fundamentals", description: "Style your web pages", url: null },
            { id: "l_web4", title: "Intro to JavaScript", description: "Add interactivity to your sites", url: null },
        ],
        resources: ["HTML cheat sheet", "CSS guide", "JS basics PDF"],
    },
    {
        id: "python-beginners",
        title: "Python for Beginners",
        level: "Beginner",
        description: "Start your programming journey with Python.",
        progress: 30,
        lessons: [
            { id: "l_py1", title: "Getting Started", description: "Install Python and setup environment", url: null },
            { id: "l_py2", title: "Variables & Data Types", description: "Learn about Python data types", url: null },
            { id: "l_py3", title: "Conditions & Loops", description: "Control flow in Python", url: null },
        ],
        resources: ["Python install guide", "Beginner exercises"],
    },
    {
        id: "data-structures",
        title: "Data Structures",
        level: "Intermediate",
        description: "Learn arrays, stacks, queues & more.",
        progress: 10,
        lessons: [
            { id: "l_ds1", title: "Arrays", description: "Understanding array data structure", url: null },
            { id: "l_ds2", title: "Linked List", description: "Learn linked list implementation", url: null },
            { id: "l_ds3", title: "Stack", description: "LIFO data structure", url: null },
            { id: "l_ds4", title: "Queue", description: "FIFO data structure", url: null },
        ],
        resources: ["DS notes", "Practice problems"],
    },
];

// ====== QUIZ DATA PER COURSE ======

const quizData = {
    "web-dev": [{
            question: "Which language is used to structure a web page?",
            options: ["CSS", "JavaScript", "HTML", "Python"],
            answerIndex: 2,
        },
        {
            question: "Which tag is used to create a link in HTML?",
            options: ["<link>", "<a>", "<href>", "<p>"],
            answerIndex: 1,
        },
    ],
    "python-beginners": [{
            question: "Which keyword is used to define a function in Python?",
            options: ["func", "def", "function", "lambda"],
            answerIndex: 1,
        },
        {
            question: "What is the correct file extension for Python files?",
            options: [".pt", ".py", ".js", ".python"],
            answerIndex: 1,
        },
    ],
    "data-structures": [{
            question: "Which data structure works on FIFO?",
            options: ["Stack", "Queue", "Array", "Tree"],
            answerIndex: 1,
        },
        {
            question: "Which of these is a linear data structure?",
            options: ["Graph", "Tree", "Array", "Hash table"],
            answerIndex: 2,
        },
    ],
};

// ====== LOGIN PAGE INIT ======

function initLoginPage() {
    const form = document.getElementById("loginForm");
    if (!form) return;

    form.addEventListener("submit", async function(e) {
        e.preventDefault();

        const role = document.getElementById("role").value.toLowerCase();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        if (!role) {
            alert("Please select a role");
            return;
        }

        // ADMIN LOGIN (hardcoded)
        if (role === "admin") {
            if (email === "admin@gmail.com" && password === "admin123") {
                setUser("Admin", "admin", "admin@gmail.com");
                window.location.href = "admin-dashboard.html";
                return;
            } else {
                alert("Invalid admin credentials.");
                return;
            }
        }

        // STUDENT / TEACHER LOGIN (via Flask backend)
        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, role }),
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.message || "Login failed.");
                return;
            }

            // Save user session
            setUser(data.user.name, data.user.role, data.user.email);

            if (data.user.role === "student") {
                window.location.href = "student-dashboard.html";
            } else if (data.user.role === "teacher") {
                window.location.href = "teacher-dashboard.html";
            }
        } catch (err) {
            console.error(err);
            alert("Server error. Make sure Flask backend is running on http://127.0.0.1:4000");
        }
    });
}


// ====== REGISTER PAGE INIT ======

function initRegisterPage() {
    const form = document.getElementById("registerForm");
    if (!form) return;

    const msg = document.getElementById("registerMsg");

    form.addEventListener("submit", async function(e) {
        e.preventDefault();

        const name = document.getElementById("regName").value.trim();
        const role = document.getElementById("regRole").value;
        const email = document.getElementById("regEmail").value.trim();
        const password = document.getElementById("regPassword").value;

        if (!name || !role || !email || !password) {
            msg.textContent = "Please fill all fields.";
            msg.style.color = "red";
            return;
        }

        if (role === "admin") {
            msg.textContent = "You cannot register as Admin.";
            msg.style.color = "red";
            return;
        }

        try {
            // Call Flask backend
            const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password, role }),
            });

            const data = await res.json();

            if (!res.ok) {
                msg.textContent = data.message || "Registration failed.";
                msg.style.color = "red";
                return;
            }

            // Also store in localStorage for compatibility
            registerUser(name, email, password, role);

            msg.textContent = "Registration successful. You can now login.";
            msg.style.color = "green";
            form.reset();

            setTimeout(() => {
                window.location.href = "login.html";
            }, 1200);
        } catch (err) {
            console.error(err);
            msg.textContent = "Server error. Make sure backend is running.";
            msg.style.color = "red";
        }
    });
}


function initStudentDashboard() {
    const myCoursesDiv = document.getElementById("myCourses");
    const allCoursesDiv = document.getElementById("allCourses");

    if (!myCoursesDiv || !allCoursesDiv) return;

    const welcomeName = document.getElementById("welcomeName");
    if (welcomeName) {
        welcomeName.textContent = getUserName();
    }

    if (getUserRole() !== "student") {
        window.location.href = "login.html";
        return;
    }

    const email = getUserEmail();
    const allCourses = getAllCourses();
    const enrollments = getUserEnrollments(email);
    const enrolledCourseIds = enrollments.map((e) => e.courseId);

    const myCourses = allCourses.filter((c) => enrolledCourseIds.includes(c.id));

    // ==== MY COURSES ====
    if (!myCourses.length) {
        myCoursesDiv.innerHTML = `
      <p class="muted small">You are not enrolled in any courses yet.</p>
    `;
    } else {
        myCoursesDiv.innerHTML = myCourses
            .map((c) => {
                const prog = getCourseProgress(c.id, 0);
                return `
        <div class="course-card">
          <h3>${c.title}</h3>
          <p>${c.description}</p>
          <p class="muted small">Level: ${c.level || "-"}</p>

          <div style="height:8px;background:#ddd;border-radius:4px;overflow:hidden;margin-top:4px;">
            <div style="height:8px;background:#2563eb;width:${prog}%;"></div>
          </div>

          <p class="muted small">${prog}% completed</p>

          <button class="btn small" onclick="openCourse('${c.id}')">Continue</button>
        </div>
      `;
            })
            .join("");
    }

    // ==== ALL COURSES ====
    allCoursesDiv.innerHTML = allCourses
        .map((c) => {
                const isUserEnrolled = enrolledCourseIds.includes(c.id);
                const prog = getCourseProgress(c.id, 0);

                return `
      <div class="course-card">
        <h3>${c.title}</h3>
        <p>${c.description}</p>
        <p class="muted small">Level: ${c.level || "-"}</p>

        <div style="height:8px;background:#ddd;border-radius:4px;overflow:hidden;margin-top:4px;">
          <div style="height:8px;background:#2563eb;width:${prog}%;"></div>
        </div>

        <p class="muted small">${prog}% completed</p>

        ${
          isUserEnrolled
            ? `<button class="btn small" onclick="openCourse('${c.id}')">Open</button>`
            : `<button class="btn small" onclick="enrollFromDashboard('${c.id}')">Enroll</button>`
        }
      </div>
    `;
    })
    .join("");
}

// ====== TEACHER DASHBOARD INIT ======

function initTeacherDashboard() {
    const teacherCoursesDiv = document.getElementById("teacherCourses");
    const createForm = document.getElementById("createCourseForm");
    const msg = document.getElementById("createCourseMsg");

    if (!teacherCoursesDiv) return;

    const welcomeName = document.getElementById("welcomeName");
    if (welcomeName) {
        welcomeName.textContent = getUserName();
    }

    if (getUserRole() !== "teacher") {
        window.location.href = "login.html";
        return;
    }

    // RENDER TEACHER'S COURSES
    function renderTeacherCourses() {
        const email = getUserEmail();
        const allCourses = loadCourses();
        const myCourses = allCourses.filter((c) => c.createdBy === email);

        if (!myCourses.length) {
            teacherCoursesDiv.innerHTML =
                "<p class='muted small'>You have not created any courses yet.</p>";
            return;
        }

        teacherCoursesDiv.innerHTML = myCourses
            .map(
                (c) => `
      <div class="course-card">
        <h3>${c.title}</h3>
        <p>${c.description}</p>
        <p class="muted small">Level: ${c.level}</p>
        <p class="muted small">Lessons: ${c.lessons?.length || 0}</p>
        <div style="margin-top:8px; display:flex; flex-wrap:wrap; gap:6px;">
          <button class="btn small" onclick="manageLessons('${c.id}')">Manage Lessons</button>
          <button class="btn small" onclick="manageQuiz('${c.id}')">Manage Quiz</button>
          <button class="btn small" onclick="viewStudents('${c.id}')">View Students</button>
          <button class="btn small" onclick="editCourse('${c.id}')">Edit</button>
          <button class="btn small" onclick="deleteCourse('${c.id}')">Delete</button>
        </div>


      </div>
    `
            )
            .join("");

    }

    renderTeacherCourses();

    // CREATE NEW COURSE (save to localStorage)
    if (createForm) {
        createForm.addEventListener("submit", function(e) {
            e.preventDefault();

            const title = document.getElementById("courseTitle").value.trim();
            const level = document.getElementById("courseLevel").value;
            const desc = document.getElementById("courseDesc").value.trim();

            if (!title || !level || !desc) {
                msg.textContent = "Please fill all fields.";
                msg.style.color = "red";
                return;
            }

            const newCourse = {
                id: generateCourseId(),
                title,
                level,
                description: desc,
                createdBy: getUserEmail(), // IMPORTANT
                lessons: [],
                quiz: [],
                students: [],
            };

            const courses = loadCourses();
            courses.push(newCourse);
            saveCourses(courses);

            msg.textContent = `Course "${title}" created successfully.`;
            msg.style.color = "green";

            createForm.reset();
            renderTeacherCourses(); // refresh list
        });
    }
}
// ===== TEACHER: EDIT COURSE (simple prompt-based) =====
function editCourse(courseId) {
    const courses = loadCourses();
    const idx = courses.findIndex((c) => c.id === courseId);
    if (idx === -1) {
        alert("Course not found.");
        return;
    }

    const current = courses[idx];
    const newTitle = prompt("Edit course title:", current.title);
    if (!newTitle) return;

    const newDesc = prompt("Edit description:", current.description);
    if (!newDesc) return;

    courses[idx].title = newTitle.trim();
    courses[idx].description = newDesc.trim();
    saveCourses(courses);

    alert("Course updated.");
    // Simple reload to refresh UI
    window.location.reload();
}

// ===== TEACHER: DELETE COURSE =====
function deleteCourse(courseId) {
    if (!confirm("Are you sure you want to delete this course?")) return;

    let courses = loadCourses();
    courses = courses.filter((c) => c.id !== courseId);
    saveCourses(courses);

    alert("Course deleted.");
    window.location.reload();
}
// ===== TEACHER: GO TO MANAGE LESSONS PAGE =====
function manageLessons(courseId) {
    localStorage.setItem("selectedCourseId", courseId);
    window.location.href = "manage-lessons.html";
}

function initManageQuiz() {
  const titleEl = document.getElementById("quizCourseTitle");
  const subtitleEl = document.getElementById("quizCourseSubtitle");
  const listEl = document.getElementById("quizQuestionsTeacher");
  const emptyEl = document.getElementById("quizEmptyMsg");
  const form = document.getElementById("addQuizForm");

  if (!titleEl || !form || !listEl) return; // Not on this page

  // Only teacher can access
  if (getUserRole() !== "teacher") {
    window.location.href = "login.html";
    return;
  }

  const courseId = localStorage.getItem("selectedCourseId");
  if (!courseId) {
    titleEl.textContent = "No course selected.";
    return;
  }

  const email = getUserEmail();
  const courses = loadCourses();
  const idx = courses.findIndex(
    (c) => c.id === courseId && c.createdBy === email
  );

  if (idx === -1) {
    titleEl.textContent = "Course not found or not owned by you.";
    return;
  }

  const course = courses[idx];

  titleEl.textContent = "Course: " + course.title;
  subtitleEl.textContent = course.description || "";

  function renderQuestions() {
    const quiz = course.quiz || [];

    if (!quiz.length) {
      listEl.innerHTML = "";
      emptyEl.textContent = "No quiz questions added yet.";
      return;
    }

    emptyEl.textContent = "";
    listEl.innerHTML = quiz
      .map((q, i) => {
        return `
        <li>
          <strong>Q${i + 1}. ${q.question}</strong><br>
          <span class="muted small">
            A) ${q.options[0]}<br>
            B) ${q.options[1]}<br>
            C) ${q.options[2]}<br>
            D) ${q.options[3]}<br>
            Correct: Option ${q.answerIndex + 1}
          </span>
          <br>
          <button class="btn small" style="margin-top:4px;"
                  onclick="deleteQuizQuestion('${course.id}', ${i})">
            Delete Question
          </button>
        </li>
      `;
      })
      .join("");
  }

  renderQuestions();

  // Handle add question
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const qText = document.getElementById("quizQuestionText").value.trim();
    const opt1 = document.getElementById("quizOpt1").value.trim();
    const opt2 = document.getElementById("quizOpt2").value.trim();
    const opt3 = document.getElementById("quizOpt3").value.trim();
    const opt4 = document.getElementById("quizOpt4").value.trim();
    const correctIndex = parseInt(
      document.getElementById("quizCorrectIndex").value,
      10
    );

    if (!qText || !opt1 || !opt2 || !opt3 || !opt4) {
      alert("Please fill all fields.");
      return;
    }

    const newQuestion = {
      question: qText,
      options: [opt1, opt2, opt3, opt4],
      answerIndex: correctIndex,
    };

    course.quiz = course.quiz || [];
    course.quiz.push(newQuestion);
    courses[idx] = course;
    saveCourses(courses);

    form.reset();
    renderQuestions();
  });
}

function manageQuiz(courseId) {
  localStorage.setItem("selectedCourseId", courseId);
  window.location.href = "manage-quiz.html";
}


// ====== ADMIN DASHBOARD INIT ======

function initAdminDashboard() {
    const totalUsersEl = document.getElementById("totalUsers");
    const totalStudentsEl = document.getElementById("totalStudents");
    const totalTeachersEl = document.getElementById("totalTeachers");
    const usersTableBody = document.getElementById("usersTableBody");

    if (!totalUsersEl || !totalStudentsEl || !totalTeachersEl || !usersTableBody) return;

    if (getUserRole() !== "admin") {
        window.location.href = "login.html";
        return;
    }

    const users = loadUsers();
    const totalUsers = users.length;
    const totalStudents = users.filter((u) => u.role === "student").length;
    const totalTeachers = users.filter((u) => u.role === "teacher").length;

    totalUsersEl.textContent = totalUsers;
    totalStudentsEl.textContent = totalStudents;
    totalTeachersEl.textContent = totalTeachers;

    usersTableBody.innerHTML = users
        .map(
            (u, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${u.name}</td>
        <td>${u.email}</td>
        <td>${u.role}</td>
        <td>${u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "-"}</td>
      </tr>
    `
        )
        .join("");
}

// ====== COURSE HANDLING ======

function openCourse(courseId) {
    localStorage.setItem("selectedCourseId", courseId);
    window.location.href = "course-details.html";
}

function initCourseDetails() {
  const titleEl = document.getElementById("courseTitle");
  const subtitleEl = document.getElementById("courseSubtitle");
  const lessonsList = document.getElementById("lessonsList");
  const resourcesList = document.getElementById("resourcesList");
  const enrollBtn = document.getElementById("enrollToggleBtn");
  const enrollStatus = document.getElementById("enrollStatus");

  if (!titleEl || !subtitleEl || !lessonsList || !resourcesList) return;

  if (!getUserRole()) {
    window.location.href = "login.html";
    return;
  }

  const courseId = localStorage.getItem("selectedCourseId") || "web-dev";
  const course = findCourseById(courseId) || sampleCourses[0];

  // Title & subtitle
  titleEl.textContent = course.title;
  subtitleEl.textContent =
    course.description + " • Level: " + (course.level || "");

  // Lessons display (student view)
// ==== LESSONS DISPLAY WITH COMPLETION BUTTONS ====
if (course.lessons && course.lessons.length) {
  const email = getUserEmail();
  const enrollments = loadEnrollments();
  let entry = enrollments.find(
    (e) => e.email === email && e.courseId === courseId
  );

  const completed = entry ? entry.completedLessons : [];

  lessonsList.innerHTML = course.lessons
    .map((lesson, i) => {
      const isDone = completed.includes(lesson.id);
      return `
        <li>
          <strong>${i + 1}. ${lesson.title}</strong><br>
          <span class="muted small">${lesson.description}</span>
          ${
            lesson.url
              ? `<br><a href="${lesson.url}" target="_blank">Open material</a>`
              : ""
          }
          <br>
          <button class="btn small" onclick="toggleCompleteLesson('${course.id}', '${lesson.id}')">
            ${isDone ? "Completed ✔" : "Mark Completed"}
          </button>
        </li>
      `;
    })
    .join("");
} else {
  lessonsList.innerHTML = "<li class='muted small'>Lessons will appear here.</li>";
}


  // Resources placeholder (for now)
  if (course.resources && course.resources.length) {
    resourcesList.innerHTML = course.resources
      .map((res) => `<li>${res}</li>`)
      .join("");
  } else {
    resourcesList.innerHTML =
      "<li class='muted small'>Resources will appear here.</li>";
  }

  // ===== ENROLLMENT BUTTON (only for student) =====
  if (enrollBtn && enrollStatus) {
    if (getUserRole() !== "student") {
      enrollBtn.style.display = "none";
      enrollStatus.textContent = "Enrollment status available only for students.";
      return;
    }

    const email = getUserEmail();
    const enrolled = isEnrolled(email, courseId);

    function updateEnrollUI(isNowEnrolled) {
      if (isNowEnrolled) {
        enrollBtn.textContent = "Unenroll from this course";
        enrollStatus.textContent = "You are enrolled in this course.";
      } else {
        enrollBtn.textContent = "Enroll in this course";
        enrollStatus.textContent = "You are not enrolled in this course.";
      }
    }

    updateEnrollUI(enrolled);

    enrollBtn.onclick = function () {
      const currentlyEnrolled = isEnrolled(email, courseId);
      if (currentlyEnrolled) {
        if (confirm("Are you sure you want to unenroll from this course?")) {
          unenrollFromCourse(email, courseId);
          setCourseProgress(courseId, 0);
          updateEnrollUI(false);
          alert("You have been unenrolled.");
        }
      } else {
        enrollInCourse(email, courseId);
        updateEnrollUI(true);
        alert("Enrolled in course.");
      }
    };
  }
}
function openCourse(courseId) {
  localStorage.setItem("selectedCourseId", courseId);
  window.location.href = "course-details.html";
}


// ===== TEACHER: MANAGE LESSONS PAGE INIT =====
function initManageLessons() {
    const titleEl = document.getElementById("manageCourseTitle");
    const subtitleEl = document.getElementById("manageCourseSubtitle");
    const listEl = document.getElementById("lessonsListTeacher");
    const form = document.getElementById("addLessonForm");

    if (!titleEl || !listEl || !form) return;

    // Only teacher can access
    if (getUserRole() !== "teacher") {
        window.location.href = "login.html";
        return;
    }

    const courseId = localStorage.getItem("selectedCourseId");
    if (!courseId) {
        subtitleEl.textContent = "No course selected.";
        return;
    }

    const email = getUserEmail();
    const courses = loadCourses();
    const idx = courses.findIndex(
        (c) => c.id === courseId && c.createdBy === email
    );

    if (idx === -1) {
        subtitleEl.textContent = "Course not found or not owned by you.";
        return;
    }

    const course = courses[idx];

    titleEl.textContent = "Course: " + course.title;
    subtitleEl.textContent = course.description;

    function renderLessons() {
        const currentCourse = courses[idx];
        const lessons = currentCourse.lessons || [];

        if (!lessons.length) {
            listEl.innerHTML =
                "<li class='muted small'>No lessons added yet. Use the form below to add.</li>";
            return;
        }

        listEl.innerHTML = lessons
            .map(
                (lesson, i) => `
        <li>
          <strong>${i + 1}. ${lesson.title}</strong><br>
          <span class="muted small">${lesson.description || ""}</span>
          ${
            lesson.url
              ? `<br><a href="${lesson.url}" target="_blank" class="muted small">Open content</a>`
              : ""
          }
          <br>
          <button class="btn small" style="margin-top:4px;"
                  onclick="deleteLesson('${course.id}','${lesson.id}')">
            Delete Lesson
          </button>
        </li>
      `
      )
      .join("");
  }

  renderLessons();

  // Handle add lesson
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const title = document.getElementById("lessonTitle").value.trim();
    const desc = document.getElementById("lessonDesc").value.trim();
    const url = document.getElementById("lessonUrl").value.trim();

    if (!title || !desc) {
      alert("Please fill title and description.");
      return;
    }

    const newLesson = {
      id: "l_" + Date.now(),
      title,
      description: desc,
      url: url || null,
    };

    courses[idx].lessons = courses[idx].lessons || [];
    courses[idx].lessons.push(newLesson);
    saveCourses(courses);

    form.reset();
    renderLessons();
  });
}

// ===== TEACHER: DELETE SINGLE LESSON =====
function deleteLesson(courseId, lessonId) {
  const email = getUserEmail();
  const courses = loadCourses();
  const idx = courses.findIndex(
    (c) => c.id === courseId && c.createdBy === email
  );
  if (idx === -1) {
    alert("Course not found.");
    return;
  }

  const before = courses[idx].lessons || [];
  const after = before.filter((l) => l.id !== lessonId);
  courses[idx].lessons = after;
  saveCourses(courses);

  // Simple approach: reload the page
  window.location.reload();
}
function deleteQuizQuestion(courseId, index) {
  const email = getUserEmail();
  const courses = loadCourses();
  const idx = courses.findIndex(
    (c) => c.id === courseId && c.createdBy === email
  );
  if (idx === -1) {
    alert("Course not found.");
    return;
  }

  const quiz = courses[idx].quiz || [];
  if (index < 0 || index >= quiz.length) return;

  if (!confirm("Delete this question?")) return;

  quiz.splice(index, 1);
  courses[idx].quiz = quiz;
  saveCourses(courses);

  window.location.reload();
}


function markCourseCompleted() {
    const status = document.getElementById("courseStatus");
    const courseId = localStorage.getItem("selectedCourseId") || "web-dev";

    setCourseProgress(courseId, 100);

    if (status) {
        status.textContent = "Marked as completed. Progress saved for this course.";
    }
}

// ====== QUIZ LOGIC ======

function initQuiz() {
    const quizContainer = document.getElementById("quizQuestions");
    const quizResult = document.getElementById("quizResult");
    const submitBtn = document.getElementById("submitQuizBtn");
    const quizSubtitle = document.getElementById("quizSubtitle");

    if (!quizContainer || !submitBtn) return;

   const courseId = localStorage.getItem("selectedCourseId") || "web-dev";
const course = findCourseById(courseId);

let questions = [];

// 1) If teacher-created quiz exists, use that
if (course && Array.isArray(course.quiz) && course.quiz.length) {
  questions = course.quiz;
} else {
  // 2) Otherwise, fallback to static quizData (for sample courses)
  questions = quizData[courseId] || [];
}

    if (!questions.length) {
        quizContainer.innerHTML =
            "<p class='muted small'>Quiz coming soon for this course.</p>";
        submitBtn.disabled = true;
        return;
    }

    quizContainer.innerHTML = questions
        .map((q, idx) => {
            const optionsHtml = q.options
                .map(
                    (opt, optIdx) => `
        <label>
          <input type="radio" name="q${idx}" value="${optIdx}">
          ${opt}
        </label>
      `
                )
                .join("");

            return `
        <div class="quiz-question">
          <p>Q${idx + 1}. ${q.question}</p>
          ${optionsHtml}
        </div>
      `;
        })
        .join("");

    if (quizSubtitle) {
        quizSubtitle.textContent = `This quiz has ${questions.length} questions. Each question has one correct answer.`;
    }

    submitBtn.addEventListener("click", function() {
        handleQuizSubmit(questions, quizResult);
    });
}

function handleQuizSubmit(questions, resultEl) {
    let score = 0;
    let attempted = 0;

    questions.forEach((q, idx) => {
        const selected = document.querySelector(`input[name="q${idx}"]:checked`);
        if (selected) {
            attempted++;
            const value = parseInt(selected.value, 10);
            if (value === q.answerIndex) {
                score++;
            }
        }
    });
if (!resultEl) return;

// --- NEW: save quiz result for this student & course ---
const total = questions.length;
const email = getUserEmail();
const courseId = localStorage.getItem("selectedCourseId") || "web-dev";

if (email && getUserRole() === "student") {
  setQuizResultForUser(email, courseId, score, total);
}

resultEl.style.color = "#2563eb";

resultEl.textContent =
  `You scored ${score}/${total}. ` +
  (attempted === 0
    ? "Try answering the questions."
    : score === total
    ? "Perfect score! 🎉 (Saved)"
    : score >= total / 2
    ? "Good job! Keep practicing. 💪 (Result saved)"
    : "Keep learning and try again. 📚 (Result saved)");

}

// ===== CERTIFICATE PAGE INIT ======

function initCertificatePage() {
    const nameEl = document.getElementById("studentName");
    const courseEl = document.getElementById("courseName");
    const dateEl = document.getElementById("issuedDate");

    if (!nameEl || !courseEl || !dateEl) return;

    if (!getUserName() || !getUserRole()) {
        window.location.href = "login.html";
        return;
    }

    const userName = getUserName();
    const courseId = localStorage.getItem("selectedCourseId") || "web-dev";
    const selectedCourse = findCourseById(courseId);

    nameEl.textContent = userName;
    courseEl.textContent = selectedCourse ? selectedCourse.title : "";
    dateEl.textContent = new Date().toLocaleDateString();
}


// ===== PROFILE PAGE INIT ======

function initProfilePage() {
    const nameEl = document.getElementById("profileName");
    const roleEl = document.getElementById("profileRole");
    const emailEl = document.getElementById("profileEmail");
    const joinedEl = document.getElementById("profileJoined");
    const shortEl = document.getElementById("profileShort");

    if (!nameEl || !roleEl || !emailEl || !joinedEl) return;

    if (!getUserRole()) {
        window.location.href = "login.html";
        return;
    }

    const user = getCurrentUser();

    if (user) {
        nameEl.textContent = user.name;
        roleEl.textContent =
            user.role === "student" ?
            "Student" :
            user.role === "teacher" ?
            "Teacher" :
            user.role;
        emailEl.textContent = user.email;
        joinedEl.textContent = user.createdAt ?
            new Date(user.createdAt).toLocaleDateString() :
            "-";
    } else {
        nameEl.textContent = getUserName();
        roleEl.textContent = getUserRole() || "-";
        emailEl.textContent = getUserEmail() || "-";
        joinedEl.textContent = "-";
    }

    if (shortEl) {
        shortEl.textContent = `Hi ${nameEl.textContent}, here are your account details.`;
    }
}


function enrollFromDashboard(courseId) {
  if (getUserRole() !== "student") {
    alert("Only students can enroll.");
    return;
  }
  const email = getUserEmail();
  if (!email) {
    window.location.href = "login.html";
    return;
  }
  enrollInCourse(email, courseId);
  alert("Enrolled in course.");
  window.location.reload();
}


function toggleCompleteLesson(courseId, lessonId) {
  const email = getUserEmail();
  let enrollments = loadEnrollments();
  let entryIndex = enrollments.findIndex(
    (e) => e.email === email && e.courseId === courseId
  );

  if (entryIndex === -1) {
    alert("Please enroll first!");
    return;
  }

  let entry = enrollments[entryIndex];

  entry.completedLessons = entry.completedLessons || [];

  if (entry.completedLessons.includes(lessonId)) {
    // Already completed → Undo
    entry.completedLessons = entry.completedLessons.filter((id) => id !== lessonId);
  } else {
    // Mark completed
    entry.completedLessons.push(lessonId);
  }

  enrollments[entryIndex] = entry;
  saveEnrollments(enrollments);

  // Now update progress
  updateProgress(courseId);

  window.location.reload();
}
function updateProgress(courseId) {
  const email = getUserEmail();
  const enrollments = loadEnrollments();
  const entry = enrollments.find((e) => e.email === email && e.courseId === courseId);
  const course = findCourseById(courseId);

  if (!entry || !course || !course.lessons) return;

  const total = course.lessons.length;
  const done = entry.completedLessons.length;

  const percentage = Math.round((done / total) * 100);

  setCourseProgress(courseId, percentage);
}
function viewStudents(courseId) {
  localStorage.setItem("selectedCourseId", courseId);
  window.location.href = "course-students.html";
}

function initCourseStudents() {
  const titleEl = document.getElementById("courseStudentsTitle");
  const subtitleEl = document.getElementById("courseStudentsSubtitle");
  const tbody = document.getElementById("courseStudentsBody");
  const emptyEl = document.getElementById("courseStudentsEmpty");

  if (!titleEl || !tbody) return; // Not on students page

  // Only teacher can view this page
  if (getUserRole() !== "teacher") {
    window.location.href = "login.html";
    return;
  }

  const courseId = localStorage.getItem("selectedCourseId");
  if (!courseId) {
    titleEl.textContent = "No course selected.";
    return;
  }

  const email = getUserEmail();
  const courses = loadCourses();
  const course = courses.find(
    (c) => c.id === courseId && c.createdBy === email
  );

  if (!course) {
    titleEl.textContent = "Course not found or not owned by you.";
    return;
  }

  titleEl.textContent = "Course: " + course.title;
  subtitleEl.textContent = course.description || "";

  const enrollments = loadEnrollments().filter((e) => e.courseId === courseId);
  const users = loadUsers();

  if (!enrollments.length) {
    tbody.innerHTML = "";
    emptyEl.textContent = "No students have enrolled yet.";
    return;
  }

  emptyEl.textContent = "";

  tbody.innerHTML = enrollments
    .map((enr, index) => {
      const stu = users.find(
        (u) => u.email.toLowerCase() === enr.email.toLowerCase()
      );
      const name = stu ? stu.name : "(Unknown)";

      const progress = getCourseProgressForUser(enr.email, courseId, 0);
      const quizRes = getQuizResultForUser(enr.email, courseId);

      const quizText = quizRes
        ? `${quizRes.score}/${quizRes.total}`
        : "Not attempted";

      return `
        <tr>
          <td>${index + 1}</td>
          <td>${name}</td>
          <td>${enr.email}</td>
          <td>${progress}%</td>
          <td>${quizText}</td>
        </tr>
      `;
    })
    .join("");
}


// ===== GLOBAL INIT ======

document.addEventListener("DOMContentLoaded", function () {
  initLoginPage();
  initRegisterPage();
  initStudentDashboard();
  initTeacherDashboard();
  initAdminDashboard();
  initCourseDetails();
  initQuiz();
  initCertificatePage();
  initProfilePage();
  initManageLessons();
  initCourseStudents(); 
  initManageQuiz();
});