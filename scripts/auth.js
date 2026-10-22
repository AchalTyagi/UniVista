document.addEventListener('DOMContentLoaded', () => {
    // 1. Check if user is logged in
    const profileData = localStorage.getItem('uniVista_profile');
    
    // 2. If no profile exists and we are NOT on the login/mainpage, redirect them
    const currentPage = window.location.pathname.split('/').pop();
    if (!profileData && currentPage !== 'login.html' && currentPage !== 'mainpage.html') {
        window.location.href = 'login.html';
        return;
    }

    // 3. If profile exists, update the top-right navbar on the current page
    if (profileData) {
        const profile = JSON.parse(profileData);
        
        // Find the navbar elements
        const navName = document.getElementById('global-nav-name');
        const navAvatar = document.getElementById('global-nav-avatar');

        // Update them with the user's actual data
        if (navName) navName.textContent = profile.name;
        if (navAvatar) navAvatar.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.avatarSeed}`;
    }
});