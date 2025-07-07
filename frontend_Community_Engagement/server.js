const express = require("express")
const session = require("express-session")
const cookieParser = require("cookie-parser")
const bodyParser = require("body-parser")
const path = require("path")
const axios = require("axios")
const moment = require("moment")

const app = express()
const PORT = process.env.PORT || 3000

// Frappe base URL - Update this to your Frappe instance
const FRAPPE_BASE_URL = process.env.FRAPPE_BASE_URL || "http://localhost:8000"

// Middleware
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cookieParser())
app.use(
  session({
    secret: process.env.SESSION_SECRET || "community-management-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }, // 24 hours
  }),
)

// Set EJS as template engine
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))

// Static files
app.use(express.static(path.join(__dirname, "public")))

// Middleware to make session info available to all views
app.use((req, res, next) => {
  res.locals.username = req.session.username || "";
  res.locals.employee_name = req.session.employee_name || "";
  res.locals.employee_email = req.session.employee_email || "";
  res.locals.employee_id = req.session.employee_id || "";
  next();
});

// Helper function to make authenticated requests to Frappe
const makeAuthenticatedRequest = async (url, options = {}, cookies = "") => {
  try {
    const config = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Cookie: cookies,
        ...options.headers,
      },
    }

    const response = await axios(`${FRAPPE_BASE_URL}${url}`, config)
    return response.data
  } catch (error) {
    console.error("API Error:", error.response?.data || error.message)
    throw error
  }
}

// Authentication middleware
const requireAuth = (req, res, next) => {
  if (!req.session.sid) {
    return res.redirect("/login")
  }
  next()
}

// Routes

// Login Page
app.get("/login", (req, res) => {
  if (req.session.sid) {
    return res.redirect("/dashboard")
  }
  res.render("login", { error: null })
})

// Login POST
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body

    const response = await axios.post(`${FRAPPE_BASE_URL}/api/method/login`, {
      usr: username,
      pwd: password,
    })

    if (response.data.message === "Logged In") {
      // Extract session ID from cookies
      const cookies = response.headers["set-cookie"]
      let sid = ""

      if (cookies) {
        cookies.forEach((cookie) => {
          if (cookie.startsWith("sid=")) {
            sid = cookie.split(";")[0]
          }
        })
      }

      req.session.sid = sid
      req.session.username = username

      // Fetch Employee record for this user (assume user_id matches username/email)
      try {
        const empData = await axios.get(`${FRAPPE_BASE_URL}/api/resource/Employee?filters=[[\"user_id\",\"=\",\"${username}\"]]&fields=[\"name\",\"employee_name\",\"user_id\",\"personal_email\"]`, {
          headers: { Cookie: sid }
        });
        if (empData.data.data && empData.data.data.length > 0) {
          const emp = empData.data.data[0];
          req.session.employee_id = emp.name;
          req.session.employee_name = emp.employee_name || "";
          req.session.employee_email = emp.personal_email || "";
        } else {
          req.session.employee_id = null;
          req.session.employee_name = "";
          req.session.employee_email = "";
        }
      } catch (empErr) {
        req.session.employee_id = null;
        req.session.employee_name = "";
        req.session.employee_email = "";
      }

      return res.redirect("/dashboard")
    } else {
      res.render("login", { error: "Invalid credentials" })
    }
  } catch (error) {
    res.render("login", { error: "Login failed. Please try again." })
  }
})

// Dashboard
app.get("/dashboard", requireAuth, (req, res) => {
  res.render("dashboard", {
    username: req.session.username,
    currentPage: "dashboard",
  })
})

// Announcements
app.get("/announcements", requireAuth, async (req, res) => {
  try {
    const data = await makeAuthenticatedRequest(
      '/api/resource/Community Announcement?filters=[["status","=","Published"]]&fields=["name","title","content","expiry_date","audience","attachment","department","acknowledgment","creation"]&order_by=expiry_date desc',
      { method: "GET" },
      req.session.sid,
    )

    const announcements = data.data.map((announcement) => ({
      ...announcement,
      content_snippet: announcement.content ? announcement.content.substring(0, 150) + "..." : "",
      expiry_date_formatted: announcement.expiry_date ? moment(announcement.expiry_date).format("MMM DD, YYYY") : "",
      creation_formatted: moment(announcement.creation).format("MMM DD, YYYY"),
    }))

    res.render("announcements", {
      announcements,
      currentPage: "announcements",
      moment,
    })
  } catch (error) {
    res.render("announcements", {
      announcements: [],
      currentPage: "announcements",
      error: "Failed to load announcements",
    })
  }
})

