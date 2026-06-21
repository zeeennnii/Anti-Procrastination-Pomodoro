// =========================================
// LOGIN
// =========================================

const loginScreen = document.getElementById("loginScreen");
const appContent = document.getElementById("appContent");
const usernameInput = document.getElementById("usernameInput");
const passwordInput = document.getElementById("passwordInput");
const loginBtn = document.getElementById("loginBtn");
const loginError = document.getElementById("loginError");
const logoutBtn = document.getElementById("logoutBtn");

const togglePasswordBtn = document.getElementById("togglePasswordBtn");
const eyeIcon = document.getElementById("eyeIcon");

const VALID_USERNAME = "admin";
const VALID_PASSWORD = "procrastinator";

const EYE_OPEN =
    '<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"></path><circle cx="12" cy="12" r="3"></circle>';

const EYE_CLOSED =
    '<path d="M3 3l18 18"></path>' +
    '<path d="M10.58 10.58a2 2 0 002.83 2.83"></path>' +
    '<path d="M9.88 4.24A9.12 9.12 0 0112 4c7 0 11 7 11 7a13.16 13.16 0 01-1.67 2.68"></path>' +
    '<path d="M6.61 6.61A13.16 13.16 0 001 12s4 7 11 7a9.16 9.16 0 005.39-1.61"></path>';

togglePasswordBtn.addEventListener("click", function () {
    const isHidden = passwordInput.type === "password";
    passwordInput.type = isHidden ? "text" : "password";
    eyeIcon.innerHTML = isHidden ? EYE_CLOSED : EYE_OPEN;
    togglePasswordBtn.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");
});

function checkLogin() {
    if (localStorage.getItem("loggedIn") === "true") {
        loginScreen.classList.add("hidden");
        appContent.classList.remove("hidden");
    } else {
        loginScreen.classList.remove("hidden");
        appContent.classList.add("hidden");
    }
}

loginBtn.addEventListener("click", function () {
    if (usernameInput.value === VALID_USERNAME && passwordInput.value === VALID_PASSWORD) {
        localStorage.setItem("loggedIn", "true");
        loginError.textContent = "";
        passwordInput.value = "";
        checkLogin();
        refreshAllDisplays();
    } else {
        loginError.textContent = "Incorrect username or password.";
    }
});

passwordInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") loginBtn.click();
});

logoutBtn.addEventListener("click", function () {
    localStorage.setItem("loggedIn", "false");
    audioPlayer.pause();
    checkLogin();
});

checkLogin();

// =========================
// ELEMENT REFERENCES
// =========================

const taskInput = document.getElementById("taskInput");
const taskTargetInput = document.getElementById("taskTargetInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");
const activeTaskLabel = document.getElementById("activeTaskLabel");

const timerDisplay = document.getElementById("timer");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");

const focusModeBtn = document.getElementById("focusModeBtn");
const shortBreakBtn = document.getElementById("shortBreakBtn");
const longBreakBtn = document.getElementById("longBreakBtn");

const sessionCountEl = document.getElementById("sessionCount");
const focusStreakEl = document.getElementById("focusStreak");
const shareBtn = document.getElementById("shareBtn");

const quote = document.getElementById("quote");

const musicToggleBtn = document.getElementById("musicToggleBtn");
const audioPlayer = document.getElementById("audioPlayer");

// =========================
// MOTIVATION MODAL
// =========================

const motivationModal = document.getElementById("motivationModal");
const openMotivationModalBtn = document.getElementById("openMotivationModalBtn");
const closeMotivationBtn = document.getElementById("closeMotivationBtn");
const saveMotivationBtn = document.getElementById("saveMotivationBtn");
const motivationInput = document.getElementById("motivationInput");
const motivationList = document.getElementById("motivationList");

const defaultQuotes = [
    "Discipline beats motivation.",
    "Small progress is still progress.",
    "One Pomodoro at a time.",
    "Keep going. You're building momentum.",
    "Done is better than perfect.",
    "Success starts with showing up.",
    "Focus on progress, not perfection.",
    "Consistency creates results."
];

