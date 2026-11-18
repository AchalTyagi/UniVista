document.addEventListener('DOMContentLoaded', () => {

    const isLocal = ['localhost', '127.0.0.1'].includes(
        window.location.hostname
    );

    const apiBase = isLocal
        ? 'http://localhost:3000'
        : 'https://univista-eta.vercel.app';

    console.log('UniVista Login Script Loaded');
    console.log('Backend URL:', apiBase);

    // 2. Login and Create Account tabs
    const tabButtons = document.querySelectorAll('.tab-btn');
    const submitButton = document.querySelector('.submit-button');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {

            if (button.textContent.trim() === 'Create your Account') {
                window.location.href = 'login.html';
                return;
            }

            tabButtons.forEach(btn =>
                btn.classList.remove('active')
            );

            button.classList.add('active');

            if (submitButton) {
                submitButton.textContent = 'Log Me In';
            }
        });
    });

    // 3. Handle login form submission
    const loginForm = document.querySelector('.login-form');

    if (loginForm) {

        // Create an error message container
        const errorBox = document.createElement('div');
        errorBox.className = 'form-error';
        errorBox.hidden = true;

        const formActions = loginForm.querySelector('.form-actions');

        if (formActions) {
            loginForm.insertBefore(errorBox, formActions);
        } else {
            loginForm.appendChild(errorBox);
        }

        // Login event listener
        loginForm.addEventListener('submit', async (e) => {

            console.log('Login form submitted');

            // BREAKPOINT 1: Prevent default form submission
            e.preventDefault();

            errorBox.hidden = true;

            const activeSubmitButton =
                submitButton || loginForm.querySelector('[type="submit"]');

            if (activeSubmitButton) {
                activeSubmitButton.disabled = true;
            }

            // BREAKPOINT 2: Read credentials
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;

            console.log('Email:', email);
            console.log('Sending login request...');

            try {

                // BREAKPOINT 3: Send request to backend
                const response = await fetch(`${apiBase}/api/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email,
                        password
                    })
                });

                console.log('Backend response status:', response.status);

                // BREAKPOINT 4: Read backend response
                const data = await response.json();

                console.log('Backend response received:', data);

                if (!response.ok) {
                    throw new Error(data.error || 'Login failed');
                }

                if (!data.token) {
                    throw new Error('Authentication token was not received.');
                }

                // BREAKPOINT 5: Save authentication token
                localStorage.setItem('univista_token', data.token);

                console.log('Login successful. Redirecting to dashboard...');

                // BREAKPOINT 6: Redirect
                window.location.href = 'dashboard.html';

            } catch (error) {

                console.error('Login error:', error);

                errorBox.textContent =
                    error.message || 'Unable to connect to the server.';

                errorBox.hidden = false;

            } finally {

                if (activeSubmitButton) {
                    activeSubmitButton.disabled = false;
                }
            }
        });

    } else {
        console.warn('Login form not found on this page.');
    }

    // 4. Google and GitHub login
    function socialLogin(provider) {
        console.log(`Starting ${provider} authentication...`);

        window.location.href = `${apiBase}/api/auth/${provider}`;
    }

    document.getElementById('google-btn')
        ?.addEventListener('click', () => socialLogin('google'));

    document.getElementById('github-btn')
        ?.addEventListener('click', () => socialLogin('github'));

    // 5. Handle Calculate My Survival
    document.querySelector('.calculate-btn')
        ?.addEventListener('click', () => {

            const token = localStorage.getItem('univista_token');

            window.location.href = token
                ? 'dashboard.html'
                : 'login.html';
        });

});