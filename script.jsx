document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // 1. Element References
    // ----------------------------------------------------
    const tabButtons = document.querySelectorAll('.form-tabs button');
    const authForm = document.querySelector('.login-form');
    const submitBtn = document.querySelector('.submit-button');
    const ctaButtons = document.querySelectorAll('.hero-content .button');
    const socialButtons = document.querySelectorAll('.social-login button');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    let currentMode = 'signIn'; // 'signIn' | 'signUp'

    // ----------------------------------------------------
    // 2. Tab Switching (Sign In vs Create Account)
    // ----------------------------------------------------
    tabButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();

            // Update active state visual
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const tabText = btn.textContent.trim().toLowerCase();

            if (tabText.includes('create')) {
                currentMode = 'signUp';
                submitBtn.textContent = 'Create Account';
            } else {
                currentMode = 'signIn';
                submitBtn.textContent = 'Log Me In';
            }
        });
    });

    // ----------------------------------------------------
    // 3. Form Submission
    // ----------------------------------------------------
    if (authForm) {
        authForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const email = emailInput.value.trim();
            const password = passwordInput.value;
            const rememberMe = authForm.querySelector('input[name="remember"]')?.checked;

            if (!email || !password) {
                alert('Please enter both your email and password.');
                return;
            }

            if (currentMode === 'signIn') {
                console.log('Logging in user:', { email, rememberMe });
                // Replace with your backend/auth service call
                alert(`Welcome back! Logging in as ${email}`);
            } else {
                console.log('Registering user:', { email });
                // Replace with your registration endpoint
                alert(`Account created for ${email}!`);
            }

            authForm.reset();
        });
    }

    // ----------------------------------------------------
    // 4. Hero CTA Scroll & Focus
    // ----------------------------------------------------
    ctaButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const formContainer = document.querySelector('.hero-form-container');
            if (formContainer) {
                formContainer.scrollIntoView({ behavior: 'smooth' });
                emailInput?.focus();
            }
        });
    });

    // ----------------------------------------------------
    // 5. Social Auth Triggers
    // ----------------------------------------------------
    socialButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const provider = btn.textContent.includes('Google') ? 'Google' : 'Discord';
            console.log(`Initiating OAuth with ${provider}`);
            alert(`Redirecting to ${provider} authentication...`);
        });
    });
});