// Saved in localStorage, so these survive refreshes and logouts — they only
// go away if the user deletes them here.
let customQuotes = JSON.parse(localStorage.getItem("customQuotes")) || [];

function getAllQuotes() {
    return defaultQuotes.concat(customQuotes);
}

function showRandomQuote() {
    const all = getAllQuotes();
    const random = Math.floor(Math.random() * all.length);
    quote.textContent = all[random];
}

function renderMotivationList() {
    motivationList.innerHTML = "";

    if (customQuotes.length === 0) {
        const empty = document.createElement("li");
        empty.classList.add("motivation-empty");
        empty.textContent = "No custom quotes yet.";
        motivationList.appendChild(empty);
        return;
    }

    customQuotes.forEach(function (text, index) {
        const li = document.createElement("li");

        const span = document.createElement("span");
        span.classList.add("motivation-text");
        span.textContent = text;

        const deleteBtn = document.createElement("button");
        deleteBtn.classList.add("delete-quote-btn");
        deleteBtn.textContent = "Delete";
        deleteBtn.addEventListener("click", function () {
            customQuotes.splice(index, 1);
            localStorage.setItem("customQuotes", JSON.stringify(customQuotes));
            renderMotivationList();
        });

        li.appendChild(span);
        li.appendChild(deleteBtn);
        motivationList.appendChild(li);
    });
}

openMotivationModalBtn.addEventListener("click", function () {
    motivationInput.value = "";
    renderMotivationList();
    motivationModal.classList.remove("hidden");
});

closeMotivationBtn.addEventListener("click", function () {
    motivationModal.classList.add("hidden");
});

saveMotivationBtn.addEventListener("click", function () {
    const text = motivationInput.value.trim();
    if (text === "") return;

    customQuotes.push(text);
    localStorage.setItem("customQuotes", JSON.stringify(customQuotes));

    motivationInput.value = "";
    renderMotivationList();

    quote.textContent = text;
});

// =========================
// TASKS (with per-task pomodoro progress, e.g. "Pomodoros 0/4")
// =========================

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

let activeTaskId = localStorage.getItem("activeTaskId")
    ? Number(localStorage.getItem("activeTaskId"))
    : null;

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

addTaskBtn.addEventListener("click", addTask);

taskInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") addTask();
});

function addTask() {
    const text = taskInput.value.trim();
    if (text === "") return;

    let target = parseInt(taskTargetInput.value, 10);
    if (isNaN(target) || target < 1) target = 4;

    tasks.push({
        id: Date.now(),
        text: text,
        completed: false,
        pomodoros: 0,
        target: target
    });

    taskInput.value = "";
    taskTargetInput.value = "4";
    saveTasks();
    renderTasks();
}

function setActiveTask(id) {
    activeTaskId = id;
    localStorage.setItem("activeTaskId", id === null ? "" : String(id));

    const task = tasks.find(function (t) { return t.id === id; });
    activeTaskLabel.textContent = task
        ? "Focusing on: " + task.text
        : "No task selected for the timer";

    renderTasks();
}

function renderTasks() {
    taskList.innerHTML = "";

    tasks.forEach(function (task) {

        const li = document.createElement("li");
        if (task.completed) li.classList.add("completed");
        if (task.id === activeTaskId) li.classList.add("active-task");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;
        checkbox.addEventListener("change", function () {
            task.completed = checkbox.checked;
            saveTasks();
            renderTasks();
        });

        const span = document.createElement("span");
        span.classList.add("task-text");
        span.textContent = task.text;

        const badge = document.createElement("span");
        badge.classList.add("pomodoro-badge");
        badge.textContent = "Pomodoros " + (task.pomodoros || 0) + "/" + (task.target || 4);

        const selectBtn = document.createElement("button");
        selectBtn.classList.add("select-btn");
        if (task.id === activeTaskId) {
            selectBtn.classList.add("is-selected");
            selectBtn.textContent = "Selected";
        } else {
            selectBtn.textContent = "Select";
        }
        selectBtn.addEventListener("click", function () {
            setActiveTask(task.id === activeTaskId ? null : task.id);
        });

        const deleteBtn = document.createElement("button");
        deleteBtn.classList.add("delete-btn");
        deleteBtn.textContent = "Delete";
        deleteBtn.addEventListener("click", function () {
            tasks = tasks.filter(function (t) { return t.id !== task.id; });
            if (activeTaskId === task.id) setActiveTask(null);
            saveTasks();
            renderTasks();
        });

        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(badge);
        li.appendChild(selectBtn);
        li.appendChild(deleteBtn);

        taskList.appendChild(li);
    });
}

