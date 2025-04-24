import { getAllLogsAllUsers, exportAllLogsCSV } from './utils.js';

const table = document.getElementById("managerLogsTable");
const exportBtn = document.getElementById("exportAllBtn");

const filterDev = document.getElementById("filterDeveloper");
const filterTask = document.getElementById("filterTask");
const filterBlockers = document.getElementById("filterBlockers");
const filterFrom = document.getElementById("filterFromDate");
const filterTo = document.getElementById("filterToDate");
const applyFiltersBtn = document.getElementById("applyFiltersBtn");

let fullLogs = getAllLogsAllUsers();

function renderManagerLogs(logs) {
  table.innerHTML = "";

  logs.forEach((log, i) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${log.username}</td>
      <td>${log.date}</td>
      <td>${log.tasks}</td>
      <td>${log.timeSpent} hrs</td>
      <td>${log.mood}</td>
      <td>${log.blockers || "-"}</td>
      <td><textarea rows="2" data-index="${i}" class="feedback">${log.feedback || ""}</textarea></td>
      <td><input type="checkbox" data-index="${i}" class="reviewed" ${log.reviewed ? "checked" : ""}/></td>
    `;
    table.appendChild(row);
  });

  // Save feedback
  document.querySelectorAll(".feedback").forEach(textarea => {
    textarea.addEventListener("change", e => {
      fullLogs[e.target.dataset.index].feedback = e.target.value;
      localStorage.setItem(`devlog_logs_${fullLogs[e.target.dataset.index].username}`, JSON.stringify(
        fullLogs.filter(log => log.username === fullLogs[e.target.dataset.index].username)
      ));
    });
  });

  // Save reviewed
  document.querySelectorAll(".reviewed").forEach(box => {
    box.addEventListener("change", e => {
      fullLogs[e.target.dataset.index].reviewed = e.target.checked;
      localStorage.setItem(`devlog_logs_${fullLogs[e.target.dataset.index].username}`, JSON.stringify(
        fullLogs.filter(log => log.username === fullLogs[e.target.dataset.index].username)
      ));
    });
  });
}

// Filter functionality
applyFiltersBtn.addEventListener("click", () => {
  const devVal = filterDev.value;
  const taskVal = filterTask.value.toLowerCase();
  const blockersVal = filterBlockers.value.toLowerCase();
  const from = filterFrom.value;
  const to = filterTo.value;

  const filtered = fullLogs.filter(log => {
    const matchDev = !devVal || log.username === devVal;
    const matchTask = !taskVal || log.tasks.toLowerCase().includes(taskVal);
    const matchBlockers = !blockersVal || (log.blockers && log.blockers.toLowerCase().includes(blockersVal));
    const matchFrom = !from || log.date >= from;
    const matchTo = !to || log.date <= to;
    return matchDev && matchTask && matchBlockers && matchFrom && matchTo;
  });

  renderManagerLogs(filtered);
});

// Export all logs
exportBtn.addEventListener("click", () => {
  exportAllLogsCSV(fullLogs);
});

// Populate developer filter dropdown
function populateDeveloperDropdown() {
  const users = [...new Set(fullLogs.map(log => log.username))];
  filterDev.innerHTML = '<option value="">All Developers</option>';
  users.forEach(dev => {
    const opt = document.createElement("option");
    opt.value = dev;
    opt.textContent = dev;
    filterDev.appendChild(opt);
  });
}

function checkManagerNotification() {
  if (localStorage.getItem("notify_manager") === "true") {
    alert("🔔 New developer logs submitted!");
    localStorage.setItem("notify_manager", "false");
  }
}

// Initial render
renderManagerLogs(fullLogs);
populateDeveloperDropdown();
checkManagerNotification();
