from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import smtplib
from jinja2 import Template
import os
import uuid
import subprocess

# Update these paths to match your setup
REPO_PATH = "C:\\Users\\V\\Documents\\10257\\mkdocs-spam-out"  # Your GitHub repository
DOCS_PATH = os.path.join(REPO_PATH, "docs")  # Docs folder inside your repository
TEMPLATES_PATH = "C:\\Users\\V\\Documents\\10257\\SpamOut\\email_html"  # Where your HTML templates are stored

def generate_attachment_report(attachment_results):
    try:
        # Ensure the docs directory exists
        os.makedirs(DOCS_PATH, exist_ok=True)
        
        report_data = {
            "files": [
                {
                    "filename": filename,
                    "status": result['status'],
                    "status_color": "#3BB54A" if result['status'] == 'safe' else "#ff3b30",
                    "status_icon": "https://media.marka-img.com/bf85e0d6/7PdfZxrlupddvCC3ityTf7lixZeenU.png"
                                  if result['status'] == 'safe'
                                  else "https://media.marka-img.com/bf85e0d6/eES9YTnRMPkqXGq8r0KsbrlOeBKa35.png",
                    "details": result.get('details', 'No details provided')
                }
                for filename, result in attachment_results.items()
            ]
        }

        # Use absolute path to the template
        template_path = os.path.join(TEMPLATES_PATH, "attachment_report.html")
        with open(template_path, "r") as file:
            template_content = file.read()

        template = Template(template_content)
        report_html = template.render(report_data)

        report_id = str(uuid.uuid4())[:8]
        report_filename = f"report_{report_id}.html"

        # Save directly to the docs folder in your repository
        report_filepath = os.path.join(DOCS_PATH, report_filename)
        with open(report_filepath, "w", encoding="utf-8") as file:
            file.write(report_html)

        print(f"Report generated at: {report_filepath}")
        return report_filepath, report_filename

    except Exception as e:
        print(f"Error generating attachment report: {e}")
        return None, None

def commit_and_push_to_github(report_filepath, report_filename):
    try:
        # Change to the repository directory
        os.chdir(REPO_PATH)

        # Pull the latest changes from the remote repository
        subprocess.run(["git", "pull", "origin", "main"], check=True)
        
        # Add the new file
        subprocess.run(["git", "add", f"docs/{report_filename}"], check=True)
        
        # Commit the changes
        subprocess.run(["git", "commit", "-m", f"Add security report {report_filename}"], check=True)
        
        # Push to GitHub
        subprocess.run(["git", "push", "origin", "main"], check=True)
        
        print(f"Successfully committed and pushed {report_filename} to GitHub.")
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error during git operations: {e}")
        return False

def send_analysis_report(security_analysis, attachment_results):
    try:
        # Generate the report
        report_filepath, report_filename = generate_attachment_report(attachment_results)
        if not report_filepath:
            raise Exception("Failed to generate report")
        
        # Commit and push to GitHub
        success = commit_and_push_to_github(report_filepath, report_filename)
        if not success:
            raise Exception("Failed to push to GitHub")
        
        # GitHub Pages URL
        deploy_url = f"https://NL0711.github.io/mkdocs-spam-out/{report_filename}"
        
        # Prepare email
        msg = MIMEMultipart()
        msg["From"] = "cherrypie6923@gmail.com"
        msg["To"] = "poppyexs@gmail.com"
        msg["Subject"] = "Email Security Analysis Report"

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
                "email": security_analysis.get('email'),
                "domain": security_analysis.get('domain'),
                "overallScore": security_analysis.get('overall_score'),
                "overallGrade": security_analysis.get('overall_grade'),
                "statusText": status_text,
                "statusImgSrc": status_img_src
            },
            "templateStyle": {
                "score_color": status_color,
                "status_color": status_color,
                "status_bg_color": status_bg_color
            },
            "download_url": deploy_url
        }

        # Use absolute path to the template
        report_template_path = os.path.join(TEMPLATES_PATH, "report.html")
        with open(report_template_path, "r") as file:
            template_content = file.read()

        template = Template(template_content)
        email_body = template.render(email_data)

        msg.attach(MIMEText(email_body, "html"))

        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login("cherrypie6923@gmail.com", "grbt trhp rrkn zjxl")
        server.sendmail("cherrypie6923@gmail.com", "poppyexs@gmail.com", msg.as_string())
        server.quit()

        print(f"Email sent successfully with download link: {deploy_url}")

    except Exception as e:
        print(f"Error sending email: {e}")

# Test the function with dummy data
send_analysis_report({'threats_detected': False, 'email': 'aaaa@gmail.com', 'domain': 'gmail.com', 'overall_score': '60', 'overall_grade': 'B'},
                      {'invoice_12345.pdf': {'status': 'safe', 'details': 'No threats detected'},
                       'report.docx': {'status': 'unsafe', 'details': 'Threats detected!'}})
