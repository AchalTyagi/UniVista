document.addEventListener('DOMContentLoaded', () => {
    // 1. Tabs
    const tabButtons = document.querySelectorAll('.tab-btn');
    const submitButton = document.querySelector('.submit-button');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (button.textContent.trim() === 'Create your Account') {
                window.location.href = 'login.html';
            } else {
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                submitButton.textContent = 'Log Me In';
            }
        });
    });

    // 2. Sign In
    const loginForm = document.querySelector('.login-form');

    if (loginForm) {
        const errorBox = document.createElement('div');
        errorBox.className = 'form-error';
        errorBox.hidden = true;
        loginForm.insertBefore(
            errorBox,
            loginForm.querySelector('.form-actions')
        );

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            errorBox.hidden = true;
            submitButton.disabled = true;

            try {
                const result = await UniVistaAuth.signIn(
                    document.getElementById('email').value,
                    document.getElementById('password').value
                );

                if (result.ok) {
                    // Remember Me preference
                    const rememberMe = document.getElementById('rememberMe');
                    const shouldRemember = rememberMe
                        ? rememberMe.checked
                        : true;

                    // Get the profile created by the successful login
                    const profile = UniVistaAuth.getProfile();

                    if (!profile) {
                        throw new Error(
                            'Login succeeded, but the user profile could not be loaded.'
                        );
                    }

                    // Remove any previous profile copy
                    localStorage.removeItem('uniVista_profile');
                    sessionStorage.removeItem('uniVista_profile');

                    // Store the profile according to Remember Me
                    if (shouldRemember) {
                        localStorage.setItem(
                            'uniVista_profile',
                            JSON.stringify(profile)
                        );
                    } else {
                        sessionStorage.setItem(
                            'uniVista_profile',
                            JSON.stringify(profile)
                        );
                    }

                    window.location.href = 'dashboard.html';
                } else {
                    errorBox.textContent = result.error;
                    errorBox.hidden = false;
                    submitButton.disabled = false;
                }
            } catch (error) {
                errorBox.textContent =
                    error.message || 'Unable to log in. Please try again.';
                errorBox.hidden = false;
                submitButton.disabled = false;
            }
        });
    }

    // 3. Google / GitHub buttons
    // OAuth is not implemented yet.
    document.querySelectorAll('.btn-social').forEach(btn => {
        btn.addEventListener('click', () => {
            window.location.href = 'login.html';
        });
    });

    // 4. Calculate My Survival
    const calculateBtn = document.querySelector('.calculate-btn');

    if (calculateBtn) {
        calculateBtn.addEventListener('click', () => {
            window.location.href =
                UniVistaAuth.getProfile()
                    ? 'dashboard.html'
                    : 'login.html';
        });
    }
});
