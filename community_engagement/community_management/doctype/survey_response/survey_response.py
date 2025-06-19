# Copyright (c) 2025, xyz and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document


class SurveyResponse(Document):
	pass

import frappe

def fetch_questions(doc, method):
    if not doc.answers:
        questions = frappe.get_all("Survey Question", filters={"parent": doc.survey}, fields=["question"])
        for q in questions:
            doc.append("answers", {
                "question": q.question
            })
