document.addEventListener('DOMContentLoaded', () => {
    // 1. Check if user is logged in
    const profileData = localStorage.getItem('uniVista_profile');
    
    // 2. If no profile exists and we are NOT on the login or mainpage, redirect them
    const currentPage = window.location.pathname.split('/').pop();
    if (!profileData && currentPage !== 'login.html' && currentPage !== 'mainpage.html' && currentPage !== '') {
        window.location.href = 'login.html';
        return;
    }

    // 3. If profile exists, update the top-right navbar on the current page
    if (profileData) {
        const profile = JSON.parse(profileData);
        
        const navName = document.getElementById('global-nav-name');
        const navAvatar = document.getElementById('global-nav-avatar');

        if (navName) navName.textContent = profile.name;
        if (navAvatar) navAvatar.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.avatarSeed}`;
    }

    // 4. Logout Logic
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Wipe all UniVista data from local storage so the next user starts fresh
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('uniVista_')) {
                    localStorage.removeItem(key);
                }
            });
            
            // Redirect to the main page instead of the login gatekeeper
            window.location.href = 'mainpage.html';
        });
    }
});