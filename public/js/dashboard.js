
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

  if (selectedProgram && window.programOptions[selectedProgram]) {

    window.programOptions[selectedProgram].forEach(option => {
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

  if (selectedProgram && window.programOptions[selectedProgram]) {

    window.programOptions[selectedProgram].forEach(option => {
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

// --- Branch Performance Analysis Logic ---
const statsProgram = document.getElementById('stats_program');
const statsBranch = document.getElementById('stats_branch');
const statsYear = document.getElementById('stats_year');
const statsTestSelect = document.getElementById('stats_testSelect');
const generateBtn = document.getElementById('generateStatsBtn');
const resultArea = document.getElementById('statsResultArea');
const noDataArea = document.getElementById('statsNoData');

function updateStatsBranches() {
  if (!statsProgram || !statsBranch) return;
  const selectedProgram = statsProgram.value;
  statsBranch.innerHTML = '<option value="" disabled selected>Select branch</option>';
  statsTestSelect.innerHTML = '<option value="">Select Test</option>';
  statsTestSelect.disabled = true;


  if (selectedProgram && window.programOptions[selectedProgram]) {
    window.programOptions[selectedProgram].forEach(option => {
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
}

async function populateStatsTests() {
  if (!statsBranch || !statsTestSelect || !statsProgram || !statsYear) return;

  const selectedBranch = statsBranch.value;
  const selectedProgram = statsProgram.value;
  const selectedYear = statsYear.value;
  const testTypeEl = document.querySelector('input[name="statsTestType"]:checked');

  if (!selectedBranch || !selectedProgram || !selectedYear || !testTypeEl) {
    statsTestSelect.innerHTML = "<option value=''>Select Test</option>";
    statsTestSelect.disabled = true;
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
    statsTestSelect.innerHTML = "<option value=''>Select Test</option>";
    statsTestSelect.disabled = allTests.length === 0;


    allTests.forEach((test) => {
      const opt = document.createElement("option");
      opt.value = test._id;
      opt.textContent = test.testName;
      statsTestSelect.appendChild(opt);
    });
  } catch (err) {
    console.error('Error fetching tests for stats:', err);
    statsTestSelect.disabled = true;
  }
}


if (statsProgram) {
  statsProgram.addEventListener('change', () => {
    updateStatsBranches();
    populateStatsTests();
  });
}

if (statsBranch) {
  statsBranch.addEventListener('change', populateStatsTests);
}

if (statsYear) {
  statsYear.addEventListener('change', populateStatsTests);
}

const statsTestTypeRadios = document.querySelectorAll('input[name="statsTestType"]');
statsTestTypeRadios.forEach(radio => {
  radio.addEventListener('change', populateStatsTests);
});

let qualChart = null;

if (generateBtn) {
  generateBtn.addEventListener('click', async () => {
    const program = statsProgram.value;
    const branch = statsBranch.value;
    const year = statsYear.value;
    const testId = statsTestSelect.value;
    const isTechnical = document.querySelector('input[name="statsTestType"]:checked').value === 'technical';

    generateBtn.disabled = true;
    const originalHtml = generateBtn.innerHTML;
    generateBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Generating...';

    try {
      const url = `/admin/qualification-stats?program=${program}&year=${year}&branch=${branch}&testId=${testId}&isTechnical=${isTechnical}`;
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
