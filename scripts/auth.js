document.addEventListener('DOMContentLoaded', () => {
    const profileData = localStorage.getItem('uniVista_profile');
    const currentPage = window.location.pathname.split('/').pop();
    
    // 1. If user IS logged in and tries to view the main/login page, send them to dashboard
    if (profileData && (currentPage === 'mainpage.html' || currentPage === 'login.html' || currentPage === '')) {
        window.location.href = 'dashboard.html';
        return;
    }

    // 2. If user is NOT logged in and tries to view a protected page, send them to login
    if (!profileData && currentPage !== 'login.html' && currentPage !== 'mainpage.html' && currentPage !== '') {
        window.location.href = 'login.html';
        return;
    }

    // Select the navigation elements
    const userProfileContainer = document.querySelector('.user-profile');
    const navLinksContainer = document.querySelector('.nav-links');

    // 3. Toggle visibility based on login status
    if (profileData) {
        // User IS logged in: Show and populate header
        if (userProfileContainer) userProfileContainer.style.display = 'flex';
        if (navLinksContainer) navLinksContainer.style.display = 'flex';
        
        const profile = JSON.parse(profileData);
        const navName = document.getElementById('global-nav-name');
        const navAvatar = document.getElementById('global-nav-avatar');

        if (navName) navName.textContent = profile.name;
        if (navAvatar) navAvatar.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.avatarSeed}`;
    } else {
        // User is NOT logged in: Hide user profile and protected links
        if (userProfileContainer) userProfileContainer.style.display = 'none';
        if (navLinksContainer) navLinksContainer.style.display = 'none';
    }

    // 4. Logout Logic
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Wipe all UniVista data from local storage
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('uniVista_')) {
                    localStorage.removeItem(key);
                }
            });
            
            // Send back to main page after logging out
            window.location.href = 'mainpage.html';
        });
    }
});