renderTasks();
if (activeTaskId) setActiveTask(activeTaskId);

// =========================
// DAILY SESSION COUNTER (resets every new day)
// =========================

let sessionsToday = 0;
let focusCycleCount = 0;

function checkNewDay() {
    const today = new Date().toDateString();
    const savedDate = localStorage.getItem("sessionsDate");

    if (savedDate !== today) {
        sessionsToday = 0;
        focusCycleCount = 0;
        localStorage.setItem("sessionsDate", today);
        localStorage.setItem("sessionsToday", "0");
        localStorage.setItem("focusCycleCount", "0");
    } else {
        sessionsToday = Number(localStorage.getItem("sessionsToday")) || 0;
        focusCycleCount = Number(localStorage.getItem("focusCycleCount")) || 0;
    }

    sessionCountEl.textContent = sessionsToday;
}

// =========================
// CONSISTENCY STREAK
// Goes up only once per day, and only on a day where at least 1 full
// pomodoro (focus session) was completed.
// =========================

function checkStreakValidity() {
    const lastDate = localStorage.getItem("lastStreakDate");
    if (!lastDate) return;

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (lastDate !== today.toDateString() && lastDate !== yesterday.toDateString()) {
        localStorage.setItem("consistencyStreak", "0");
    }
}

function displayStreak() {
    const streak = Number(localStorage.getItem("consistencyStreak")) || 0;
    focusStreakEl.textContent = streak + " Days";
}

function updateStreakOnCompletion() {
    const today = new Date().toDateString();
    const lastDate = localStorage.getItem("lastStreakDate");
    let streak = Number(localStorage.getItem("consistencyStreak")) || 0;

    if (lastDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        streak = (lastDate === yesterday.toDateString()) ? streak + 1 : 1;

        localStorage.setItem("lastStreakDate", today);
        localStorage.setItem("consistencyStreak", String(streak));
    }

    displayStreak();
}

checkNewDay();
checkStreakValidity();
displayStreak();
showRandomQuote();

// =========================
// SHARE PROGRESS MODAL
// =========================

const shareModal = document.getElementById("shareModal");
const closeShareBtn = document.getElementById("closeShareBtn");
const shareStreakNumber = document.getElementById("shareStreakNumber");
const shareSubText = document.getElementById("shareSubText");
const savePngBtn = document.getElementById("savePngBtn");
const nativeShareBtn = document.getElementById("nativeShareBtn");
const twitterShareBtn = document.getElementById("twitterShareBtn");
const facebookShareBtn = document.getElementById("facebookShareBtn");
const shareCanvas = document.getElementById("shareCanvas");

function getShareText() {
    const streak = localStorage.getItem("consistencyStreak") || 0;
    return "Try Anti-Procrastination Pomodoro now! I'm on a " + streak +
        "-day streak with " + sessionsToday + " pomodoro(s) done today. Stop procrastinating, start getting things done.";
}

shareBtn.addEventListener("click", function () {
    const streak = localStorage.getItem("consistencyStreak") || 0;
    shareStreakNumber.textContent = streak;
    shareSubText.textContent = sessionsToday + " pomodoro(s) completed today";
    shareModal.classList.remove("hidden");
});

closeShareBtn.addEventListener("click", function () {
    shareModal.classList.add("hidden");
});

function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
}

