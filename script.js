let [milliseconds, seconds, minutes, hours] = [0, 0, 0, 0];
let displayTime = document.getElementById("displayTime");
let splitTime = document.getElementById("splitTime");
let lapsContainer = document.getElementById("laps");
let timer = null;
let lapTimes = [];
let lastLapTime = 0;

// Theme handling
const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
let currentTheme = localStorage.getItem("theme") || (prefersDarkScheme.matches ? "dark" : "light");
document.body.classList.toggle("light-theme", currentTheme === "light");

function toggleTheme() {
    currentTheme = currentTheme === "light" ? "dark" : "light";
    document.body.classList.toggle("light-theme");
    localStorage.setItem("theme", currentTheme);
}

function formatTime(ms, sec, min, hr) {
    return `${hr.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}.${Math.floor(ms/10).toString().padStart(2, '0')}`;
}

function calculateTotalMs() {
    return milliseconds + (seconds * 1000) + (minutes * 60000) + (hours * 3600000);
}

function stopwatch() {
    milliseconds += 10;
    if (milliseconds === 1000) {
        milliseconds = 0;
        seconds++;
        if (seconds === 60) {
            seconds = 0;
            minutes++;
            if (minutes === 60) {
                minutes = 0;
                hours++;
            }
        }
    }

    displayTime.innerHTML = formatTime(milliseconds, seconds, minutes, hours);
    updateSplitTime();
}

function updateSplitTime() {
    if (lapTimes.length > 0) {
        const totalTime = calculateTotalMs();
        const splitMs = totalTime - lastLapTime;
        const splitHr = Math.floor(splitMs / 3600000);
        const splitMin = Math.floor((splitMs % 3600000) / 60000);
        const splitSec = Math.floor((splitMs % 60000) / 1000);
        const splitMillisec = splitMs % 1000;
        splitTime.innerHTML = `Split: ${formatTime(splitMillisec, splitSec, splitMin, splitHr)}`;
    }
}

function watchstart() {
    if (timer !== null) return;
    timer = setInterval(stopwatch, 10);
    document.getElementById("startBtn").classList.add("hidden");
    document.getElementById("pauseBtn").classList.remove("hidden");
}

function watchstop() {
    clearInterval(timer);
    timer = null;
    document.getElementById("startBtn").classList.remove("hidden");
    document.getElementById("pauseBtn").classList.add("hidden");
}

function watchReset() {
    clearInterval(timer);
    timer = null;
    [milliseconds, seconds, minutes, hours] = [0, 0, 0, 0];
    displayTime.innerHTML = "00:00:00.00";
    splitTime.innerHTML = "Split: 00:00:00.00";
    lapsContainer.innerHTML = "";
    lapTimes = [];
    lastLapTime = 0;
    document.getElementById("startBtn").classList.remove("hidden");
    document.getElementById("pauseBtn").classList.add("hidden");
}

function addLap() {
    if (!timer) return;
    
    const currentTime = calculateTotalMs();
    const lapTime = currentTime - lastLapTime;
    lastLapTime = currentTime;
    
    const lap = document.createElement("div");
    lap.classList.add("lap");
    
    const lapNumber = document.createElement("span");
    lapNumber.textContent = `${lapTimes.length + 1}`;
    
    const splitTimeSpan = document.createElement("span");
    splitTimeSpan.textContent = displayTime.innerHTML;
    
    const lapTimeSpan = document.createElement("span");
    const lapHr = Math.floor(lapTime / 3600000);
    const lapMin = Math.floor((lapTime % 3600000) / 60000);
    const lapSec = Math.floor((lapTime % 60000) / 1000);
    const lapMs = lapTime % 1000;
    lapTimeSpan.textContent = formatTime(lapMs, lapSec, lapMin, lapHr);
    
    lap.appendChild(lapNumber);
    lap.appendChild(splitTimeSpan);
    lap.appendChild(lapTimeSpan);
    
    lapTimes.push(lapTime);
    
    // Highlight fastest/slowest laps
    if (lapTimes.length > 1) {
        const fastest = Math.min(...lapTimes);
        const slowest = Math.max(...lapTimes);
        if (lapTime === fastest) lap.classList.add("fastest-lap");
        if (lapTime === slowest) lap.classList.add("slowest-lap");
    }
    
    lapsContainer.insertBefore(lap, lapsContainer.firstChild);
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        timer ? watchstop() : watchstart();
    } else if (e.code === 'KeyR') {
        watchReset();
    } else if (e.code === 'KeyL') {
        addLap();
    }
});
