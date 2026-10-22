document.addEventListener('DOMContentLoaded', () => {
    // 1. Tab Switching Logic
    const tabButtons = document.querySelectorAll('.tab-btn');
    const submitButton = document.querySelector('.submit-button');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all tabs
            tabButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked tab
            button.classList.add('active');
            
            // Change the submit button text based on the active tab
            if (button.textContent.trim() === 'Sign In') {
                submitButton.textContent = 'Log Me In';
            } else {
                submitButton.textContent = 'Create Account';
            }
        });
    });

    // 2. Form Submission Redirect 
    const loginForm = document.querySelector('.login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Stops the page from refreshing
            
            // Route new users to the initialization gatekeeper to build their profile
            window.location.href = "login.html"; 
        });
    }

    // 3. Google & GitHub Auth (Simplified Routing)
    const socialButtons = document.querySelectorAll('.btn-social');
    const googleBtn = document.getElementById('google-btn') || socialButtons[0];
    const githubBtn = document.getElementById('github-btn') || socialButtons[1];

    if (googleBtn) {
        googleBtn.addEventListener('click', () => {
            // Route to initialization gatekeeper
            window.location.href = "login.html";
        });
    }

    if (githubBtn) {
        githubBtn.addEventListener('click', () => {
            // Route to initialization gatekeeper
            window.location.href = "login.html";
        });
    }

    // 4. "Calculate My Survival" Button Logic
    const calculateBtn = document.querySelector('.calculate-btn');
    if (calculateBtn) {
        calculateBtn.addEventListener('click', () => {
            // Check if they already have a profile
            const hasProfile = localStorage.getItem('uniVista_profile');
            
            // If they have a profile, go to dashboard. If not, send to initialization.
            window.location.href = hasProfile ? "dashboard.html" : "login.html";
        });
    }
});