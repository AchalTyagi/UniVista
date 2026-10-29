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
        mainAvatar: document.getElementById('main-user-avatar'),
        
        // New Elements
        directives: document.getElementById('display-directives'),
        
        p1Name: document.getElementById('display-p1-name'),
        p1Tech: document.getElementById('display-p1-tech'),
        p1Desc: document.getElementById('display-p1-desc'),
        p1Link: document.getElementById('display-p1-link'),
        
        p2Name: document.getElementById('display-p2-name'),
        p2Tech: document.getElementById('display-p2-tech'),
        p2Desc: document.getElementById('display-p2-desc'),
        p2Link: document.getElementById('display-p2-link')
    };

    // Form Input Elements
    const inputElements = {
        name: document.getElementById('edit-name'),
        status: document.getElementById('edit-status'),
        avatar: document.getElementById('edit-avatar'),
        cpu: document.getElementById('edit-cpu'),
        ram: document.getElementById('edit-ram'),
        gpu: document.getElementById('edit-gpu'),
        controller: document.getElementById('edit-controller'),
        
        directives: document.getElementById('edit-directives'),
        
        p1Name: document.getElementById('edit-p1-name'),
        p1Tech: document.getElementById('edit-p1-tech'),
        p1Desc: document.getElementById('edit-p1-desc'),
        p1Link: document.getElementById('edit-p1-link'),
        
        p2Name: document.getElementById('edit-p2-name'),
        p2Tech: document.getElementById('edit-p2-tech'),
        p2Desc: document.getElementById('edit-p2-desc'),
        p2Link: document.getElementById('edit-p2-link')
    };

    // Load Profile Data
    function loadProfileData() {
        const profile = JSON.parse(localStorage.getItem('uniVista_profile')) || {
            name: "Ledev Sharma",
            status: "Undergraduate // Year 2",
            avatarSeed: "Felix",
            cpu: "Intel Core i7-1355U",
            ram: "16 GB",
            gpu: "Intel Iris Xe Graphics",
            controller: "Kreo Surge XB",
            directives: "Evaluating CAT Examination, Exploring US Masters Programs, Exploring Germany Masters Programs",
            
            p1Name: "RepoXray",
            p1Tech: "Node.js",
            p1Desc: "Dependency security risk assessment web app utilizing Express and MongoDB Atlas.",
            p1Link: "https://github.com/LedevSharma/RepoXray",
            
            p2Name: "Smart-file-organiser",
            p2Tech: "Python",
            p2Desc: "Desktop application project built with PyQt6 to streamline directory sorting.",
            p2Link: "https://github.com/LedevSharma/Smart-file-organiser"
        };

        // Update Text Elements
        displayElements.name.textContent = profile.name;
        displayElements.navName.textContent = profile.name;
        displayElements.status.textContent = profile.status;
        displayElements.cpu.textContent = profile.cpu;
        displayElements.ram.textContent = profile.ram;
        displayElements.gpu.textContent = profile.gpu;
        displayElements.controller.textContent = profile.controller;

        // Render Directives List
        const directiveArray = profile.directives.split(',').map(item => item.trim()).filter(item => item !== "");
        displayElements.directives.innerHTML = directiveArray.map(d => `<li>${d}</li>`).join('');

        // Update Projects
        displayElements.p1Name.textContent = profile.p1Name;
        displayElements.p1Tech.textContent = profile.p1Tech;
        displayElements.p1Desc.textContent = profile.p1Desc;
        displayElements.p1Link.href = profile.p1Link;

        displayElements.p2Name.textContent = profile.p2Name;
        displayElements.p2Tech.textContent = profile.p2Tech;
        displayElements.p2Desc.textContent = profile.p2Desc;
        displayElements.p2Link.href = profile.p2Link;

        // Update Avatar
        const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.avatarSeed}`;
        displayElements.navAvatar.src = avatarUrl;
        displayElements.mainAvatar.src = avatarUrl;

        // Pre-fill form inputs
        inputElements.name.value = profile.name;
        inputElements.status.value = profile.status;
        inputElements.avatar.value = profile.avatarSeed;
        inputElements.cpu.value = profile.cpu;
        inputElements.ram.value = profile.ram;
        inputElements.gpu.value = profile.gpu;
        inputElements.controller.value = profile.controller;
        inputElements.directives.value = profile.directives;
        
        inputElements.p1Name.value = profile.p1Name;
        inputElements.p1Tech.value = profile.p1Tech;
        inputElements.p1Desc.value = profile.p1Desc;
        inputElements.p1Link.value = profile.p1Link;
        
        inputElements.p2Name.value = profile.p2Name;
        inputElements.p2Tech.value = profile.p2Tech;
        inputElements.p2Desc.value = profile.p2Desc;
        inputElements.p2Link.value = profile.p2Link;
    }

    const toggleModal = () => modal.classList.toggle('active');
    
    if (editBtn) editBtn.addEventListener('click', toggleModal);
    if (closeBtn) closeBtn.addEventListener('click', toggleModal);
    if (cancelBtn) cancelBtn.addEventListener('click', toggleModal);

    // Save Changes
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const updatedProfile = {
                name: inputElements.name.value,
                status: inputElements.status.value,
                avatarSeed: inputElements.avatar.value,
                cpu: inputElements.cpu.value,
                ram: inputElements.ram.value,
                gpu: inputElements.gpu.value,
                controller: inputElements.controller.value,
                directives: inputElements.directives.value,
                
                p1Name: inputElements.p1Name.value,
                p1Tech: inputElements.p1Tech.value,
                p1Desc: inputElements.p1Desc.value,
                p1Link: inputElements.p1Link.value,
                
                p2Name: inputElements.p2Name.value,
                p2Tech: inputElements.p2Tech.value,
                p2Desc: inputElements.p2Desc.value,
                p2Link: inputElements.p2Link.value
            };

            localStorage.setItem('uniVista_profile', JSON.stringify(updatedProfile));
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
        
        const funds = localStorage.getItem('uniVista_funds');
        const attended = localStorage.getItem('uniVista_attended');
        const conducted = localStorage.getItem('uniVista_conducted');
        const sleep = localStorage.getItem('uniVista_sleep');

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

        if (funds) {
            html += `
                <div class="history-card" style="border-top-color: #fbbf24;">
                    <h4>Capital</h4>
                    <p>₹${funds}</p>
                    <span>Last logged funds</span>
                </div>
            `;
        }

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

    loadProfileData();
    loadWizardHistory();
});