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

    // 2. Form Submission Redirect (Login/Create Account)
    const loginForm = document.querySelector('.login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Stops the page from refreshing
            
            const email = document.getElementById('email').value;
            console.log(`Authenticating ${email}...`);
            
            // Redirect the user to the dashboard page
            window.location.href = "dashboard.html"; 
        });
    }

    // 3. Social Login Redirect
    const socialButtons = document.querySelectorAll('.btn-social');
    socialButtons.forEach(button => {
        button.addEventListener('click', () => {
            console.log('Social login clicked...');
            window.location.href = "dashboard.html";
        });
    });
});