// Configuration Data
const configs = {
    shift: {
        defaultTime: 180, // 3 mins
        text: "Warm Amber. Transition gently.",
        colorClass: "theme-shift"
    },
    overload: {
        defaultTime: 90, // 1.5 mins
        text: "Cool Cyan. Deep freeze.",
        colorClass: "theme-overload"
    }
};

// Global State
let currentMode = 'shift';
let totalSeconds = configs.shift.defaultTime;
let remainingSeconds = totalSeconds;
let timerInterval = null;
let isRunning = false;

// DOM Elements
const body = document.body;
const timerDisplay = document.getElementById('timer-display');
const phaseTitle = document.getElementById('phase-title');
const instructionText = document.getElementById('instruction-text');
const actionBtn = document.getElementById('action-btn');
const btnShift = document.getElementById('btn-shift');
const btnOverload = document.getElementById('btn-overload');

// Init
updateDisplay();

function setMode(mode) {
    if (isRunning) return; // 執行中不給切換

    currentMode = mode;
    
    // Update Theme Colors
    body.className = configs[mode].colorClass;

    // Update Buttons UI
    btnShift.classList.toggle('active', mode === 'shift');
    btnOverload.classList.toggle('active', mode === 'overload');

    // Reset Time to Default for that mode
    totalSeconds = configs[mode].defaultTime;
    remainingSeconds = totalSeconds;
    
    // Update Texts
    instructionText.innerText = configs[mode].text;
    updateDisplay();
}

function adjustTime(amount) {
    if (isRunning) return; // 執行中不給調整

    totalSeconds += amount;
    // 限制時間：最少 30秒，最多 60分鐘
    if (totalSeconds < 30) totalSeconds = 30;
    if (totalSeconds > 3600) totalSeconds = 3600;
    
    remainingSeconds = totalSeconds;
    updateDisplay();
}

function updateDisplay() {
    const mins = Math.floor(remainingSeconds / 60);
    const secs = remainingSeconds % 60;
    timerDisplay.innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function startTimer() {
    if (isRunning) {
        // User clicked STOP
        resetTimer();
        return;
    }

    // START
    isRunning = true;
    actionBtn.innerText = "Stop";
    phaseTitle.innerText = "Flow";
    instructionText.innerText = "Follow the oil. Breathe.";

    timerInterval = setInterval(() => {
        remainingSeconds--;
        updateDisplay();

        if (remainingSeconds <= 0) {
            completeTimer();
        }
    }, 1000);
}

function completeTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    phaseTitle.innerText = "Done";
    instructionText.innerText = "Ritual Complete.";
    actionBtn.innerText = "Reset";
    
    // 簡單的震動 (Mobile)
    if (navigator.vibrate) navigator.vibrate([200]);
}

function resetTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    remainingSeconds = totalSeconds; // 重置回設定的時間
    actionBtn.innerText = "Start Ritual";
    phaseTitle.innerText = "Ready";
    instructionText.innerText = configs[currentMode].text;
    updateDisplay();
}

// Button Listener (already in HTML onclick, but kept for safety)
actionBtn.addEventListener('click', startTimer);
