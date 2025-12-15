// Configuration
const configs = {
    shift: {
        defaultTime: 180, 
        text: "Amber Mode. Gentle transition.",
        className: "theme-shift"
    },
    overload: {
        defaultTime: 90, 
        text: "Cyan Mode. Deep focus.",
        className: "theme-overload"
    }
};

// Global State
let currentMode = '';
let totalSeconds = 180;
let remainingSeconds = 180;
let timerInterval = null;
let isRunning = false;
let audioCtx = null;

// DOM Elements
const body = document.body;
const timerDisplay = document.getElementById('timer-display');
const phaseTitle = document.getElementById('phase-title');
const instructionText = document.getElementById('instruction-text');
const actionBtn = document.getElementById('action-btn');
const btnShift = document.getElementById('btn-shift');
const btnOverload = document.getElementById('btn-overload');

// Hourglass Visual Elements
const liquidTop = document.getElementById('liquid-top');
const liquidBottom = document.getElementById('liquid-bottom');
const streamLine = document.getElementById('stream-line');

// Audio Engine (Singing Bowl)
function initAudio() {
    if (!audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function playBellSound() {
    if (!audioCtx) return;
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(432, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 4);
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 4);
}

// Function: Update Liquid Heights based on Time
function updateVisuals() {
    // 計算剩餘百分比 (0.0 ~ 1.0)
    const percentageLeft = remainingSeconds / totalSeconds;
    const percentageDone = 1 - percentageLeft;

    // 上面的液體：剩多少就有多高 (100% -> 0%)
    liquidTop.style.height = `${percentageLeft * 100}%`;

    // 下面的液體：過多少就有多高 (0% -> 100%)
    liquidBottom.style.height = `${percentageDone * 100}%`;

    // 控制流動線 (有在跑且還有時間才顯示)
    if (isRunning && remainingSeconds > 0) {
        streamLine.style.opacity = '1';
        // 讓流動線稍微有點動態高度，連接上下
        streamLine.style.height = '140%'; // 延伸到下瓶
    } else {
        streamLine.style.opacity = '0';
    }
}

function setMode(mode) {
    if (isRunning) return;

    currentMode = mode;
    body.classList.remove('theme-shift', 'theme-overload');
    body.classList.add(configs[mode].className);

    btnShift.classList.toggle('active', mode === 'shift');
    btnOverload.classList.toggle('active', mode === 'overload');

    totalSeconds = configs[mode].defaultTime;
    remainingSeconds = totalSeconds;
    
    instructionText.innerText = configs[mode].text;
    phaseTitle.innerText = "Ready";
    actionBtn.innerText = "Start Ritual";
    
    updateDisplay();
    updateVisuals(); // 確保畫面重置時液體也是滿的
}

function adjustTime(amount) {
    if (isRunning) return; 

    totalSeconds += amount;
    if (totalSeconds < 10) totalSeconds = 10;
    if (totalSeconds > 3600) totalSeconds = 3600;
    
    remainingSeconds = totalSeconds;
    updateDisplay();
    updateVisuals(); // 調整時間時，視覺也要跟著變 (例如重置回滿)
}

function updateDisplay() {
    const mins = Math.floor(remainingSeconds / 60);
    const secs = remainingSeconds % 60;
    timerDisplay.innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function startTimer() {
    if (isRunning) {
        resetTimer();
        return;
    }

    initAudio();
    isRunning = true;
    actionBtn.innerText = "Stop";
    phaseTitle.innerText = "Focus";
    instructionText.innerText = "Watch the flow. Be here.";
    
    updateVisuals(); // 啟動流動線

    timerInterval = setInterval(() => {
        remainingSeconds--;
        updateDisplay();
        updateVisuals(); // 每秒更新液體高度

        if (remainingSeconds <= 0) {
            completeTimer();
        }
    }, 1000);
}

function completeTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    phaseTitle.innerText = "Done";
    instructionText.innerText = "Time restored.";
    actionBtn.innerText = "Reset";
    
    updateVisuals(); // 關閉流動線
    playBellSound();
    if (navigator.vibrate) navigator.vibrate([500]);
}

function resetTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    remainingSeconds = totalSeconds; 
    actionBtn.innerText = "Start Ritual";
    phaseTitle.innerText = "Ready";
    instructionText.innerText = configs[currentMode].text;
    updateDisplay();
    updateVisuals();
}

actionBtn.addEventListener('click', startTimer);

window.onload = function() {
    setMode('shift');
};
