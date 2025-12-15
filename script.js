// Configuration: 定義兩種模式的參數
const configs = {
    shift: {
        totalTime: 180, // 3分鐘
        name: "Shift Reset",
        phases: [
            { end: 170, title: "Pause", text: "Cut the noise. Warm the oil in your hands." }, // 前10秒
            { end: 30, title: "Breathe", text: "Inhale the gap. Focus on the scent." },      // 中間主要時間
            { end: 0, title: "Flow", text: "Wipe it off. Return to yourself." }               // 最後30秒
        ],
        animationSpeed: "6s" // 呼吸速度
    },
    overload: {
        totalTime: 90, // 1.5分鐘
        name: "Overload Reset",
        phases: [
            { end: 80, title: "Stop", text: "Freeze. Feel the cold glass of the bottle." },
            { end: 10, title: "Grounding", text: "Deep pressure. Feel the weight." },
            { end: 0, title: "Here & Now", text: "Press down. Anchor yourself." }
        ],
        animationSpeed: "10s" // 極慢速，強迫鎮靜
    }
};

let currentMode = 'shift';
let timeLeft = configs.shift.totalTime;
let timerInterval = null;
let isRunning = false;

// DOM Elements
const timerDisplay = document.getElementById('timer-display');
const phaseTitle = document.getElementById('phase-title');
const instructionText = document.getElementById('instruction-text');
const actionBtn = document.getElementById('action-btn');
const mainOrb = document.querySelector('.main-orb');
const modeBtns = document.querySelectorAll('.mode-btn');

// Initialize
updateDisplay(timeLeft);

function setMode(mode) {
    if (isRunning) resetTimer(); // 如果正在跑，切換模式要先重置
    
    currentMode = mode;
    timeLeft = configs[mode].totalTime;
    
    // Update Buttons UI
    modeBtns.forEach(btn => {
        btn.classList.remove('active');
        if(btn.dataset.mode === mode) btn.classList.add('active');
    });

    // Reset Text
    phaseTitle.innerText = "Ready";
    instructionText.innerText = mode === 'shift' ? "Transition from work to life." : "Emergency brake for your mind.";
    
    // Adjust Animation Speed based on mode
    mainOrb.style.animationDuration = configs[mode].animationSpeed;
    
    updateDisplay(timeLeft);
}

function updateDisplay(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    timerDisplay.innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function startTimer() {
    if (isRunning) {
        resetTimer();
        return;
    }

    isRunning = true;
    actionBtn.innerText = "Stop Ritual";
    
    // Start the countdown
    timerInterval = setInterval(() => {
        timeLeft--;
        updateDisplay(timeLeft);
        checkPhase(timeLeft);

        if (timeLeft <= 0) {
            completeTimer();
        }
    }, 1000);
    
    // Initial Phase Check
    checkPhase(timeLeft);
}

function checkPhase(currentTime) {
    const config = configs[currentMode];
    // Find which phase we are in
    const currentPhase = config.phases.find(p => currentTime > p.end) || config.phases[config.phases.length - 1];
    
    if (currentPhase) {
        phaseTitle.innerText = currentPhase.title;
        instructionText.innerText = currentPhase.text;
    }
}

function completeTimer() {
    clearInterval(timerInterval);
    phaseTitle.innerText = "Completed";
    instructionText.innerText = "Carry this calmness forward.";
    actionBtn.innerText = "Reset";
    isRunning = false;
    
    // Haptic feedback if available (Mobile only)
    if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]); // 兩次震動提醒結束
    }
}

function resetTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    timeLeft = configs[currentMode].totalTime;
    actionBtn.innerText = "Start Ritual";
    setMode(currentMode); // Reset texts
}

// Event Listener
actionBtn.addEventListener('click', startTimer);