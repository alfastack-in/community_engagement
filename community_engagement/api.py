import frappe
from frappe import _

# ---------------------- ANNOUNCEMENTS ----------------------

@frappe.whitelist(allow_guest=True)
def get_latest_announcements(limit=10):
    return frappe.get_all(
        "Community Announcement",
        fields=["name", "title", "content", "owner", "creation"],
        order_by="creation desc",
        limit=int(limit)
    )

@frappe.whitelist()
def create_announcement(title, content):
    doc = frappe.new_doc("Community Announcement")
    doc.title = title
    doc.content = content
    doc.insert()
    return doc


# ---------------------- EVENTS ----------------------

@frappe.whitelist(allow_guest=True)
def get_upcoming_events():
    return frappe.get_all(
        "Community Event",
        filters={"event_date": (">=", frappe.utils.nowdate())},
        fields=["name", "title", "description", "event_date", "location"],
        order_by="event_date asc"
    )

@frappe.whitelist()
def rsvp_event(event_name):
    doc = frappe.new_doc("Event Attendee")
    doc.event = event_name
    doc.attendee = frappe.session.user
    doc.insert()
    return doc


# ---------------------- SURVEYS ----------------------

@frappe.whitelist(allow_guest=True)
def get_active_surveys():
    return frappe.get_all(
        "Community Survey",
        filters={"status": "Active"},
        fields=["name", "title", "description", "creation"]
    )

@frappe.whitelist()
def submit_survey_response(survey_name, answers):
    response = frappe.new_doc("Survey Response")
    response.survey = survey_name
    response.respondent = frappe.session.user
    response.answers = answers
    response.insert()
    return response


# ---------------------- GALLERY ----------------------

@frappe.whitelist(allow_guest=True)
def get_gallery_albums():
    return frappe.get_all(
        "Gallery Album",
        fields=["name", "title", "description", "cover_image", "creation"],
        order_by="creation desc"
    )

@frappe.whitelist(allow_guest=True)
def get_album_images(album_name):
    return frappe.get_all(
        "Gallery Image",
        filters={"album": album_name},
        fields=["name", "image", "caption", "creation"],
        order_by="creation desc"
    )


# ---------------------- ENGAGEMENT FEED ----------------------

@frappe.whitelist(allow_guest=True)
def get_engagement_feed(limit=20):
    return frappe.get_all(
        "Engagement Comment",
        fields=["name", "owner", "content", "reference_type", "reference_name", "creation"],
        order_by="creation desc",
        limit=int(limit)
    )

@frappe.whitelist()
def post_engagement_comment(content, reference_type, reference_name):
    comment = frappe.new_doc("Engagement Comment")
    comment.owner = frappe.session.user
    comment.content = content
    comment.reference_type = reference_type
    comment.reference_name = reference_name
    comment.insert()
    return comment
