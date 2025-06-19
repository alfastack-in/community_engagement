import frappe

@frappe.whitelist()
def get_survey_questions(survey):
    return frappe.get_all(
        "Survey Question",
        filters={"parent": survey},
        fields=["question"],
        ignore_permissions=True
    )
