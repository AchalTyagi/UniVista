document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // PROFILE EDITING LOGIC
    // ==========================================
    const editBtn = document.getElementById('edit-profile-btn');
    const modal = document.getElementById('edit-modal');
    const closeBtn = document.getElementById('close-modal-btn');
    const cancelBtn = document.getElementById('cancel-modal-btn');
    const form = document.getElementById('edit-profile-form');

    // DOM Elements to Update on the Page
    const displayElements = {
        name: document.getElementById('display-name'),
        status: document.getElementById('display-status'),
        cpu: document.getElementById('display-cpu'),
        ram: document.getElementById('display-ram'),
        gpu: document.getElementById('display-gpu'),
        controller: document.getElementById('display-controller'),
        navName: document.getElementById('nav-user-name'),
        navAvatar: document.getElementById('nav-user-avatar'),
        mainAvatar: document.getElementById('main-user-avatar')
    };

    // Form Input Elements
    const inputElements = {
        name: document.getElementById('edit-name'),
        status: document.getElementById('edit-status'),
        avatar: document.getElementById('edit-avatar'),
        cpu: document.getElementById('edit-cpu'),
        ram: document.getElementById('edit-ram'),
        gpu: document.getElementById('edit-gpu'),
        controller: document.getElementById('edit-controller')
    };

    // Load Profile Data from LocalStorage (or use your defaults)
    function loadProfileData() {
        const profile = JSON.parse(localStorage.getItem('uniVista_profile')) || {
            name: "Ledev Sharma",
            status: "Undergraduate // Year 2",
            avatarSeed: "Felix",
            cpu: "Intel Core i7-1355U",
            ram: "16 GB",
            gpu: "Intel Iris Xe Graphics",
            controller: "Kreo Surge XB"
        };

        // Update the visible text on the profile page
        displayElements.name.textContent = profile.name;
        displayElements.navName.textContent = profile.name;
        displayElements.status.textContent = profile.status;
        displayElements.cpu.textContent = profile.cpu;
        displayElements.ram.textContent = profile.ram;
        displayElements.gpu.textContent = profile.gpu;
        displayElements.controller.textContent = profile.controller;

        // Update avatars dynamically using DiceBear API
        const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.avatarSeed}`;
        displayElements.navAvatar.src = avatarUrl;
        displayElements.mainAvatar.src = avatarUrl;

        // Pre-fill the edit form inputs with current data
        inputElements.name.value = profile.name;
        inputElements.status.value = profile.status;
        inputElements.avatar.value = profile.avatarSeed;
        inputElements.cpu.value = profile.cpu;
        inputElements.ram.value = profile.ram;
        inputElements.gpu.value = profile.gpu;
        inputElements.controller.value = profile.controller;
    }

    // Modal Open/Close Toggles
    const toggleModal = () => modal.classList.toggle('active');
    
    if (editBtn) editBtn.addEventListener('click', toggleModal);
    if (closeBtn) closeBtn.addEventListener('click', toggleModal);
    if (cancelBtn) cancelBtn.addEventListener('click', toggleModal);

    // Save Changes when form is submitted
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault(); // Prevent page reload
            
            // Gather updated data
            const updatedProfile = {
                name: inputElements.name.value,
                status: inputElements.status.value,
                avatarSeed: inputElements.avatar.value, // Typing a different word generates a new avatar
                cpu: inputElements.cpu.value,
                ram: inputElements.ram.value,
                gpu: inputElements.gpu.value,
                controller: inputElements.controller.value
            };

            // Save to browser storage
            localStorage.setItem('uniVista_profile', JSON.stringify(updatedProfile));
            
            // Refresh UI and close modal
            loadProfileData(); 
            toggleModal(); 
        });
    }

    // ==========================================
    // SURVIVAL WIZARD HISTORY LOGIC
    // ==========================================
    function loadWizardHistory() {
        const historyContainer = document.getElementById('wizard-history-container');
        if (!historyContainer) return;
        
        // Fetch values saved from your wizard stages
        const funds = localStorage.getItem('uniVista_funds');
        const attended = localStorage.getItem('uniVista_attended');
        const conducted = localStorage.getItem('uniVista_conducted');
        const sleep = localStorage.getItem('uniVista_sleep');

        // Check if no data exists
        if (!funds && !attended && !sleep) {
            historyContainer.innerHTML = `
                <div class="empty-history">
                    No survival telemetry recorded yet. <br>
                    <a href="wizard-1-funds.html" style="color: #8b5cf6; text-decoration: none; margin-top: 10px; display: inline-block;">Start the Wizard &rarr;</a>
                </div>
            `;
            return;
        }

        let html = '';

        // Render Capital Card
        if (funds) {
            html += `
                <div class="history-card" style="border-top-color: #fbbf24;">
                    <h4>Capital</h4>
                    <p>₹${funds}</p>
                    <span>Last logged funds</span>
                </div>
            `;
        }

        // Render Attendance Card
        if (conducted && attended) {
            const attPercent = ((parseInt(attended) / parseInt(conducted)) * 100).toFixed(1);
            html += `
                <div class="history-card" style="border-top-color: #4ade80;">
                    <h4>Attendance</h4>
                    <p>${attPercent}%</p>
                    <span>Current standing</span>
                </div>
            `;
        }

        // Render Sleep Card
        if (sleep) {
            html += `
                <div class="history-card" style="border-top-color: #a78bfa;">
                    <h4>Sleep Avg</h4>
                    <p>${sleep} hrs</p>
                    <span>Last 3 days</span>
                </div>
            `;
        }

        historyContainer.innerHTML = html;
    }

    // Initialize Page on Load
    loadProfileData();
    loadWizardHistory();
});