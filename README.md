# Smart GPA & CGPA Calculator 🎓

A modern, responsive, and visually stunning student-friendly GPA/CGPA management web application. It features a glassmorphic user interface, dynamic dashboards, predictive scenario simulators, target grade planners, interactive charts, local persistence, backup facilities, and printable transcript reports.

Built using only pure frontend technologies—**HTML5, CSS3, and Vanilla JavaScript**—with no backend, logins, or signup steps required.

---

## 🚀 Key Features

* **Visual Student Dashboard**: High-level tracking of current GPA, cumulative CGPA, semesters completed, credits earned, active badges, and automatically generated study insights.
* **GPA Calculator**: Real-time calculation of active term GPA. Supports adding unlimited subjects, credit hours weighting, grade mappings, sorting, filtering, quick edits, and clearing subjects.
* **CGPA Manager**: Aggregates past terms in a history panel. Tracks cumulative credits and maps standing categories (Excellent, Very Good, Good, etc.).
* **"What-If" Simulator**: Predicts final graduation CGPA based on expected future averages and remaining semesters. Includes Best-Case (perfect 10), Worst-Case (failsafe 6.0), and Target-Case comparison cards with dynamic charts.
* **Target CGPA Planner**: Computes the required GPA in remaining semesters to achieve a target CGPA. Includes circular feasibility gauges (Impossible, Challenging, Highly Feasible) and study recommendations.
* **Analytics Panel**: Charts representing GPA trends over time, credit contribution per semester, grade distributions, and grade point frequencies using Chart.js.
* **Academic Profile**: Custom profile sections (Name, Roll No., Branch, College, Target GPA) backed up automatically inside the browser's Local Storage.
* **Official Reports**: Generates formal academic transcript sheets in a clean vector format. Features dynamic toggle filters and uses custom CSS print styles to output high-quality PDFs via the browser's print dialog (`window.print()`).
* **Cache Backups (JSON)**: Export your data in JSON backup files or import them to restore your academic profile across different machines.
* **Theme Switching**: Includes theme toggles (Dark and Light mode) with theme choice persistence.

---

## 📊 Grading Scale Map

The calculator utilizes a standard 10-point scale:

| Grade | Grade Point | Definition |
| :--- | :--- | :--- |
| **A+** | 10 | Outstanding |
| **A**  | 9  | Excellent |
| **B+** | 8  | Very Good |
| **B**  | 7  | Good |
| **C**  | 6  | Average |
| **D**  | 5  | Pass |
| **F**  | 0  | Fail |

---

## 🛠️ Technology Stack

* **Structure**: Semantic HTML5 markup
* **Styling**: Vanilla CSS3 (Custom properties, Flexbox/Grid, Backdrop-filters, Transitions)
* **Logic**: Vanilla ES6+ JavaScript
* **Libraries**:
  * [Chart.js](https://www.chartjs.org/) (for interactive visualizations)
  * [Font Awesome](https://fontawesome.com/) (for modern iconography)

---

## 💻 Local Setup & Execution

Since the project operates entirely client-side, running it is simple:

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/arvindpeddagolla-cloud/smartCGPA.git
   cd smartCGPA
   ```

2. **Run a Static Server**:
   Any basic web server can host the files. For example, using Python:
   ```bash
   python -m http.server 8080
   ```

3. **Open in Browser**:
   Navigate to `http://localhost:8080` to launch the application.
