# Campus Event Portal

This is a beginner-friendly website made with HTML, CSS and simple JavaScript.

## Open the project

1. Open VS Code.
2. Choose **File → Open Folder** and select this project folder.
3. Open `index.html` in a browser to view the website.
4. Edit a file, save it, then refresh the browser to see your change.

Keep all files together in this folder. Every page uses `style.css` for its design and `script.js` for small interactive features.

## What the JavaScript does

- Filters events by type on the Events page.
- Shows updated seat availability in the event list, details and registration pages.
- Checks that an event has seats before saving a registration.
- Shows the student's name, event and confirmation number on the confirmation page, which can be printed.
- Saves registrations and organizer-created events in this browser using `localStorage`.
- Shows saved registrations and event counts on the organizer dashboard.
- Displays a welcome message on the demo login page.

## Important

This is a front-end class project. Data is stored only in this browser on this computer and does not sync to other users. A real site needs a server and database for secure login, shared event counts, reliable prevention of overbooking and notifications to students. The login page is only a demonstration.

To reset demo data, clear this site's local storage in the browser's developer tools, then reload the page.

To change colors, edit the color rules near the bottom of `style.css`. To change event details, edit the sample event list near the top of `script.js` and the matching HTML content.
