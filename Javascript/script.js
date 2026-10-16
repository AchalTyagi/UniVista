document.addEventListener('DOMContentLoaded', () => {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const submitButton = document.querySelector('.submit-button');
    const form = document.querySelector('.login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordGroup = document.getElementById('confirm-password-group');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const signinActions = document.getElementById('signin-actions');
    const formError = document.getElementById('form-error');
    const userGreeting = document.getElementById('user-greeting');
    const forgotPasswordLink = document.getElementById('forgot-password-link');

    let currentMode = 'signin'; // 'signin' or 'signup'

    // --- Helper: Non-Intrusive Toast Notification ---
    function showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }

    // --- Helper: Inline Form Error ---
    function setFormError(message) {
        if (!message) {
            formError.textContent = '';
            formError.classList.add('hidden');
            emailInput.classList.remove('input-error');
            passwordInput.classList.remove('input-error');
            confirmPasswordInput.classList.remove('input-error');
        } else {
            formError.textContent = message;
            formError.classList.remove('hidden');
        }
    }

    // --- Tab Switching Logic ---
    tabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const selectedTab = e.currentTarget;
            currentMode = selectedTab.dataset.tab;

            // Update active tab styling and ARIA attributes
            tabBtns.forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            });
            selectedTab.classList.add('active');
            selectedTab.setAttribute('aria-selected', 'true');

            // Clear previous errors
            setFormError('');

            // Toggle Sign Up vs Sign In UI fields
            if (currentMode === 'signup') {
                submitButton.textContent = 'Sign Up';
                confirmPasswordGroup.classList.remove('hidden');
                confirmPasswordInput.setAttribute('required', 'true');
                signinActions.classList.add('hidden');
            } else {
                submitButton.textContent = 'Log Me In';
                confirmPasswordGroup.classList.add('hidden');
                confirmPasswordInput.removeAttribute('required');
                confirmPasswordInput.value = '';
                signinActions.classList.remove('hidden');
            }
        });
    });

    // --- Form Submission & Validation Logic ---
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        setFormError('');

        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        const isRemembered = document.getElementById('remember').checked;

        // Validate Email Format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            emailInput.classList.add('input-error');
            setFormError('Please enter a valid student or personal email address.');
            return;
        }

        // Validate Password Length
        if (password.length < 6) {
            passwordInput.classList.add('input-error');
            setFormError('Password must be at least 6 characters long.');
            return;
        }

        // Validate Confirm Password on Sign Up
        if (currentMode === 'signup' && password !== confirmPassword) {
            confirmPasswordInput.classList.add('input-error');
            setFormError('Passwords do not match. Please try again.');
            return;
        }

        // Extract username before '@' for personalized greeting
        const username = email.split('@')[0];
        userGreeting.textContent = `Hello ${username}!`;

        console.log({
            action: currentMode === 'signin' ? 'Logging in' : 'Creating account',
            email: email,
            rememberMe: isRemembered
        });

        showToast(
            currentMode === 'signin'
                ? `Welcome back, ${username}!`
                : `Account created for ${email}!`,
            'success'
        );

        form.reset();
    });

    // --- Calculate Survival Button Logic ---
    const calculateBtn = document.querySelector('.calculate-btn');
    if (calculateBtn) {
        calculateBtn.addEventListener('click', () => {
            const btnText = calculateBtn.querySelector('span');
            const originalText = btnText.innerHTML;

            calculateBtn.disabled = true;
            btnText.textContent = 'Calculating odds...';

            setTimeout(() => {
                showToast('Survival calculation complete! Loading telemetry dashboard...', 'info');
                btnText.innerHTML = originalText;
                calculateBtn.disabled = false;
            }, 1500);
        });
    }

    // --- Social Login Buttons ---
    const socialBtns = document.querySelectorAll('.btn-social');
    socialBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const platform = e.currentTarget.textContent.trim();
            console.log(`Initiating OAuth flow for: ${platform}`);
            showToast(`Redirecting to ${platform} authentication...`, 'info');
        });
    });

    // --- Forgot Password Link ---
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            const email = emailInput.value.trim();
            if (email) {
                showToast(`Password reset instructions sent to ${email}.`, 'success');
            } else {
                emailInput.focus();
                showToast('Enter your Personal ID email first to reset your password.', 'error');
            }
        });
    }
});