/**
 * Smart GPA & CGPA Calculator - Analytics Charts (charts.js)
 */

window.GPACharts = (() => {
  // Chart Instances
  let trendChart = null;
  let distChart = null;
  let creditsChart = null;
  let freqChart = null;
  let whatifChart = null;

  // Retrieve Theme Colors for Chart Customization
  function getThemeConfig() {
    const isLight = document.body.classList.contains("light-mode");
    return {
      textColor: isLight ? "#4f46e5" : "#9ca3af",
      gridColor: isLight ? "rgba(79, 70, 229, 0.06)" : "rgba(255, 255, 255, 0.05)",
      tooltipBg: isLight ? "rgba(255, 255, 255, 0.95)" : "rgba(15, 23, 42, 0.95)",
      tooltipBorder: isLight ? "#4f46e5" : "rgba(255, 255, 255, 0.08)",
      tooltipText: isLight ? "#1e1b4b" : "#f3f4f6"
    };
  }

  // Common Chart Font Family
  const fontConfig = {
    family: "'Outfit', 'Inter', sans-serif"
  };

  /**
   * Initializes all analytics charts
   */
  function init(semesters = [], activeSubjects = []) {
    const cfg = getThemeConfig();

    // Destroy existing charts to reload with correct theme styles
    destroyAllCharts();

    // 1. GPA vs CGPA Trend Line Chart
    const trendCtx = document.getElementById("chart-gpa-trend")?.getContext("2d");
    if (trendCtx) {
      const labels = semesters.map(s => s.name);
      const gpaData = semesters.map(s => parseFloat(s.gpa));
      
      // Calculate running CGPA curve for the line
      let runningWeightedSum = 0;
      let runningCredits = 0;
      const cgpaData = semesters.map(s => {
        runningWeightedSum += parseFloat(s.gpa) * parseInt(s.credits);
        runningCredits += parseInt(s.credits);
        return runningCredits > 0 ? parseFloat((runningWeightedSum / runningCredits).toFixed(2)) : 0;
      });

      trendChart = new Chart(trendCtx, {
        type: 'line',
        data: {
          labels: labels.length > 0 ? labels : ["No Data"],
          datasets: [
            {
              label: 'Semester GPA',
              data: gpaData.length > 0 ? gpaData : [0],
              borderColor: '#7c3aed',
              backgroundColor: 'rgba(124, 58, 237, 0.05)',
              borderWidth: 3,
              tension: 0.3,
              fill: true,
              pointBackgroundColor: '#7c3aed',
              pointHoverRadius: 6
            },
            {
              label: 'Cumulative CGPA',
              data: cgpaData.length > 0 ? cgpaData : [0],
              borderColor: '#06b6d4',
              backgroundColor: 'transparent',
              borderWidth: 3,
              tension: 0.2,
              pointBackgroundColor: '#06b6d4',
              pointHoverRadius: 6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: { color: cfg.textColor, font: fontConfig }
            },
            tooltip: {
              backgroundColor: cfg.tooltipBg,
              borderColor: cfg.tooltipBorder,
              borderWidth: 1,
              titleColor: cfg.tooltipText,
              bodyColor: cfg.tooltipText,
              titleFont: fontConfig,
              bodyFont: fontConfig
            }
          },
          scales: {
            x: {
              grid: { color: cfg.gridColor },
              ticks: { color: cfg.textColor, font: fontConfig }
            },
            y: {
              min: 0,
              max: 10,
              grid: { color: cfg.gridColor },
              ticks: { color: cfg.textColor, font: fontConfig }
            }
          }
        }
      });
    }

    // 2. Grade Distribution Pie Chart
    const distCtx = document.getElementById("chart-grade-dist")?.getContext("2d");
    if (distCtx) {
      // Gather all subjects (active + nested in history)
      const gradesCount = { "A+": 0, "A": 0, "B+": 0, "B": 0, "C": 0, "D": 0, "F": 0 };
      
      activeSubjects.forEach(s => { if (gradesCount[s.grade] !== undefined) gradesCount[s.grade]++; });
      semesters.forEach(sem => {
        if (sem.subjects && Array.isArray(sem.subjects)) {
          sem.subjects.forEach(s => { if (gradesCount[s.grade] !== undefined) gradesCount[s.grade]++; });
        }
      });

      const dataValues = Object.values(gradesCount);
      const dataLabels = Object.keys(gradesCount);
      
      // Filter out grades with 0 frequency for aesthetic cleanliness
      const finalLabels = [];
      const finalData = [];
      dataValues.forEach((val, index) => {
        if (val > 0) {
          finalLabels.push(dataLabels[index]);
          finalData.push(val);
        }
      });

      // Default visual if empty
      const isDataEmpty = finalData.length === 0;

      distChart = new Chart(distCtx, {
        type: 'doughnut',
        data: {
          labels: isDataEmpty ? ["No Data"] : finalLabels,
          datasets: [{
            data: isDataEmpty ? [1] : finalData,
            backgroundColor: isDataEmpty ? ['rgba(156,163,175,0.15)'] : [
              '#22c55e', // A+ Green
              '#06b6d4', // A Cyan
              '#3b82f6', // B+ Blue
              '#4f46e5', // B Indigo
              '#f59e0b', // C Amber
              '#f97316', // D Orange
              '#ef4444'  // F Red
            ],
            borderColor: isDataEmpty ? 'rgba(156,163,175,0.2)' : 'rgba(0, 0, 0, 0.1)',
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: { color: cfg.textColor, font: fontConfig }
            },
            tooltip: {
              enabled: !isDataEmpty,
              backgroundColor: cfg.tooltipBg,
              borderColor: cfg.tooltipBorder,
              borderWidth: 1,
              titleColor: cfg.tooltipText,
              bodyColor: cfg.tooltipText,
              titleFont: fontConfig,
              bodyFont: fontConfig
            }
          },
          cutout: '65%'
        }
      });
    }

    // 3. Credits Completed per Semester Bar Chart
    const creditsCtx = document.getElementById("chart-credits-sems")?.getContext("2d");
    if (creditsCtx) {
      const labels = semesters.map(s => s.name);
      const creditsData = semesters.map(s => parseInt(s.credits) || 0);

      creditsChart = new Chart(creditsCtx, {
        type: 'bar',
        data: {
          labels: labels.length > 0 ? labels : ["No Data"],
          datasets: [{
            label: 'Credits Completed',
            data: creditsData.length > 0 ? creditsData : [0],
            backgroundColor: 'rgba(6, 182, 212, 0.55)',
            borderColor: '#06b6d4',
            borderWidth: 2,
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: { color: cfg.textColor, font: fontConfig }
            },
            tooltip: {
              backgroundColor: cfg.tooltipBg,
              borderColor: cfg.tooltipBorder,
              borderWidth: 1,
              titleColor: cfg.tooltipText,
              bodyColor: cfg.tooltipText
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: cfg.textColor, font: fontConfig }
            },
            y: {
              grid: { color: cfg.gridColor },
              ticks: { color: cfg.textColor, font: fontConfig }
            }
          }
        }
      });
    }

    // 4. Grade Point Frequencies Chart (Bar)
    const freqCtx = document.getElementById("chart-grade-frequency")?.getContext("2d");
    if (freqCtx) {
      // We map credits weight vs grade point frequency
      // Let's count total subjects credit weights per Grade point scale
      const freqMap = { 10: 0, 9: 0, 8: 0, 7: 0, 6: 0, 5: 0, 0: 0 };
      
      activeSubjects.forEach(s => {
        const pt = getGradePoint(s.grade);
        freqMap[pt] += parseInt(s.credits);
      });
      semesters.forEach(sem => {
        if (sem.subjects && Array.isArray(sem.subjects)) {
          sem.subjects.forEach(s => {
            const pt = getGradePoint(s.grade);
            freqMap[pt] += parseInt(s.credits);
          });
        }
      });

      const labels = ['A+ (10)', 'A (9)', 'B+ (8)', 'B (7)', 'C (6)', 'D (5)', 'F (0)'];
      const data = [freqMap[10], freqMap[9], freqMap[8], freqMap[7], freqMap[6], freqMap[5], freqMap[0]];
      const hasData = data.some(v => v > 0);

      freqChart = new Chart(freqCtx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Total Credit Weight',
            data: hasData ? data : [0, 0, 0, 0, 0, 0, 0],
            backgroundColor: 'rgba(79, 70, 229, 0.55)',
            borderColor: '#4f46e5',
            borderWidth: 2,
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: { color: cfg.textColor, font: fontConfig }
            },
            tooltip: {
              backgroundColor: cfg.tooltipBg,
              borderColor: cfg.tooltipBorder,
              borderWidth: 1,
              titleColor: cfg.tooltipText,
              bodyColor: cfg.tooltipText
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: cfg.textColor, font: fontConfig }
            },
            y: {
              grid: { color: cfg.gridColor },
              ticks: { color: cfg.textColor, font: fontConfig }
            }
          }
        }
      });
    }
  }

  /**
   * Run when data recalculates
   */
  function update(semesters = [], activeSubjects = []) {
    init(semesters, activeSubjects);
  }

  /**
   * Renders the scenario bar chart in What-If Simulator
   */
  function updateWhatIf(current = 0, best = 0, expected = 0, worst = 0) {
    const cfg = getThemeConfig();
    const ctx = document.getElementById("chart-whatif-scenarios")?.getContext("2d");
    if (!ctx) return;

    if (whatifChart) {
      whatifChart.destroy();
    }

    whatifChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Current CGPA', 'Best Case (Perfect 10)', 'Target Case (Expected)', 'Worst Case (Failsafe 6.0)'],
        datasets: [{
          label: 'Cumulative CGPA Outcome',
          data: [current, best, expected, worst],
          backgroundColor: [
            'rgba(156, 163, 175, 0.45)', // Grey
            'rgba(34, 197, 94, 0.55)',  // Green
            'rgba(6, 182, 212, 0.55)',   // Cyan
            'rgba(239, 68, 68, 0.55)'    // Red
          ],
          borderColor: [
            '#9ca3af',
            '#22c55e',
            '#06b6d4',
            '#ef4444'
          ],
          borderWidth: 2,
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: cfg.tooltipBg,
            borderColor: cfg.tooltipBorder,
            borderWidth: 1,
            titleColor: cfg.tooltipText,
            bodyColor: cfg.tooltipText
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: cfg.textColor, font: fontConfig }
          },
          y: {
            min: 0,
            max: 10,
            grid: { color: cfg.gridColor },
            ticks: { color: cfg.textColor, font: fontConfig }
          }
        }
      }
    });
  }

  // Private Helper
  function getGradePoint(grade) {
    const points = { "A+": 10, "A": 9, "B+": 8, "B": 7, "C": 6, "D": 5, "F": 0 };
    return points[grade] !== undefined ? points[grade] : 0;
  }

  // Destroy all active charts to avoid rendering conflicts
  function destroyAllCharts() {
    if (trendChart) trendChart.destroy();
    if (distChart) distChart.destroy();
    if (creditsChart) creditsChart.destroy();
    if (freqChart) freqChart.destroy();
  }

  return {
    init,
    update,
    updateWhatIf
  };
})();
