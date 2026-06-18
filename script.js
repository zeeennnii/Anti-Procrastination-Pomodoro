// =========================
// ELEMENT REFERENCES
// =========================

const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");

const timerDisplay = document.getElementById("timer");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");

const sessionCount = document.getElementById("sessionCount");
const quote = document.getElementById("quote");

// =========================
// MOTIVATIONAL QUOTES
// =========================

const quotes = [
    "Discipline beats motivation.",
    "Small progress is still progress.",
    "One Pomodoro at a time.",
    "Keep going. You're building momentum.",
    "Done is better than perfect.",
    "Success starts with showing up.",
    "Focus on progress, not perfection.",
    "Consistency creates results."
];

// =========================
// LOCAL STORAGE
// =========================

let sessions = Number(localStorage.getItem("sessions")) || 0;
sessionCount.textContent = sessions;

loadTasks();
showRandomQuote();

// =========================
// ADD TASK
// =========================

addTaskBtn.addEventListener("click", addTask);

taskInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        addTask();
    }
});

function addTask() {
    const text = taskInput.value.trim();

    if (text === "") return;

    createTask(text, false);

    taskInput.value = "";

    saveTasks();
}

// =========================
// CREATE TASK
// =========================

function createTask(text, completed) {

    const li = document.createElement("li");

    if (completed) {
        li.classList.add("completed");
    }

    const span = document.createElement("span");
    span.textContent = text;

    span.addEventListener("click", function () {
        li.classList.toggle("completed");
        saveTasks();
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";

    deleteBtn.addEventListener("click", function () {
        li.remove();
        saveTasks();
    });

    li.appendChild(span);
    li.appendChild(deleteBtn);

    taskList.appendChild(li);
}

// =========================
// SAVE TASKS
// =========================

function saveTasks() {

    const tasks = [];

    document.querySelectorAll("#taskList li").forEach(function (li) {

        tasks.push({

            text: li.querySelector("span").textContent,

            completed: li.classList.contains("completed")

        });

    });

    localStorage.setItem("tasks", JSON.stringify(tasks));

}

// =========================
// LOAD TASKS
// =========================

function loadTasks() {

    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];

    tasks.forEach(function (task) {

        createTask(task.text, task.completed);

    });

}

// =========================
// RANDOM QUOTE
// =========================

function showRandomQuote() {

    const random = Math.floor(Math.random() * quotes.length);

    quote.textContent = quotes[random];

}

// =========================
// TIMER
// =========================

let time = 25 * 60;
let timer = null;

updateTimer();

function updateTimer() {

    const minutes = Math.floor(time / 60);
    const seconds = time % 60;

    timerDisplay.textContent =
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

}

// =========================
// START TIMER
// =========================

startBtn.addEventListener("click", function () {

    if (timer !== null) return;

    timer = setInterval(function () {

        if (time > 0) {

            time--;
            updateTimer();

        } else {

            clearInterval(timer);
            timer = null;

            alert("🎉 Pomodoro Complete!");

            sessions++;
            sessionCount.textContent = sessions;

            localStorage.setItem("sessions", sessions);

            showRandomQuote();

        }

    }, 1000);

});

// =========================
// PAUSE TIMER
// =========================

pauseBtn.addEventListener("click", function () {

    clearInterval(timer);
    timer = null;

});

// =========================
// RESET TIMER
// =========================

resetBtn.addEventListener("click", function () {

    clearInterval(timer);

    timer = null;

    time = 25 * 60;

    updateTimer();

});