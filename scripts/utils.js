// Format date as YYYY-MM-DD
export function formatDate(date) {
  return date.toISOString().split("T")[0];
}

// Save a new log (append to existing)
export function saveUserLog(username, newLog) {
  const logs = getAllLogsForUser(username);
  logs.push(newLog);
  localStorage.setItem(`devlog_logs_${username}`, JSON.stringify(logs));
}

// Get all logs for user
export function getAllLogsForUser(username) {
  return JSON.parse(localStorage.getItem(`devlog_logs_${username}`)) || [];
}

// Get logs for a specific user and day
export function getUserLogs(username, date) {
  return getAllLogsForUser(username).filter(log => log.date === date);
}

// Export logs to CSV (current user)
export function exportUserCSV(username) {
  const logs = getAllLogsForUser(username);
  const header = ["Date", "Tasks", "Time Spent", "Mood", "Blockers"];
  const rows = logs.map(log => [
    log.date,
    `"${log.tasks.replace(/\n/g, " ")}"`,
    log.timeSpent,
    log.mood,
    `"${log.blockers || ""}"`
  ]);
  const csv = [header, ...rows].map(r => r.join(",")).join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${username}_devlog.csv`;
  a.click();
}

// Export logs for all users (manager)
export function exportAllLogsCSV(allLogs) {
  const header = ["User", "Date", "Tasks", "Time Spent", "Mood", "Blockers", "Feedback", "Reviewed"];
  const rows = allLogs.map(log => [
    log.username,
    log.date,
    `"${log.tasks.replace(/\n/g, " ")}"`,
    log.timeSpent,
    log.mood,
    `"${log.blockers || ""}"`,
    `"${log.feedback || ""}"`,
    log.reviewed ? "Yes" : "No"
  ]);

  const csv = [header, ...rows].map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `all_devlogs.csv`;
  a.click();
}

// Get all logs from all users (for manager)
export function getAllLogsAllUsers() {
  const users = JSON.parse(localStorage.getItem("devlog_users")) || [];
  let allLogs = [];

  users.forEach(({ username }) => {
    const logs = getAllLogsForUser(username);
    logs.forEach(log => allLogs.push(log));
  });

  return allLogs;
}
