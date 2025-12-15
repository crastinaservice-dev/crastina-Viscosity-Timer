// Configuration
const configs = {
    shift: {
        defaultTime: 180, 
        text: "Warm Amber. Transition gently.",
        className: "theme-shift"
    },
    overload: {
        defaultTime: 90, 
        text: "Cool Cyan. Deep freeze.",
        className: "theme-overload"
    }
};

// Global State
let currentMode = '';
let totalSeconds = 180;
let remainingSeconds = 180;
let timerInterval = null;
let isRunning = false;
let audioCtx = null; // 音效核心

// DOM Elements
const body = document.body;
const timerDisplay = document.getElementById('timer-display');
const phaseTitle = document.getElementById('phase-title');
const instructionText = document.getElementById('instruction-text');
const actionBtn = document.getElementById('action-btn');
const btnShift = document.getElementById('btn-shift');
const btnOverload = document.getElementById('btn-overload');

// --- 音效引擎 (Web Audio API) ---
// 瀏覽器通常需要使用者互動(點擊)後才能播放聲音，所以我們在 Start 時初始化
function initAudio() {
    if (!audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContext();
    }
    // 恢復 suspended 的 context (這是 Chrome 的常見限制)
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function playBellSound() {
    if (!audioCtx) return;

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    // 設定聲音類型：Sine (正弦波) 最像頌缽/鐘聲
    oscillator.type = 'sine';
    
    // 設定頻率：Crastina 風格應該低沈一點 (例如 432Hz 或 528Hz，這裡選 440Hz A4 標準音稍微降一點)
    oscillator.frequency.setValueAtTime(432, audioCtx.currentTime); // 432Hz 更有冥想感
    
    // 音量控制：模擬敲擊後的自然衰減 (Envelope)
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.1); // 快速達到最大音量
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 4); // 4秒內緩慢消失

    // 連接線路
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    // 播放
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 4); // 4秒後停止
}
// ------------------------------

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
}

function adjustTime(amount) {
    if (isRunning) return; 

    totalSeconds += amount;
    if (totalSeconds < 10) totalSeconds = 10; // 測試方便改小一點，正式可改回30
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
        resetTimer();
        return;
    }

    // 關鍵：初始化音效系統
    initAudio();

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

function completeTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    phaseTitle.innerText = "Done";
    instructionText.innerText = "Ritual Complete.";
    actionBtn.innerText = "Reset";
    
    // 播放聲音
    playBellSound();

    // 震動 (手機)
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
}

actionBtn.addEventListener('click', startTimer);

window.onload = function() {
    setMode('shift');
};