function drawShareCanvas(streak, todayCount) {
    const ctx = shareCanvas.getContext("2d");
    const w = shareCanvas.width;
    const h = shareCanvas.height;

    ctx.clearRect(0, 0, w, h);

    const bgGradient = ctx.createLinearGradient(0, 0, w, h);
    bgGradient.addColorStop(0, "#105666");
    bgGradient.addColorStop(1, "#0A3323");
    ctx.fillStyle = bgGradient;
    roundRect(ctx, 0, 0, w, h, 36);
    ctx.fill();

    // tomato body
    ctx.save();
    ctx.translate(w / 2, h / 2 - 90);

    ctx.fillStyle = "#839958";
    ctx.beginPath();
    ctx.ellipse(0, -86, 46, 22, 0, 0, Math.PI * 2);
    ctx.fill();

    const tomatoGradient = ctx.createRadialGradient(-25, -30, 10, 0, 0, 110);
    tomatoGradient.addColorStop(0, "#e2756b");
    tomatoGradient.addColorStop(1, "#c14a3c");
    ctx.fillStyle = tomatoGradient;
    ctx.beginPath();
    ctx.ellipse(0, 0, 100, 88, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = "700 34px Poppins, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("• v •", 0, 6);
    ctx.restore();

    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.font = "700 52px Poppins, sans-serif";
    ctx.fillText(streak + "-Day Streak", w / 2, h / 2 + 110);

    ctx.font = "500 24px Inter, sans-serif";
    ctx.fillText(todayCount + " pomodoro(s) completed today", w / 2, h / 2 + 155);

    ctx.fillStyle = "#EDF4F7";
    ctx.font = "italic 500 22px Inter, sans-serif";
    ctx.fillText("Stop procrastinating, start getting things done.", w / 2, h - 50);
}

savePngBtn.addEventListener("click", function () {
    const streak = localStorage.getItem("consistencyStreak") || 0;
    drawShareCanvas(streak, sessionsToday);

    const link = document.createElement("a");
    link.download = "pomodoro-streak.png";
    link.href = shareCanvas.toDataURL("image/png");
    link.click();
});

nativeShareBtn.addEventListener("click", async function () {
    const text = getShareText();

    if (navigator.share) {
        try {
            await navigator.share({ title: "My Pomodoro Progress", text: text, url: window.location.href });
        } catch (err) {
            // user cancelled the share sheet
        }
    } else {
        try {
            await navigator.clipboard.writeText(text);
            alert("Progress copied to clipboard! Paste it anywhere to share.");
        } catch (err) {
            alert(text);
        }
    }
});

twitterShareBtn.addEventListener("click", function () {
    const text = getShareText();
    const url = "https://twitter.com/intent/tweet?text=" + encodeURIComponent(text) +
        "&url=" + encodeURIComponent(window.location.href);
    window.open(url, "_blank");
});

facebookShareBtn.addEventListener("click", function () {
    const text = getShareText();
    const url = "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(window.location.href) +
        "&quote=" + encodeURIComponent(text);
    window.open(url, "_blank");
});

// =========================
// MUSIC PLAYER (up to 10 songs, scrollable carousel)
// =========================
// IMPORTANT: the <audio> tag can only stream a DIRECT audio file link
// (something ending in .mp3, .ogg, or .wav, where the URL itself is the sound
// file). YouTube and SoundCloud page links are webpages, not audio files, so
// they will never play here — that's a browser limitation, not a bug.
// The most reliable option is to upload your own .mp3 files into this GitHub
// repo (e.g. in an "assets" folder) and use that relative path as the link.

const musicCarousel = document.getElementById("musicCarousel");
const openAddSongModalBtn = document.getElementById("openAddSongModalBtn");

const addSongModal = document.getElementById("addSongModal");
const closeSongModalBtn = document.getElementById("closeSongModalBtn");
const saveSongBtn = document.getElementById("saveSongBtn");
const songTitleInput = document.getElementById("songTitleInput");
const songUrlInput = document.getElementById("songUrlInput");
const songArtInput = document.getElementById("songArtInput");

const DEFAULT_ART = "https://placehold.co/56x56/105666/EDF4F7?text=%E2%99%AB";
const MAX_SONGS = 10;

const DEFAULT_SONG = {
    id: "default",
    title: "Lo-fi Focus Beats (sample track)",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    art: DEFAULT_ART
};

let songs = JSON.parse(localStorage.getItem("customSongs")) || [];
if (songs.length === 0) songs = [DEFAULT_SONG];

let activeSongId = localStorage.getItem("activeSongId") || songs[0].id;
if (!songs.find(function (s) { return s.id === activeSongId; })) {
    activeSongId = songs[0].id;
}

function saveSongs() {
    localStorage.setItem("customSongs", JSON.stringify(songs));
}

function renderSongList() {
    musicCarousel.innerHTML = "";

    songs.forEach(function (song) {
        const item = document.createElement("div");
        item.classList.add("music-item");
        if (song.id === activeSongId) item.classList.add("is-active");

        const thumb = document.createElement("img");
        thumb.src = song.art || DEFAULT_ART;
        thumb.alt = "Cover";

        const titleEl = document.createElement("span");
        titleEl.textContent = song.title;

        item.appendChild(thumb);
        item.appendChild(titleEl);

        item.addEventListener("click", function () {
            loadSong(song.id, true);
        });

        musicCarousel.appendChild(item);
    });

    updateCarouselFocus();
}

// Visual-only: blurs and shrinks items the further they sit from the
// carousel's vertical center. This never touches playback.
function updateCarouselFocus() {
    const items = musicCarousel.querySelectorAll(".music-item");
    const containerRect = musicCarousel.getBoundingClientRect();
    const containerCenter = containerRect.top + containerRect.height / 2;

    items.forEach(function (item) {
        const rect = item.getBoundingClientRect();
        const itemCenter = rect.top + rect.height / 2;
        const distance = Math.abs(itemCenter - containerCenter);
        const ratio = Math.min(distance / (containerRect.height / 2 + 1), 1);

        item.style.filter = "blur(" + (ratio * 3.5).toFixed(2) + "px)";
        item.style.transform = "scale(" + (1 - ratio * 0.3).toFixed(2) + ")";
        item.style.opacity = (1 - ratio * 0.5).toFixed(2);
    });
}

let carouselFrame = null;
musicCarousel.addEventListener("scroll", function () {
    // Scrolling only updates the blur/scale look — it never starts, stops,
    // or swaps the currently playing track.
    if (carouselFrame) return;
    carouselFrame = requestAnimationFrame(function () {
        updateCarouselFocus();
        carouselFrame = null;
    });
});

function loadSong(id, autoplay) {
    const song = songs.find(function (s) { return s.id === id; });
    if (!song) return;

    activeSongId = id;
    localStorage.setItem("activeSongId", id);

    audioPlayer.src = song.url;
    audioPlayer.load();

    renderSongList();

    const activeEl = musicCarousel.querySelector(".is-active");
    if (activeEl) activeEl.scrollIntoView({ behavior: "smooth", block: "center" });

    if (autoplay) playCurrentSong();
}

function playCurrentSong() {
    const playPromise = audioPlayer.play();
    if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
            alert("This link can't be played here. Please use a direct audio file link " +
                "(ending in .mp3, .ogg, or .wav) — YouTube and SoundCloud page links aren't supported.");
        });
    }
}