// Announcement Detail
app.get("/announcement/:name", requireAuth, async (req, res) => {
  try {
    const announcementName = req.params.name;
    const data = await makeAuthenticatedRequest(
      `/api/resource/Community Announcement/${announcementName}?fields=["name","title","content","expiry_date","audience","department","acknowledgment","creation","attachment"]`,
      { method: "GET" },
      req.session.sid,
    );
    const announcement = data.data;
    res.render("announcement-detail", {
      announcement,
      currentPage: "announcements",
      moment,
    });
  } catch (error) {
    res.redirect("/announcements?error=Failed to load announcement");
  }
});

// Acknowledge Announcement
app.post("/acknowledge-announcement", requireAuth, async (req, res) => {
  try {
    const { announcement } = req.body;

    const response = await makeAuthenticatedRequest(
      `/api/resource/Community Announcement/${announcement}`,
      {
        method: "PUT",
        data: { acknowledgment: 1 },
      },
      req.session.sid
    );

    res.json({ success: true });
  } catch (error) {
    console.error("FRAPPE ERROR:", error?.response?.data || error.message || error);
    res.json({ success: false, error: "Failed to acknowledge announcement" });
  }
});


// Surveys
app.get("/surveys", requireAuth, async (req, res) => {
  try {
    const data = await makeAuthenticatedRequest(
      '/api/resource/Community Survey?filters=[["status","=","Active"]]&fields=["name","title","description","anonymous","status","creation"]',
      { method: "GET" },
      req.session.sid,
    )

    const surveys = data.data.map((survey) => ({
      ...survey,
      creation_formatted: moment(survey.creation).format("MMM DD, YYYY"),
    }))

    res.render("surveys", {
      surveys,
      currentPage: "surveys",
    })
  } catch (error) {
    res.render("surveys", {
      surveys: [],
      currentPage: "surveys",
      error: "Failed to load surveys",
    })
  }
})

// Survey Detail
app.get("/survey/:name", requireAuth, async (req, res) => {
  try {
    const surveyName = req.params.name;
    // Fetch the survey with its child table (questions)
    const data = await makeAuthenticatedRequest(
      `/api/resource/Community Survey/${surveyName}?fields=["name","title","questions"]&expand=questions`,
      { method: "GET" },
      req.session.sid,
    );
    const survey = data.data;
    // questions is an array of child table rows
    const questions = survey.questions || [];
    res.render("survey-detail", {
      survey,
      questions,
      currentPage: "surveys",
    });
  } catch (error) {
    res.redirect("/surveys?error=Failed to load survey");
  }
});

// Submit Survey Response
app.post("/submit-survey", requireAuth, async (req, res) => {
  try {
    const { survey_name, answers } = req.body;
    // Ensure answers is always an array
    const answersArray = Array.isArray(answers) ? answers : Object.values(answers);
    console.log("Submitting survey response:", { survey_name, answersArray });
    await makeAuthenticatedRequest(
      "/api/resource/Survey Response",
      {
        method: "POST",
        data: {
          survey: survey_name,
          responses: answersArray, // Use 'responses' as the child table
        },
      },
      req.session.sid,
    );
    res.redirect("/surveys?success=Survey submitted successfully");
  } catch (error) {
    console.error("Survey submission error:", error?.response?.data || error.message || error);
    res.redirect(`/survey/${req.body.survey_name}?error=Failed to submit survey`);
  }
});

// Gallery
app.get("/gallery", requireAuth, async (req, res) => {
  try {
    const data = await makeAuthenticatedRequest(
      '/api/resource/Gallery Album?fields=["name","album_name","description","event","status","creation"]',
      { method: "GET" },
      req.session.sid,
    )

    const albums = data.data.map((album) => ({
      ...album,
      creation_formatted: moment(album.creation).format("MMM DD, YYYY"),
    }))

    res.render("gallery", {
      albums,
      currentPage: "gallery",
    })
  } catch (error) {
    res.render("gallery", {
      albums: [],
      currentPage: "gallery",
      error: "Failed to load gallery",
    })
  }
})

// Album Detail
app.get("/album/:name", requireAuth, async (req, res) => {
  try {
    const albumName = req.params.name;
    // Fetch the album with its images child table
    const data = await makeAuthenticatedRequest(
      `/api/resource/Gallery Album/${albumName}?fields=["name","album_name","description","images"]&expand=images`,
      { method: "GET" },
      req.session.sid,
    );
    const album = data.data;
    const images = album.images || [];
    res.render("album-detail", {
      album,
      images,
      currentPage: "gallery",
    });
  } catch (error) {
    res.redirect("/gallery?error=Failed to load album");
  }
});

