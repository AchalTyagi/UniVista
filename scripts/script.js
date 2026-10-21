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

   // 3. Form Submission Redirect
    const loginForm = document.querySelector('.login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Stops the page from refreshing
            
            const email = document.getElementById('email').value;
            
            // Optional: Show a quick loading message or alert before redirecting
            console.log(`Authenticating ${email}...`);
            
            // Redirect the user to the main dashboard page
            window.location.href = "dashboard.html"; 
        });
    }

    // 4. Social Login Redirect
    const socialButtons = document.querySelectorAll('.btn-social');
    socialButtons.forEach(button => {
        button.addEventListener('click', () => {
            window.location.href = "dashboard.html";
        });
    });
});