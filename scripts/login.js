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

    // 2. Sign In: validate against registered accounts
    const loginForm = document.querySelector('.login-form');
    if (loginForm) {
        const errorBox = document.createElement('div');
        errorBox.className = 'form-error';
        errorBox.hidden = true;
        loginForm.insertBefore(errorBox, loginForm.querySelector('.form-actions'));

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            errorBox.hidden = true;
            submitButton.disabled = true;

            const result = await UniVistaAuth.signIn(
                document.getElementById('email').value,
                document.getElementById('password').value
            );

            if (result.ok) {
                window.location.href = 'dashboard.html';
            } else {
                errorBox.textContent = result.error;
                errorBox.hidden = false;
                submitButton.disabled = false;
            }
        });
    }

    // 3. Google / GitHub buttons: no OAuth backend, so route to registration
    document.querySelectorAll('.btn-social').forEach(btn => {
        btn.addEventListener('click', () => { window.location.href = 'login.html'; });
    });

    // 4. "Calculate My Survival"
    const calculateBtn = document.querySelector('.calculate-btn');
    if (calculateBtn) {
        calculateBtn.addEventListener('click', () => {
            window.location.href = UniVistaAuth.getProfile() ? 'dashboard.html' : 'login.html';
        });
    }
});
