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

    // 2. Calculate Survival Button Logic
    const calculateBtn = document.querySelector('.calculate-btn');
    
    if (calculateBtn) {
        calculateBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // Temporary interaction before you build out the actual features
            alert("⚠️ Calculating survival odds...\n\nProcessing Maggie Budget...\nAnalyzing Sleep Debt...\n\nResult: Hang in there!");
        });
    }

    // 3. Form Submission Prevent Default (To stop page reloads during testing)
    const loginForm = document.querySelector('.login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            alert(`Attempting to authenticate user: ${email}`);
        });
    }
});