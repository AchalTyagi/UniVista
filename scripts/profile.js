document.addEventListener('DOMContentLoaded', () => {

    const editBtn = document.getElementById('edit-profile-btn');
    const modal = document.getElementById('edit-modal');
    const closeBtn = document.getElementById('close-modal-btn');
    const cancelBtn = document.getElementById('cancel-modal-btn');
    const form = document.getElementById('edit-profile-form');

    const $ = (id) => document.getElementById(id);

    const DEFAULT_PROFILE = {
        name: 'Your Name', status: 'Student', avatarSeed: 'Felix', currentCgpa: '', targetCgpa: '',
        cpu: '', ram: '', gpu: '', controller: '', directives: '',
        ...Object.fromEntries(Array.from({length: 10}, (_, i) => { const n = i + 1; return [[`p${n}Name`, ''], [`p${n}Tech`, ''], [`p${n}Desc`, ''], [`p${n}Link`, '']]; }).flat())
    };

    // Only allow http(s) links (blocks javascript: URLs)
    const safeUrl = (u) => /^https?:\/\//i.test(u || '') ? u : '';

    function currentProfile() {
        // Merge so older/partial profiles never produce "undefined"
        return Object.assign({}, DEFAULT_PROFILE, UniVistaAuth.getProfile() || {});
    }

    function renderProject(prefix, p) {
        const name = String(p[`${prefix}Name`] || '').trim();
        if (!name) return null;
        const card = document.createElement('a');
        card.className = 'project-card clickable-card';
        card.target = '_blank';
        card.rel = 'noopener noreferrer';
        const url = safeUrl(p[`${prefix}Link`]);
        if (url) card.href = url;
        else { card.removeAttribute('href'); card.style.pointerEvents = 'none'; }
        const header = document.createElement('div');
        header.className = 'project-header';
        const title = document.createElement('h4');
        title.textContent = name;
        header.appendChild(title);
        const techText = String(p[`${prefix}Tech`] || '').trim();
        if (techText) {
            const tech = document.createElement('span');
            tech.className = 'tech-tag';
            tech.textContent = techText;
            header.appendChild(tech);
        }
        const desc = document.createElement('p');
        desc.textContent = p[`${prefix}Desc`] || '';
        card.append(header, desc);
        return card;
    }

    // Maps profile fields to the edit-form input ids
    const idFor = { name: 'edit-name', status: 'edit-status', cpu: 'edit-cpu', ram: 'edit-ram', gpu: 'edit-gpu',
        controller: 'edit-controller', directives: 'edit-directives', currentCgpa: 'edit-current-cgpa', targetCgpa: 'edit-target-cgpa' };

    function fillForm(p) {
        Object.entries(idFor).forEach(([field, id]) => {
            if (field !== 'directives' && $(id)) $(id).value = p[field] || '';
        });
        $('edit-avatar').value = p.avatarSeed || '';
        // Project 1 is always present in the form; projects 2–10 are added on demand.
        for (const [part, suffix] of [['Name','name'], ['Tech','tech'], ['Link','link'], ['Desc','desc']]) {
            const input = $(`edit-p1-${suffix}`);
            if (input) input.value = p[`p1${part}`] || '';
        }

        const directiveInputs = $('directive-inputs');
        directiveInputs.querySelectorAll('.extra-directive-row').forEach(row => row.remove());
        const directives = String(p.directives || '').split(',').map(s => s.trim()).filter(Boolean);
        $('edit-directives').value = directives[0] || '';
        directives.slice(1).forEach(value => addDirectiveInput(value));

        const projectInputs = $('project-inputs');
        projectInputs.replaceChildren();
        let count = 1;
        for (let n = 2; n <= 10; n++) {
            if (['Name', 'Tech', 'Link', 'Desc'].some(part => String(p[`p${n}${part}`] || '').trim())) count = n;
        }
        for (let n = 2; n <= count; n++) addProjectInput(n, p);
        $('add-project-btn').hidden = count >= 10;
    }

    let directiveCounter = 1;
    function addDirectiveInput(value = '') {
        const container = $('directive-inputs');
        const index = container.querySelectorAll('.directive-input-row').length + 1;
        const row = document.createElement('div');
        row.className = 'input-group directive-input-row extra-directive-row';
        const label = document.createElement('label');
        label.textContent = `Post-Grad Directive ${index}`;
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'standard-input extra-directive-input';
        input.placeholder = 'e.g. Exploring Germany Masters';
        input.value = value;
        row.append(label, input);
        container.appendChild(row);
        return input;
    }

    function addProjectInput(number, profile = {}) {
        const container = $('project-inputs');
        if (number > 10 || container.querySelectorAll('.project-edit-entry').length >= 9) return;
        const section = document.createElement('section');
        section.className = 'project-edit-entry';
        section.style.marginTop = '1.25rem';
        const heading = document.createElement('h3');
        heading.className = 'modal-section-title';
        heading.textContent = `GitHub Project ${number}`;
        section.appendChild(heading);
        const grid = document.createElement('div');
        grid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:10px;';
        const makeField = (part, labelText, placeholder = '') => {
            const wrap = document.createElement('div');
            wrap.className = 'input-group';
            const label = document.createElement('label');
            label.textContent = labelText;
            label.htmlFor = `edit-p${number}-${part.toLowerCase()}`;
            const input = document.createElement('input');
            input.id = `edit-p${number}-${part.toLowerCase()}`;
            input.className = 'standard-input';
            input.type = part === 'Link' ? 'url' : 'text';
            input.placeholder = placeholder;
            input.value = profile[`p${number}${part}`] || '';
            wrap.append(label, input);
            return {wrap, input};
        };
        const name = makeField('Name', 'Project Name');
        const tech = makeField('Tech', 'Tech Stack');
        grid.append(name.wrap, tech.wrap);
        const link = makeField('Link', 'GitHub URL', 'https://github.com/username/project');
        const desc = makeField('Desc', 'Short Description');
        section.append(grid, link.wrap, desc.wrap);
        container.appendChild(section);
        return section;
    }

    function render() {
        const p = currentProfile();

        $('display-name').textContent = p.name;
        if ($('nav-user-name')) $('nav-user-name').textContent = p.name;
        $('display-status').textContent = p.status;
        const currentCgpa = $('display-current-cgpa');
        const targetCgpa = $('display-target-cgpa');
        if (currentCgpa) currentCgpa.textContent = p.currentCgpa !== '' && p.currentCgpa != null ? Number(p.currentCgpa).toFixed(2).replace(/\\.00$/, '') : '—';
        if (targetCgpa) targetCgpa.textContent = p.targetCgpa !== '' && p.targetCgpa != null ? Number(p.targetCgpa).toFixed(2).replace(/\\.00$/, '') : '—';
        const academicFooter = document.querySelector('.target-box .stat-footer');
        if (academicFooter) academicFooter.textContent = (p.currentCgpa || p.targetCgpa) ? 'Your academic goals, as entered in profile customization.' : 'Add your current and target CGPA in Edit Profile.';
        $('display-cpu').textContent = p.cpu || 'Not added yet';
        $('display-ram').textContent = p.ram || 'Not added yet';
        $('display-gpu').textContent = p.gpu || 'Not added yet';
        $('display-controller').textContent = p.controller || 'Not added yet';

        // Directives: build with textContent (no innerHTML injection)
        const list = $('display-directives');
        list.textContent = '';
        const items = String(p.directives || '').split(',').map(s => s.trim()).filter(Boolean);
        (items.length ? items : ['No directives set yet']).forEach(text => {
            const li = document.createElement('li');
            li.textContent = text;
            list.appendChild(li);
        });

        const projectList = $('display-project-list');
        if (projectList) {
            projectList.replaceChildren();
            let hasProjects = false;
            for (let n = 1; n <= 10; n++) {
                const card = renderProject(`p${n}`, p);
                if (card) { projectList.appendChild(card); hasProjects = true; }
            }
            const projectsEmpty = $('projects-empty-state');
            if (projectsEmpty) projectsEmpty.style.display = hasProjects ? 'none' : 'block';
        }

        const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(p.avatarSeed)}`;
        if ($('nav-user-avatar')) $('nav-user-avatar').src = avatarUrl;
        if ($('main-user-avatar')) $('main-user-avatar').src = avatarUrl;

        fillForm(p);
    }

    const openModal = () => { fillForm(currentProfile()); modal.classList.add('active'); };
    const closeModal = () => { modal.classList.remove('active'); fillForm(currentProfile()); }; // discard unsaved edits

    if (editBtn) editBtn.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
    if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

    $('add-directive-btn')?.addEventListener('click', () => addDirectiveInput());
    $('add-project-btn')?.addEventListener('click', () => {
        const container = $('project-inputs');
        const nextNumber = container.querySelectorAll('.project-edit-entry').length + 2;
        if (nextNumber <= 10) addProjectInput(nextNumber);
        $('add-project-btn').hidden = nextNumber >= 10;
        const firstInput = $(`edit-p${nextNumber}-name`);
        if (firstInput) firstInput.focus();
    });

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const updated = { avatarSeed: $('edit-avatar').value.trim() || 'Felix' };
            Object.entries(idFor).forEach(([field, id]) => {
                if (field !== 'directives') updated[field] = $(id).value.trim();
            });
            for (let n = 1; n <= 10; n++) {
                const prefix = `p${n}`;
                for (const [part, suffix] of [['Name','name'], ['Tech','tech'], ['Link','link'], ['Desc','desc']]) {
                    const input = $(`edit-${prefix}-${suffix}`);
                    updated[`${prefix}${part}`] = input ? input.value.trim() : (currentProfile()[`${prefix}${part}`] || '');
                }
                if (updated[`${prefix}Link`] && !safeUrl(updated[`${prefix}Link`])) {
                    alert(`Project ${n} URL must start with http:// or https://`);
                    return;
                }
            }
            updated.directives = [
                $('edit-directives').value,
                ...Array.from(document.querySelectorAll('#directive-inputs .extra-directive-input')).map(input => input.value)
            ].map(value => value.trim()).filter(Boolean).join(', ');
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

        const read = (key) => {
            const raw = localStorage.getItem('uniVista_' + key);
            if (raw === null || raw === '') return null;
            try { return JSON.parse(raw); } catch (_) { return raw; }
        };
        const n = (key) => {
            const value = read(key);
            if (value === null || value === '') return NaN;
            return Number(value);
        };

        const funds = n('funds'), conducted = n('conducted'), attended = n('attended');
        const assignments = n('assignments'), deadline = n('deadline'), sleep = n('sleep');
        const result = read('lastResult');
        const cards = [];
        const add = (color, title, value, caption) => cards.push({ color, title, value, caption });

        if (result && typeof result === 'object' && Number.isFinite(Number(result.score))) {
            add('#8b5cf6', 'Survival Score', `${result.score}/100`, result.verdict || 'Latest analysis');
        }
        if (Number.isFinite(funds)) add('#fbbf24', 'Capital', `₹${funds}`, 'Funds entered');
        if (Number.isFinite(conducted) && Number.isFinite(attended) && conducted > 0 && attended <= conducted) {
            add('#4ade80', 'Attendance', `${((attended / conducted) * 100).toFixed(1)}%`, 'Current standing');
        }
        if (Number.isFinite(assignments) && Number.isFinite(deadline)) {
            add('#f87171', 'Pending Work', `${assignments} pending`, `Nearest deadline: ${deadline} day(s)`);
        }
        if (Number.isFinite(sleep)) add('#a78bfa', 'Sleep Average', `${sleep} hrs`, 'Average sleep entered');

        container.replaceChildren();
        if (!cards.length) {
            const empty = document.createElement('div');
            empty.className = 'empty-history';
            const message = document.createElement('p');
            message.textContent = 'No survival analysis saved yet. Complete all four wizard stages and calculate your result to see it here.';
            const link = document.createElement('a');
            link.href = 'wizard-1-funds.html';
            link.textContent = 'Start the Survival Wizard →';
            link.style.cssText = 'color:#8b5cf6;text-decoration:none;margin-top:10px;display:inline-block;';
            empty.append(message, link);
            container.appendChild(empty);
            return;
        }

        cards.forEach((c) => {
            const card = document.createElement('div');
            card.className = 'history-card';
            card.style.borderTopColor = c.color;
            const title = document.createElement('h4');
            title.textContent = c.title;
            const value = document.createElement('p');
            value.textContent = c.value;
            const caption = document.createElement('span');
            caption.textContent = c.caption;
            card.append(title, value, caption);
            container.appendChild(card);
        });
    }

    render();
    loadWizardHistory();
});