// The button text is driven by the audio element's own events, so it always
// matches reality even if play() fails or the source is invalid.
audioPlayer.addEventListener("play", function () {
    musicToggleBtn.textContent = "Pause";
});

audioPlayer.addEventListener("pause", function () {
    musicToggleBtn.textContent = "Play";
});

audioPlayer.addEventListener("error", function () {
    musicToggleBtn.textContent = "Play";
});

musicToggleBtn.addEventListener("click", function () {
    if (audioPlayer.paused) {
        playCurrentSong();
    } else {
        audioPlayer.pause();
    }
});

openAddSongModalBtn.addEventListener("click", function () {
    if (songs.length >= MAX_SONGS) {
        alert("You can only add up to 10 songs.");
        return;
    }
    songTitleInput.value = "";
    songUrlInput.value = "";
    songArtInput.value = "";
    addSongModal.classList.remove("hidden");
});

closeSongModalBtn.addEventListener("click", function () {
    addSongModal.classList.add("hidden");
});

saveSongBtn.addEventListener("click", function () {
    const title = songTitleInput.value.trim();
    const url = songUrlInput.value.trim();
    const art = songArtInput.value.trim();

    if (title === "" || url === "") return;

    songs.push({
        id: "song-" + Date.now(),
        title: title,
        url: url,
        art: art || DEFAULT_ART
    });

    saveSongs();
    addSongModal.classList.add("hidden");
    renderSongList();
});

