// scripts/auth.js
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:3000' 
    : 'https://univista-eta.vercel.app';
const PUBLIC_PAGES = ['index.html', 'login.html', 'about-us.html'];
const GUEST_ONLY_PAGES = ['index.html', 'login.html'];

async function initializeApp() {
    // NEW: Catch tokens returned from OAuth redirects
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');
    
    if (urlToken) {
        // Save the token and instantly wipe it from the browser URL history for security
        localStorage.setItem('univista_token', urlToken);
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Now proceed with normal logic...
    const token = localStorage.getItem('univista_token');
    
    // FIX FOR FIREFOX LOCAL FILES: Safely extract the current page name
    let page = window.location.pathname.split('/').pop();
    if (!page || page === '') {
        page = 'index.html'; 
    }

    const isPublicPage = PUBLIC_PAGES.includes(page);
    const isGuestOnlyPage = GUEST_ONLY_PAGES.includes(page);

    // 1. ROUTING: Kick logged-out users away from protected pages
    if (!token) {
        if (!isPublicPage) {
            window.location.replace('login.html');
        }
        // Hide the user profile icon on public pages if logged out
        const userProfileEl = document.querySelector('.user-profile');
        if (userProfileEl) userProfileEl.style.display = 'none';
        return;
    }

    // 2. ROUTING: Kick logged-in users away from the login page
    if (token && isGuestOnlyPage) {
        window.location.replace('dashboard.html');
        return;
    }

    // 3. FETCH DATA: If logged in, get the real profile from your MongoDB Atlas database
    if (token && !isGuestOnlyPage) {
        try {
            const response = await fetch(`${API_BASE}/api/profile`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const userData = await response.json();
                
                // Update the navbar
                const navName = document.getElementById('global-nav-name');
                if (navName) navName.innerText = `Hello ${userData.name}!`;

            } else {
                // Token is dead/invalid. Wipe it and log out to prevent loops.
                localStorage.removeItem('univista_token');
                window.location.replace('login.html');
            }
        } catch (error) {
            console.error('Error fetching backend profile:', error);
        }
    }
}

// Global logout function
function logout() {
    localStorage.removeItem('univista_token');
    window.location.replace('login.html');
}

// Run the initialization when any page loads
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();

    // Attach logout event if a logout button exists on the page
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
});