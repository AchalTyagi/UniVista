document.addEventListener('DOMContentLoaded', () => {
    // --- STAGE 2: Attendance Logic ---
    const conductedInput = document.getElementById('conducted');
    const attendedInput = document.getElementById('attended');
    const targetSlider = document.getElementById('target-slider');
    const targetDisplay = document.getElementById('target-display');
    const currentPercentDisplay = document.getElementById('current-percent');
    const bunkAllowanceDisplay = document.getElementById('bunk-allowance');
    const attMetricStatus = document.getElementById('att-metric-status');
    const wizardForm2 = document.getElementById('wizard-form-2');

    function calculateAttendance() {
        // Guard clause to ensure we are on the attendance page
        if (!conductedInput || !attendedInput || !targetSlider) return;

        const conducted = parseInt(conductedInput.value);
        const attended = parseInt(attendedInput.value);
        const target = parseInt(targetSlider.value);

        // Reset UI if inputs are empty or invalid
        if (isNaN(conducted) || isNaN(attended) || conducted <= 0) {
            currentPercentDisplay.textContent = '--%';
            attMetricStatus.textContent = 'AWAITING INPUT';
            attMetricStatus.style.color = '#ffffff';
            bunkAllowanceDisplay.textContent = 'Enter class data to calculate allowance.';
            return;
        }

        // Error state: Cannot attend more classes than conducted
        if (attended > conducted) {
            currentPercentDisplay.textContent = 'ERR';
            attMetricStatus.textContent = 'INVALID INPUT';
            attMetricStatus.style.color = '#ff5252';
            bunkAllowanceDisplay.textContent = 'Classes attended cannot exceed classes conducted.';
            return;
        }

        // Calculate current percentage
        const currentPercent = (attended / conducted) * 100;
        currentPercentDisplay.textContent = `${currentPercent.toFixed(1)}%`;

        if (currentPercent >= target) {
            // Math formula for how many consecutive classes can be skipped
            const skippable = Math.floor((attended * 100 / target) - conducted);
            
            attMetricStatus.textContent = 'SAFE ZONE';
            attMetricStatus.style.color = '#00b894'; 
            
            if (skippable === 0) {
                bunkAllowanceDisplay.textContent = `You are exactly at the target. You cannot skip the next class.`;
            } else {
                bunkAllowanceDisplay.textContent = `You can safely skip the next ${skippable} class(es).`;
            }
        } else {
            // Math formula for how many consecutive classes must be attended to reach the target
            const requiredToAttend = Math.ceil(((target / 100) * conducted - attended) / (1 - (target / 100)));
            
            attMetricStatus.textContent = 'DEBARMENT RISK';
            attMetricStatus.style.color = '#ff5252'; 
            bunkAllowanceDisplay.textContent = `You must attend the next ${requiredToAttend} class(es) to reach ${target}%.`;
        }
    }

    // Initialize Event Listeners for Stage 2
    if (conductedInput && attendedInput && targetSlider) {
        conductedInput.addEventListener('input', calculateAttendance);
        attendedInput.addEventListener('input', calculateAttendance);
        
        targetSlider.addEventListener('input', (e) => {
            targetDisplay.textContent = e.target.value;
            calculateAttendance();
        });

        // Form Submission for Stage 2
        if (wizardForm2) {
            wizardForm2.addEventListener('submit', (e) => {
                e.preventDefault();
                
                // Save telemetry data locally before routing to the next step
                localStorage.setItem('univista_classes_conducted', conductedInput.value);
                localStorage.setItem('univista_classes_attended', attendedInput.value);
                localStorage.setItem('univista_target_attendance', targetSlider.value);
                
                window.location.href = "wizard-3-homework.html";
            });
        }
    }
});