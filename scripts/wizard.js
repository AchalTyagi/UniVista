document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // STAGE 1: FUNDS LOGIC
    // ==========================================
    const form1 = document.getElementById('wizard-form-1');
    if (form1) {
        const fundsInput = document.getElementById('funds');
        const daysSlider = document.getElementById('days-slider');
        const daysDisplay = document.getElementById('days-display');
        const dailyBudgetEl = document.getElementById('daily-budget');
        const maggieCountEl = document.getElementById('maggie-count');
        const metricStatusEl = document.getElementById('metric-status');
        const pills = document.querySelectorAll('.pill-btn');

        function updateSurvivalRatio() {
            let funds = parseFloat(fundsInput.value) || 0;
            let days = parseInt(daysSlider.value) || 1;
            let dailyBudget = funds / days;
            let maggiePerDay = dailyBudget / 15;

            dailyBudgetEl.textContent = `₹${dailyBudget.toFixed(2)}/day`;
            maggieCountEl.innerHTML = `Equivalent to: <strong style="color: #ffffff;">${maggiePerDay.toFixed(1)} packs of Maggie</strong> per day`;

            if (dailyBudget < 15) {
                metricStatusEl.textContent = "CRITICAL: STARVATION IMMINENT";
                metricStatusEl.style.color = "#ff5252";
            } else if (dailyBudget < 50) {
                metricStatusEl.textContent = "WARNING: NO ROOM FOR ERROR";
                metricStatusEl.style.color = "#fbbf24";
            } else {
                metricStatusEl.textContent = "MANAGEABLE";
                metricStatusEl.style.color = "#4ade80";
            }
        }

        fundsInput.addEventListener('input', updateSurvivalRatio);
        daysSlider.addEventListener('input', (e) => {
            daysDisplay.textContent = e.target.value;
            updateSurvivalRatio();
        });

        pills.forEach(pill => {
            pill.addEventListener('click', () => {
                fundsInput.value = pill.getAttribute('data-val');
                pills.forEach(p => p.classList.remove('selected'));
                pill.classList.add('selected');
                updateSurvivalRatio();
            });
        });

        if(localStorage.getItem('uniVista_funds')) fundsInput.value = localStorage.getItem('uniVista_funds');
        if(localStorage.getItem('uniVista_days')) {
            daysSlider.value = localStorage.getItem('uniVista_days');
            daysDisplay.textContent = localStorage.getItem('uniVista_days');
        }
        
        updateSurvivalRatio();

        form1.addEventListener('submit', (e) => {
            e.preventDefault();
            localStorage.setItem('uniVista_funds', fundsInput.value);
            localStorage.setItem('uniVista_days', daysSlider.value);
            window.location.href = "wizard-2-attendance.html";
        });
    }

    // ==========================================
    // STAGE 2: ATTENDANCE LOGIC
    // ==========================================
    const form2 = document.getElementById('wizard-form-2');
    if (form2) {
        const conductedInput = document.getElementById('conducted');
        const attendedInput = document.getElementById('attended');
        const targetSlider = document.getElementById('target-slider');
        const targetDisplay = document.getElementById('target-display');
        
        const currentPercentEl = document.getElementById('current-percent');
        const bunkAllowanceEl = document.getElementById('bunk-allowance');
        const metricStatusEl = document.getElementById('att-metric-status');

        function updateAttendance() {
            let conducted = parseInt(conductedInput.value) || 0;
            let attended = parseInt(attendedInput.value) || 0;
            let target = parseInt(targetSlider.value) || 75;

            // Auto-correct if user types more attended classes than conducted
            if (attended > conducted && conducted > 0) {
                attended = conducted;
                attendedInput.value = conducted;
            }

            if (conducted === 0 || attendedInput.value === "") {
                currentPercentEl.textContent = "--%";
                bunkAllowanceEl.innerHTML = "";
                metricStatusEl.textContent = "AWAITING INPUT";
                metricStatusEl.style.color = "#a1a1aa";
                return;
            }

            let currentPercent = (attended / conducted) * 100;
            currentPercentEl.textContent = `${currentPercent.toFixed(1)}%`;

            let targetDecimal = target / 100;

            if (currentPercent >= target) {
                // Calculate safe bunks
                let safeBunks = Math.floor((attended - (targetDecimal * conducted)) / targetDecimal);
                safeBunks = Math.max(0, safeBunks); // Prevent negative numbers
                
                bunkAllowanceEl.innerHTML = `You can safely bunk <strong style="color: #ffffff;">${safeBunks}</strong> more consecutive classes.`;
                metricStatusEl.textContent = "SAFE ZONE";
                metricStatusEl.style.color = "#4ade80"; 
            } else {
                // Calculate required classes to recover
                let requiredClasses = Math.ceil(((targetDecimal * conducted) - attended) / (1 - targetDecimal));
                
                bunkAllowanceEl.innerHTML = `You must attend <strong style="color: #ffffff;">${requiredClasses}</strong> consecutive classes to recover.`;
                metricStatusEl.textContent = "CRITICAL: DEBARMENT RISK";
                metricStatusEl.style.color = "#ff5252"; 
            }
        }

        // Real-time Event Listeners
        conductedInput.addEventListener('input', updateAttendance);
        attendedInput.addEventListener('input', updateAttendance);
        
        targetSlider.addEventListener('input', (e) => {
            targetDisplay.textContent = e.target.value;
            updateAttendance();
        });

        // Pre-fill form if user comes back from a future page
        if(localStorage.getItem('uniVista_conducted')) conductedInput.value = localStorage.getItem('uniVista_conducted');
        if(localStorage.getItem('uniVista_attended')) attendedInput.value = localStorage.getItem('uniVista_attended');
        if(localStorage.getItem('uniVista_targetAtt')) {
            targetSlider.value = localStorage.getItem('uniVista_targetAtt');
            targetDisplay.textContent = localStorage.getItem('uniVista_targetAtt');
        }

        // Run immediately on page load
        updateAttendance();

        form2.addEventListener('submit', (e) => {
            e.preventDefault();
            localStorage.setItem('uniVista_conducted', conductedInput.value);
            localStorage.setItem('uniVista_attended', attendedInput.value);
            localStorage.setItem('uniVista_targetAtt', targetSlider.value);
            // Notice: ensure wizard-3-assignments.html exists in your folder before clicking next!
            window.location.href = "wizard-3-assignments.html";
        });
    }
    // ==========================================
    // STAGE 3: ASSIGNMENTS LOGIC
    // ==========================================
    const form3 = document.getElementById('wizard-form-3');
    if (form3) {
        const assignmentsInput = document.getElementById('assignments');
        const deadlineInput = document.getElementById('deadline');
        const hwStatusText = document.getElementById('hw-status-text');
        const metricStatusEl = document.getElementById('hw-metric-status');

        function updateHomeworkStatus() {
            // Safely get values, treat empty strings as empty
            let assignmentsVal = assignmentsInput.value;
            let deadlineVal = deadlineInput.value;

            // If either is completely empty, show awaiting input
            if (assignmentsVal === "" || deadlineVal === "") {
                hwStatusText.textContent = "--";
                metricStatusEl.textContent = "AWAITING INPUT";
                metricStatusEl.style.color = "#a1a1aa";
                return;
            }

            let assignments = parseInt(assignmentsVal);
            let deadline = parseInt(deadlineVal);

            if (assignments === 0) {
                hwStatusText.innerHTML = "Clear skies. Go take a nap.";
                metricStatusEl.textContent = "SAFE ZONE";
                metricStatusEl.style.color = "#4ade80"; // Green
            } else if (deadline <= 1) {
                hwStatusText.innerHTML = "Pull an all-nighter immediately.";
                metricStatusEl.textContent = "DEFCON 1: CRITICAL";
                metricStatusEl.style.color = "#ff5252"; // Red
            } else if (deadline <= 3) {
                hwStatusText.innerHTML = "High stress. Cancel weekend plans.";
                metricStatusEl.textContent = "WARNING";
                metricStatusEl.style.color = "#fbbf24"; // Yellow
            } else {
                hwStatusText.innerHTML = "You have time, but don't slack off.";
                metricStatusEl.textContent = "MANAGEABLE";
                metricStatusEl.style.color = "#4ade80"; // Green
            }
        }

        // Real-time Event Listeners
        assignmentsInput.addEventListener('input', updateHomeworkStatus);
        deadlineInput.addEventListener('input', updateHomeworkStatus);

        // Pre-fill form if data exists in localStorage
        if(localStorage.getItem('uniVista_assignments')) {
            assignmentsInput.value = localStorage.getItem('uniVista_assignments');
        }
        if(localStorage.getItem('uniVista_deadline')) {
            deadlineInput.value = localStorage.getItem('uniVista_deadline');
        }

        // Run immediately on page load
        updateHomeworkStatus();

        // Save and move to Stage 4
        form3.addEventListener('submit', (e) => {
            e.preventDefault();
            localStorage.setItem('uniVista_assignments', assignmentsInput.value);
            localStorage.setItem('uniVista_deadline', deadlineInput.value);
            window.location.href = "wizard-4-sleep.html";
        });
    }

});
