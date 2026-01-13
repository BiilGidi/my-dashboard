// --- 1. GREETING LOGIC ---
const greeting = document.getElementById('greeting');
const savedGreeting = localStorage.getItem('userGreeting');
if (savedGreeting) greeting.textContent = savedGreeting;

greeting.addEventListener('blur', () => {
    localStorage.setItem('userGreeting', greeting.textContent);
});

// --- 2. THEME LOGIC ---
const themeSelect = document.getElementById('themeSelect');
const currentTheme = localStorage.getItem('theme') || 'theme-deep-sea';
document.body.className = currentTheme;
themeSelect.value = currentTheme;

themeSelect.addEventListener('change', (e) => {
    document.body.className = e.target.value;
    localStorage.setItem('theme', e.target.value);
});

// --- 3. CLOCK LOGIC ---
function updateClock() {
    const now = new Date();
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('currentDate').textContent = now.toLocaleDateString('en-US', dateOptions);
    document.getElementById('currentTime').textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
setInterval(updateClock, 1000);
updateClock();

// --- 4. TASK LOGIC ---
let tasks = JSON.parse(localStorage.getItem('myTasks')) || [];
const taskInput = document.getElementById('taskInput');
const activeList = document.getElementById('activeTasks');
const completedList = document.getElementById('completedTasks');

taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && taskInput.value.trim() !== "") {
        tasks.push({ id: Date.now(), text: taskInput.value, completed: false });
        taskInput.value = "";
        saveAndRender();
    }
});

function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) task.completed = !task.completed;
    saveAndRender();
}

function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveAndRender();
}

function saveAndRender() {
    localStorage.setItem('myTasks', JSON.stringify(tasks));
    activeList.innerHTML = "";
    completedList.innerHTML = "";

    tasks.forEach((task) => {
        const li = document.createElement('li');
        li.draggable = true;
        li.dataset.id = task.id;
        li.innerHTML = `
            <span style="flex-grow:1; cursor:pointer;" onclick="toggleTask(${task.id})">${task.completed ? '✓' : '○'} ${task.text}</span>
            <button class="delete-btn" onclick="deleteTask(${task.id})">×</button>
        `;
        li.addEventListener('dragstart', () => li.classList.add('dragging'));
        li.addEventListener('dragend', () => li.classList.remove('dragging'));

        if (task.completed) completedList.appendChild(li);
        else activeList.appendChild(li);
    });
    document.getElementById('completedCount').textContent = tasks.filter(t => t.completed).length;
}

// --- 5. DRAG & DROP ---
activeList.addEventListener('dragover', e => {
    e.preventDefault();
    const draggingItem = document.querySelector('.dragging');
    const siblings = [...activeList.querySelectorAll('li:not(.dragging)')];
    let nextSibling = siblings.find(sibling => e.clientY <= sibling.offsetTop + sibling.offsetHeight / 2);
    activeList.insertBefore(draggingItem, nextSibling);
});

activeList.addEventListener('drop', () => {
    const newOrderIds = [...activeList.querySelectorAll('li')].map(li => parseInt(li.dataset.id));
    const reorderedActive = newOrderIds.map(id => tasks.find(t => t.id === id));
    tasks = [...reorderedActive, ...tasks.filter(t => t.completed)];
    localStorage.setItem('myTasks', JSON.stringify(tasks));
});

saveAndRender();
