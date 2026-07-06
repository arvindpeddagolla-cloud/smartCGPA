/**
 * Smart GPA & CGPA Calculator - Core Logic (app.js)
 */

// ================= STATE MANAGEMENT =================
const AppStore = {
  profile: {
    name: "Guest Student",
    rollNumber: "",
    branch: "",
    college: "",
    gradYear: 2027,
    targetCGPA: 9.0
  },
  gpaSubjects: [], // Active term subjects
  semesters: [],   // Logged semester history
  theme: "dark",
  
  // Grade Point Mapping
  gradePoints: {
    "A+": 10,
    "A": 9,
    "B+": 8,
    "B": 7,
    "C": 6,
    "D": 5,
    "F": 0
  },

  // Save state to Local Storage
  save() {
    localStorage.setItem("smartgpa_profile", JSON.stringify(this.profile));
    localStorage.setItem("smartgpa_subjects", JSON.stringify(this.gpaSubjects));
    localStorage.setItem("smartgpa_semesters", JSON.stringify(this.semesters));
    localStorage.setItem("smartgpa_theme", this.theme);
  },

  // Load state from Local Storage
  load() {
    const savedProfile = localStorage.getItem("smartgpa_profile");
    if (savedProfile) this.profile = JSON.parse(savedProfile);

    const savedSubjects = localStorage.getItem("smartgpa_subjects");
    if (savedSubjects) this.gpaSubjects = JSON.parse(savedSubjects);

    const savedSemesters = localStorage.getItem("smartgpa_semesters");
    if (savedSemesters) this.semesters = JSON.parse(savedSemesters);

    const savedTheme = localStorage.getItem("smartgpa_theme");
    if (savedTheme) this.theme = savedTheme;
  },

  // Clear all data
  reset() {
    localStorage.removeItem("smartgpa_profile");
    localStorage.removeItem("smartgpa_subjects");
    localStorage.removeItem("smartgpa_semesters");
    localStorage.removeItem("smartgpa_theme");
    
    this.profile = {
      name: "Guest Student",
      rollNumber: "",
      branch: "",
      college: "",
      gradYear: 2027,
      targetCGPA: 9.0
    };
    this.gpaSubjects = [];
    this.semesters = [];
    this.theme = "dark";
  }
};

// ================= NOTIFICATION SYSTEM (TOASTS) =================
function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  
  let icon = '<i class="fa-solid fa-circle-info"></i>';
  if (type === "success") icon = '<i class="fa-solid fa-circle-check"></i>';
  if (type === "error") icon = '<i class="fa-solid fa-circle-exclamation"></i>';
  if (type === "warning") icon = '<i class="fa-solid fa-triangle-exclamation"></i>';

  toast.innerHTML = `${icon} <span>${message}</span>`;
  container.appendChild(toast);

  // Auto remove toast
  setTimeout(() => {
    toast.classList.add("fade-out");
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 4000);
}

// ================= MATHEMATICAL CALCULATIONS =================

/**
 * Calculates current semester GPA
 */
function calculateSemesterGPA(subjects) {
  if (!subjects || subjects.length === 0) return { gpa: 0, credits: 0, points: 0 };
  
  let totalCredits = 0;
  let totalWeightedScore = 0;
  
  subjects.forEach(sub => {
    const credits = parseFloat(sub.credits) || 0;
    const gradePoint = AppStore.gradePoints[sub.grade] !== undefined ? AppStore.gradePoints[sub.grade] : 0;
    totalCredits += credits;
    totalWeightedScore += (credits * gradePoint);
  });
  
  const gpa = totalCredits > 0 ? (totalWeightedScore / totalCredits) : 0;
  
  return {
    gpa: parseFloat(gpa.toFixed(2)),
    credits: totalCredits,
    points: totalWeightedScore
  };
}

/**
 * Calculates Cumulative CGPA based on logged semester history
 */
function calculateCumulativeCGPA(semesters) {
  if (!semesters || semesters.length === 0) return { cgpa: 0, credits: 0, standing: "N/A" };
  
  let totalCredits = 0;
  let totalWeightedGPA = 0;
  
  semesters.forEach(sem => {
    const credits = parseFloat(sem.credits) || 0;
    const gpa = parseFloat(sem.gpa) || 0;
    totalCredits += credits;
    totalWeightedGPA += (gpa * credits);
  });
  
  const cgpa = totalCredits > 0 ? (totalWeightedGPA / totalCredits) : 0;
  const roundedCGPA = parseFloat(cgpa.toFixed(2));
  
  // Standing Calculation
  let standing = "Needs Improvement";
  if (roundedCGPA >= 9.0) standing = "Excellent";
  else if (roundedCGPA >= 8.0) standing = "Very Good";
  else if (roundedCGPA >= 7.0) standing = "Good";
  else if (roundedCGPA >= 6.0) standing = "Average";
  
  return {
    cgpa: roundedCGPA,
    credits: totalCredits,
    standing: standing
  };
}

// Get Badge Statuses
function getAcademicBadges(cgpa, totalCredits, activeSubjectsCount) {
  return {
    freshman: activeSubjectsCount > 0 || AppStore.semesters.length > 0,
    perfect: AppStore.semesters.some(sem => parseFloat(sem.gpa) === 10.0) || (activeSubjectsCount > 0 && calculateSemesterGPA(AppStore.gpaSubjects).gpa === 10.0),
    credits: totalCredits >= 80,
    deans: cgpa >= 9.0 && totalCredits >= 15
  };
}

