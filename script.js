/**
 * PROCRASTINATION STATION - Logic Core v2.0
 * Now with Smart Auto-Fills & Real-Life Minute Calculations
 */

let currentMode = 'quick'; 
let tasks = []; 

document.addEventListener("DOMContentLoaded", () => {
    loadState();
    if (tasks.length === 0) tasks.push({ name: '', hours: '' });
    renderTasks();
});

// --- UI & STATE MANAGEMENT ---
function switchMode(mode) {
    currentMode = mode;
    const isQuick = mode === 'quick';
    
    document.getElementById('btnQuickMode').className = isQuick 
        ? "flex-1 py-3 rounded-2xl font-black bg-white border-2 border-gray-900 shadow-[4px_4px_0px_0px_rgba(17,24,39,1)] text-gray-900"
        : "flex-1 py-3 rounded-2xl font-black text-gray-400 hover:text-gray-900 transition-colors";
    
    document.getElementById('btnTaskMode').className = !isQuick
        ? "flex-1 py-3 rounded-2xl font-black bg-white border-2 border-gray-900 shadow-[4px_4px_0px_0px_rgba(17,24,39,1)] text-gray-900"
        : "flex-1 py-3 rounded-2xl font-black text-gray-400 hover:text-gray-900 transition-colors";

    document.getElementById('quickModeSection').classList.toggle('hidden', !isQuick);
    document.getElementById('taskModeSection').classList.toggle('hidden', isQuick);
    
    saveState();
}

function addTask() {
    tasks.push({ name: '', hours: '' });
    renderTasks();
    saveState();
}

function removeTask(index) {
    tasks.splice(index, 1);
    if (tasks.length === 0) tasks.push({ name: '', hours: '' });
    renderTasks();
    saveState();
}

// SMART AUTO-FILL LOGIC
function handleNameInput(index, value) {
    tasks[index].name = value;
    const lowerName = value.toLowerCase();
    const hoursInput = document.getElementById(`task-hours-${index}`);

    // If the hours input is currently empty, try to auto-guess based on keywords
    if (hoursInput && hoursInput.value === '') {
        let guessedHours = null;
        
        if (lowerName.includes('assignment')) {
            guessedHours = 2;
        } else if (lowerName.includes('ppt') || lowerName.includes('presentation')) {
            guessedHours = 1.5;
        } else if (lowerName.includes('homework')) { 
            guessedHours = 1;
        }


        if (guessedHours !== null) {
            tasks[index].hours = guessedHours;
            hoursInput.value = guessedHours; // Update DOM directly so user doesn't lose focus
            hoursInput.classList.add('auto-filled');
            
            // Remove class after animation finishes so it can trigger again later if needed
            setTimeout(() => hoursInput.classList.remove('auto-filled'), 1500); 
            updateSubtotal();
        }
    }
    saveState();
}

function handleHoursInput(index, value) {
    tasks[index].hours = value;
    updateSubtotal();
    saveState();
}

function renderTasks() {
    const list = document.getElementById('taskList');
    list.innerHTML = '';
    
    tasks.forEach((task, i) => {
        const item = document.createElement('div');
        item.className = "flex gap-3 items-center animate-in slide-in-from-left-4 duration-300";
        item.innerHTML = `
            <input type="text" placeholder="Task (e.g., Math Assignment)" value="${task.name}" 
                   oninput="handleNameInput(${i}, this.value)"
                   class="flex-grow p-4 bg-gray-50 border-4 border-gray-900 rounded-2xl font-bold text-sm focus:bg-white focus:outline-none transition-all text-gray-900 placeholder-gray-400">
            <input type="number" id="task-hours-${i}" placeholder="Hrs" value="${task.hours}" min="0" step="0.5"
                   oninput="handleHoursInput(${i}, this.value)"
                   class="w-24 p-4 bg-gray-50 border-4 border-gray-900 rounded-2xl font-bold text-sm focus:bg-white focus:outline-none transition-all text-gray-900">
            <button onclick="removeTask(${i})" class="text-red-500 hover:scale-125 transition-transform p-2 bg-red-50 rounded-xl border-2 border-transparent hover:border-red-200">
                <i data-lucide="trash-2" class="w-5 h-5"></i>
            </button>
        `;
        list.appendChild(item);
    });
    lucide.createIcons();
    updateSubtotal();
}

function updateSubtotal() {
    const total = tasks.reduce((sum, t) => sum + (parseFloat(t.hours) || 0), 0);
    document.getElementById('subtotalDisplay').innerText = total.toFixed(1) + 'h';
}

