document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // SHARED HELPERS & ASSESSMENT LOGIC
    // (used by the live previews AND the final results page,
    //  so the numbers always agree)
    // ==========================================
    const KEY = 'uniVista_';
    const MAGGI_UNIT_COST = 15;
    const COLORS = { good: '#00b894', caution: '#f1c40f', warn: '#f39c12', bad: '#ff5252', neutral: '#ffffff' };

    const get = (k) => localStorage.getItem(KEY + k);
    const set = (k, v) => localStorage.setItem(KEY + k, v);
    const num = (el) => (el.value.trim() === '' ? NaN : Number(el.value));
    const restore = (el, key) => { const v = get(key); if (v !== null && el) el.value = v; };

    function assessFunds(funds, days) {
        const daily = funds / days;
        const maggi = Math.floor(daily / MAGGI_UNIT_COST);
        const score = Math.min(100, Math.round((daily / (3 * MAGGI_UNIT_COST)) * 100));
        if (funds === 0) return { level: 'bad', status: 'TOTAL INSOLVENCY', note: '0 meals. Emergency aid required.', daily, score: 0 };
        if (maggi >= 3) return { level: 'good', status: 'NOMINAL', note: `Sustainable: ${maggi} unit(s) per day.`, daily, score };
        if (maggi > 0) return { level: 'warn', status: 'WARNING', note: `Rationing required: ${maggi} unit(s) per day.`, daily, score };
        return { level: 'bad', status: 'CRITICAL DEFICIT', note: 'Insufficient daily capital for baseline nutrition.', daily, score };
    }

    function assessAttendance(conducted, attended, target) {
        if (Number.isNaN(conducted) || Number.isNaN(attended)) return { state: 'empty' };
        if (!Number.isInteger(conducted) || !Number.isInteger(attended) || conducted <= 0 || attended < 0) {
            return { state: 'invalid', note: 'Enter whole, non-negative class counts.' };
        }
        if (attended > conducted) return { state: 'invalid', note: 'Classes attended cannot exceed classes conducted.' };

        const percent = (attended / conducted) * 100;
        // Integer comparison avoids floating-point edge cases (e.g. exactly 75%)
        const safe = attended * 100 >= target * conducted;

        if (safe) {
            const skippable = Math.floor((attended * 100) / target) - conducted;
            return {
                state: 'ok', safe: true, percent, skippable, score: 100, level: 'good', status: 'SAFE ZONE',
                note: skippable === 0
                    ? 'You are exactly at target. Cannot skip next class.'
                    : `You can safely skip the next ${skippable} class(es).`
            };
        }
        const required = target === 100 ? null : Math.ceil((target * conducted - 100 * attended) / (100 - target));
        return {
            state: 'ok', safe: false, percent, required, level: 'bad', status: 'DEBARMENT RISK',
            score: Math.max(0, Math.round(100 - (target - percent) * 6)),
            note: target === 100
                ? 'To reach 100%, you must attend every future class; it can no longer be recovered once a class is missed.'
                : `Must attend next ${required} class(es) to reach ${target}%.`
        };
    }

    function assessHomework(assignments, deadline) {
        if (assignments === 0) return { status: 'NO PENDING WORK', level: 'good', score: 100 };
        // A deadline of zero means work is due today. Otherwise, use a simple
        // capacity rule: plan for roughly one assignment per available day.
        if (deadline === 0) return { status: 'CRITICAL', level: 'bad', score: 10 };
        const assignmentsPerDay = assignments / deadline;
        if (assignmentsPerDay <= 1) return { status: 'RELAX', level: 'good', score: 90 };
        if (assignmentsPerDay >= 2 || deadline <= 1) return { status: 'CRITICAL', level: 'bad', score: 10 };
        if (deadline <= 2 || assignmentsPerDay > 1.5) return { status: 'HIGH', level: 'warn', score: 35 };
        return { status: 'MODERATE', level: 'caution', score: 60 };
    }

    function assessSleep(sleep, caffeine) {
        let status, level, score;
        if (sleep < 3) { status = 'SEVERE DEPRIVATION'; level = 'bad'; score = 10; }
        else if (sleep < 5) { status = 'ZOMBIE MODE'; level = 'bad'; score = 30; }
        else if (sleep < 7) { status = 'RUNNING ON FUMES'; level = 'warn'; score = 60; }
        else { status = 'FUNCTIONAL'; level = 'good'; score = 100; }
        const overloaded = caffeine >= 5;
        if (overloaded) score = Math.max(0, score - 10);
        const debt = Math.max(0, 8 - sleep) * 3; // hours of debt over the 3-day window
        const note = `${debt.toFixed(1)} hrs sleep debt over 3 days` + (overloaded ? ' · caffeine overload' : '');
        return { status, level, score, debt, note };
    }

    const isInvalidFunds = (f) => Number.isNaN(f) || f < 0;

    // ==========================================
    // STAGE 1: FUNDS
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
        function renderFunds() {
            const funds = num(fundsInput);
            const days = parseInt(daysSlider.value) || 1;
            daysDisplay.textContent = days;

            if (Number.isNaN(funds)) {
                dailyBudgetDisplay.textContent = '₹--/day';
                metricStatus.textContent = 'AWAITING INPUT';
                metricStatus.style.color = COLORS.neutral;
                maggieCountDisplay.textContent = '';
                return;
            }
            if (funds < 0) {
                dailyBudgetDisplay.textContent = '₹--/day';
                metricStatus.textContent = 'INVALID INPUT';
                metricStatus.style.color = COLORS.bad;
                maggieCountDisplay.textContent = 'Funds cannot be negative.';
                return;
            }
            const r = assessFunds(funds, days);
            dailyBudgetDisplay.textContent = `₹${r.daily.toFixed(2)}/day`;
            metricStatus.textContent = r.status;
            metricStatus.style.color = COLORS[r.level];
            maggieCountDisplay.textContent = r.note;
        }

        function syncPills() {
            pillBtns.forEach(b => b.classList.toggle('selected', b.getAttribute('data-val') === fundsInput.value));
        }

        restore(fundsInput, 'funds');
        restore(daysSlider, 'days');
        renderFunds();
        syncPills();

        fundsInput.addEventListener('input', () => { renderFunds(); syncPills(); });
        daysSlider.addEventListener('input', renderFunds);
        pillBtns.forEach(btn => btn.addEventListener('click', () => {
            fundsInput.value = btn.getAttribute('data-val');
            renderFunds();
            syncPills();
        }));

        if (wizardForm1) {
            wizardForm1.addEventListener('submit', async (e) => {
                e.preventDefault();
                if (isInvalidFunds(num(fundsInput))) { fundsInput.focus(); return; }
                set('funds', fundsInput.value);
                set('days', daysSlider.value);
                if (window.UniVistaData) await window.UniVistaData.saveRecord('wizard-funds', { funds: Number(fundsInput.value), days: Number(daysSlider.value) });
                window.location.href = 'wizard-2-attendance.html';
            });
        }
    }

    // ==========================================
    // STAGE 2: ATTENDANCE
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
        function renderAttendance() {
            const target = parseInt(targetSlider.value);
            targetDisplay.textContent = target;
            const r = assessAttendance(num(conductedInput), num(attendedInput), target);

            if (r.state === 'empty') {
                currentPercentDisplay.textContent = '--%';
                attMetricStatus.textContent = 'AWAITING INPUT';
                attMetricStatus.style.color = COLORS.neutral;
                bunkAllowanceDisplay.textContent = '';
            } else if (r.state === 'invalid') {
                currentPercentDisplay.textContent = 'ERR';
                attMetricStatus.textContent = 'INVALID INPUT';
                attMetricStatus.style.color = COLORS.bad;
                bunkAllowanceDisplay.textContent = r.note;
            } else {
                currentPercentDisplay.textContent = `${r.percent.toFixed(1)}%`;
                attMetricStatus.textContent = r.status;
                attMetricStatus.style.color = COLORS[r.level];
                bunkAllowanceDisplay.textContent = r.note;
            }
            return r;
        }

        restore(conductedInput, 'conducted');
        restore(attendedInput, 'attended');
        restore(targetSlider, 'targetAtt');
        renderAttendance();

        conductedInput.addEventListener('input', renderAttendance);
        attendedInput.addEventListener('input', renderAttendance);
        targetSlider.addEventListener('input', renderAttendance);

        if (wizardForm2) {
            wizardForm2.addEventListener('submit', async (e) => {
                e.preventDefault();
                // Don't let invalid data (e.g. attended > conducted) through to later stages
                if (renderAttendance().state !== 'ok') return;
                set('conducted', conductedInput.value);
                set('attended', attendedInput.value);
                set('targetAtt', targetSlider.value);
                if (window.UniVistaData) await window.UniVistaData.saveRecord('wizard-attendance', { conducted: Number(conductedInput.value), attended: Number(attendedInput.value), targetAtt: Number(targetSlider.value) });
                window.location.href = 'wizard-3-assignments.html';
            });
        }
    }

    // ==========================================
    // STAGE 3: ASSIGNMENTS
    // ==========================================
    const assignmentsInput = document.getElementById('assignments');
    const deadlineInput = document.getElementById('deadline');
    const hwStatus = document.getElementById('hw-metric-status');
    const hwStatusText = document.getElementById('hw-status-text');
    const wizardForm3 = document.getElementById('wizard-form-3');

    if (assignmentsInput && deadlineInput) {
        function renderHomework() {
            const a = num(assignmentsInput);
            const d = num(deadlineInput);

            if (Number.isNaN(a) || Number.isNaN(d)) {
                hwStatus.textContent = 'AWAITING INPUT';
                hwStatus.style.color = COLORS.neutral;
                hwStatusText.textContent = '--';
                return false;
            }
            if (a < 0 || d < 0 || !Number.isInteger(a) || !Number.isInteger(d)) {
                hwStatus.textContent = 'INVALID INPUT';
                hwStatus.style.color = COLORS.bad;
                hwStatusText.textContent = 'Enter whole, non-negative values';
                return false;
            }
            const r = assessHomework(a, d);
            hwStatus.textContent = r.status;
            hwStatus.style.color = COLORS[r.level];
            hwStatusText.textContent = r.status;
            return true;
        }

        restore(assignmentsInput, 'assignments');
        restore(deadlineInput, 'deadline');
        renderHomework();

        assignmentsInput.addEventListener('input', renderHomework);
        deadlineInput.addEventListener('input', renderHomework);

        if (wizardForm3) {
            wizardForm3.addEventListener('submit', async (e) => {
                e.preventDefault();
                if (!renderHomework()) return;
                set('assignments', assignmentsInput.value);
                set('deadline', deadlineInput.value);
                if (window.UniVistaData) await window.UniVistaData.saveRecord('wizard-assignments', { assignments: Number(assignmentsInput.value), deadline: Number(deadlineInput.value) });
                window.location.href = 'wizard-4-sleep.html'; // was an alert() dead end
            });
        }
    }

    // ==========================================
    // STAGE 4: SLEEP (was missing entirely)
    // ==========================================
    const sleepInput = document.getElementById('sleep');
    const caffeineInput = document.getElementById('caffeine');
    const sleepMetricStatus = document.getElementById('sleep-metric-status');
    const sleepStatusText = document.getElementById('sleep-status-text');
    const wizardForm4 = document.getElementById('wizard-form-4');

    if (sleepInput && caffeineInput) {
        function renderSleep() {
            const s = num(sleepInput);
            const c = num(caffeineInput);

            if (Number.isNaN(s) || Number.isNaN(c)) {
                sleepMetricStatus.textContent = 'AWAITING INPUT';
                sleepMetricStatus.style.color = COLORS.neutral;
                sleepStatusText.textContent = '--';
                return false;
            }
            if (s < 0 || s > 72 || c < 0 || !Number.isInteger(c)) {
                sleepMetricStatus.textContent = 'INVALID INPUT';
                sleepMetricStatus.style.color = COLORS.bad;
                sleepStatusText.textContent = 'Enter total sleep from 0-72 hours over 3 days; caffeine must be a whole number';
                return false;
            }
            const averagePerDay = s / 3;
            const r = assessSleep(averagePerDay, c);
            sleepMetricStatus.textContent = r.status;
            sleepMetricStatus.style.color = COLORS[r.level];
            sleepStatusText.textContent = `${r.status} (${averagePerDay.toFixed(1)} hrs/day; ${r.note})`;
            return true;
        }

        restore(sleepInput, 'sleep');
        restore(caffeineInput, 'caffeine');
        renderSleep();

        sleepInput.addEventListener('input', renderSleep);
        caffeineInput.addEventListener('input', renderSleep);

        if (wizardForm4) {
            wizardForm4.addEventListener('submit', async (e) => {
                e.preventDefault();
                if (!renderSleep()) return;
                set('sleep', sleepInput.value);
                set('caffeine', caffeineInput.value);
                if (window.UniVistaData) await window.UniVistaData.saveRecord('wizard-sleep', { sleep: Number(sleepInput.value), caffeine: Number(caffeineInput.value) });
                window.location.href = 'wizard-5-calculate.html';
            });
        }
    }

    // ==========================================
    // STAGE 5: FINAL CALCULATION (was missing entirely)
    // ==========================================
    const resultRoot = document.getElementById('result-root');

    if (resultRoot) {
        const stored = {
            funds: get('funds'), days: get('days'),
            conducted: get('conducted'), attended: get('attended'), target: get('targetAtt') || '75',
            assignments: get('assignments'), deadline: get('deadline'),
            sleep: get('sleep'), caffeine: get('caffeine')
        };

        const missing = [];
        if (stored.funds === null || stored.days === null) missing.push(['wizard-1-funds.html', '1. Funds']);
        if (stored.conducted === null || stored.attended === null) missing.push(['wizard-2-attendance.html', '2. Attendance']);
        if (stored.assignments === null || stored.deadline === null) missing.push(['wizard-3-assignments.html', '3. Homework']);
        if (stored.sleep === null || stored.caffeine === null) missing.push(['wizard-4-sleep.html', '4. Sleep']);

        if (missing.length) {
            resultRoot.innerHTML = `
                <div class="empty-result">
                    <p>Some stages are still incomplete. Finish them to get your verdict:</p>
                    <ul>${missing.map(([href, label]) => `<li><a href="${href}">${label} &rarr;</a></li>`).join('')}</ul>
                </div>`;
        } else {
            const funds = assessFunds(Number(stored.funds), Number(stored.days));
            const att = assessAttendance(Number(stored.conducted), Number(stored.attended), Number(stored.target));
            const hw = assessHomework(Number(stored.assignments), Number(stored.deadline));
            const sl = assessSleep(Number(stored.sleep), Number(stored.caffeine));

            if (att.state !== 'ok') {
                resultRoot.innerHTML = `<div class="empty-result"><p>Your attendance data is invalid.</p><a href="wizard-2-attendance.html">Fix attendance &rarr;</a></div>`;
            } else {
                const score = Math.round((funds.score + att.score + hw.score + sl.score) / 4);
                let verdict, level;
                if (score >= 75) { verdict = 'SURVIVABLE'; level = 'good'; }
                else if (score >= 50) { verdict = 'SHAKY'; level = 'caution'; }
                else if (score >= 25) { verdict = 'CRITICAL'; level = 'warn'; }
                else { verdict = 'TERMINAL'; level = 'bad'; }

                set('lastResult', JSON.stringify({ score, verdict }));
                if (window.UniVistaData) window.UniVistaData.saveRecord('wizard-final-result', {
                    inputs: stored, score, verdict,
                    breakdown: { funds: funds.status, attendance: att.status, homework: hw.status, sleep: sl.status }
                });

                const rows = [
                    ['Funds', funds.status, funds.level, `₹${Number(stored.funds)} over ${stored.days} day(s) = ₹${funds.daily.toFixed(2)}/day. ${funds.note}`],
                    ['Attendance', att.status, att.level, `${att.percent.toFixed(1)}% vs ${stored.target}% target. ${att.note}`],
                    ['Homework', hw.status, hw.level, `${stored.assignments} pending, nearest deadline in ${stored.deadline} day(s).`],
                    ['Sleep', sl.status, sl.level, `${(Number(stored.sleep) / 3).toFixed(1)} hrs/day average from ${stored.sleep} total hours over 3 days; ${stored.caffeine} caffeine/day. ${sl.note}`]
                ];

                resultRoot.innerHTML = `
                    <div class="result-score">
                        <span class="result-score-value" style="color:${COLORS[level]}">${score}</span>
                        <span class="result-score-max">/ 100</span>
                        <div class="result-verdict" style="color:${COLORS[level]}">${verdict}</div>
                    </div>
                    <div class="progress-bar"><div class="progress-fill" style="width:${score}%; background:${COLORS[level]}"></div></div>
                    <div class="result-rows">
                        ${rows.map(([title, status, lvl, detail]) => `
                            <div class="result-row" style="border-left-color:${COLORS[lvl]}">
                                <div class="result-row-head"><strong>${title}</strong><span style="color:${COLORS[lvl]}">${status}</span></div>
                                <p>${detail}</p>
                            </div>`).join('')}
                    </div>
                    <p class="result-disclaimer">Score = average of the four category scores. It is a rough heuristic, not medical or academic advice.</p>`;
            }
        }
    }
});
