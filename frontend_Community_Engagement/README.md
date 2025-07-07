# Community Management App

A modern web app for managing community announcements, events, surveys, galleries, and engagement feeds. Built with Node.js, Express, EJS, and integrates with a Frappe backend.

## Features
- Announcements with attachments
- Events and RSVP
- Surveys and responses
- Gallery albums and images
- Engagement feed (comments)
- User authentication (session-based)

## Prerequisites
- Node.js (v14+ recommended)
- Access to a Frappe backend (ERPNext or custom)

## Setup
1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd community-management-app
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file (optional) and set:
   ```env
   FRAPPE_BASE_URL=http://localhost:8000
   SESSION_SECRET=your-secret
   ```
   Or set these as environment variables.
4. Start the app:
   ```bash
   npm start
   ```
   The app runs on [http://localhost:3000](http://localhost:3000) by default.

## Environment Variables
- `FRAPPE_BASE_URL`: URL of your Frappe backend (default: http://localhost:8000)
- `SESSION_SECRET`: Secret for session encryption

## Deployment
- Deployable on any Node.js hosting (Heroku, Vercel, DigitalOcean, etc.)
- Set environment variables in your deployment platform.

## Folder Structure
- `server.js` - Main Express server
- `views/` - EJS templates
- `public/` - Static assets (CSS, JS)

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](LICENSE)
