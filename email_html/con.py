from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import smtplib
from jinja2 import Template

def send_analysis_report(security_analysis):
    """Send analysis report email."""
    try:
        msg = MIMEMultipart()
        msg["From"] = "cherrypie6923@gmail.com"
        msg["To"] = "poppyexs@gmail.com"
        msg["Subject"] = "Email Security Analysis Report"

        # Determine the status text and image source based on the analysis
        if security_analysis.get('threats_detected'):
            status_text = "Threats detected! ⚠️"
            status_img_src = "https://media.marka-img.com/bf85e0d6/eES9YTnRMPkqXGq8r0KsbrlOeBKa35.png"
            status_color = "#ff3b30"
            status_bg_color = "#ffe5e5"
        else:
            status_text = "No threats detected! 🎉"
            status_img_src = "https://media.marka-img.com/bf85e0d6/vHBBpV3mxnD5uNNKdRs4icOJCUMP0Z.png"
            status_color = "#3BB54A"
            status_bg_color = "#cff7d3"

        # Prepare the data for the email template
        email_data = {
            "securityAnalysis": {
                "email": "aaaa@gmail.com",
                "domain": "gmail.com",
                "overallScore": "60",
                "overallGrade": "B",
                "statusText": status_text,
                "statusImgSrc": status_img_src
            },
            "attachmentResults": [
                {"filename": "index.html", 
                 "status": "safe", 
                 "details": "No threats detected"
                 }
            ],
            "templateStyle": {
                "score_color": status_color,
                "status_color": status_color,
                "status_bg_color": status_bg_color
            }
        }

        # Render the Jinja2 template to a string
        with open("./report.html", "r") as file:
            template_content = file.read()

        template = Template(template_content)
        email_body = template.render(email_data)

        msg.attach(MIMEText(email_body, "html"))

        # Send the email using smtplib
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login("cherrypie6923@gmail.com", "grbt trhp rrkn zjxl")
        server.sendmail("cherrypie6923@gmail.com", "poppyexs@gmail.com", msg.as_string())
        server.quit()

    except Exception as e:
        print(f"Error sending email: {e}")

# Test the function with dummy data
send_analysis_report({'threats_detected': False})
