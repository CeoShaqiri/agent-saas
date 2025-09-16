import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

def send_answer_email(to_email: str, question: str, answer: str):
    SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")
    if not SENDGRID_API_KEY:
        raise Exception("SendGrid API key not set in environment variables.")
    message = Mail(
        from_email="noreply@yourdomain.com",
        to_emails=to_email,
        subject="Your Expert Answer is Ready!",
        html_content=f"<strong>Question:</strong> {question}<br><strong>Answer:</strong> {answer}"
    )
    try:
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        response = sg.send(message)
        return response.status_code
    except Exception as e:
        print(e)
        return None