// Events
app.get("/events", requireAuth, async (req, res) => {
  try {
    const now = encodeURIComponent(new Date().toISOString().slice(0, 19).replace('T', ' '))

const data = await makeAuthenticatedRequest(
  `/api/resource/Community Event?fields=["name","title","date_and_time","location","description","rsvp_required","status","creation"]&filters=[[\"date_and_time\",\">=\",\"${now}\"]]&order_by=date_and_time desc`,
  { method: "GET" },
  req.session.sid,
)



    const events = data.data.map((event) => ({
      ...event,
      date_time_formatted: moment(event.date_and_time).format("MMM DD, YYYY [at] h:mm A"),
      creation_formatted: moment(event.creation).format("MMM DD, YYYY"),
      is_upcoming: moment(event.date_and_time).isAfter(moment()),
    }))

    res.render("events", {
      events,
      currentPage: "events",
      moment,
    })
  } catch (error) {
    res.render("events", {
      events: [],
      currentPage: "events",
      error: "Failed to load events",
    })
  }
})

// RSVP Event
app.post("/rsvp-event", requireAuth, async (req, res) => {
  try {
    const { event_name } = req.body

    await makeAuthenticatedRequest(
      "/api/method/rsvp_event",
      {
        method: "POST",
        data: { event_name },
      },
      req.session.sid,
    )

    res.json({ success: true })
  } catch (error) {
    res.json({ success: false, error: "Failed to RSVP for event" })
  }
})

// Engagement Feed
app.get("/feed", requireAuth, async (req, res) => {
  try {
    const data = await makeAuthenticatedRequest(
      '/api/resource/Engagement Comment?fields=["name","employee","document_type","parent_document","comment_text","creation"]&order_by=creation desc&limit_page_length=20',
      { method: "GET" },
      req.session.sid,
    )

    const comments = data.data.map((comment) => ({
      ...comment,
      creation_formatted: moment(comment.creation).fromNow(),
    }))

    res.render("feed", {
      comments,
      currentPage: "feed",
    })
  } catch (error) {
    res.render("feed", {
      comments: [],
      currentPage: "feed",
      error: "Failed to load feed",
    })
  }
})

// Post Comment
app.post("/post-comment", requireAuth, async (req, res) => {
  try {
    const { document_type, parent_document, comment_text } = req.body
    await makeAuthenticatedRequest(
      "/api/resource/Engagement Comment",
      {
        method: "POST",
        data: {
          employee: req.session.employee_id,
          document_type,
          parent_document,
          comment_text,
        },
      },
      req.session.sid,
    )
    res.redirect("/feed?success=Comment posted successfully")
  } catch (error) {
    res.redirect("/feed?error=Failed to post comment")
  }
})

// Logout
app.post("/logout", async (req, res) => {
  try {
    await makeAuthenticatedRequest("/api/method/logout", { method: "POST" }, req.session.sid)
  } catch (error) {
    console.error("Logout error:", error)
  }

  req.session.destroy()
  res.redirect("/login")
})

// Root redirect
app.get("/", (req, res) => {
  if (req.session.sid) {
    res.redirect("/dashboard")
  } else {
    res.redirect("/login")
  }
})

// Get documents for a doctype (AJAX endpoint)
app.get("/get-documents", requireAuth, async (req, res) => {
  const { doctype } = req.query;
  if (!doctype) return res.status(400).json({ error: "Missing doctype" });
  try {
    // Try to fetch name and title fields (fallback to name if title not present)
    const data = await makeAuthenticatedRequest(
      `/api/resource/${encodeURIComponent(doctype)}?fields=["name","title"]`,
      { method: "GET" },
      req.session.sid,
    );
    const docs = (data.data || []).map(doc => ({
      name: doc.name,
      title: doc.title || doc.name
    }));
    res.json({ documents: docs });
  } catch (error) {
    // Try fallback to just name if title field doesn't exist
    try {
      const data = await makeAuthenticatedRequest(
        `/api/resource/${encodeURIComponent(doctype)}?fields=["name"]`,
        { method: "GET" },
        req.session.sid,
      );
      const docs = (data.data || []).map(doc => ({
        name: doc.name,
        title: doc.name
      }));
      res.json({ documents: docs });
    } catch (err2) {
      res.status(500).json({ error: "Failed to fetch documents" });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Community Management App running on port ${PORT}`)
})
