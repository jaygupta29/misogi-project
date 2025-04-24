import { getAllLogsForUser, formatDate } from './utils.js';

let chartInstance;

export function renderUserChart(username) {
  const logs = getAllLogsForUser(username);

  // Last 7 days
  const today = new Date();
  const data = [];

  for (let i = 6; i >= 0; i--) {
    const day = new Date(today);
    day.setDate(today.getDate() - i);
    const dateStr = formatDate(day);
    const dailyLogs = logs.filter(log => log.date === dateStr);
    const totalTime = dailyLogs.reduce((sum, log) => sum + log.timeSpent, 0);
    data.push({ date: dateStr, time: totalTime });
  }

  const ctx = document.getElementById("productivityChart").getContext("2d");

  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: data.map(d => d.date.slice(5)), // MM-DD
      datasets: [{
        label: "Hours Logged",
        data: data.map(d => d.time),
        backgroundColor: "#007BFF",
        borderRadius: 4,
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => `${context.raw} hrs`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 12,
          title: { display: true, text: "Hours" }
        },
        x: {
          title: { display: true, text: "Day" }
        }
      }
    }
  });
}
