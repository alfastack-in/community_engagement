import frappe
from frappe import _

# ---------------------- ANNOUNCEMENTS ----------------------

@frappe.whitelist()
def get_latest_announcements(limit=10):
    frappe.only_for(['System Manager', 'HR Manager', 'Employee'])

    today = frappe.utils.nowdate()

    return frappe.get_all(
        "Community Announcement",
        filters={"expiry_date": [">=", today]},
        fields=[
            "name", "title", "content", "attachemnt", "expiry_date",
            "audience", "department", "acknowledgment", "status",
            "owner", "creation"
        ],
        order_by="creation desc",
        limit=int(limit)
    )

@frappe.whitelist()
def create_announcement(title=None, content=None, attachemnt=None, expiry_date=None, audience=None, department=None):
    frappe.only_for(['System Manager', 'HR Manager'])

    # Fallback to form_dict if direct args are missing
    title = title or frappe.form_dict.get('title')
    content = content or frappe.form_dict.get('content')
    attachemnt = attachemnt or frappe.form_dict.get('attachemnt')
    expiry_date = expiry_date or frappe.form_dict.get('expiry_date')
    audience = audience or frappe.form_dict.get('audience')
    department = department or frappe.form_dict.get('department')

    if not title or not content:
        frappe.throw('Title and Content are required.')

    doc = frappe.new_doc("Community Announcement")
    doc.title = title
    doc.content = content
    doc.attachemnt = attachemnt
    doc.expiry_date = expiry_date
    doc.audience = audience
    doc.department = department
    doc.status = "Draft"  # Default status
    doc.insert()
    return doc

@frappe.whitelist()
def delete_announcement(name):
    frappe.only_for(['System Manager', 'HR Manager'])
    frappe.delete_doc("Community Announcement", name, ignore_permissions=False)
    return {"message": "Deleted"}

@frappe.whitelist()
def acknowledge_announcement(announcement):
    frappe.only_for(['Employee'])
    doc = frappe.get_doc("Community Announcement", announcement)
    doc.acknowledgment = 1
    doc.save(ignore_permissions=True)
    return {"message": "Acknowledged"}

# ---------------------- EVENTS ----------------------

@frappe.whitelist()
def get_upcoming_events(limit=20):
    frappe.only_for(['System Manager', 'HR Manager', 'Employee'])
    return frappe.get_all(
        "Community Event",
        filters={"date_and_time": (">=", frappe.utils.now_datetime())},
        fields=[
            "name", "title", "date_and_time", "location", "description",
            "rsvp_required", "status", "creation"
        ],
        order_by="date_and_time asc",
        limit=int(limit)
    )

@frappe.whitelist(allow_guest=False)
def rsvp_event(event_name):
    user = frappe.session.user
    # Mark RSVP (customize as per your schema)
    doc = frappe.get_doc("Community Event", event_name)
    if user not in (doc.rsvp_list or []):
        doc.append("rsvp_list", user)
        doc.save(ignore_permissions=True)
    return {"status": "success"}



# ---------------------- SURVEYS ----------------------

@frappe.whitelist()
def get_active_surveys():
    frappe.only_for(['System Manager', 'HR Manager', 'Employee'])
    return frappe.get_all(
        "Community Survey",
        filters={"status": "Active"},
        fields=["name", "title", "description", "anonymous", "status", "creation"]
    )

@frappe.whitelist()
def get_survey_questions(survey_name):
    frappe.only_for(['System Manager', 'HR Manager', 'Employee'])
    return frappe.get_all(
        "Survey Question",
        filters={"parent": survey_name},
        fields=["name", "question", "type"],
        order_by="idx asc"
    )

@frappe.whitelist()
def submit_survey_response(survey_name, answers):
    frappe.only_for(['Employee'])
    response = frappe.new_doc("Survey Response")
    response.survey = survey_name
    response.respondent = frappe.session.user
    response.answers = answers
    response.insert()
    return response


# ---------------------- GALLERY ----------------------

@frappe.whitelist()
def get_gallery_albums():
    frappe.only_for(['System Manager', 'HR Manager', 'Employee'])
    return frappe.get_all(
        "Gallery Album",
        fields=["name", "album_name", "description", "event", "status", "creation"],
        order_by="creation desc"
    )

@frappe.whitelist()
def get_album_images(album_name):
    frappe.only_for(['System Manager', 'HR Manager', 'Employee'])
    return frappe.get_all(
        "Gallery Image",
        filters={"parent": album_name},
        fields=["name", "image", "caption", "creation"],
        order_by="creation desc"
    )



# ---------------------- ENGAGEMENT FEED ----------------------

@frappe.whitelist()
def get_engagement_feed(limit=20):
    frappe.only_for(['System Manager', 'HR Manager', 'Employee'])
    return frappe.get_all(
        "Engagement Comment",
        fields=[
            "name", "employee", "document_type", "parent_document",
            "comment_text", "creation"
        ],
        order_by="creation desc",
        limit=int(limit)
    )

@frappe.whitelist()
def post_engagement_comment(comment_text, document_type, parent_document):
    frappe.only_for(['System Manager', 'HR Manager', 'Employee'])
    comment = frappe.new_doc("Engagement Comment")
    comment.employee = frappe.session.user
    comment.document_type = document_type
    comment.parent_document = parent_document
    comment.comment_text = comment_text
    comment.insert()
    return comment