audioPlayer.src = songs.find(function (s) { return s.id === activeSongId; }).url;
renderSongList();

// =========================
// TIMER (Focus / Short Break / Long Break)
// =========================

const FOCUS_TIME = 25 * 60;
const SHORT_BREAK_TIME = 5 * 60;
const LONG_BREAK_TIME = 15 * 60;

let mode = "focus";
let time = FOCUS_TIME;
let timer = null;

function updateTimer() {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;

    timerDisplay.textContent =
        String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
}

function updateModeButtons() {
    [focusModeBtn, shortBreakBtn, longBreakBtn].forEach(function (btn) {
        btn.classList.remove("active");
    });

    if (mode === "focus") focusModeBtn.classList.add("active");
    if (mode === "short") shortBreakBtn.classList.add("active");
    if (mode === "long") longBreakBtn.classList.add("active");
}

function setMode(newMode) {
    clearInterval(timer);
    timer = null;
    mode = newMode;

    if (mode === "focus") time = FOCUS_TIME;
    else if (mode === "short") time = SHORT_BREAK_TIME;
    else if (mode === "long") time = LONG_BREAK_TIME;

    updateTimer();
    updateModeButtons();
}

focusModeBtn.addEventListener("click", function () { setMode("focus"); });
shortBreakBtn.addEventListener("click", function () { setMode("short"); });
longBreakBtn.addEventListener("click", function () { setMode("long"); });

updateTimer();
updateModeButtons();

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
            handleSessionComplete();
        }

    }, 1000);
});

function handleSessionComplete() {

    if (mode === "focus") {

        sessionsToday++;
        sessionCountEl.textContent = sessionsToday;
        localStorage.setItem("sessionsToday", String(sessionsToday));

        focusCycleCount++;
        localStorage.setItem("focusCycleCount", String(focusCycleCount));

        updateStreakOnCompletion();

        // If the user forgot to select a task, credit the first task in the list instead.
        const creditedTask = activeTaskId
            ? tasks.find(function (t) { return t.id === activeTaskId; })
            : tasks[0];

        if (creditedTask) {
            creditedTask.pomodoros = (creditedTask.pomodoros || 0) + 1;
            saveTasks();
            renderTasks();
        }

        showRandomQuote();
        alert("Pomodoro complete! Time for a break.");

        setMode(focusCycleCount % 4 === 0 ? "long" : "short");

    } else {
        alert("Break is over. Back to focus!");
        setMode("focus");
    }
}

// =========================
// PAUSE TIMER
// =========================

pauseBtn.addEventListener("click", function () {
    clearInterval(timer);
    timer = null;
});

// =========================
// RESET TIMER
// (Resets the clock for the current mode only — pomodoro counts, tasks, and
// streaks are untouched, and they also survive a full page refresh.)
// =========================

resetBtn.addEventListener("click", function () {
    setMode(mode);
});

// =========================
// HOW TO USE TOGGLE
// =========================

const howToToggleBtn = document.getElementById("howToToggleBtn");
const howToContent = document.getElementById("howToContent");

howToToggleBtn.addEventListener("click", function () {
    const isHidden = howToContent.classList.contains("hidden");
    howToContent.classList.toggle("hidden");
    howToToggleBtn.textContent = isHidden ? "Hide Instructions" : "How to Use";
});

// =========================
// Helper used after logging in, so stats reflect immediately
// =========================

function refreshAllDisplays() {
    checkNewDay();
    checkStreakValidity();
    displayStreak();
    renderTasks();
}
