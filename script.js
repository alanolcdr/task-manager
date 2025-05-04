let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

const taskManagerContainer = document.querySelector(".taskManager");
const confirmEl = document.querySelector(".confirm");
const confirmedBtn = confirmEl.querySelector(".confirmed");
const cancelledBtn = confirmEl.querySelector(".cancel");
let indexToBeDeleted = null;

document.getElementById('taskForm').addEventListener('submit', handleFormSubmit);

function handleFormSubmit(event) {
  event.preventDefault();
  const taskInput = document.getElementById('taskInput');
  const taskText = taskInput.value.trim();

  if (taskText !== '') {
    const newTask = {
      text: taskText,
      completed: false
    };

    tasks.push(newTask);
    saveTasks();
    taskInput.value = '';
    renderTasks();
  }
}

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function renderTasks() {
  const taskContainer = document.getElementById('taskContainer');
  taskContainer.innerHTML = '';

  tasks.forEach((task, index) => {
    const taskCard = document.createElement('div');
    taskCard.classList.add('taskCard');
    taskCard.classList.add(task.completed ? 'completed' : 'pending');

    const taskText = document.createElement('p');
    taskText.innerText = task.text;

    const taskStatus = document.createElement('p');
    taskStatus.classList.add('status');
    taskStatus.innerText = task.completed ? "Ukończone" : "Trwa";

    const toggleButton = document.createElement('button');
    toggleButton.classList.add("button-box");
    const btnContentEl = document.createElement("span");
    btnContentEl.classList.add("green");
    btnContentEl.innerText = task.completed ? 'Oznacz jako trwające' : 'Oznacz jako ukończone';
    toggleButton.appendChild(btnContentEl);
    toggleButton.addEventListener('click', () => {
      tasks[index].completed = !tasks[index].completed;
      saveTasks();
      renderTasks();
    });

    const deleteButton = document.createElement('button');
    deleteButton.classList.add("button-box");
    const delBtnContentEl = document.createElement("span");
    delBtnContentEl.classList.add("red");
    delBtnContentEl.innerText = 'Usuń';
    deleteButton.appendChild(delBtnContentEl);

    deleteButton.addEventListener('click', () => {
      indexToBeDeleted = index;
      showConfirm();
    });

    taskCard.appendChild(taskText);
    taskCard.appendChild(taskStatus);
    taskCard.appendChild(toggleButton);
    taskCard.appendChild(deleteButton);

    taskContainer.appendChild(taskCard);
  });
}

function deleteTask(index) {
  tasks.splice(index, 1);
  saveTasks();
  renderTasks();
}

function showConfirm() {
  confirmEl.classList.add('show');
  taskManagerContainer.classList.add("overlay");
}

function hideConfirm() {
  confirmEl.classList.remove('show');
  taskManagerContainer.classList.remove("overlay");
}

confirmedBtn.addEventListener("click", () => {
  hideConfirm();
  if (indexToBeDeleted !== null) {
    deleteTask(indexToBeDeleted);
    indexToBeDeleted = null;
  }
});

cancelledBtn.addEventListener("click", () => {
  hideConfirm();
  indexToBeDeleted = null;
});

document.getElementById('exportJsonBtn').addEventListener('click', () => {
  const json = JSON.stringify(tasks, null, 2);
  downloadFile('tasks.json', json, 'application/json');
});

const importFileInput = document.getElementById('importFileInput');
document.getElementById('importJsonBtn').addEventListener('click', () => {
  importFileInput.click();
});

importFileInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const importedTasks = JSON.parse(e.target.result);
      if (Array.isArray(importedTasks)) {
        const valid = importedTasks.every(t => typeof t.text === 'string' && typeof t.completed === 'boolean');
        if (valid) {
          tasks = importedTasks;
          saveTasks();
          renderTasks();
          alert('Zadania zostały zaimportowane poprawnie.');
        } else {
          alert('Nieprawidłowy format danych w pliku JSON.');
        }
      } 
    } catch (err) {
      alert('Błąd podczas odczytu pliku JSON.');
    }
  };
  reader.readAsText(file);
  importFileInput.value = ''; 
});

function downloadFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

renderTasks();

const themeBtn = document.getElementById('toggleThemeBtn');

function setTheme(isDark) {
  document.body.classList.toggle('dark-mode', isDark);
  themeBtn.textContent = isDark ? "☀️ Tryb jasny" : "🌙 Tryb ciemny";
  localStorage.setItem('darkMode', isDark ? '1' : '0');
}

(function initTheme() {
  const userPref = localStorage.getItem('darkMode');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  setTheme(userPref === '1' || (userPref === null && prefersDark));
})();

themeBtn.addEventListener('click', () => {
  const isDark = !document.body.classList.contains('dark-mode');
  setTheme(isDark);
});

