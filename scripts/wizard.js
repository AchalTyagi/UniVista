document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // STAGE 1: FUNDS LOGIC
    // ==========================================
    const fundsInput = document.getElementById('funds');
    const daysSlider = document.getElementById('days-slider');
    const daysDisplay = document.getElementById('days-display');
    const dailyBudgetDisplay = document.getElementById('daily-budget');
    const maggieCountDisplay = document.getElementById('maggie-count');
    const metricStatus = document.getElementById('metric-status');
    const pillBtns = document.querySelectorAll('.pill-btn');
    const wizardForm1 = document.getElementById('wizard-form-1');

    if (fundsInput && daysSlider) {
        const MAGGI_UNIT_COST = 15;

        function calculateBurnRate() {
            const currentFunds = parseFloat(fundsInput.value) || 0;
            const remainingDays = parseInt(daysSlider.value) || 1;

            const dailyBudget = currentFunds / remainingDays;
            const maggiePerDay = Math.floor(dailyBudget / MAGGI_UNIT_COST);

            dailyBudgetDisplay.textContent = `₹${dailyBudget.toFixed(2)}/day`;

            if (fundsInput.value === '') {
                metricStatus.textContent = "AWAITING INPUT";
                metricStatus.style.color = "#ffffff";
                maggieCountDisplay.textContent = "";
            } else if (currentFunds === 0) {
                metricStatus.textContent = "TOTAL INSOLVENCY";
                metricStatus.style.color = "#ff5252";
                maggieCountDisplay.textContent = "0 meals. Emergency aid required.";
            } else if (maggiePerDay >= 3) {
                metricStatus.textContent = "NOMINAL";
                metricStatus.style.color = "#00b894";
                maggieCountDisplay.textContent = `Sustainable: ${maggiePerDay} unit(s) per day.`;
            } else if (maggiePerDay > 0) {
                metricStatus.textContent = "WARNING";
                metricStatus.style.color = "#f39c12";
                maggieCountDisplay.textContent = `Rationing required: ${maggiePerDay} unit(s) per day.`;
            } else {
                metricStatus.textContent = "CRITICAL DEFICIT";
                metricStatus.style.color = "#ff5252";
                maggieCountDisplay.textContent = "Insufficient daily capital for baseline nutrition.";
            }
        }

        // Trigger calculation when typing
        fundsInput.addEventListener('input', calculateBurnRate);
        
        // Trigger calculation when dragging slider
        daysSlider.addEventListener('input', (e) => {
            daysDisplay.textContent = e.target.value;
            calculateBurnRate();
        });

        // Trigger calculation when clicking quick-select pills
        pillBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                fundsInput.value = e.target.getAttribute('data-val');
                calculateBurnRate(); 
            });
        });

        // Handle redirection to Stage 2
        // Handle redirection to Stage 2
        if (wizardForm1) {
            wizardForm1.addEventListener('submit', (e) => {
                e.preventDefault(); 
                // UPDATED KEYS
                localStorage.setItem('uniVista_funds', fundsInput.value);
                localStorage.setItem('uniVista_days', daysSlider.value);
                
                window.location.href = "wizard-2-attendance.html";
            });
        }
    }

    // ==========================================
    // STAGE 2: ATTENDANCE LOGIC
    // ==========================================
    const conductedInput = document.getElementById('conducted');
    const attendedInput = document.getElementById('attended');
    const targetSlider = document.getElementById('target-slider');
    const targetDisplay = document.getElementById('target-display');
    const currentPercentDisplay = document.getElementById('current-percent');
    const bunkAllowanceDisplay = document.getElementById('bunk-allowance');
    const attMetricStatus = document.getElementById('att-metric-status');
    const wizardForm2 = document.getElementById('wizard-form-2');

    if (conductedInput && attendedInput && targetSlider) {
        function calculateAttendance() {
            const conducted = parseInt(conductedInput.value);
            const attended = parseInt(attendedInput.value);
            const target = parseInt(targetSlider.value);

            if (isNaN(conducted) || isNaN(attended) || conducted <= 0) {
                currentPercentDisplay.textContent = '--%';
                attMetricStatus.textContent = 'AWAITING INPUT';
                attMetricStatus.style.color = '#ffffff';
                bunkAllowanceDisplay.textContent = '';
                return;
            }

            if (attended > conducted) {
                currentPercentDisplay.textContent = 'ERR';
                attMetricStatus.textContent = 'INVALID INPUT';
                attMetricStatus.style.color = '#ff5252';
                bunkAllowanceDisplay.textContent = 'Classes attended cannot exceed classes conducted.';
                return;
            }

            const currentPercent = (attended / conducted) * 100;
            currentPercentDisplay.textContent = `${currentPercent.toFixed(1)}%`;

            if (currentPercent >= target) {
                const skippable = Math.floor((attended * 100 / target) - conducted);
                attMetricStatus.textContent = 'SAFE ZONE';
                attMetricStatus.style.color = '#00b894'; 
                
                if (skippable === 0) {
                    bunkAllowanceDisplay.textContent = `You are exactly at target. Cannot skip next class.`;
                } else {
                    bunkAllowanceDisplay.textContent = `You can safely skip the next ${skippable} class(es).`;
                }
            } else {
                const requiredToAttend = target === 100 ? null : Math.max(0, Math.ceil(((target / 100) * conducted - attended) / (1 - (target / 100))));
                attMetricStatus.textContent = 'DEBARMENT RISK';
                attMetricStatus.style.color = '#ff5252'; 
                bunkAllowanceDisplay.textContent = target === 100 ? 'To reach 100%, you must attend every future class; the exact number depends on how many classes are conducted next.' : `Must attend next ${requiredToAttend} class(es) to reach ${target}%.`;
            }
        }

        conductedInput.addEventListener('input', calculateAttendance);
        attendedInput.addEventListener('input', calculateAttendance);
        
        targetSlider.addEventListener('input', (e) => {
            targetDisplay.textContent = e.target.value;
            calculateAttendance();
        });

        if (wizardForm2) {
            wizardForm2.addEventListener('submit', (e) => {
                e.preventDefault();
                // UPDATED KEYS
                localStorage.setItem('uniVista_conducted', conductedInput.value);
                localStorage.setItem('uniVista_attended', attendedInput.value);
                localStorage.setItem('uniVista_targetAtt', targetSlider.value);
                
                window.location.href = "wizard-3-assignments.html";
            });
        }
    }

    // ==========================================
    // STAGE 3: ASSIGNMENTS LOGIC
    // ==========================================
    const assignmentsInput = document.getElementById('assignments');
    const deadlineInput = document.getElementById('deadline');
    const hwStatus = document.getElementById('hw-metric-status');
    const hwStatusText = document.getElementById('hw-status-text');
    const wizardForm3 = document.getElementById('wizard-form-3');

    if (assignmentsInput && deadlineInput) {
        function calculateAssignmentThreat() {
            const assignments = Number(assignmentsInput.value);
            const deadline = Number(deadlineInput.value);

            if (assignmentsInput.value === '' || deadlineInput.value === '') {
                hwStatus.textContent = 'AWAITING INPUT';
                hwStatusText.textContent = '--';
                return;
            }
            if (assignments < 0 || deadline < 0 || !Number.isFinite(assignments) || !Number.isFinite(deadline)) {
                hwStatus.textContent = 'INVALID INPUT';
                hwStatusText.textContent = 'Enter valid non-negative values';
                return;
            }

            let status;
            if (assignments === 0) status = 'NO PENDING WORK';
            else if (deadline <= 1 && assignments >= 2) status = 'CRITICAL';
            else if (deadline <= 2 || assignments >= 4) status = 'HIGH';
            else if (assignments >= 2 || deadline <= 5) status = 'MODERATE';
            else status = 'LOW';

            hwStatus.textContent = status;
            hwStatusText.textContent = status;
            hwStatus.style.color = status === 'CRITICAL' ? '#ff5252' : status === 'HIGH' ? '#f39c12' : status === 'NO PENDING WORK' ? '#00b894' : '';
        }

        assignmentsInput.addEventListener('input', calculateAssignmentThreat);
        deadlineInput.addEventListener('input', calculateAssignmentThreat);
        const savedAssignments = localStorage.getItem('uniVista_assignments');
        const savedDeadline = localStorage.getItem('uniVista_deadline');
        if (savedAssignments !== null) assignmentsInput.value = savedAssignments;
        if (savedDeadline !== null) deadlineInput.value = savedDeadline;
        calculateAssignmentThreat();

        if (wizardForm3) {
            wizardForm3.addEventListener('submit', (e) => {
                e.preventDefault();
                if (!wizardForm3.reportValidity()) return;
                localStorage.setItem('uniVista_assignments', assignmentsInput.value);
                localStorage.setItem('uniVista_deadline', deadlineInput.value);
                alert('Your assignment details have been saved. The Sleep and Calculate pages will be added later.');
            });
        }
    }
});