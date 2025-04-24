import { getToken } from './auth.js';
import { getUserLogs, saveUserLog, getAllLogsForUser, exportUserCSV, formatDate } from './utils.js';
import { renderUserChart } from './graph.js';

const taskInput = document.getElementById("taskInput");
const timeInput = document.getElementById("timeInput");
const moodInput = document.getElementById("moodInput");
const blockersInput = document.getElementById("blockersInput");
const markdownPreview = document.getElementById("markdownPreview");

const submitBtn = document.getElementById("submitLog");
const exportBtn = document.getElementById("exportBtn");
const logsTable = document.getElementById("logsTable");

const taskDateInput = document.getElementById("taskDate");
taskDateInput.value = formatDate(new Date()); // set default to today

const token = getToken();
if (!token || token.role !== "developer") {
  console.warn("Unauthorized access. Returning to login.");
  // window.location.href = window.location.pathname; // reload safely
}

let user = getToken()?.username;
console.log("token",token)
// if (!user) {
//   console.warn("Unauthorized access. Returning to login.");
//   window.location.href = window.location.pathname; // reload safely
// }
// if (!user) location.reload();

// Live Markdown preview
taskInput.addEventListener("input", () => {
  markdownPreview.innerHTML = marked.parse(taskInput.value);
});

// Submit new task
submitBtn.addEventListener("click", () => {
  user = user ? user : getToken()?.username
  const logs = getAllLogsForUser(user);
  const editingTs = taskInput.dataset.editing;

  if(!taskInput.value){
    alert("Task cannotbe empty")
    return
  }
  if(!timeInput.value){
    alert("Time cannotbe empty")
    return
  }
  if (editingTs) {
    // Edit existing log
    const idx = logs.findIndex(l => l.timestamp == editingTs);
    if (idx !== -1) {
      logs[idx].tasks = taskInput.value;
      logs[idx].timeSpent = Number(timeInput.value);
      logs[idx].mood = moodInput.value;
      logs[idx].blockers = blockersInput.value;
    }
    delete taskInput.dataset.editing;
    alert("Log updated!");
  } else {
    // Create new log
    const newLog = {
      date: taskDateInput.value || formatDate(new Date()),
      timestamp: Date.now(),
      tasks: taskInput.value,
      timeSpent: Number(timeInput.value),
      mood: moodInput.value,
      blockers: blockersInput.value,
      reviewed: false,
      username: user,
    };
    localStorage.setItem("notify_manager", "true");
    logs.push(newLog);
    alert("Log added!");
  }

  localStorage.setItem(`devlog_logs_${user}`, JSON.stringify(logs));
  clearInputs();
  renderLogs();
  renderUserChart(user);
});


function clearInputs() {
  taskInput.value = "";
  timeInput.value = "";
  moodInput.value = "😊";
  blockersInput.value = "";
  markdownPreview.innerHTML = "";
}

// Render user logs
function renderLogs() {
  user = user ? user : getToken()?.username
  const selectedDate = taskDateInput.value;
const logs = getAllLogsForUser(user)
  .filter(log => log.date === selectedDate)
  .sort((a, b) => b.timestamp - a.timestamp);
  logsTable.innerHTML = "";

  logs.forEach((log) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${log.date}</td>
      <td>${log.timeSpent} hrs</td>
      <td>${log.mood}</td>
      <td>${log.blockers || "-"}</td>
      <td><button data-ts="${log.timestamp}" class="editBtn">Edit</button></td>
    `;
    logsTable.appendChild(row);
  });

  document.querySelectorAll(".editBtn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const ts = e.target.dataset.ts;
      const logs = getAllLogsForUser(user);
      const log = logs.find(log => log.timestamp == ts);
      if (log) {
        taskInput.value = log.tasks;
        timeInput.value = log.timeSpent;
        moodInput.value = log.mood;
        blockersInput.value = log.blockers;
        markdownPreview.innerHTML = marked.parse(log.tasks);

        // Store this log timestamp for update
        taskInput.dataset.editing = ts;
      }
    });
  });
}

// Export CSV
exportBtn.addEventListener("click", () => {
  exportUserCSV(user);
});

taskDateInput.addEventListener("change", () => {
  renderLogs();
});

// 🔔 10 PM reminder
setInterval(() => {
  const now = new Date();
  const hours = now.getHours();
  const todayLogs = getUserLogs(user, formatDate(now));

  if (hours === 22 && todayLogs.length === 0) {
    if (Notification.permission === "granted") {
      new Notification("⏰ Submit your DevLog for today!");
    } else {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          new Notification("⏰ Submit your DevLog for today!");
        }
      });
    }
  }
}, 60000);

renderLogs();
renderUserChart(user);
