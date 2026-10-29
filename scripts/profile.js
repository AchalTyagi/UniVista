document.addEventListener('DOMContentLoaded', () => {

    const editBtn = document.getElementById('edit-profile-btn');
    const modal = document.getElementById('edit-modal');
    const closeBtn = document.getElementById('close-modal-btn');
    const cancelBtn = document.getElementById('cancel-modal-btn');
    const form = document.getElementById('edit-profile-form');

    const $ = (id) => document.getElementById(id);

    const DEFAULT_PROFILE = {
        name: 'Your Name', status: 'Student', avatarSeed: 'Felix',
        cpu: '', ram: '', gpu: '', controller: '', directives: '',
        p1Name: '', p1Tech: '', p1Desc: '', p1Link: '', p2Name: '', p2Tech: '', p2Desc: '', p2Link: ''
    };

    // Only allow http(s) links (blocks javascript: URLs)
    const safeUrl = (u) => /^https?:\/\//i.test(u || '') ? u : '';

    function currentProfile() {
        // Merge so older/partial profiles never produce "undefined"
        return Object.assign({}, DEFAULT_PROFILE, UniVistaAuth.getProfile() || {});
    }

    function renderProject(prefix, p) {
        const card = $(`display-${prefix}-link`);
        const name = p[`${prefix}Name`];
        // Only show a project card when the user has supplied a project name.
        if (!String(name || '').trim()) { card.style.display = 'none'; return; }
        card.style.display = '';
        $(`display-${prefix}-name`).textContent = name;
        $(`display-${prefix}-tech`).textContent = p[`${prefix}Tech`];
        $(`display-${prefix}-desc`).textContent = p[`${prefix}Desc`];
        const url = safeUrl(p[`${prefix}Link`]);
        if (url) { card.href = url; card.removeAttribute('aria-disabled'); card.style.pointerEvents = ''; }
        else { card.removeAttribute('href'); card.style.pointerEvents = 'none'; }
    }

    // Maps profile fields to the edit-form input ids
    const idFor = { name: 'edit-name', status: 'edit-status', cpu: 'edit-cpu', ram: 'edit-ram', gpu: 'edit-gpu',
        controller: 'edit-controller', directives: 'edit-directives',
        p1Name: 'edit-p1-name', p1Tech: 'edit-p1-tech', p1Desc: 'edit-p1-desc', p1Link: 'edit-p1-link',
        p2Name: 'edit-p2-name', p2Tech: 'edit-p2-tech', p2Desc: 'edit-p2-desc', p2Link: 'edit-p2-link' };

    function fillForm(p) {
        Object.entries(idFor).forEach(([field, id]) => { $(id).value = p[field] || ''; });
        $('edit-avatar').value = p.avatarSeed || '';
    }

    function render() {
        const p = currentProfile();

        $('display-name').textContent = p.name;
        $('nav-user-name').textContent = p.name;
        $('display-status').textContent = p.status;
        $('display-cpu').textContent = p.cpu || 'Not added yet';
        $('display-ram').textContent = p.ram || 'Not added yet';
        $('display-gpu').textContent = p.gpu || 'Not added yet';
        $('display-controller').textContent = p.controller || 'Not added yet';

        // Directives: build with textContent (no innerHTML injection)
        const list = $('display-directives');
        list.textContent = '';
        const items = p.directives.split(',').map(s => s.trim()).filter(Boolean);
        (items.length ? items : ['No directives set yet']).forEach(text => {
            const li = document.createElement('li');
            li.textContent = text;
            list.appendChild(li);
        });

        renderProject('p1', p);
        renderProject('p2', p);
        const hasProjects = Boolean(String(p.p1Name || '').trim() || String(p.p2Name || '').trim());
        const projectsEmpty = $('projects-empty-state');
        if (projectsEmpty) projectsEmpty.style.display = hasProjects ? 'none' : 'block';

        const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(p.avatarSeed)}`;
        $('nav-user-avatar').src = avatarUrl;
        $('main-user-avatar').src = avatarUrl;

        fillForm(p);
    }

    const openModal = () => { fillForm(currentProfile()); modal.classList.add('active'); };
    const closeModal = () => { modal.classList.remove('active'); fillForm(currentProfile()); }; // discard unsaved edits

    if (editBtn) editBtn.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
    if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const updated = { avatarSeed: $('edit-avatar').value.trim() || 'Felix' };
            Object.entries(idFor).forEach(([field, id]) => { updated[field] = $(id).value.trim(); });
            UniVistaAuth.saveProfile(updated); // also syncs the account record and keeps the email
            render();
            modal.classList.remove('active');
            if (window.UniVistaData) window.UniVistaData.saveRecord('profile-update', updated);
        });
    }

    // ==========================================
    const exportBtn = $('export-profile-json-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            if (window.UniVistaData?.exportAll) {
                window.UniVistaData.exportAll();
            } else {
                alert('JSON export is unavailable. Please reload the page and try again.');
            }
        });
    }

        // SURVIVAL WIZARD HISTORY
    // ==========================================
    function loadWizardHistory() {
        const container = $('wizard-history-container');
        if (!container) return;

        const n = (k) => { const v = localStorage.getItem('uniVista_' + k); return v === null || v === '' ? NaN : Number(v); };
        const funds = n('funds'), conducted = n('conducted'), attended = n('attended');
        const assignments = n('assignments'), deadline = n('deadline'), sleep = n('sleep');
        let result = null;
        try { result = JSON.parse(localStorage.getItem('uniVista_lastResult')); } catch (e) { /* ignore */ }

        const cards = [];
        const add = (color, title, value, caption) => cards.push({ color, title, value, caption });

        if (result && Number.isFinite(result.score)) add('#8b5cf6', 'Survival Score', `${result.score}/100`, String(result.verdict));
        if (Number.isFinite(funds)) add('#fbbf24', 'Capital', `₹${funds}`, 'Last logged funds');
        if (Number.isFinite(conducted) && Number.isFinite(attended) && conducted > 0) {
            add('#4ade80', 'Attendance', `${((attended / conducted) * 100).toFixed(1)}%`, 'Current standing');
        }
        if (Number.isFinite(assignments) && Number.isFinite(deadline)) {
            add('#f87171', 'Pending Work', `${assignments} due`, `Nearest in ${deadline} day(s)`);
        }
        if (Number.isFinite(sleep)) add('#a78bfa', 'Sleep Avg', `${sleep} hrs`, 'Last 3 days');

        container.textContent = '';
        if (!cards.length) {
            const empty = document.createElement('div');
            empty.className = 'empty-history';
            empty.innerHTML = 'No survival telemetry recorded yet. <br><a href="wizard-1-funds.html" style="color:#8b5cf6;text-decoration:none;margin-top:10px;display:inline-block;">Start the Wizard &rarr;</a>';
            container.appendChild(empty);
            return;
        }
        cards.forEach(c => {
            const card = document.createElement('div');
            card.className = 'history-card';
            card.style.borderTopColor = c.color;
            const h = document.createElement('h4'); h.textContent = c.title;
            const p = document.createElement('p'); p.textContent = c.value;
            const s = document.createElement('span'); s.textContent = c.caption;
            card.append(h, p, s);
            container.appendChild(card);
        });
    }

    render();
    loadWizardHistory();
});
