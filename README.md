# 🎒 UniVista

## 📖 About the Project

The **UniVista** is a no-nonsense, stress-reducing dashboard built specifically for students. College is an absolute grind, and standard productivity tools are built for people with 9-to-5 jobs, predictable incomes, and a healthy eight hours of sleep. 

This project throws out the corporate jargon and focuses on what actually matters. It takes your sleep deprivation, low bank balance, and skipped classes and turns them into a realistic, manageable survival plan so you can make it to the end of the semester without losing your mind.

### ✨ What It Does (The Core Features)

*   🍜 **The Maggie Budget:** Tracks your last few rupees so you know exactly when you'll run out of food money. No confusing financial charts—just real student math.
*   🛏️ **Safe to Skip?:** An attendance manager that calculates exactly how many classes you can bunk without tanking your grade or risking your enrollment.
*   🚨 **Assignment SOS:** Sorts your massive pile of homework and projects so you know exactly what you need to panic about first.
*   🧟 **Sleep Debt Tracker:** Measures how much of a zombie you are based on your late-night cram sessions and helps you figure out when it's time to finally close the laptop and rest.

## 🤝 How to Contribute

Got an idea to make surviving college a little easier? Found a bug that accidentally told you it was safe to skip finals? We want your help! 

Since we're all just trying to make it to graduation, keeping this project open-source means we can build something that actually helps students instead of stressing them out more.

### 🐛 Reporting Bugs
If the calculator breaks or the math isn't mathing, let us know so we can fix it before someone's GPA drops. 
* Check the **Issues** tab to see if someone already reported it.
* If not, open a new issue. Drop a clear description of what broke, what you expected to happen, and screenshots if you have them. 

### 💡 Requesting Features
Have a genius idea for a new feature? (Maybe a caffeine-to-productivity ratio tracker?) We are all ears.
* Open an issue and label it as an `enhancement` or `feature request`.
* Explain what the feature is and why it would save someone's semester.

### 💻 Writing Code
Want to actually build something? Awesome. Here is the standard protocol:

1. **Fork the Repo:** Make a copy of the project to your own account.
2. **Clone it Locally:** Bring it down to your machine so you can work on it.
3. **Create a Branch:** Give it a clear name so we know what you're working on. 
   * *Example:* `git checkout -b feature/caffeine-tracker` or `bugfix/attendance-glitch`
4. **Make Your Changes:** Write your code. Keep it clean, and add comments if you're doing some complex math that a sleep-deprived person wouldn't instantly understand.
5. **Commit Your Changes:** Leave a message that actually explains what you did.
   * *Good:* `git commit -m "Fix attendance logic for weekly classes"`
   * *Bad:* `git commit -m "fixed stuff"`
6. **Push to Your Branch:** Send it back up to GitHub.
   * `git push origin feature/caffeine-tracker`
7. **Open a Pull Request (PR):** Submit your code for review! Tell us what you changed and link any related issues.

### ✌️ The Vibe Check (Code of Conduct)
Keep it respectful and kind. We are all stressed out, running on three hours of sleep, and trying our best. No toxic tech-bro behavior, gatekeeping, or being rude in the PR comments. If you wouldn't say it to someone in the library at 2 AM, don't type it here.

## Run locally

1. Keep the `pages`, `styles`, and `scripts` folders together in the project root.
2. Open `pages/mainpage.html` in a browser, or serve the project root with a local static server and visit `/pages/mainpage.html`.
3. Use the main page form to continue to the dashboard (authentication is intentionally bypassed during this UI/functionality pass).
4. Start the Survival Wizard from the dashboard. The currently wired steps are Funds → Attendance → Assignments. Sleep and Calculate are not connected yet.

## Project structure

- `pages/` — HTML pages
- `styles/` — shared and page-specific CSS
- `scripts/` — JavaScript for navigation, profile display, and wizard interactions

Note: this is a frontend prototype. Login/authentication is intentionally not enforced at this stage.



## Session behavior

Each successful sign-in starts a fresh wizard session. The user's profile details are preserved, while previously entered funds, attendance, assignments, sleep values, and the previous result are cleared and must be entered again. This prototype uses browser `localStorage`; it is not production-grade authentication or secure multi-user storage.


## Assessment 2: JSON file persistence

This frontend-only version provides a JSON export option without a backend.

### Run the project

1. Open the `Univista` folder.
2. Open `pages/mainpage.html` directly or use VS Code Live Server.
3. Open the profile page and choose Edit Profile → Export JSON to download your data.//localhost:3000/pages/mainpage.html`.

Do not open the HTML files directly with `file://` when testing JSON persistence. The browser must use the local server so the `/api/submissions` endpoint is available.

### What gets saved

- Profile customization changes (`profile-update`).
- Funds, attendance, assignments, and sleep form submissions.
- The final survival score and verdict.

Records are appended to `data/submissions.json`. Each record includes a type, timestamp, optional account email/name, and submitted payload. Passwords are not sent to this endpoint.

### JSON export option

In the profile customization modal, use **Export JSON** to download a `.json` file containing the current profile and the wizard values/results available in that browser session. This works independently from server persistence.

The browser `localStorage` remains as the front-end's working state; the JSON file is the local server-side record required for Assessment 2. This is a coursework/local-development implementation, not production-grade multi-user authentication or deployment security.


## JSON option (frontend-only; no backend)

This version does **not** require Node.js, Express, or a backend.

- Profile and wizard values remain in browser `localStorage`.
- Relevant actions are also collected in the browser under `uniVista_json_records`.
- In **Profile → Edit Profile → Export JSON**, select **Export JSON** to download a `.json` file containing the profile, saved Survival Wizard values/results, and locally collected records.
- A browser-only website cannot automatically write or update a JSON file inside the project folder. Export JSON downloads a file when the user clicks the button.
- Data is stored only in the current browser profile. It is not shared across devices and may be cleared by the browser.
