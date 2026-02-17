// Optional download form selectors (only present in some pages)
const branch_name = document.querySelector('#branch_name');
const test_id = document.querySelector('#test_id');
if (branch_name && test_id) {
  branch_name.addEventListener('change', () => {
    axios.get('/branchTests', {
      params: { branch_name: branch_name.value }
    })
      .then((response) => {
        const allTests = response.data;
        test_id.innerHTML = "<option value='' disabled>Select Test</option>";
        allTests.forEach((opt) => {
          const new_option = document.createElement("option");
          new_option.value = opt._id;
          new_option.textContent = opt.testName;
          test_id.appendChild(new_option);
        })
      })
      .catch((err) => {
        console.log('error received: ', err);
      })
  })
}

async function loadDashboardStats() {
  try {
    const res = await fetch("/stats");
    const data = await res.json();

    if (!data.success) throw new Error("Failed to load stats");

    document.getElementById("totalStudents").textContent = data.totalUsers;
    document.getElementById("activeTests").textContent = data.activeTests;
    document.getElementById("completedTests").textContent = data.completedTests;
    document.getElementById("upcomingTests").textContent = data.upcomingTests;
  } catch (err) {
    console.error("Error loading dashboard stats:", err);
    // Optionally show fallback values
    document.querySelectorAll(".card-value").forEach(el => (el.textContent = "--"));
  }
}

loadDashboardStats();

const branchSelect = document.getElementById("branchSelect");
const testSelect = document.getElementById("testSelect");
const leaderboardBody = document.getElementById("leaderboardBody");
const testCaption = document.getElementById("testCaption");

let allUsers = [];

async function fetchLeaderboard() {
  try {
    const res = await fetch("/leaderboard");
    allUsers = await res.json();
    populateTests();
  } catch (err) {
    console.error("Error fetching leaderboard:", err);
  }
}

function populateTests() {
  if (!branchSelect || !testSelect) return;
  const selectedBranch = branchSelect.value;
  testSelect.innerHTML = "<option value=''>Select Test</option>";

  // Get all unique tests for this branch
  const tests = new Map();

  allUsers.forEach(user => {
    (user.submissions || []).forEach(sub => {
      const test = sub.test_id;
      if (test && test.branch === selectedBranch) {
        tests.set(test._id, test);
      }
    });
  });

  for (const [id, test] of tests.entries()) {
    const opt = document.createElement("option");
    opt.value = id;
    opt.textContent = test.testName;
    testSelect.appendChild(opt);
  }
}

