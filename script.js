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
const liquidTop = document.getElementById('liquid-top');
const liquidBottom = document.getElementById('liquid-bottom');
const streamLine = document.getElementById('stream-line');

// Audio
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

// Visual Update Logic
function updateVisuals() {
    const percentageLeft = remainingSeconds / totalSeconds;
    const percentageDone = 1 - percentageLeft;

    liquidTop.style.height = `${percentageLeft * 100}%`;
    liquidBottom.style.height = `${percentageDone * 100}%`;

    // 只有在跑動時才顯示水流
    if (isRunning && remainingSeconds > 0) {
        streamLine.style.opacity = '1';
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
    updateVisuals();
}

function adjustTime(amount) {
    if (isRunning) return; 

    totalSeconds += amount;
    if (totalSeconds < 10) totalSeconds = 10;
    if (totalSeconds > 3600) totalSeconds = 3600;
    
    remainingSeconds = totalSeconds;
    updateDisplay();
    updateVisuals();
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
    instructionText.innerText = "Watch the flow.";
    
    // 立即顯示水流
    streamLine.style.opacity = '1';

    timerInterval = setInterval(() => {
        remainingSeconds--;
        updateDisplay();
        updateVisuals();

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
    
    streamLine.style.opacity = '0'; // 關閉水流
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
    // 強制重繪一次，確保液體出現
    setTimeout(updateVisuals, 100);
};
