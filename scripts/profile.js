document.addEventListener('DOMContentLoaded', () => {

    const editBtn = document.getElementById('edit-profile-btn');
    const modal = document.getElementById('edit-modal');
    const closeBtn = document.getElementById('close-modal-btn');
    const cancelBtn = document.getElementById('cancel-modal-btn');
    const form = document.getElementById('edit-profile-form');

    const $ = (id) => document.getElementById(id);

    const DEFAULT_PROFILE = {
        name: 'Your Name', status: 'Student', currentCgpa: '', targetCgpa: '',
        cpu: '', ram: '', gpu: '', controller: '', directives: '',
        p1Name: '', p1Tech: '', p1Desc: '', p1Link: '', p2Name: '', p2Tech: '', p2Desc: '', p2Link: '', socialLinks: []
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
        controller: 'edit-controller', directives: 'edit-directives', currentCgpa: 'edit-current-cgpa', targetCgpa: 'edit-target-cgpa',
        p1Name: 'edit-p1-name', p1Tech: 'edit-p1-tech', p1Desc: 'edit-p1-desc', p1Link: 'edit-p1-link',
        p2Name: 'edit-p2-name', p2Tech: 'edit-p2-tech', p2Desc: 'edit-p2-desc', p2Link: 'edit-p2-link' };

    const SOCIAL_PLATFORMS = [
        { value: 'LinkedIn', label: 'LinkedIn' },
        { value: 'Instagram', label: 'Instagram' },
        { value: 'X', label: 'X' },
        { value: 'GitHub', label: 'GitHub' },
        { value: 'Portfolio', label: 'Personal Portfolio' },
        { value: 'YouTube', label: 'YouTube' },
        { value: 'Facebook', label: 'Facebook' },
        { value: 'Medium', label: 'Medium' },
        { value: 'Behance', label: 'Behance' },
        { value: 'Other', label: 'Other' }
    ];

    function addSocialLinkInput(link = {}) {
        const container = $('social-link-inputs');
        if (!container || container.querySelectorAll('.social-link-row').length >= 5) return;
        const row = document.createElement('div');
        row.className = 'social-link-row';
        const select = document.createElement('select');
        select.className = 'standard-input social-platform';
        select.setAttribute('aria-label', 'Social platform');
        SOCIAL_PLATFORMS.forEach(platform => {
            const option = document.createElement('option');
            option.value = platform.value;
            option.textContent = platform.label;
            select.appendChild(option);
        });
        select.value = SOCIAL_PLATFORMS.some(x => x.value === link.platform) ? link.platform : 'LinkedIn';
        const url = document.createElement('input');
        url.type = 'url';
        url.className = 'standard-input social-url';
       url.placeholder = 'https://example.com/your-profile';
        url.setAttribute('aria-label', 'Social profile URL');
        url.value = safeUrl(link.url || '');
        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'remove-social-link';
        remove.textContent = 'Remove';
        remove.addEventListener('click', () => { row.remove(); updateSocialLinkControls(); });
        row.append(select, url, remove);
        container.appendChild(row);
        updateSocialLinkControls();
    }

    function updateSocialLinkControls() {
        const container = $('social-link-inputs');
        const button = $('add-social-link-btn');
        if (!container || !button) return;
        const count = container.querySelectorAll('.social-link-row').length;
        button.hidden = count >= 5;
        button.textContent = count >= 5 ? 'Maximum 5 links reached' : '+ Add Social Link';
    }

    function renderSocialLinks(p) {
        const container = $('display-social-links');
        if (!container) return;
        container.textContent = '';
        const links = Array.isArray(p.socialLinks) ? p.socialLinks : [];
        links.slice(0, 5).forEach(link => {
            const url = safeUrl(link && link.url);
            const platform = String(link && link.platform || 'Link');
            if (!url) return;
            const anchor = document.createElement('a');
            anchor.className = 'social-link-chip';
            anchor.href = url;
            anchor.target = '_blank';
            anchor.rel = 'noopener noreferrer';
            const iconName = ({
                'LinkedIn': 'linkedin', 'Instagram': 'instagram', 'X': 'x', 'GitHub': 'github',
                'Portfolio': 'portfolio', 'YouTube': 'youtube', 'Facebook': 'facebook',
                'Medium': 'medium', 'Behance': 'behance', 'Other': 'other'
            })[platform] || 'other';
            const icon = document.createElement('img');
            icon.className = 'social-link-icon';
            icon.src = `../assets/images/social-${iconName}.png`;
            icon.alt = '';
            icon.loading = 'lazy';
            anchor.appendChild(icon);
            anchor.title = platform;
            anchor.setAttribute('aria-label', `${platform} profile (opens in a new tab)`);
            container.appendChild(anchor);
        });
    }

    function fillSocialLinks(p) {
        const container = $('social-link-inputs');
        if (!container) return;
        container.textContent = '';
        const links = Array.isArray(p.socialLinks) ? p.socialLinks.slice(0, 5) : [];
        links.forEach(link => addSocialLinkInput(link));
        updateSocialLinkControls();
    }

    function fillForm(p) {
        Object.entries(idFor).forEach(([field, id]) => {
            if (field !== 'directives') $(id).value = p[field] || '';
        });

        // Restore directives as separate fields, while remaining compatible with
        // older profiles that saved them as one comma-separated string.
        const directiveInputs = $('directive-inputs');
        directiveInputs.querySelectorAll('.extra-directive-row').forEach(row => row.remove());
        const directives = String(p.directives || '').split(',').map(s => s.trim()).filter(Boolean);
        $('edit-directives').value = directives[0] || '';
        directives.slice(1).forEach(value => addDirectiveInput(value));

        const project2 = $('project-2-fields');
        const hasProject2 = ['p2Name', 'p2Tech', 'p2Link', 'p2Desc'].some(key => String(p[key] || '').trim());
        project2.hidden = !hasProject2;
        $('add-project-btn').hidden = hasProject2;
        const removeProject2 = $('remove-project-2-btn');
        if (removeProject2) removeProject2.hidden = !hasProject2;
        fillSocialLinks(p);
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
        if (index > 1) {
            const remove = document.createElement('button');
            remove.type = 'button';
            remove.className = 'remove-social-link remove-entry-btn';
            remove.textContent = 'Remove';
            remove.setAttribute('aria-label', `Remove directive ${index}`);
            remove.addEventListener('click', () => {
                row.remove();
                relabelDirectiveInputs();
            });
            row.appendChild(remove);
        }
        container.appendChild(row);
        relabelDirectiveInputs();
        return input;
    }

    function relabelDirectiveInputs() {
        const rows = Array.from($('directive-inputs').querySelectorAll('.directive-input-row'));
        rows.forEach((row, index) => {
            const label = row.querySelector('label');
            const input = row.querySelector('input');
            const n = index + 1;
            if (label) label.textContent = `Post-Grad Directive ${n}`;
            if (input) {
                if (n === 1) input.id = 'edit-directives';
                else input.classList.add('extra-directive-input');
            }
            const remove = row.querySelector('.remove-entry-btn');
            if (remove) remove.setAttribute('aria-label', `Remove directive ${n}`);
        });
    }

    function clearProject2() {
        ['edit-p2-name', 'edit-p2-tech', 'edit-p2-link', 'edit-p2-desc'].forEach(id => { if ($(id)) $(id).value = ''; });
        $('project-2-fields').hidden = true;
        $('add-project-btn').hidden = false;
        if ($('remove-project-2-btn')) $('remove-project-2-btn').hidden = true;
    }

    function render() {
        const p = currentProfile();

        $('display-name').textContent = p.name;
        if ($('nav-user-name')) $('nav-user-name').textContent = p.name;
        $('display-status').textContent = p.status;
        renderSocialLinks(p);
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

        renderProject('p1', p);
        renderProject('p2', p);
        const hasProjects = Boolean(String(p.p1Name || '').trim() || String(p.p2Name || '').trim());
        const projectsEmpty = $('projects-empty-state');
        if (projectsEmpty) projectsEmpty.style.display = hasProjects ? 'none' : 'block';

        const avatarUrl = '../assets/images/default-avatar.png';
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
    $('add-social-link-btn')?.addEventListener('click', () => addSocialLinkInput());
    $('add-project-btn')?.addEventListener('click', () => {
        $('project-2-fields').hidden = false;
        $('add-project-btn').hidden = true;
        if ($('remove-project-2-btn')) $('remove-project-2-btn').hidden = false;
        $('edit-p2-name').focus();
    });
    $('remove-project-2-btn')?.addEventListener('click', clearProject2);

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const updated = {};
            Object.entries(idFor).forEach(([field, id]) => {
                if (field !== 'directives') updated[field] = $(id).value.trim();
            });
            updated.directives = [
                $('edit-directives').value,
                ...Array.from(document.querySelectorAll('#directive-inputs .extra-directive-input')).map(input => input.value)
            ].map(value => value.trim()).filter(Boolean).join(', ');
            updated.socialLinks = Array.from(document.querySelectorAll('#social-link-inputs .social-link-row'))
                .map(row => ({ platform: row.querySelector('.social-platform').value, url: row.querySelector('.social-url').value.trim() }))
                .filter(link => link.url)
                .filter(link => /^https?:\/\//i.test(link.url))
                .slice(0, 5);
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
        if (Number.isFinite(sleep)) add('#a78bfa', 'Sleep Average', `${(sleep / 3).toFixed(1)} hrs/day`, 'Average per day over the last 3 days');

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
            card.className = c.title === 'Survival Score' ? 'history-card history-score-card' : 'history-card';
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
