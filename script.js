document.addEventListener('DOMContentLoaded', () => {
    // --- Tab Switching Logic ---
    const tabBtns = document.querySelectorAll('.tab-btn');
    const submitButton = document.querySelector('.submit-button');
    const form = document.querySelector('.login-form');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Remove active class from all tabs
            tabBtns.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            e.target.classList.add('active');

            // Update form UI based on selected tab
            if (e.target.textContent === 'Create your Account') {
                submitButton.textContent = 'Sign Up';
                // You can dynamically add fields like 'Confirm Password' here if needed
            } else {
                submitButton.textContent = 'Log Me In';
            }
        });
    });

    // --- Form Submission Logic ---
    form.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent page reload
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const isRemembered = document.querySelector('input[name="remember"]').checked;
        const activeTab = document.querySelector('.tab-btn.active').textContent;

        // Basic validation check
        if (email && password) {
            console.log({
                action: activeTab === 'Sign In' ? 'Logging in' : 'Creating account',
                email: email,
                rememberMe: isRemembered
            });
            alert(`${activeTab === 'Sign In' ? 'Login' : 'Account creation'} successful for ${email}!`);
            
            // Clear form after successful submission
            form.reset();
        }
    });

    // --- Calculate Button Logic ---
    const calculateBtn = document.querySelector('.calculate-btn');
    if (calculateBtn) {
        calculateBtn.addEventListener('click', () => {
            // Add a fun loading state or redirect
            const originalText = calculateBtn.innerHTML;
            calculateBtn.innerHTML = 'Calculating odds...';
            calculateBtn.style.opacity = '0.8';
            
            setTimeout(() => {
                alert("Survival calculation initiated! Redirecting to dashboard...");
                calculateBtn.innerHTML = originalText;
                calculateBtn.style.opacity = '1';
            }, 1500);
        });
    }

    // --- Social Login Buttons ---
    const socialBtns = document.querySelectorAll('.btn-social');
    socialBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const platform = e.currentTarget.textContent.trim();
            console.log(`Initiating OAuth flow for: ${platform}`);
            alert(`Redirecting to ${platform} authentication...`);
        });
    });
});