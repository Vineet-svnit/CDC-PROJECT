// --- Sidebar and View Switching Logic ---
document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.getElementById('adminSidebar');
  const sidebarToggle = document.getElementById('sidebarToggle');
  const navLinks = document.querySelectorAll('#adminSidebar .nav-link');
  const viewSections = document.querySelectorAll('.dashboard-view-section');

  // Sidebar Toggle
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
      // For mobile
      if (window.innerWidth <= 768) {
        sidebar.classList.toggle('show');
      }
    });
  }

  // View Switching
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      const targetViewId = link.getAttribute('data-view');
      if (!targetViewId) return;

      // Update Active Link
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      // Update Active Section
      viewSections.forEach(section => {
        section.classList.remove('active');
        if (section.id === targetViewId) {
          section.classList.add('active');
        }
      });

      // Close sidebar on mobile after selection
      if (window.innerWidth <= 768 && sidebar) {
        sidebar.classList.remove('show');
      }
    });
  });
});

// Optional download form selectors (only present in some pages)
const downloadForm = {
  branch: document.querySelector('#branch_name'),
  test: document.querySelector('#test_id'),
  program: document.querySelector('#download_program'),
  year: document.querySelector('#download_year')
};

function updateTestDropdown() {
  if (!downloadForm.branch.value || !downloadForm.program?.value || !downloadForm.year?.value) return;

  axios.get('/branchTests', {
    params: {
      branch_name: downloadForm.branch.value,
      program: downloadForm.program.value,
      year: downloadForm.year.value
    }
  })
    .then((response) => {
      const allTests = response.data;
      downloadForm.test.innerHTML = "<option value='' disabled selected>Select Test</option>";
      allTests.forEach((opt) => {
        const new_option = document.createElement("option");
        new_option.value = opt._id;
        new_option.textContent = opt.testName;
        downloadForm.test.appendChild(new_option);
      })
    })
    .catch((err) => {
      console.log('error received: ', err);
    });
}

