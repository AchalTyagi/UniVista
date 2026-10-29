
/* =========================================
   UniVista Authentication
   Supports persistent and temporary sessions
   ========================================= */

const UniVistaAuth = (() => {
    const ACCOUNTS_KEY = "uniVista_accounts";
    const PROFILE_KEY = "uniVista_profile";

    // Other UniVista wizard keys are deliberately
    // preserved when the user logs out.

    // ---------- Storage Helpers ----------

    function getAccounts() {
        try {
            const accounts = JSON.parse(
                localStorage.getItem(ACCOUNTS_KEY) || "[]"
            );

            return Array.isArray(accounts) ? accounts : [];
        } catch (error) {
            console.error("Unable to load accounts:", error);
            return [];
        }
    }

    function saveAccounts(accounts) {
        localStorage.setItem(
            ACCOUNTS_KEY,
            JSON.stringify(accounts)
        );
    }

    function readStoredProfile() {
        const data =
            sessionStorage.getItem(PROFILE_KEY) ||
            localStorage.getItem(PROFILE_KEY);

        if (!data) return null;

        try {
            return JSON.parse(data);
        } catch (error) {
            console.error("Unable to parse profile:", error);
            return null;
        }
    }

    function saveSession(profile, rememberMe = true) {
        // Never keep duplicate profile copies
        localStorage.removeItem(PROFILE_KEY);
        sessionStorage.removeItem(PROFILE_KEY);

        if (rememberMe) {
            localStorage.setItem(
                PROFILE_KEY,
                JSON.stringify(profile)
            );
        } else {
            sessionStorage.setItem(
                PROFILE_KEY,
                JSON.stringify(profile)
            );
        }
    }

    // ---------- Account Helpers ----------

    async function hashPassword(password) {
        // SHA-256 helper for compatibility with a browser-only demo.
        // This is NOT suitable for production password storage.
        if (!window.crypto?.subtle) {
            throw new Error(
                "Secure password hashing is unavailable in this browser."
            );
        }

        const data = new TextEncoder().encode(password);
        const hash = await crypto.subtle.digest("SHA-256", data);

        return Array.from(new Uint8Array(hash))
            .map(byte => byte.toString(16).padStart(2, "0"))
            .join("");
    }

    // ---------- Registration ----------

    async function register(name, email, password) {
        name = String(name || "").trim();
        email = String(email || "").trim().toLowerCase();
        password = String(password || "");

        if (!name || !email || !password) {
            return {
                ok: false,
                error: "Please fill in all required fields."
            };
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return {
                ok: false,
                error: "Please enter a valid email address."
            };
        }

        if (password.length < 8) {
            return {
                ok: false,
                error: "Password must contain at least 8 characters."
            };
        }

        const accounts = getAccounts();

        if (accounts.some(account => account.email === email)) {
            return {
                ok: false,
                error: "An account with this email already exists."
            };
        }

        try {
            const passwordHash = await hashPassword(password);

            const account = {
                id: crypto.randomUUID
                    ? crypto.randomUUID()
                    : `${Date.now()}-${Math.random()}`,
                name,
                email,
                passwordHash,
                data: {
                    name,
                    email,
                    status: "Undergraduate",
                    avatarUrl: ""
                }
            };

            accounts.push(account);
            saveAccounts(accounts);

            return { ok: true };
        } catch (error) {
            console.error("Registration failed:", error);

            return {
                ok: false,
                error: "Unable to create the account."
            };
        }
    }

    // ---------- Sign In ----------

    async function signIn(email, password) {
        email = String(email || "").trim().toLowerCase();
        password = String(password || "");

        if (!email || !password) {
            return {
                ok: false,
                error: "Enter your email and password."
            };
        }

        const accounts = getAccounts();
        const account = accounts.find(
            item => item.email === email
        );

        if (!account) {
            return {
                ok: false,
                error: "No account found with this email."
            };
        }

        try {
            const passwordHash = await hashPassword(password);

            // Supports accounts created using this file.
            // If your existing project uses another hash format,
            // preserve its original verification logic instead.
            if (account.passwordHash !== passwordHash) {
                return {
                    ok: false,
                    error: "Incorrect email or password."
                };
            }

            const profile = {
                ...(account.data || {}),
                id: account.id,
                name: account.name,
                email: account.email
            };

            // Clear the previous session. login.js will save
            // this profile in the correct storage after sign-in.
            localStorage.removeItem(PROFILE_KEY);
            sessionStorage.removeItem(PROFILE_KEY);

            // Keep the authenticated profile available to login.js.
            // This temporary in-memory value is not persisted.
            pendingProfile = profile;

            return { ok: true };
        } catch (error) {
            console.error("Sign-in failed:", error);

            return {
                ok: false,
                error: "Unable to sign in. Please try again."
            };
        }
    }

    // Holds the profile between successful sign-in and the
    // login.js call to getProfile().
    let pendingProfile = null;

    // ---------- Profile ----------

    function getProfile() {
        return readStoredProfile() || pendingProfile;
    }

    function updateProfile(updates) {
        const profile = getProfile();

        if (!profile) {
            return {
                ok: false,
                error: "No active user session."
            };
        }

        const updatedProfile = {
            ...profile,
            ...updates,
            id: profile.id,
            email: profile.email
        };

        // Preserve the current session type
        const isTemporary =
            sessionStorage.getItem(PROFILE_KEY) !== null;

        saveSession(updatedProfile, !isTemporary);
        pendingProfile = updatedProfile;

        // Update the saved account profile
        const accounts = getAccounts();
        const index = accounts.findIndex(
            account => account.id === updatedProfile.id
        );

        if (index !== -1) {
            accounts[index].data = {
                ...(accounts[index].data || {}),
                ...updatedProfile
            };

            saveAccounts(accounts);
        }

        return { ok: true, profile: updatedProfile };
    }

    // ---------- Logout ----------

    function logout() {
        localStorage.removeItem(PROFILE_KEY);
        sessionStorage.removeItem(PROFILE_KEY);
        pendingProfile = null;
    }

    // ---------- Public API ----------

    return {
        register,
        signIn,
        getProfile,
        updateProfile,
        logout
    };
})();