// Generate Academic Recommendations / Insights
function generateInsights(cgpa, credits, activeGPAData) {
  const insights = [];
  
  // Rule 1: Goal checking
  const target = parseFloat(AppStore.profile.targetCGPA) || 9.0;
  if (cgpa > 0) {
    if (cgpa >= target) {
      insights.push({
        type: "good",
        icon: "fa-solid fa-trophy",
        text: `Superb! Your current CGPA of ${cgpa} is meeting or exceeding your target of ${target.toFixed(2)}.`
      });
    } else {
      insights.push({
        type: "info",
        icon: "fa-solid fa-route",
        text: `Target Check: You are currently ${(target - cgpa).toFixed(2)} grade points away from your goal of ${target.toFixed(2)} CGPA.`
      });
    }
  }

  // Rule 2: Active semester GPA comparison
  if (activeGPAData.credits > 0 && cgpa > 0) {
    if (activeGPAData.gpa > cgpa) {
      insights.push({
        type: "good",
        icon: "fa-solid fa-chart-line",
        text: `Trend: Your current term GPA prediction (${activeGPAData.gpa}) is higher than your cumulative CGPA (${cgpa}). Keep it up to pull your overall score up!`
      });
    } else if (activeGPAData.gpa < cgpa) {
      insights.push({
        type: "warning",
        icon: "fa-solid fa-triangle-exclamation",
        text: `Trend Alert: Your current term GPA prediction (${activeGPAData.gpa}) is trailing your cumulative CGPA (${cgpa}). Consider optimizing grades in high-credit subjects.`
      });
    }
  }

  // Rule 3: Low credit warning or general tips
  if (AppStore.gpaSubjects.length > 0) {
    const lowGrades = AppStore.gpaSubjects.filter(s => AppStore.gradePoints[s.grade] <= 6);
    if (lowGrades.length > 0) {
      insights.push({
        type: "warning",
        icon: "fa-solid fa-circle-exclamation",
        text: `Subject Alert: Focus on improving grades in: ${lowGrades.map(s => s.name).join(", ")}. Grades are C (6) or below.`
      });
    }
  }

  // Rule 4: Distinction check
  if (cgpa >= 8.5) {
    insights.push({
      type: "good",
      icon: "fa-solid fa-award",
      text: "Distinction Track: Maintain a cumulative CGPA above 8.5 to graduate with academic distinction."
    });
  } else if (cgpa > 0 && cgpa < 7.0) {
    insights.push({
      type: "info",
      icon: "fa-solid fa-graduation-cap",
      text: "Aim for consistent scores above 8.0 in your future modules to safely step into the 'Very Good' standing tier."
    });
  }

  // Fallback if empty
  if (insights.length === 0) {
    insights.push({
      type: "info",
      icon: "fa-solid fa-sparkles",
      text: "Start logging your subjects in the GPA Calculator and past Semesters to generate automated study advice!"
    });
  }

  return insights;
}

// ================= DOM RENDERING CONTROLLER =================

function updateUI() {
  const cgpaStats = calculateCumulativeCGPA(AppStore.semesters);
  const activeSemStats = calculateSemesterGPA(AppStore.gpaSubjects);
  
  // 1. Sidebar Updates
  document.getElementById("sb-profile-name").textContent = AppStore.profile.name || "Guest Student";
  document.getElementById("sb-profile-branch").textContent = AppStore.profile.branch || "No Branch Listed";
  document.getElementById("sb-profile-cgpa").textContent = `CGPA: ${cgpaStats.cgpa.toFixed(2)}`;
  
  // 2. Academic Standing Top Badge
  const standingText = document.getElementById("standing-text");
  const standingPill = document.getElementById("standing-pill");
  standingText.textContent = cgpaStats.cgpa > 0 ? cgpaStats.standing : "Average";
  
  // Update class on standing pill
  standingPill.className = "academic-standing-pill";
  if (cgpaStats.cgpa >= 9.0) standingPill.classList.add("text-success");
  else if (cgpaStats.cgpa >= 8.0) standingPill.classList.add("text-primary");
  else if (cgpaStats.cgpa >= 7.0) standingPill.classList.add("text-accent");
  else if (cgpaStats.cgpa >= 6.0) standingPill.classList.add("text-warning");
  else if (cgpaStats.cgpa > 0) standingPill.classList.add("text-danger");

  // 3. Dashboard Updates
  document.getElementById("banner-student-name").textContent = AppStore.profile.name.split(" ")[0];
  document.getElementById("dash-current-gpa").textContent = activeSemStats.gpa.toFixed(2);
  document.getElementById("dash-current-cgpa").textContent = cgpaStats.cgpa.toFixed(2);
  document.getElementById("dash-total-credits").textContent = cgpaStats.credits + activeSemStats.credits;
  document.getElementById("dash-credits-completed").textContent = `${activeSemStats.credits} active / ${cgpaStats.credits} cumulative`;
  document.getElementById("dash-semester-count").textContent = `${AppStore.semesters.length} semesters logged`;
  document.getElementById("dash-total-subjects").textContent = AppStore.gpaSubjects.length;
  
  // CGPA Standing Label
  document.getElementById("dash-cgpa-standing").textContent = cgpaStats.cgpa > 0 ? `Standing: ${cgpaStats.standing}` : "No semesters loaded";

  // Goal Progress in Dashboard
  const targetVal = parseFloat(AppStore.profile.targetCGPA) || 9.0;
  document.getElementById("dash-goal-value").textContent = targetVal.toFixed(2);
  const goalProgress = document.getElementById("dash-goal-progress");
  const goalGapText = document.getElementById("dash-goal-gap");
  
  if (cgpaStats.cgpa > 0) {
    const percent = Math.min(100, Math.max(0, (cgpaStats.cgpa / targetVal) * 100));
    goalProgress.style.width = `${percent}%`;
    if (cgpaStats.cgpa >= targetVal) {
      goalGapText.textContent = "Goal Achieved! 🎉";
      goalGapText.style.color = "var(--success-color)";
    } else {
      goalGapText.textContent = `${(targetVal - cgpaStats.cgpa).toFixed(2)} points left`;
      goalGapText.style.color = "var(--accent-color)";
    }
  } else {
    goalProgress.style.width = `0%`;
    goalGapText.textContent = "Goal status uncalculated";
    goalGapText.style.color = "var(--text-muted)";
  }

  // Dashboard Insights list
  const insightsList = document.getElementById("insights-list");
  insightsList.innerHTML = "";
  const calculatedInsights = generateInsights(cgpaStats.cgpa, cgpaStats.credits, activeSemStats);
  calculatedInsights.forEach(ins => {
    const li = document.createElement("li");
    li.className = `insight-${ins.type}`;
    li.innerHTML = `<i class="${ins.icon}"></i> <span>${ins.text}</span>`;
    insightsList.appendChild(li);
  });

  // Dashboard Badges
  const badges = getAcademicBadges(cgpaStats.cgpa, cgpaStats.credits + activeSemStats.credits, AppStore.gpaSubjects.length);
  const badgeIds = {
    freshman: document.getElementById("badge-freshman"),
    perfect: document.getElementById("badge-perfect"),
    credits: document.getElementById("badge-credits"),
    deans: document.getElementById("badge-deans")
  };
  
  for (const [key, element] of Object.entries(badgeIds)) {
    if (element) {
      if (badges[key]) {
        element.classList.remove("locked");
        element.classList.add("unlocked");
        element.removeAttribute("title");
      } else {
        element.classList.remove("unlocked");
        element.classList.add("locked");
      }
    }
  }

  // 4. GPA Tab Lists
  renderGPAList();

  // 5. CGPA Tab Lists
  renderCGPAList();

  // 6. Reports Preview Sync
  syncReportPreview(cgpaStats, activeSemStats, calculatedInsights);

  // 7. Trigger Charts Redraw (Safely, if charts.js is loaded)
  if (window.GPACharts && typeof window.GPACharts.update === "function") {
    window.GPACharts.update(AppStore.semesters, AppStore.gpaSubjects);
  }
}

