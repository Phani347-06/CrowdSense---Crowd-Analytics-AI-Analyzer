import smtplib
import threading
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
import os
import sys

# Add parent directory to path to import config
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import Config

def _send_email_async(organizer_email, subject, body):
    """Internal function to handle SMTP communication in a background thread."""
    if not Config.EMAIL_PASSWORD:
        print(f"⚠️ Email Error: EMAIL_PASSWORD not set. Cannot send to {organizer_email}")
        return

    try:
        msg = MIMEMultipart()
        msg['From'] = Config.EMAIL_ADDRESS
        msg['To'] = organizer_email
        msg['Subject'] = subject
        
        msg.attach(MIMEText(body, 'plain'))
        
        server = smtplib.SMTP(Config.SMTP_SERVER, Config.SMTP_PORT)
        server.starttls()
        server.login(Config.EMAIL_ADDRESS, Config.EMAIL_PASSWORD)
        server.send_message(msg)
        server.quit()
        print(f"✅ Success: Alert email sent to {organizer_email}")
    except Exception as e:
        print(f"❌ SMTP Error sending to {organizer_email}: {e}")

def send_event_alert_email(organizer_email, alert_data):
    """
    Sends a professional event density alert email.
    Runs in a background thread to avoid blocking the main simulation/API.
    """
    zone_name = alert_data.get('zone_name', 'Unknown Zone')
    alert_type = alert_data.get('alert_type', 'INFO')
    event_name = alert_data.get('event_name', 'Campus Monitoring')
    
    # Determine Subject
    if alert_type == "CRITICAL":
        subject = f"🚨 Critical Crowd Risk Alert – {zone_name}"
    elif alert_type == "HIGH":
        subject = f"⚠️ High Crowd Risk Warning – {zone_name}"
    elif alert_type == "SURGE":
        subject = f"📈 Sudden Crowd Surge Detected – {zone_name}"
    elif alert_type == "APPROVED":
        subject = f"✅ Event Approved: {event_name}"
    elif alert_type == "REJECTED":
        subject = f"❌ Event Registration Rejected: {event_name}"
    elif alert_type == "UPDATED":
        subject = f"📝 Event Details Updated: {event_name}"
    elif alert_type == "BROADCAST":
        subject = f"📢 ADMIN BROADCAST: {alert_data.get('title', 'Important Announcement')}"
    else:
        subject = f"CrowdSense Alert – {zone_name}"

    # Build Body Template
    if alert_type in ["APPROVED", "REJECTED", "UPDATED", "BROADCAST"]:
        body = f"""
CrowdSense System Notification
{f"--- {alert_type} ---" if alert_type == "BROADCAST" else ""}

Event: {event_name}
Zone: {zone_name}

Message:
{alert_data.get('message', 'Your event status or details have been updated in the CrowdSense system.')}

Time: {datetime.now().strftime('%H:%M %p')}


Log in to the dashboard to see full details:
http://localhost:5173/events

This is an automated notification from CrowdSense.
        """
    else:
        body = f"""
CrowdSense Automated Alert

Event: {event_name}
Zone: {zone_name}

Current Crowd: {alert_data.get('current_count', 0)}
Approved Capacity: {alert_data.get('capacity', 0)}
CRI Score: {alert_data.get('cri', 0)} ({alert_type.title()})
30-min Forecast: {alert_data.get('forecast', 'N/A')}
Surge Detected: {'YES' if alert_data.get('is_surge') else 'NO'}

Recommended Action:
{alert_data.get('action', 'Monitor zone closely and consider restricting entry.')}

Time: {datetime.now().strftime('%H:%M %p')}

This is an automated alert from CrowdSense.
        """

    # Dispatch in background thread
    thread = threading.Thread(target=_send_email_async, args=(organizer_email, subject, body))
    thread.daemon = True
    thread.start()