// --- CORE LOGIC & TIME CALCULATIONS ---
async function calculateSlacking() {
    const deadlineVal = parseFloat(document.getElementById('deadline').value);
    const showSearch = document.getElementById('showName').value.trim();
    const resultDiv = document.getElementById('result');

    let totalWorkTime = currentMode === 'quick' 
        ? (parseFloat(document.getElementById('taskTime').value) || 0)
        : tasks.reduce((sum, t) => sum + (parseFloat(t.hours) || 0), 0);

    if (!deadlineVal || !showSearch || totalWorkTime <= 0) {
        showStatus("Fill in all the boxes, you slacker! 🙄", "bg-yellow-200 text-yellow-900");
        return;
    }

    document.body.classList.remove('red-alert');
    showStatus("Fetching show data... 📡", "bg-gray-100 text-gray-900");

    try {
        const response = await fetch(`https://api.tvmaze.com/singlesearch/shows?q=${encodeURIComponent(showSearch)}`);
        if (!response.ok) throw new Error("Not Found");
        
        const data = await response.json();
        const avgRuntime = data.averageRuntime || data.runtime || 30; // Runtime in minutes
        
        // Convert free time into EXACT minutes
        const freeHours = deadlineVal - totalWorkTime;
        const freeMinutes = Math.round(freeHours * 60);

        updateMeterUI(totalWorkTime, deadlineVal);

        // REAL-LIFE LOGIC TREE
        if (freeMinutes < 0) {
            handleCookedScenario(Math.abs(freeHours));
        } else if (freeMinutes === 0) {
            handleEdgeScenario();
        } else if (freeMinutes > 0 && freeMinutes < avgRuntime) {
            handlePartialScenario(freeMinutes, avgRuntime, data.name);
        } else {
            handleSafeScenario(freeMinutes, avgRuntime, data.name, freeHours);
        }

    } catch (err) {
        showStatus("Show not found! Did you spell it right? 🤨", "bg-red-100 text-red-600");
        new Audio('https://www.myinstants.com/media/sounds/faahhhhhhhh.mp3').play().catch(() => {});
    }
}

// --- RESULT SCENARIOS ---

function handleCookedScenario(hoursOver) {
    document.body.classList.add('red-alert');
    new Audio('https://www.myinstants.com/media/sounds/spongebob-fail.mp3').play().catch(() => {});
    showStatus(`🚨 YOU ARE COOKED! <br> You are ${hoursOver.toFixed(1)}h behind schedule already. Drop the remote!`, "bg-red-500 text-white animate-bounce-short");
}

function handleEdgeScenario() {
    new Audio('https://www.myinstants.com/media/sounds/vine-boom.mp3').play().catch(() => {});
    showStatus(`⚠️ DANGER ZONE! <br> You have exactly 0 minutes of free time. Start working NOW.`, "bg-orange-400 text-gray-900");
}

function handlePartialScenario(freeMinutes, runtime, showName) {
    new Audio('https://www.myinstants.com/media/sounds/hallelujah.mp3').play().catch(() => {});
    
    // They have free time, but not enough for a full episode
    showStatus(`⏳ TEASE ALERT! <br> You have ${freeMinutes} minutes free. That's not enough for a full episode of "${showName}" (which is ${runtime} mins), but you can watch the first ${freeMinutes} minutes before locking in!`, "bg-blue-300 text-gray-900");
}

function handleSafeScenario(freeMinutes, runtime, showName, freeHours) {
    new Audio('https://www.myinstants.com/media/sounds/hallelujah.mp3').play().catch(() => {});
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#60a5fa', '#34d399', '#fbbf24'] });

    const eps = Math.floor(freeMinutes / runtime);
    const leftoverMins = freeMinutes % runtime;
    
    let message = `✅ VIBE CHECK PASSED! <br> You have ${freeHours.toFixed(1)}h free. You can watch <span class='text-white underline px-1'>${eps} full episodes</span> of "${showName}"!`;
    
    if (leftoverMins > 0) {
        message += `<br><span class="text-sm mt-2 block opacity-80">(And you'll still have ${leftoverMins} minutes to spare for scrolling TikTok 👀)</span>`;
    }

    showStatus(message, "bg-green-400 text-gray-900");
}

// --- UTILITIES ---

function updateMeterUI(work, deadline) {
    const meter = document.getElementById('meterContainer');
    const fill = document.getElementById('meterFill');
    const status = document.getElementById('meterStatus');
    
    meter.classList.remove('hidden');
    const ratio = work / deadline;
    const percent = Math.min(ratio * 100, 100);
    fill.style.width = percent + "%";

    if (ratio > 1) {
        fill.style.backgroundColor = "#ef4444";
        status.innerText = "BOSS LEVEL: YOU'RE COOKED 💀";
    } else if (ratio > 0.8) {
        fill.style.backgroundColor = "#fb923c";
        status.innerText = "RISKY BUSINESS ⚠️";
    } else {
        fill.style.backgroundColor = "#4ade80";
        status.innerText = "CHILL VIBES ONLY 🛋️";
    }
}

function showStatus(text, classes) {
    const resultDiv = document.getElementById('result');
    resultDiv.classList.remove('hidden');
    resultDiv.className = `mt-6 border-[6px] border-gray-900 p-6 rounded-[32px] font-bold text-center ${classes}`;
    resultDiv.innerHTML = text;
}

function saveState() {
    localStorage.setItem('pro_slacker_v2', JSON.stringify({
        deadline: document.getElementById('deadline').value,
        quickTime: document.getElementById('taskTime').value,
        show: document.getElementById('showName').value,
        tasks, currentMode
    }));
}

function loadState() {
    const saved = localStorage.getItem('pro_slacker_v2');
    if (!saved) return;
    const data = JSON.parse(saved);
    
    if (data.deadline) document.getElementById('deadline').value = data.deadline;
    if (data.quickTime) document.getElementById('taskTime').value = data.quickTime;
    if (data.show) document.getElementById('showName').value = data.show;
    
    tasks = data.tasks || [];
    if (data.currentMode) switchMode(data.currentMode);
}
