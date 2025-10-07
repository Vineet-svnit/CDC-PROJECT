let branch_name = document.querySelector('#branch_name');
let test_id = document.querySelector('#test_id');
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
    const selectedBranch = branchSelect.value;
    testSelect.innerHTML = "<option value=''>Select Test</option>";

    // Get all unique tests for this branch
    const tests = new Map();

    allUsers.forEach(user => {
      user.submissions.forEach(sub => {
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
    const selectedTestId = testSelect.value;
    if (!selectedTestId) {
      leaderboardBody.innerHTML = "";
      testCaption.textContent = "Select a test to view leaderboard";
      return;
    }

    // Get test info for caption
    let selectedTest;
    for (const user of allUsers) {
      for (const sub of user.submissions) {
        if (sub.test_id && sub.test_id._id === selectedTestId) {
          selectedTest = sub.test_id;
          break;
        }
      }
    }

    testCaption.textContent = `${selectedTest?.testName || ""} — Total Marks: ${
      selectedTest?.totalMarks || 0
    }`;

    // Filter users who attempted this test
    const participants = allUsers
      .map(user => {
        const submission = user.submissions.find(
          sub => sub.test_id && sub.test_id._id === selectedTestId
        );
        if (!submission) return null;
        return {
          name: user.name,
          score: submission.score || 0,
          status: submission.score > 0 ? "Completed" : "Attempted"
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

  branchSelect.addEventListener("change", populateTests);
  testSelect.addEventListener("change", populateLeaderboard);

  fetchLeaderboard();