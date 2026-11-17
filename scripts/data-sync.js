/* Frontend-only JSON data helper.
   Records are stored in browser localStorage. Browsers cannot silently write to a
   project-folder JSON file without a backend; use Export JSON to download a file. */
(function () {
    const RECORDS_KEY = 'uniVista_json_records';

    function readRecords() {
        try {
            const value = JSON.parse(localStorage.getItem(RECORDS_KEY) || '[]');
            return Array.isArray(value) ? value : [];
        } catch (_) {
            return [];
        }
    }

    function saveRecord(type, payload) {
        const profile = window.UniVistaAuth?.getProfile?.() || {};
        const record = {
            type: String(type || 'form-submission'),
            email: String(profile.email || ''),
            userName: String(profile.name || ''),
            submittedAt: new Date().toISOString(),
            payload: payload && typeof payload === 'object' ? payload : {}
        };

        try {
            const records = readRecords();
            records.push(record);
            localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
            return Promise.resolve({ saved: true, local: true });
        } catch (error) {
            console.warn('UniVista could not save this record in localStorage.', error);
            return Promise.resolve({ saved: false, local: true });
        }
    }

    function exportAll() {
        const profile = window.UniVistaAuth?.getProfile?.() || {};
        const parse = (key) => {
            const raw = localStorage.getItem('uniVista_' + key);
            if (raw === null || raw === '') return null;
            try { return JSON.parse(raw); } catch (_) { return raw; }
        };
        const exportData = {
            schemaVersion: 1,
            exportedAt: new Date().toISOString(),
            storageMode: 'frontend-localStorage',
            profile,
            wizard: {
                funds: parse('funds'),
                days: parse('days'),
                conducted: parse('conducted'),
                attended: parse('attended'),
                targetAtt: parse('targetAtt'),
                assignments: parse('assignments'),
                deadline: parse('deadline'),
                sleep: parse('sleep'),
                caffeine: parse('caffeine'),
                lastResult: parse('lastResult')
            },
            records: readRecords()
        };
        const safeName = String(profile.name || 'student').trim()
            .replace(/[^a-z0-9_-]+/gi, '-').replace(/^-+|-+$/g, '') || 'student';
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `univista-${safeName}-data.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    window.UniVistaData = { saveRecord, readRecords, exportAll };
})();