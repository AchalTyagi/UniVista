(function () {
  const RECORDS_KEY = "uniVista_json_records";

  // 1. Read previously saved records
  function readRecords() {
    try {
      const records = JSON.parse(localStorage.getItem(RECORDS_KEY) || "[]");

      return Array.isArray(records) ? records : [];
    } catch {
      return [];
    }
  }

  // 2. Save a new form submission
  async function saveRecord(type, payload) {
    const profile = window.UniVistaAuth?.getProfile?.() || {};

    const record = {
      type: type || "form-submission",
      email: profile.email || "",
      userName: profile.name || "",
      submittedAt: new Date().toISOString(),
      payload: payload && typeof payload === "object" ? payload : {},
    };

    try {
      const records = readRecords();

      records.push(record);

      localStorage.setItem(RECORDS_KEY, JSON.stringify(records));

      return { saved: true, local: true };
    } catch (error) {
      console.error("Unable to save record:", error);
      return { saved: false, local: true };
    }
  }

  // 3. Export all UniVista data as a JSON file
  function exportAll() {
    const profile = window.UniVistaAuth?.getProfile?.() || {};

    function getData(key) {
      const value = localStorage.getItem("uniVista_" + key);

      if (!value) return null;

      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }

    const exportData = {
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      storageMode: "frontend-localStorage",
      profile: profile,

      wizard: {
        funds: getData("funds"),
        days: getData("days"),
        conducted: getData("conducted"),
        attended: getData("attended"),
        targetAtt: getData("targetAtt"),
        assignments: getData("assignments"),
        deadline: getData("deadline"),
        sleep: getData("sleep"),
        caffeine: getData("caffeine"),
        lastResult: getData("lastResult"),
      },

      records: readRecords(),
    };

    const file = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(file);
    const link = document.createElement("a");

    const name = (profile.name || "student").replace(/[^a-z0-9_-]/gi, "-");

    link.href = url;
    link.download = `univista-${name}-data.json`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  }

  // 4. Make functions available to other JavaScript files
  window.UniVistaData = {
    saveRecord,
    readRecords,
    exportAll,
  };
})();
