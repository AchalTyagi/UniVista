document.addEventListener('DOMContentLoaded', () => {
    
    // Stage 1: Funds Logic
    const form1 = document.getElementById('wizard-form-1');
    
    if (form1) {
        const fundsInput = document.getElementById('funds');
        const daysSlider = document.getElementById('days-slider');
        const daysDisplay = document.getElementById('days-display');
        const dailyBudgetEl = document.getElementById('daily-budget');
        const maggieCountEl = document.getElementById('maggie-count');
        const metricStatusEl = document.getElementById('metric-status');
        const pills = document.querySelectorAll('.pill-btn');

        // Core Calculation Function
        function updateSurvivalRatio() {
            // Get current values (default to 0 or 1 if empty to prevent NaN errors)
            let funds = parseFloat(fundsInput.value) || 0;
            let days = parseInt(daysSlider.value) || 1;
            
            // Calculate ratios
            let dailyBudget = funds / days;
            let maggiePerDay = dailyBudget / 15;

            // Update DOM text
            dailyBudgetEl.textContent = `₹${dailyBudget.toFixed(2)}/day`;
            maggieCountEl.innerHTML = `Equivalent to: <strong style="color: #ffffff;">${maggiePerDay.toFixed(1)} packs of Maggie</strong> per day`;

            // Update Status Badge Colors based on severity
            if (dailyBudget < 15) {
                metricStatusEl.textContent = "CRITICAL: STARVATION IMMINENT";
                metricStatusEl.style.color = "#ff5252"; // Red
                metricStatusEl.style.background = "rgba(255,82,82,0.1)";
            } else if (dailyBudget < 50) {
                metricStatusEl.textContent = "WARNING: NO ROOM FOR ERROR";
                metricStatusEl.style.color = "#fbbf24"; // Yellow
                metricStatusEl.style.background = "rgba(251,191,36,0.1)";
            } else {
                metricStatusEl.textContent = "MANAGEABLE";
                metricStatusEl.style.color = "#4ade80"; // Green
                metricStatusEl.style.background = "rgba(74,222,128,0.1)";
            }
        }

        // Event Listeners for instant updates
        fundsInput.addEventListener('input', updateSurvivalRatio);
        
        daysSlider.addEventListener('input', (e) => {
            daysDisplay.textContent = e.target.value; // Updates the "10 Days" text next to slider
            updateSurvivalRatio();
        });

        // Predicament Pills Logic
        pills.forEach(pill => {
            pill.addEventListener('click', () => {
                fundsInput.value = pill.getAttribute('data-val'); // Set input value
                
                // Toggle active pill styling
                pills.forEach(p => p.classList.remove('selected'));
                pill.classList.add('selected');
                
                updateSurvivalRatio(); // Run calc immediately
            });
        });

        // Pre-fill form if user comes back from Stage 2
        if(localStorage.getItem('uniVista_funds')) {
            fundsInput.value = localStorage.getItem('uniVista_funds');
        }
        if(localStorage.getItem('uniVista_days')) {
            daysSlider.value = localStorage.getItem('uniVista_days');
            daysDisplay.textContent = localStorage.getItem('uniVista_days');
        }
        
        // Run calculation once on page load
        updateSurvivalRatio();

        // Save and move to Stage 2
        form1.addEventListener('submit', (e) => {
            e.preventDefault();
            localStorage.setItem('uniVista_funds', fundsInput.value);
            localStorage.setItem('uniVista_days', daysSlider.value);
            window.location.href = "wizard-2-attendance.html";
        });
    }

    // Stage 3: Assignments Logic
    const form3 = document.getElementById('wizard-form-3');
    
    if (form3) {
        const assignmentsInput = document.getElementById('assignments');
        const deadlineInput = document.getElementById('deadline');
        const hwStatusText = document.getElementById('hw-status-text');
        const metricStatusEl = document.getElementById('hw-metric-status');

        function updateHomeworkStatus() {
            // Safely parse inputs, default to empty string if blank
            let assignments = assignmentsInput.value !== "" ? parseInt(assignmentsInput.value) : "";
            let deadline = deadlineInput.value !== "" ? parseInt(deadlineInput.value) : "";

            // Awaiting input state
            if (assignments === "" || deadline === "") {
                hwStatusText.textContent = "--";
                metricStatusEl.textContent = "AWAITING INPUT";
                metricStatusEl.style.color = "#a1a1aa";
                metricStatusEl.style.background = "transparent";
                return;
            }

            // Calculation states
            if (assignments === 0) {
                hwStatusText.innerHTML = "Clear skies. Go take a nap.";
                metricStatusEl.textContent = "SAFE ZONE";
                metricStatusEl.style.color = "#4ade80"; 
                metricStatusEl.style.background = "rgba(74,222,128,0.1)";
            } else if (deadline <= 1) {
                hwStatusText.innerHTML = "Pull an all-nighter immediately.";
                metricStatusEl.textContent = "DEFCON 1: CRITICAL";
                metricStatusEl.style.color = "#ff5252"; 
                metricStatusEl.style.background = "rgba(255,82,82,0.1)";
            } else if (deadline <= 3) {
                hwStatusText.innerHTML = "High stress. Cancel weekend plans.";
                metricStatusEl.textContent = "WARNING";
                metricStatusEl.style.color = "#fbbf24"; 
                metricStatusEl.style.background = "rgba(251,191,36,0.1)";
            } else {
                hwStatusText.innerHTML = "You have time, but don't slack off.";
                metricStatusEl.textContent = "MANAGEABLE";
                metricStatusEl.style.color = "#4ade80"; 
                metricStatusEl.style.background = "rgba(74,222,128,0.1)";
            }
        }

        assignmentsInput.addEventListener('input', updateHomeworkStatus);
        deadlineInput.addEventListener('input', updateHomeworkStatus);

        if(localStorage.getItem('uniVista_assignments')) assignmentsInput.value = localStorage.getItem('uniVista_assignments');
        if(localStorage.getItem('uniVista_deadline')) deadlineInput.value = localStorage.getItem('uniVista_deadline');

        updateHomeworkStatus();

        form3.addEventListener('submit', (e) => {
            e.preventDefault();
            localStorage.setItem('uniVista_assignments', assignmentsInput.value);
            localStorage.setItem('uniVista_deadline', deadlineInput.value);
            window.location.href = "wizard-4-sleep.html";
        });
    }
});