if (downloadForm.branch && downloadForm.test) {
  downloadForm.branch.addEventListener('change', updateTestDropdown);
  if (downloadForm.program) downloadForm.program.addEventListener('change', updateTestDropdown);
  if (downloadForm.year) downloadForm.year.addEventListener('change', updateTestDropdown);
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

// --- Leaderboard Logic ---
const branchOptions = {
  btech: [
    { value: 'ai', text: 'Artificial Intelligence' },
    { value: 'che', text: 'Chemical' },
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
    { value: 'che', text: 'Chemical' },
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
    { value: 'phy', text: 'Physics' },
    { value: 'chm', text: 'Chemistry' },
    { value: 'math', text: 'Mathematics' }
  ],
  mba: [
    { value: '', text: 'No branch required' }
  ]
};

const branchSelect = document.getElementById("branchSelect");
const leaderboardProgram = document.getElementById("leaderboardProgram");
const leaderboardYear = document.getElementById("leaderboardYear");
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

function updateLeaderboardBranches() {
  if (!leaderboardProgram || !branchSelect) return;
  const selectedProgram = leaderboardProgram.value;
  branchSelect.innerHTML = '<option value="" disabled selected>Select branch</option>';

  if (selectedProgram && branchOptions[selectedProgram]) {
    // Add LR option manually
    const lrOption = document.createElement('option');
    lrOption.value = 'lr';
    lrOption.textContent = 'Logical Reasoning and Aptitude';
    branchSelect.appendChild(lrOption);

    branchOptions[selectedProgram].forEach(option => {
      const opt = document.createElement('option');
      opt.value = option.value;
      opt.textContent = option.text;
      branchSelect.appendChild(opt);
    });
    branchSelect.disabled = false;
    if (selectedProgram === 'mba') {
      branchSelect.value = '';
    } else {
      // Automatically select the first option if it's not MBA
      // (Optional: keep as "Select branch" to force user interaction)
    }
  } else {
    branchSelect.disabled = true;
  }
}

function populateTests() {
  if (!branchSelect || !testSelect || !leaderboardProgram || !leaderboardYear) return;
  const selectedBranch = branchSelect.value;
  const selectedProgram = leaderboardProgram.value;
  const selectedAdmissionYear = parseInt(leaderboardYear.value);

  testSelect.innerHTML = "<option value=''>Select Test</option>";

  // Get all unique tests for this branch, program, and admission year
  const tests = new Map();

  allUsers.forEach(user => {
    (user.submissions || []).forEach(sub => {
      const test = sub.test_id;
      if (test &&
        test.branch === selectedBranch &&
        test.program === selectedProgram &&
        parseInt(test.year) === selectedAdmissionYear) {
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

  // Get test info for caption and filtering
  let selectedTest;
  for (const user of allUsers) {
    for (const sub of (user.submissions || [])) {
      if (sub && sub.test_id && sub.test_id._id === selectedTestId) {
        selectedTest = sub.test_id;
        break;
      }
    }
    if (selectedTest) break;
  }

  if (!selectedTest) {
    leaderboardBody.innerHTML = `
      <tr>
        <td colspan="4" class="text-center py-4">
          <i class="fas fa-info-circle text-muted" style="font-size: 2rem; opacity: 0.3;"></i>
          <p class="text-muted mt-2">Test not found</p>
        </td>
      </tr>
    `;
    return;
  }

  if (testCaption) testCaption.textContent = `${selectedTest.testName} — Total Marks: ${selectedTest.totalMarks} — Year: ${selectedTest.year}`;

  // Use test's year and program to filter users (branch is only for test filtering, not user matching)
  const testYear = selectedTest.year;
  const testProgram = selectedTest.program;

  // Filter users who attempted this test and match the test's Year/Program
  const participants = allUsers
    .map(user => {
      // Check if user matches the test's year and program
      if (user.program !== testProgram) return null;
      if (user.year !== testYear) return null;

      const submission = (user.submissions || []).find(
        sub => sub && sub.test_id && sub.test_id._id === selectedTestId
      );
      if (!submission) return null;
      
      return {
        name: user.name,
        score: submission.score || 0,
        status: submission.isQualified ? "Qualified" : "Not Qualified"
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);

  leaderboardBody.innerHTML = "";
  
  if (participants.length === 0) {
    leaderboardBody.innerHTML = `
      <tr>
        <td colspan="4" class="text-center py-4">
          <i class="fas fa-info-circle text-muted" style="font-size: 2rem; opacity: 0.3;"></i>
          <p class="text-muted mt-2">No submissions found for this test</p>
        </td>
      </tr>
    `;
    return;
  }
  
  participants.forEach((p, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${index + 1}</td>
        <td>${p.name}</td>
        <td>${p.score}</td>
        <td><span class="badge ${p.status === 'Qualified' ? 'bg-success' : 'bg-danger'}">${p.status}</span></td>
      `;
    row.style.animation = `fadeInUp 0.3s ease-out forwards ${index * 0.05}s`;
    leaderboardBody.appendChild(row);
  });
}

function resetLeaderboard() {
  if (leaderboardBody) leaderboardBody.innerHTML = "";
  if (testSelect) testSelect.innerHTML = "<option value=''>Select Test</option>";
  if (testCaption) testCaption.textContent = "Select a test to view leaderboard";
  populateTests();
}

if (leaderboardProgram) {
  leaderboardProgram.addEventListener("change", () => {
    updateLeaderboardBranches();
    resetLeaderboard();
  });
}
if (branchSelect) branchSelect.addEventListener("change", resetLeaderboard);
if (leaderboardYear) leaderboardYear.addEventListener("change", resetLeaderboard);
if (testSelect) testSelect.addEventListener("change", populateLeaderboard);

// Initial setup
updateLeaderboardBranches();
fetchLeaderboard();

// --- Branch Performance Analysis Logic ---
const statsProgram = document.getElementById('stats_program');
const statsBranch = document.getElementById('stats_branch');
const statsYear = document.getElementById('stats_year');
const generateBtn = document.getElementById('generateStatsBtn');
const resultArea = document.getElementById('statsResultArea');
const noDataArea = document.getElementById('statsNoData');

if (statsProgram && statsBranch) {
  statsProgram.addEventListener('change', function () {
    const selectedProgram = this.value;
    statsBranch.innerHTML = '<option value="" disabled selected>Select branch</option>';

    if (selectedProgram && branchOptions[selectedProgram]) {
      // Add LR option manually
      const lrOption = document.createElement('option');
      lrOption.value = 'lr';
      lrOption.textContent = 'Logical Reasoning and Aptitude';
      statsBranch.appendChild(lrOption);

      branchOptions[selectedProgram].forEach(option => {
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