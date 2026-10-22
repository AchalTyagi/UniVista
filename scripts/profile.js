document.addEventListener('DOMContentLoaded', () => {
    // 1. Dynamic Telemetry Sync Timestamp[cite: 15]
    const syncTextContainer = document.querySelector('.sync-text');
    if (syncTextContainer) {
        const now = new Date();
        const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
        syncTextContainer.textContent = `LAST SYNC: TODAY AT ${now.toLocaleTimeString('en-IN', timeOptions).toUpperCase()}`;
    }

    // 2. Profile Data Hydration[cite: 15]
    const profileNameHeader = document.querySelector('.profile-name');
    const navUserGreeting = document.querySelector('.user-profile span');
    
    // Retrieve active session name, fallback to default operative identity if unauthenticated
    const activeOperative = localStorage.getItem('univista_active_user') || 'Samyak Rajendra Sakhare';
    
    if (profileNameHeader) {
        profileNameHeader.textContent = activeOperative;
    }
    
    if (navUserGreeting) {
        // Extract first name for the top navigation bar[cite: 15]
        const firstName = activeOperative.split(' ')[0];
        navUserGreeting.textContent = firstName;
    }
});