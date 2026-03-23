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
  branch: document.querySelector('#download_branch'),
  test: document.querySelector('#test_id'),
  program: document.querySelector('#download_program'),
  year: document.querySelector('#download_year')
};

function updateDownloadBranches() {
  if (!downloadForm.program || !downloadForm.branch) return;
  const selectedProgram = downloadForm.program.value;
  downloadForm.branch.innerHTML = '<option value="" disabled selected>Select branch</option>';

  if (selectedProgram && branchOptions[selectedProgram]) {

    branchOptions[selectedProgram].forEach(option => {
      const opt = document.createElement('option');
      opt.value = option.value;
      opt.textContent = option.text;
      downloadForm.branch.appendChild(opt);
    });
    downloadForm.branch.disabled = false;
    if (selectedProgram === 'mba') {
      downloadForm.branch.value = '';
    }
  } else {
    downloadForm.branch.disabled = true;
  }
}

function updateTestDropdown() {
  if (!downloadForm.branch || !downloadForm.test || !downloadForm.program || !downloadForm.year) return;

  const selectedBranch = downloadForm.branch.value;
  const selectedProgram = downloadForm.program.value;
  const selectedYear = downloadForm.year.value;
  const testTypeEl = document.querySelector('input[name="downloadTestType"]:checked');

  if (!selectedBranch || !selectedProgram || !selectedYear || !testTypeEl) {
    downloadForm.test.innerHTML = "<option value='' disabled selected>Select Test</option>";
    return;
  }

  const testType = testTypeEl.value;
  const isTech = testType === 'technical';

  axios.get('/branchTests', {
    params: {
      branch_name: selectedBranch,
      program: selectedProgram,
      year: selectedYear,
      isTechnical: isTech
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

if (downloadForm.program) {
  downloadForm.program.addEventListener('change', () => {
    updateDownloadBranches();
    updateTestDropdown();
  });
}
if (downloadForm.branch && downloadForm.test) {
  downloadForm.branch.addEventListener('change', updateTestDropdown);
  if (downloadForm.year) downloadForm.year.addEventListener('change', updateTestDropdown);

  // Add event listener for test type radio buttons
  const downloadTestTypeRadios = document.querySelectorAll('input[name="downloadTestType"]');
  downloadTestTypeRadios.forEach(radio => {
    radio.addEventListener('change', updateTestDropdown);
  });
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
    { value: '', text: 'Business Analytics' }
  ]
};

const branchSelect = document.getElementById("branchSelect");
const leaderboardProgram = document.getElementById("leaderboardProgram");
const leaderboardYear = document.getElementById("leaderboardYear");
const testSelect = document.getElementById("testSelect");
const leaderboardBody = document.getElementById("leaderboardBody");
const testCaption = document.getElementById("testCaption");

let allUsers = [];

// fetchLeaderboard is now specific to a cohort and a test (if selected)
// We'll rename it to avoid confusion or just use populateLeaderboard directly
async function fetchTestParticipants(testId, program, branch, year) {
  try {
    const res = await fetch(`/leaderboard?program=${program}&branch=${branch}&year=${year}&testId=${testId}`);
    return await res.json();
  } catch (err) {
    console.error("Error fetching leaderboard participants:", err);
    return [];
  }
}

// Helper to get ID from populated or unpopulated field
function getTestId(sub) {
  if (!sub || !sub.test_id) return null;
  const test = sub.test_id;
  // If populated object
  if (test._id) return test._id.toString();
  // If raw string or ObjectId
  return test.toString();
}


function updateLeaderboardBranches() {
  if (!leaderboardProgram || !branchSelect) return;
  const selectedProgram = leaderboardProgram.value;
  branchSelect.innerHTML = '<option value="" disabled selected>Select branch</option>';

  if (selectedProgram && branchOptions[selectedProgram]) {

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

async function populateLeaderboardTests() {
  if (!branchSelect || !testSelect || !leaderboardProgram || !leaderboardYear) return;

  const selectedBranch = branchSelect.value;
  const selectedProgram = leaderboardProgram.value;
  const selectedYear = leaderboardYear.value;
  const testTypeEl = document.querySelector('input[name="leaderboardTestType"]:checked');

  if (!selectedBranch || !selectedProgram || !selectedYear || !testTypeEl) {
    testSelect.innerHTML = "<option value=''>Select Test</option>";
    return;
  }

  const testType = testTypeEl.value;
  const isTech = testType === 'technical';

  try {
    const response = await axios.get('/branchTests', {
      params: {
        branch_name: selectedBranch,
        program: selectedProgram,
        year: selectedYear,
        isTechnical: isTech
      }
    });

    const allTests = response.data;
    testSelect.innerHTML = "<option value=''>Select Test</option>";

    allTests.forEach((test) => {
      const opt = document.createElement("option");
      opt.value = test._id;
      opt.textContent = test.testName;
      testSelect.appendChild(opt);
    });
  } catch (err) {
    console.error('Error fetching tests for leaderboard:', err);
  }
}

async function populateLeaderboard() {
  if (!testSelect || !leaderboardBody) return;
  const selectedTestId = testSelect.value;

  if (!selectedTestId) {
    leaderboardBody.innerHTML = `
      <tr>
        <td colspan="4" class="text-center py-4">
          <i class="fas fa-info-circle text-muted" style="font-size: 2rem; opacity: 0.3;"></i>
          <p class="text-muted mt-2">Select a test to view leaderboard</p>
        </td>
      </tr>
    `;
    if (testCaption) testCaption.textContent = "Select a test to view leaderboard";
    return;
  }

  // Get current filters
  const selectedBranch = branchSelect.value;
  const selectedProgram = leaderboardProgram.value;
  const selectedAdmissionYear = leaderboardYear.value;

  // Fetch only participants for this specific test
  console.log(`[Dashboard] Fetching participants for testId: ${selectedTestId}, program: ${selectedProgram}, branch: ${selectedBranch}, year: ${selectedAdmissionYear}`);
  const participantsData = await fetchTestParticipants(selectedTestId, selectedProgram, selectedBranch, selectedAdmissionYear);
  console.log(`[Dashboard] Received ${participantsData.length} users from server`);

  // Update caption using first participant's test info
  if (participantsData.length > 0) {
    const sub = participantsData[0].submissions.find(s => {
      const tid = getTestId(s);
      return tid === selectedTestId;
    });
    const test = sub?.test_id;
    if (testCaption) testCaption.textContent = `${test?.testName || ""} — Total Marks: ${test?.totalMarks || 0}`;
  }

  const participants = participantsData
    .map(user => {
      const submission = (user.submissions || []).find(
        sub => {
          const tid = getTestId(sub);
          const matches = (tid === selectedTestId);
          return matches;
        }
      );
      if (!submission) {
        console.warn(`[Dashboard] User ${user.name} returned by server but no matching submission found in sub array. Data mismatch?`);
        return null;
      }

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
        <td><span class="badge ${p.status === 'Qualified' ? 'bg-success' : p.status === 'Not Attempted' ? 'bg-secondary' : 'bg-danger'}">${p.status}</span></td>
      `;
    row.style.animation = `fadeInUp 0.3s ease-out forwards ${index * 0.05}s`;
    leaderboardBody.appendChild(row);
  });
}

function resetLeaderboard() {
  if (leaderboardBody) leaderboardBody.innerHTML = "";
  if (testSelect) testSelect.innerHTML = "<option value=''>Select Test</option>";
  if (testCaption) testCaption.textContent = "Select a test to view leaderboard";
  populateLeaderboardTests();
}

if (leaderboardProgram) {
  leaderboardProgram.addEventListener("change", async () => {
    updateLeaderboardBranches();
    await populateLeaderboardTests();
    populateLeaderboard(); // Clear it
  });
}
if (branchSelect) branchSelect.addEventListener("change", async () => {
  await populateLeaderboardTests();
  populateLeaderboard(); // Clear it
});
if (leaderboardYear) leaderboardYear.addEventListener("change", async () => {
  await populateLeaderboardTests();
  populateLeaderboard(); // Clear it
});

// Add event listener for test type radio buttons
const testTypeRadios = document.querySelectorAll('input[name="leaderboardTestType"]');
testTypeRadios.forEach(radio => {
  radio.addEventListener("change", async () => {
    await populateLeaderboardTests();
    populateLeaderboard(); // Clear it
  });
});

if (testSelect) testSelect.addEventListener("change", populateLeaderboard);

// Initial setup
updateDownloadBranches();
updateLeaderboardBranches();
// Remove fetchLeaderboard() from here - it should only run when filters are selected
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
    const typeEl = document.querySelector('input[name="statsTestType"]:checked');
    if (!typeEl) return;
    const type = typeEl.value;

    if (!program || !year || !branch) {
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