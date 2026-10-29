document.addEventListener('DOMContentLoaded', () => {
    const key = 'uniVista_profile';
    let profile = null;
    try { profile = JSON.parse(sessionStorage.getItem(key) || localStorage.getItem(key) || 'null'); } catch (_) {}
    const page = location.pathname.split('/').pop();
    if (!profile && !['mainpage.html', 'login.html', ''].includes(page)) { location.replace('mainpage.html'); return; }
    if (profile) {
        const name = document.getElementById('global-nav-name') || document.getElementById('nav-user-name');
        const avatar = document.getElementById('global-nav-avatar') || document.getElementById('nav-user-avatar');
        if (name) name.textContent = profile.name || 'Student';
        if (avatar && profile.avatarSeed) avatar.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profile.avatarSeed)}`;
    }
});