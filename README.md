# 🧩 Community Engagement

**Community Engagement** is a custom Frappe app designed to boost employee interaction in an organization through:

- 📢 Announcements
- 📊 Surveys with Responses
- 📅 Events with RSVP
- 🖼️ Photo Gallery with Albums
- 💬 Engagement Comments

This app includes all workflows, notifications, roles, and permissions needed to function out of the box.

---

## 🚀 Features

- Department-based access control
- Workflow-driven document transitions
- Role-specific permissions: HR, Employee, Department Head
- Email + in-app notifications on publish events
- REST-ready for frontend integration (Vue + FrappeUI)

---

## 🛠️ Installation Steps

### 1. Setup Bench & Site

```bash
# Create a new bench
bench init community-bench --frappe-version version-15

cd community-bench

# Create a new site
bench new-site community.local
```

---

### 2. Get the App from GitHub

```bash
# Clone the app (replace with your actual GitHub repo)
bench get-app community_engagement https://github.com/boora-aman/community_engagement.git

# Install the app on your site
bench --site community.local install-app community_engagement
```

---

### 3. Start Bench

```bash
bench start
```

Visit: http://localhost:8000

---

## ✅ Fixtures Included

No manual setup is needed. The app auto-loads:

- Workflows
- Notifications
- Roles & Permissions
- Custom Fields
- User Permissions

Exported via:

```bash
bench --site community.local export-fixtures
```

---

## 🔁 Workflows

| Doctype       | Workflow States                  |
| ------------- | -------------------------------- |
| Announcement  | Draft → Published → Archived   |
| Survey        | Draft → Active → Closed        |
| Event         | Created → Upcoming → Completed |
| Gallery Album | Draft → Review → Published     |

---

## 🔔 Notifications

| Trigger                 | Target Role |
| ----------------------- | ----------- |
| Announcement Published  | Employee    |
| Survey Activated        | Employee    |
| Event Marked Upcoming   | Employee    |
| Gallery Album Published | Employee/HR |

Uses Frappe v15 Notification system (`Notification` DocType).

---

## 👥 Roles

| Role           | Access Level                          |
| -------------- | ------------------------------------- |
| System Manager | Full override                         |
| HR Manager     | Create/edit documents for all depts   |
| Dept Head      | Limited to their department           |
| Employee       | View, Comment, RSVP, Submit Responses |

---

## 🌐 Frontend Integration

Supports REST API and `frappe-ui@next` in Vue.

### FrappeUI Setup

```js
import { createApp } from 'vue'
import { createFrappeUI } from 'frappe-ui'
import App from './App.vue'

const app = createApp(App)

app.use(createFrappeUI({
  serverURL: 'http://localhost:8000',
  useSocket: true
}))

app.mount('#app')
```

---

## 🔐 Example Test Users

| Email                | Role(s)        | Password |
| -------------------- | -------------- | -------- |
| admin@example.com    | System Manager | admin123 |
| hr@example.com       | HR Manager     | hr123    |
| employee@example.com | Employee       | emp123   |
| head@example.com     | Dept Head      | dept123  |

---

## 🧑‍💻 Developer Notes

To add changes and share:

```bash
# Export new workflows/notifications/etc.
bench --site community.local export-fixtures

# Push to GitHub
git add .
git commit -m "Update fixtures"
git push
```

---

## 📄 License

MIT © Aman Boora