// Renders the active subjects in GPA Calculator
function renderGPAList() {
  const tbody = document.getElementById("subjects-list-body");
  const emptyState = document.getElementById("subjects-empty-state");
  const table = document.getElementById("subjects-table");
  
  const query = document.getElementById("search-subjects").value.toLowerCase().trim();
  const sortBy = document.getElementById("sort-subjects").value;

  // Filter
  let filtered = [...AppStore.gpaSubjects];
  if (query) {
    filtered = filtered.filter(sub => sub.name.toLowerCase().includes(query));
  }

  // Sort
  if (sortBy === "name-asc") {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy === "name-desc") {
    filtered.sort((a, b) => b.name.localeCompare(a.name));
  } else if (sortBy === "credits-desc") {
    filtered.sort((a, b) => (b.credits - a.credits));
  } else if (sortBy === "grade-desc") {
    filtered.sort((a, b) => {
      const ap = AppStore.gradePoints[a.grade];
      const bp = AppStore.gradePoints[b.grade];
      return bp - ap;
    });
  }

  tbody.innerHTML = "";
  
  if (filtered.length === 0) {
    table.style.display = "none";
    emptyState.style.display = "flex";
  } else {
    table.style.display = "table";
    emptyState.style.display = "none";
    
    filtered.forEach(sub => {
      const gp = AppStore.gradePoints[sub.grade];
      const ws = (sub.credits * gp).toFixed(1);
      
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>${escapeHTML(sub.name)}</strong></td>
        <td>${sub.credits}</td>
        <td><span class="standing-tag ${getGradeClass(sub.grade)}">${sub.grade}</span></td>
        <td>${gp}</td>
        <td>${ws}</td>
        <td>
          <div class="action-btns">
            <button class="btn-icon btn-edit" onclick="openEditSubjectModal('${sub.id}')" title="Edit Subject">
              <i class="fa-solid fa-pencil"></i>
            </button>
            <button class="btn-icon btn-delete" onclick="deleteSubject('${sub.id}')" title="Delete Subject">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  // Calculate live values
  const stats = calculateSemesterGPA(AppStore.gpaSubjects);
  document.getElementById("live-total-credits").textContent = stats.credits;
  document.getElementById("live-total-points").textContent = stats.points;
  document.getElementById("live-semester-gpa").textContent = stats.gpa.toFixed(2);
}

// Renders the semester records in CGPA Manager
function renderCGPAList() {
  const tbody = document.getElementById("semesters-list-body");
  const emptyState = document.getElementById("semesters-empty-state");
  const table = document.getElementById("semesters-table");

  tbody.innerHTML = "";

  if (AppStore.semesters.length === 0) {
    table.style.display = "none";
    emptyState.style.display = "flex";
  } else {
    table.style.display = "table";
    emptyState.style.display = "none";

    AppStore.semesters.forEach(sem => {
      const qp = (sem.credits * sem.gpa).toFixed(1);
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>${escapeHTML(sem.name)}</strong></td>
        <td>${sem.credits} Credits</td>
        <td>${parseFloat(sem.gpa).toFixed(2)}</td>
        <td>${qp}</td>
        <td>
          <div class="action-btns">
            <button class="btn-icon btn-edit" onclick="openEditSemesterModal('${sem.id}')" title="Edit Semester">
              <i class="fa-solid fa-pencil"></i>
            </button>
            <button class="btn-icon btn-delete" onclick="deleteSemester('${sem.id}')" title="Delete Semester">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  // Grand stats
  const stats = calculateCumulativeCGPA(AppStore.semesters);
  document.getElementById("cgpa-grand-total").textContent = stats.cgpa.toFixed(2);
  document.getElementById("cgpa-total-sems").textContent = AppStore.semesters.length;
  document.getElementById("cgpa-total-credits").textContent = stats.credits;
  
  // Badge class update
  const badge = document.getElementById("cgpa-standing-badge");
  badge.textContent = stats.cgpa > 0 ? stats.standing : "N/A";
  badge.className = "standing-tag";
  
  if (stats.cgpa >= 9.0) badge.classList.add("standing-excellent");
  else if (stats.cgpa >= 8.0) badge.classList.add("standing-verygood");
  else if (stats.cgpa >= 7.0) badge.classList.add("standing-good");
  else if (stats.cgpa >= 6.0) badge.classList.add("standing-average");
  else if (stats.cgpa > 0) badge.classList.add("standing-poor");
  else badge.classList.add("standing-none");
}

// Sync Preview Paper in Reports tab
function syncReportPreview(cgpaStats, activeSemStats, insights) {
  document.getElementById("t-student-name").textContent = AppStore.profile.name || "Guest Student";
  document.getElementById("t-student-roll").textContent = AppStore.profile.rollNumber || "N/A";
  document.getElementById("t-student-branch").textContent = AppStore.profile.branch || "N/A";
  document.getElementById("t-student-college").textContent = AppStore.profile.college || "N/A";
  document.getElementById("t-student-year").textContent = AppStore.profile.gradYear || "N/A";
  document.getElementById("t-report-date").textContent = new Date().toLocaleDateString(undefined, {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  // Summary Metrics
  document.getElementById("t-summary-cgpa").textContent = cgpaStats.cgpa.toFixed(2);
  document.getElementById("t-summary-credits").textContent = cgpaStats.credits;
  document.getElementById("t-summary-sems").textContent = AppStore.semesters.length;
  document.getElementById("t-summary-standing").textContent = cgpaStats.cgpa > 0 ? cgpaStats.standing : "N/A";

  // Semester List Table
  const tSemBody = document.getElementById("t-semesters-body");
  tSemBody.innerHTML = "";
  if (AppStore.semesters.length === 0) {
    tSemBody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#94a3b8;">No academic semesters logged.</td></tr>`;
  } else {
    AppStore.semesters.forEach(sem => {
      const qp = (sem.credits * sem.gpa).toFixed(1);
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>${escapeHTML(sem.name)}</strong></td>
        <td>${sem.credits}</td>
        <td>${parseFloat(sem.gpa).toFixed(2)}</td>
        <td>${qp}</td>
      `;
      tSemBody.appendChild(tr);
    });
  }

  // In-progress Active Subjects Table
  const tActiveSec = document.getElementById("t-active-subjects-section");
  const tActiveBody = document.getElementById("t-active-body");
  tActiveBody.innerHTML = "";
  
  const showActive = document.getElementById("rep-include-active").checked;
  if (showActive && AppStore.gpaSubjects.length > 0) {
    tActiveSec.style.display = "block";
    AppStore.gpaSubjects.forEach(sub => {
      const gp = AppStore.gradePoints[sub.grade];
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>${escapeHTML(sub.name)}</strong></td>
        <td>${sub.credits}</td>
        <td>${sub.grade}</td>
        <td>${gp}</td>
      `;
      tActiveBody.appendChild(tr);
    });
  } else {
    tActiveSec.style.display = "none";
  }

  // Insights in Preview
  const tInsightsSec = document.getElementById("t-insights-section");
  const tInsightsBody = document.getElementById("t-insights-body");
  tInsightsBody.innerHTML = "";
  
  const showInsights = document.getElementById("rep-include-insights").checked;
  if (showInsights && insights.length > 0) {
    tInsightsSec.style.display = "block";
    insights.forEach(ins => {
      const li = document.createElement("li");
      li.innerHTML = `<i class="fa-solid fa-circle-check" style="color:#10b981;"></i> <span>${ins.text}</span>`;
      tInsightsBody.appendChild(li);
    });
  } else {
    tInsightsSec.style.display = "none";
  }
}

// Helper: Grade to CSS class
function getGradeClass(grade) {
  if (grade === "A+") return "text-success";
  if (grade === "A") return "text-accent";
  if (grade === "B+" || grade === "B") return "text-primary";
  if (grade === "C" || grade === "D") return "text-warning";
  return "text-danger";
}

// Helper: escape input HTML to prevent script injections
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

// ================= MODAL OPERATIONS =================
const modalOverlay = document.getElementById("quick-subject-modal");
const modalForm = document.getElementById("modal-subject-form");
const modalTitleText = document.getElementById("modal-title-text");
const modalSubmitBtn = document.getElementById("modal-submit-btn");

function openModal(title, submitText, subjectId = "") {
  modalTitleText.innerHTML = title;
  modalSubmitBtn.innerHTML = submitText;
  document.getElementById("modal-edit-id").value = subjectId;

  if (subjectId) {
    // Populate form if editing
    const subject = AppStore.gpaSubjects.find(s => s.id === subjectId);
    if (subject) {
      document.getElementById("modal-sub-name").value = subject.name;
      document.getElementById("modal-sub-credits").value = subject.credits;
      document.getElementById("modal-sub-grade").value = subject.grade;
    }
  } else {
    // Reset Form if adding
    modalForm.reset();
  }

  modalOverlay.classList.add("open");
}

function closeModal() {
  modalOverlay.classList.remove("open");
}

// Expose openEditSubjectModal globally
window.openEditSubjectModal = function(id) {
  openModal('<i class="fa-solid fa-pencil"></i> Edit Subject Detail', '<i class="fa-solid fa-floppy-disk"></i> Update Subject', id);
};

// Global delete subject trigger
window.deleteSubject = function(id) {
  AppStore.gpaSubjects = AppStore.gpaSubjects.filter(sub => sub.id !== id);
  AppStore.save();
  updateUI();
  showToast("Subject removed from active list.", "info");
};

// Past semesters editing & deleting
window.openEditSemesterModal = function(id) {
  const sem = AppStore.semesters.find(s => s.id === id);
  if (!sem) return;

  const newName = prompt("Enter Semester Name:", sem.name);
  if (newName === null) return;
  const newCredits = prompt("Enter Credits Completed:", sem.credits);
  if (newCredits === null) return;
  const newGPA = prompt("Enter Semester GPA:", sem.gpa);
  if (newGPA === null) return;

  const parsedCredits = parseInt(newCredits);
  const parsedGPA = parseFloat(newGPA);

  if (!newName.trim()) {
    showToast("Invalid Semester Name.", "error");
    return;
  }
  if (isNaN(parsedCredits) || parsedCredits <= 0) {
    showToast("Credits must be a positive integer.", "error");
    return;
  }
  if (isNaN(parsedGPA) || parsedGPA < 0 || parsedGPA > 10) {
    showToast("GPA must be a number between 0.00 and 10.00.", "error");
    return;
  }

  sem.name = newName.trim();
  sem.credits = parsedCredits;
  sem.gpa = parsedGPA;

  AppStore.save();
  updateUI();
  showToast("Semester record updated successfully.", "success");
};

window.deleteSemester = function(id) {
  AppStore.semesters = AppStore.semesters.filter(s => s.id !== id);
  AppStore.save();
  updateUI();
  showToast("Semester record removed.", "info");
};

// ================= WHAT-IF SIMULATOR HANDLER =================
function runWhatIfSimulation(e) {
  if (e) e.preventDefault();
  
  const currentCGPA = parseFloat(document.getElementById("wi-current-cgpa").value) || 0;
  const completedCredits = parseInt(document.getElementById("wi-completed-credits").value) || 0;
  const remainingSems = parseInt(document.getElementById("wi-remaining-sems").value) || 0;
  const expectedGPA = parseFloat(document.getElementById("wi-expected-gpa").value) || 0;

  // Let's assume an average credit size per remaining semester.
  // We check the history to find average semester size, or fall back to 20.
  let avgCredits = 20;
  if (AppStore.semesters.length > 0) {
    const totalCreditsHistory = AppStore.semesters.reduce((acc, sem) => acc + parseInt(sem.credits), 0);
    avgCredits = Math.round(totalCreditsHistory / AppStore.semesters.length);
  }

  const remainingCredits = remainingSems * avgCredits;
  const totalCredits = completedCredits + remainingCredits;

  if (totalCredits === 0) {
    showToast("Total credits cannot be zero. Add completed credits or remaining semesters.", "error");
    return;
  }

  // Scenario Math
  const targetCGPAVal = ((currentCGPA * completedCredits) + (expectedGPA * remainingCredits)) / totalCredits;
  const bestCGPAVal = ((currentCGPA * completedCredits) + (10.0 * remainingCredits)) / totalCredits;
  const worstCGPAVal = ((currentCGPA * completedCredits) + (6.0 * remainingCredits)) / totalCredits;

  // Render text outcomes
  const predCgpaEl = document.getElementById("sim-predicted-cgpa");
  const improvEl = document.getElementById("sim-improvement-rate");
  const standingEl = document.getElementById("sim-predicted-standing");

  const predicted = parseFloat(targetCGPAVal.toFixed(2));
  predCgpaEl.textContent = predicted.toFixed(2);

  // Improvement Rate Calculation
  let improvRate = 0;
  if (currentCGPA > 0) {
    improvRate = ((predicted - currentCGPA) / currentCGPA) * 100;
  }
  improvEl.textContent = `${improvRate >= 0 ? '+' : ''}${improvRate.toFixed(2)}%`;
  improvEl.className = `value ${improvRate >= 0 ? 'text-success' : 'text-danger'}`;

  // Standing
  let standing = "Needs Improvement";
  if (predicted >= 9.0) standing = "Excellent";
  else if (predicted >= 8.0) standing = "Very Good";
  else if (predicted >= 7.0) standing = "Good";
  else if (predicted >= 6.0) standing = "Average";
  standingEl.textContent = standing;

  // Scenario Cards
  document.getElementById("scenario-best-gpa").textContent = `CGPA: ${bestCGPAVal.toFixed(2)}`;
  document.getElementById("scenario-target-expect").textContent = expectedGPA.toFixed(2);
  document.getElementById("scenario-target-gpa").textContent = `CGPA: ${targetCGPAVal.toFixed(2)}`;
  document.getElementById("scenario-worst-gpa").textContent = `CGPA: ${worstCGPAVal.toFixed(2)}`;

  // Update What If comparison charts in charts.js
  if (window.GPACharts && typeof window.GPACharts.updateWhatIf === "function") {
    window.GPACharts.updateWhatIf(currentCGPA, bestCGPAVal, targetCGPAVal, worstCGPAVal);
  }

  showToast("Simulation run completed successfully.", "success");
}

// ================= TARGET CGPA PLANNER HANDLER =================
function runTargetPlanning(e) {
  if (e) e.preventDefault();

  const desiredCGPA = parseFloat(document.getElementById("tp-desired-cgpa").value) || 0;
  const remainingCredits = parseInt(document.getElementById("tp-remaining-credits").value) || 0;

  if (desiredCGPA <= 0 || desiredCGPA > 10) {
    showToast("Desired CGPA must be between 1.00 and 10.00.", "error");
    return;
  }
  if (remainingCredits <= 0) {
    showToast("Remaining credits must be a positive number.", "error");
    return;
  }

  // Look up history metrics
  const cgpaStats = calculateCumulativeCGPA(AppStore.semesters);
  const completedCredits = cgpaStats.credits;
  const currentCGPA = cgpaStats.cgpa;

  // Calculate: Required GPA = (desired * total - current * completed) / remaining
  const totalCredits = completedCredits + remainingCredits;
  const requiredGPAVal = ((desiredCGPA * totalCredits) - (currentCGPA * completedCredits)) / remainingCredits;
  
  const reqGPAEl = document.getElementById("planner-required-gpa");
  const feasibilityTag = document.getElementById("planner-feasibility-tag");
  const feasibilitySummary = document.getElementById("planner-feasibility-summary");
  const tipsText = document.getElementById("target-tips-text");

  const required = parseFloat(requiredGPAVal.toFixed(2));
  reqGPAEl.textContent = required.toFixed(2);

  // SVG Progress circle gauge updates
  // Dasharray total circumference = 2 * PI * r = 2 * 3.14159 * 40 ≈ 251.2
  // We map the required GPA scale (0 to 10) to 0 to 251.2
  const circleFill = document.getElementById("gauge-required-gpa-fill");
  const percent = Math.min(10, Math.max(0, required));
  const offset = 251.2 - (percent / 10) * 251.2;
  circleFill.style.strokeDashoffset = offset;

  // Feasibility evaluation
  feasibilityTag.className = "status-pill";
  if (required > 10.0) {
    feasibilityTag.textContent = "Impossible";
    feasibilityTag.classList.add("status-impossible");
    feasibilitySummary.textContent = `Goal unreachable. To achieve a ${desiredCGPA.toFixed(2)} CGPA, you would need a ${required.toFixed(2)} GPA in future semesters, which exceeds the perfect 10.0 scale. Adjust your target CGPA or remaining credits.`;
    circleFill.style.stroke = "var(--danger-color)";
    tipsText.textContent = "Recommendation: Try lowering your desired CGPA target or review if your remaining credits input is accurate. Target a realistic graduation index.";
  } else if (required <= 0.0) {
    feasibilityTag.textContent = "Already Achieved";
    feasibilityTag.classList.add("status-possible");
    feasibilitySummary.textContent = `You have already achieved your desired goal! You need a 0.00 GPA to reach this standard. Enjoy your studies!`;
    circleFill.style.stroke = "var(--success-color)";
    tipsText.textContent = "Amazing! You are in full control of your scores. Keep maintaining your momentum to secure a stellar transcript.";
  } else if (required > 9.0) {
    feasibilityTag.textContent = "Challenging";
    feasibilityTag.classList.add("status-challenging");
    feasibilitySummary.textContent = `A required GPA of ${required.toFixed(2)} is challenging but achievable. You will need outstanding grades (mostly A/A+) across all remaining modules.`;
    circleFill.style.stroke = "var(--warning-color)";
    tipsText.textContent = `Recommendation: Prioritize high-credit courses. Form study groups, avoid failing grades, and target A+ in the next ${remainingCredits} credits.`;
  } else {
    feasibilityTag.textContent = "Highly Feasible";
    feasibilityTag.classList.add("status-possible");
    feasibilitySummary.textContent = `Your goal of ${desiredCGPA.toFixed(2)} is highly achievable. A required future GPA of ${required.toFixed(2)} is within comfortable limits.`;
    circleFill.style.stroke = "var(--success-color)";
    tipsText.textContent = "Recommendation: Keep a steady study schedule. Ensure you avoid grade drops by consistently locking in B+ or A grades.";
  }

  // Update target progress bar comparison
  const currentMarker = document.getElementById("tp-marker-current");
  const goalMarker = document.getElementById("tp-marker-goal");
  const milestoneFill = document.getElementById("tp-milestone-fill");
  const milestoneMsg = document.getElementById("tp-milestone-msg");

  currentMarker.textContent = currentCGPA.toFixed(2);
  goalMarker.textContent = desiredCGPA.toFixed(2);

  if (currentCGPA > 0) {
    const progressPercent = Math.min(100, Math.max(0, (currentCGPA / desiredCGPA) * 100));
    milestoneFill.style.width = `${progressPercent}%`;
    
    if (currentCGPA >= desiredCGPA) {
      milestoneMsg.textContent = "Congratulations! You are already ahead of your goal.";
    } else {
      milestoneMsg.textContent = `You are at ${progressPercent.toFixed(1)}% of your target CGPA milestone.`;
    }
  } else {
    milestoneFill.style.width = `0%`;
    milestoneMsg.textContent = "Log past semesters to see comparative milestones.";
  }

  showToast("Goal analysis updated.", "info");
}

// ================= EVENT LISTENERS & INITS =================

document.addEventListener("DOMContentLoaded", () => {
  AppStore.load();

  // Initialize page routing
  const navItems = document.querySelectorAll(".nav-item");
  const tabContents = document.querySelectorAll(".tab-content");
  const pageTitle = document.getElementById("page-title");
  const pageSubtitle = document.getElementById("page-subtitle");
  
  navItems.forEach(item => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      
      const tabId = item.getAttribute("data-tab");
      
      // Toggle Active navigation
      navItems.forEach(ni => ni.classList.remove("active"));
      item.classList.add("active");
      
      // Show tab content
      tabContents.forEach(content => {
        if (content.id === tabId) {
          content.classList.add("active");
        } else {
          content.classList.remove("active");
        }
      });

      // Update titles
      const tabName = item.querySelector("span").textContent;
      pageTitle.textContent = tabName;
      
      const subtitles = {
        "dashboard": "Overview of your academic standing",
        "gpa-calc": "Calculate current term semester GPA",
        "cgpa-calc": "Manage your past academic semesters",
        "what-if": "Simulate future grading scenarios",
        "target-planner": "Plan path to desired CGPA milestone",
        "analytics": "Visualize your grading performance",
        "reports": "Generate transcripts and print records",
        "profile-settings": "Manage profile details and data exports"
      };
      
      pageSubtitle.textContent = subtitles[tabId] || "Smart GPA & CGPA Calculator";

      // Scroll main window to top
      document.querySelector(".content-body").scrollTop = 0;

      // Close mobile menu if open
      document.querySelector(".sidebar").classList.remove("open");
    });
  });

  // Theme Toggle Button
  const themeToggle = document.getElementById("theme-toggle");
  themeToggle.addEventListener("click", () => {
    if (document.body.classList.contains("dark-mode")) {
      document.body.classList.remove("dark-mode");
      document.body.classList.add("light-mode");
      themeToggle.querySelector("i").className = "fa-solid fa-sun";
      themeToggle.querySelector(".theme-text").textContent = "Light Mode";
      AppStore.theme = "light";
    } else {
      document.body.classList.remove("light-mode");
      document.body.classList.add("dark-mode");
      themeToggle.querySelector("i").className = "fa-solid fa-moon";
      themeToggle.querySelector(".theme-text").textContent = "Dark Mode";
      AppStore.theme = "dark";
    }
    AppStore.save();
    showToast("Theme switched successfully.", "success");
    
    // Trigger charts reload to update labels & border colors
    if (window.GPACharts && typeof window.GPACharts.init === "function") {
      window.GPACharts.init(AppStore.semesters, AppStore.gpaSubjects);
    }
  });

  // Apply saved theme on start
  if (AppStore.theme === "light") {
    document.body.classList.remove("dark-mode");
    document.body.classList.add("light-mode");
    themeToggle.querySelector("i").className = "fa-solid fa-sun";
    themeToggle.querySelector(".theme-text").textContent = "Light Mode";
  }

  // Hamburger menu for mobile
  const hamburger = document.getElementById("hamburger-menu");
  hamburger.addEventListener("click", () => {
    document.querySelector(".sidebar").classList.toggle("open");
  });

  // Close sidebar clicking outside on mobile
  document.addEventListener("click", (e) => {
    const sidebar = document.querySelector(".sidebar");
    if (window.innerWidth <= 768 && 
        !sidebar.contains(e.target) && 
        !hamburger.contains(e.target) && 
        sidebar.classList.contains("open")) {
      sidebar.classList.remove("open");
    }
  });

  // Quick subject modal actions
  const quickSubjectBtn = document.getElementById("btn-quick-subject");
  const modalCloseBtn = document.getElementById("modal-close-btn");
  
  quickSubjectBtn.addEventListener("click", () => {
    openModal('<i class="fa-solid fa-book-medical"></i> Quick Add Subject', '<i class="fa-solid fa-plus"></i> Add to Semester');
  });
  
  modalCloseBtn.addEventListener("click", closeModal);
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  // Form submits
  
  // 1. Modal Subject Submit
  modalForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("modal-sub-name").value.trim();
    const credits = parseInt(document.getElementById("modal-sub-credits").value);
    const grade = document.getElementById("modal-sub-grade").value;
    const editId = document.getElementById("modal-edit-id").value;

    if (!name) {
      showToast("Please enter a valid subject name.", "error");
      return;
    }

    if (editId) {
      // Editing
      const idx = AppStore.gpaSubjects.findIndex(s => s.id === editId);
      if (idx !== -1) {
        AppStore.gpaSubjects[idx] = { id: editId, name, credits, grade };
        showToast("Subject details updated.", "success");
      }
    } else {
      // Adding new
      const newSubject = {
        id: "sub-" + Date.now(),
        name,
        credits,
        grade
      };
      AppStore.gpaSubjects.push(newSubject);
      showToast("Subject added successfully.", "success");
    }

    AppStore.save();
    closeModal();
    updateUI();
  });

  // 2. GPA Tab: Left Add Subject Form
  const formAddSub = document.getElementById("form-add-subject");
  formAddSub.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("sub-name").value.trim();
    const credits = parseInt(document.getElementById("sub-credits").value);
    const grade = document.getElementById("sub-grade").value;

    if (!name) {
      showToast("Please enter a valid subject name.", "error");
      return;
    }

    const newSubject = {
      id: "sub-" + Date.now(),
      name,
      credits,
      grade
    };

    AppStore.gpaSubjects.push(newSubject);
    AppStore.save();
    formAddSub.reset();
    document.getElementById("sub-credits").value = 3; // Reset default credit
    
    updateUI();
    showToast(`${name} added to semester.`, "success");
  });

  // Search & Sort Event Listeners
  document.getElementById("search-subjects").addEventListener("input", renderGPAList);
  document.getElementById("sort-subjects").addEventListener("change", renderGPAList);

  // Clear Subjects
  document.getElementById("btn-clear-subjects").addEventListener("click", () => {
    if (AppStore.gpaSubjects.length === 0) return;
    if (confirm("Are you sure you want to clear all subjects for the current semester?")) {
      AppStore.gpaSubjects = [];
      AppStore.save();
      updateUI();
      showToast("Current semester subjects cleared.", "info");
    }
  });

  // Save Semester to History
  document.getElementById("btn-save-semester").addEventListener("click", () => {
    if (AppStore.gpaSubjects.length === 0) {
      showToast("No subjects to save. Add subjects first.", "error");
      return;
    }

    const nextSemNum = AppStore.semesters.length + 1;
    const defaultSemName = `Semester ${nextSemNum}`;
    const semName = prompt("Enter a name for this semester record:", defaultSemName);
    
    if (semName === null) return; // cancelled
    const nameCleaned = semName.trim() || defaultSemName;

    const stats = calculateSemesterGPA(AppStore.gpaSubjects);
    
    const newSemester = {
      id: "sem-" + Date.now(),
      name: nameCleaned,
      credits: stats.credits,
      gpa: stats.gpa,
      subjects: [...AppStore.gpaSubjects]
    };

    AppStore.semesters.push(newSemester);
    AppStore.gpaSubjects = []; // Clear active
    AppStore.save();
    updateUI();
    
    // Automatically switch to CGPA Tab to let them see it
    document.querySelector('.nav-item[data-tab="cgpa-calc"]').click();
    showToast(`Semester "${nameCleaned}" saved successfully to history.`, "success");
  });

  // 3. CGPA Tab: Add Past Semester
  const formAddSem = document.getElementById("form-add-semester");
  formAddSem.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("sem-name").value.trim();
    const credits = parseInt(document.getElementById("sem-credits").value);
    const gpa = parseFloat(document.getElementById("sem-gpa").value);

    if (!name) {
      showToast("Please enter a valid semester name.", "error");
      return;
    }
    if (isNaN(credits) || credits <= 0) {
      showToast("Credits must be a positive integer.", "error");
      return;
    }
    if (isNaN(gpa) || gpa < 0 || gpa > 10) {
      showToast("GPA must be between 0.00 and 10.00.", "error");
      return;
    }

    const newSem = {
      id: "sem-" + Date.now(),
      name,
      credits,
      gpa
    };

    AppStore.semesters.push(newSem);
    AppStore.save();
    formAddSem.reset();
    updateUI();
    showToast(`Semester "${name}" saved to history.`, "success");
  });

  // Clear Semesters History
  document.getElementById("btn-clear-semesters").addEventListener("click", () => {
    if (AppStore.semesters.length === 0) return;
    if (confirm("Are you sure you want to delete your entire semester records? This resets your cumulative CGPA.")) {
      AppStore.semesters = [];
      AppStore.save();
      updateUI();
      showToast("Semester history wiped clean.", "warning");
    }
  });

  // 4. What-If Submit
  const formWhatIf = document.getElementById("form-what-if");
  formWhatIf.addEventListener("submit", runWhatIfSimulation);

  // Sync defaults into What-If when entering tab
  document.querySelector('.nav-item[data-tab="what-if"]').addEventListener("click", () => {
    const cgpaStats = calculateCumulativeCGPA(AppStore.semesters);
    document.getElementById("wi-current-cgpa").value = cgpaStats.cgpa.toFixed(2);
    document.getElementById("wi-completed-credits").value = cgpaStats.credits;
    runWhatIfSimulation();
  });

  // 5. Target Planner Submit
  const formTargetPlanner = document.getElementById("form-target-planner");
  formTargetPlanner.addEventListener("submit", runTargetPlanning);

  // Pre-fill target values
  document.querySelector('.nav-item[data-tab="target-planner"]').addEventListener("click", () => {
    document.getElementById("tp-desired-cgpa").value = AppStore.profile.targetCGPA || "9.00";
    runTargetPlanning();
  });

  // 6. Profile Edit Form
  const formProfile = document.getElementById("form-edit-profile");
  formProfile.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("prof-name").value.trim();
    const roll = document.getElementById("prof-roll").value.trim();
    const branch = document.getElementById("prof-branch").value.trim();
    const college = document.getElementById("prof-college").value.trim();
    const year = parseInt(document.getElementById("prof-year").value) || 2027;
    const target = parseFloat(document.getElementById("prof-target").value) || 9.0;

    if (!name) {
      showToast("Student name is required.", "error");
      return;
    }

    AppStore.profile = {
      name,
      rollNumber: roll,
      branch,
      college,
      gradYear: year,
      targetCGPA: target
    };
    
    AppStore.save();
    updateUI();
    showToast("Student profile updated successfully.", "success");
  });

  // Pre-fill Profile Forms on settings tab load
  document.querySelector('.nav-item[data-tab="profile-settings"]').addEventListener("click", () => {
    document.getElementById("prof-name").value = AppStore.profile.name;
    document.getElementById("prof-roll").value = AppStore.profile.rollNumber;
    document.getElementById("prof-branch").value = AppStore.profile.branch;
    document.getElementById("prof-college").value = AppStore.profile.college;
    document.getElementById("prof-year").value = AppStore.profile.gradYear;
    document.getElementById("prof-target").value = AppStore.profile.targetCGPA;
  });

  // 7. Print Report Buttons
  document.getElementById("btn-print-report").addEventListener("click", () => {
    window.print();
  });

  document.getElementById("rep-include-insights").addEventListener("change", () => {
    const cgpaStats = calculateCumulativeCGPA(AppStore.semesters);
    const activeSemStats = calculateSemesterGPA(AppStore.gpaSubjects);
    const insights = generateInsights(cgpaStats.cgpa, cgpaStats.credits, activeSemStats);
    syncReportPreview(cgpaStats, activeSemStats, insights);
  });

  document.getElementById("rep-include-active").addEventListener("change", () => {
    const cgpaStats = calculateCumulativeCGPA(AppStore.semesters);
    const activeSemStats = calculateSemesterGPA(AppStore.gpaSubjects);
    const insights = generateInsights(cgpaStats.cgpa, cgpaStats.credits, activeSemStats);
    syncReportPreview(cgpaStats, activeSemStats, insights);
  });

  // 8. Settings Page: Export JSON
  document.getElementById("btn-export-json").addEventListener("click", () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(AppStore));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `smartgpa_backup_${Date.now()}.json`);
    dlAnchorElem.click();
    showToast("Academic backup downloaded successfully.", "success");
  });

  // Import JSON File
  document.getElementById("import-json-file").addEventListener("change", (e) => {
    const fileReader = new FileReader();
    if (!e.target.files.length) return;
    
    fileReader.readAsText(e.target.files[0], "UTF-8");
    fileReader.onload = e => {
      try {
        const parsed = JSON.parse(e.target.result);
        
        // Validation check
        if (parsed.profile && Array.isArray(parsed.gpaSubjects) && Array.isArray(parsed.semesters)) {
          AppStore.profile = parsed.profile;
          AppStore.gpaSubjects = parsed.gpaSubjects;
          AppStore.semesters = parsed.semesters;
          if (parsed.theme) AppStore.theme = parsed.theme;
          
          AppStore.save();
          updateUI();
          
          // Re-initialize charts
          if (window.GPACharts && typeof window.GPACharts.init === "function") {
            window.GPACharts.init(AppStore.semesters, AppStore.gpaSubjects);
          }

          showToast("Academic backup restored successfully!", "success");
          
          // Switch to Dashboard
          document.querySelector('.nav-item[data-tab="dashboard"]').click();
        } else {
          showToast("Invalid backup file structure.", "error");
        }
      } catch (err) {
        showToast("Error parsing file. Ensure it is a valid JSON backup.", "error");
      }
    };
  });

  // Reset database completely
  document.getElementById("btn-reset-data").addEventListener("click", () => {
    if (confirm("CRITICAL WARNING: This will permanently wipe all local storage data, including your profile, subjects, and grading records. Do you wish to proceed?")) {
      AppStore.reset();
      AppStore.save();
      
      // Reload page to reset everything cleanly
      location.reload();
    }
  });

  // Run initial draw
  updateUI();
});
