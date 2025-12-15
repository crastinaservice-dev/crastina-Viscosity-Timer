// Configuration Data
const configs = {
    shift: {
        defaultTime: 180, // 3 mins
        text: "Warm Amber. Transition gently.",
        className: "theme-shift" // 對應 CSS 的 class
    },
    overload: {
        defaultTime: 90, // 1.5 mins
        text: "Cool Cyan. Deep freeze.",
        className: "theme-overload" // 對應 CSS 的 class
    }
};

// Global State
let currentMode = ''; // 初始為空
let totalSeconds = 180;
let remainingSeconds = 180;
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

// Function: 切換模式
function setMode(mode) {
    if (isRunning) return; // 執行中不給切換

    currentMode = mode;
    
    // 1. 強制移除所有主題 Class，再加入新的
    body.classList.remove('theme-shift', 'theme-overload');
    body.classList.add(configs[mode].className);

    // 2. 更新按鈕狀態
    btnShift.classList.toggle('active', mode === 'shift');
    btnOverload.classList.toggle('active', mode === 'overload');

    // 3. 重置時間
    totalSeconds = configs[mode].defaultTime;
    remainingSeconds = totalSeconds;
    
    // 4. 更新文字
    instructionText.innerText = configs[mode].text;
    phaseTitle.innerText = "Ready";
    actionBtn.innerText = "Start Ritual";
    
    updateDisplay();
}

// Function: 調整時間 (+/-)
function adjustTime(amount) {
    if (isRunning) return; 

    totalSeconds += amount;
    if (totalSeconds < 30) totalSeconds = 30; // 最少 30秒
    if (totalSeconds > 3600) totalSeconds = 3600; // 最多 60分
    
    remainingSeconds = totalSeconds;
    updateDisplay();
}

// Function: 更新顯示 00:00
function updateDisplay() {
    const mins = Math.floor(remainingSeconds / 60);
    const secs = remainingSeconds % 60;
    timerDisplay.innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Function: 開始計時
function startTimer() {
    if (isRunning) {
        // Stop logic
        resetTimer();
        return;
    }

    // Start logic
    isRunning = true;
    actionBtn.innerText = "Stop";
    phaseTitle.innerText = "Flow";
    instructionText.innerText = currentMode === 'shift' ? "Follow the oil. Breathe." : "Ground yourself. Press down.";

    timerInterval = setInterval(() => {
        remainingSeconds--;
        updateDisplay();

        if (remainingSeconds <= 0) {
            completeTimer();
        }
    }, 1000);
}

// Function: 結束
function completeTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    phaseTitle.innerText = "Done";
    instructionText.innerText = "Ritual Complete.";
    actionBtn.innerText = "Reset";
    
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
}

// Function: 重置
function resetTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    // 重置回當前設定的時間
    remainingSeconds = totalSeconds; 
    actionBtn.innerText = "Start Ritual";
    phaseTitle.innerText = "Ready";
    instructionText.innerText = configs[currentMode].text;
    updateDisplay();
}

// Bind Events
actionBtn.addEventListener('click', startTimer);

// 【關鍵修正】頁面載入後，強制執行一次 Shift 模式初始化
window.onload = function() {
    setMode('shift');
};
