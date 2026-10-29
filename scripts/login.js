document.addEventListener('DOMContentLoaded', () => {
    const PROFILE_KEY = 'uniVista_profile';
    const loginForm = document.querySelector('.login-form');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const submitButton = document.querySelector('.submit-button');
    const rememberCheckbox = document.querySelector('input[name="remember"]');
    if (rememberCheckbox) rememberCheckbox.checked = true;
    tabButtons.forEach(button => button.addEventListener('click', () => {
        tabButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        if (submitButton) submitButton.textContent = button.textContent.trim().toLowerCase().includes('create') ? 'Create Account' : 'Log Me In';
    }));
    function readProfile() {
        try { return JSON.parse(sessionStorage.getItem(PROFILE_KEY) || localStorage.getItem(PROFILE_KEY) || 'null'); }
        catch (_) { return null; }
    }
    const profile = readProfile();
    const userLink = document.querySelector('.user-profile');
    const navLinks = document.querySelector('.nav-links');
    if (!profile) {
        if (userLink) userLink.style.display = 'none';
        if (navLinks) navLinks.style.display = 'none';
    } else {
        if (userLink) userLink.style.display = 'flex';
        if (navLinks) navLinks.style.display = 'flex';
        const name = document.getElementById('global-nav-name');
        const avatar = document.getElementById('global-nav-avatar');
        if (name) name.textContent = profile.name || 'Student';
        if (avatar && profile.avatarSeed) avatar.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profile.avatarSeed)}`;
    }
    if (loginForm) loginForm.addEventListener('submit', event => {
        event.preventDefault();
        const email = document.getElementById('email')?.value.trim();
        const password = document.getElementById('password')?.value;
        if (!email || !password) { alert('Please enter your email and password.'); return; }
        // Local front-end demo only; real credential verification requires a backend.
        const suggestedName = email.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        const nextProfile = { name: suggestedName, email, avatarSeed: suggestedName || 'Student', status: 'Undergraduate' };
        localStorage.removeItem(PROFILE_KEY);
        sessionStorage.removeItem(PROFILE_KEY);
        (rememberCheckbox && !rememberCheckbox.checked ? sessionStorage : localStorage).setItem(PROFILE_KEY, JSON.stringify(nextProfile));
        location.href = 'dashboard.html';
    });
    ['google-btn', 'github-btn'].forEach(id => {
        const button = document.getElementById(id);
        if (button) button.addEventListener('click', () => alert('Social sign-in is not configured yet. Please use email and password for the local demo.'));
    });
    const calculateBtn = document.querySelector('.calculate-btn');
    if (calculateBtn) calculateBtn.addEventListener('click', () => {
        if (readProfile()) location.href = 'dashboard.html';
        else loginForm?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
});