function populateLeaderboard() {
  if (!testSelect || !leaderboardBody) return;
  const selectedTestId = testSelect.value;
  if (!selectedTestId) {
    leaderboardBody.innerHTML = "";
    if (testCaption) testCaption.textContent = "Select a test to view leaderboard";
    return;
  }

  // Get test info for caption
  let selectedTest;
  for (const user of allUsers) {
    for (const sub of (user.submissions || [])) {
      if (sub && sub.test_id && sub.test_id._id === selectedTestId) {
        selectedTest = sub.test_id;
        break;
      }
    }
  }

  if (testCaption) testCaption.textContent = `${selectedTest?.testName || ""} — Total Marks: ${selectedTest?.totalMarks || 0
    }`;

  // Filter users who attempted this test
  const participants = allUsers
    .map(user => {
      const submission = (user.submissions || []).find(
        sub => sub && sub.test_id && sub.test_id._id === selectedTestId
      );
      if (!submission) return null;
      return {
        name: user.name,
        score: submission.score || 0,
        status: (submission.score || 0) > 0 ? "Completed" : "Attempted"
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);

  leaderboardBody.innerHTML = "";
  participants.forEach((p, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${index + 1}</td>
        <td>${p.name}</td>
        <td>${p.score}</td>
        <td>${p.status}</td>
      `;
    leaderboardBody.appendChild(row);
  });
}

if (branchSelect) branchSelect.addEventListener("change", async () => {
  // Clear previous leaderboard and test selection when branch changes
  if (leaderboardBody) leaderboardBody.innerHTML = "";
  if (testSelect) testSelect.innerHTML = "<option value=''>Select Test</option>";
  if (testCaption) testCaption.textContent = "Select a test to view leaderboard";
  await fetchLeaderboard();
  populateTests();
});
if (testSelect) testSelect.addEventListener("change", populateLeaderboard);

// --- Branch Performance Analysis Logic ---
const statsProgram = document.getElementById('stats_program');
const statsBranch = document.getElementById('stats_branch');
const statsYear = document.getElementById('stats_year');
const generateBtn = document.getElementById('generateStatsBtn');
const resultArea = document.getElementById('statsResultArea');
const noDataArea = document.getElementById('statsNoData');

const branchOptionsStats = {
  btech: [
    { value: 'ai', text: 'Artificial Intelligence' },
    { value: 'che', text: 'Chemical Engineering' },
    { value: 'chm', text: 'Chemistry' },
    { value: 'ce', text: 'Civil Engineering' },
    { value: 'cse', text: 'Computer Science and Engineering' },
    { value: 'ee', text: 'Electrical Engineering' },
    { value: 'ece', text: 'Electronics Engineering' },
    { value: 'hss', text: 'Humanities and Social Sciences' },
    { value: 'ms', text: 'Management Studies' },
    { value: 'math', text: 'Mathematics' },
    { value: 'me', text: 'Mechanical Engineering' },
    { value: 'phy', text: 'Physics' }
  ],
  mtech: [
    { value: 'ai', text: 'Artificial Intelligence' },
    { value: 'che', text: 'Chemical Engineering' },
    { value: 'chm', text: 'Chemistry' },
    { value: 'ce', text: 'Civil Engineering' },
    { value: 'cse', text: 'Computer Science and Engineering' },
    { value: 'ee', text: 'Electrical Engineering' },
    { value: 'ece', text: 'Electronics Engineering' },
    { value: 'hss', text: 'Humanities and Social Sciences' },
    { value: 'ms', text: 'Management Studies' },
    { value: 'math', text: 'Mathematics' },
    { value: 'me', text: 'Mechanical Engineering' },
    { value: 'phy', text: 'Physics' }
  ],
  msc: [
    { value: 'physics', text: 'Physics' },
    { value: 'chemistry', text: 'Chemistry' },
    { value: 'math', text: 'Mathematics' }
  ],
  mba: [
    { value: '', text: 'No branch required' }
  ]
};

if (statsProgram && statsBranch) {
  statsProgram.addEventListener('change', function () {
    const selectedProgram = this.value;
    statsBranch.innerHTML = '<option value="" disabled selected>Select branch</option>';

    if (selectedProgram && branchOptionsStats[selectedProgram]) {
      branchOptionsStats[selectedProgram].forEach(option => {
        const opt = document.createElement('option');
        opt.value = option.value;
        opt.textContent = option.text;
        statsBranch.appendChild(opt);
      });
      statsBranch.disabled = false;
      if (selectedProgram === 'mba') {
        statsBranch.value = '';
      }
    } else {
      statsBranch.disabled = true;
    }
  });
}

let qualChart = null;

if (generateBtn) {
  generateBtn.addEventListener('click', async () => {
    const program = statsProgram.value;
    const branch = statsBranch.value;
    const year = statsYear.value;
    const typeEl = document.querySelector('input[name="testType"]:checked');
    if (!typeEl) return;
    const type = typeEl.value;

    if (!program || !year || (program !== 'mba' && !branch)) {
      alert('Please select Program, Year and Branch');
      return;
    }

    generateBtn.disabled = true;
    const originalHtml = generateBtn.innerHTML;
    generateBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Generating...';

    try {
      const url = `/admin/qualification-stats?program=${program}&year=${year}&branch=${branch}&type=${type}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.success && data.total > 0) {
        resultArea.style.display = 'block';
        noDataArea.style.display = 'none';

        document.getElementById('stat_total').textContent = data.total;
        document.getElementById('stat_qualified').textContent = data.qualified;
        document.getElementById('stat_notQualified').textContent = data.notQualified;

        const percentage = Math.round((data.qualified / data.total) * 100);
        document.getElementById('stat_percentage').textContent = percentage;
        document.getElementById('stat_progressBar').style.width = percentage + '%';

        const canvas = document.getElementById('qualificationChart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        if (qualChart) {
          qualChart.destroy();
        }

        qualChart = new Chart(ctx, {
          type: 'pie',
          data: {
            labels: ['Qualified', 'Not Qualified'],
            datasets: [{
              data: [data.qualified, data.notQualified],
              backgroundColor: ['#10b981', '#ef4444'],
              borderWidth: 0
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'bottom',
              }
            }
          }
        });

      } else {
        resultArea.style.display = 'none';
        noDataArea.style.display = 'block';
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
      alert('Failed to fetch statistics');
    } finally {
      generateBtn.disabled = false;
      generateBtn.innerHTML = originalHtml;
    }
  });
}

fetchLeaderboard();