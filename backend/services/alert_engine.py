import time
from datetime import datetime, timedelta
import os
import sys

# Add parent directory to path to import config and email_service
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import Config
from services.email_service import send_event_alert_email

# In-memory store for throttling: {zone_id: last_alert_timestamp}
_last_alerts = {}

def should_trigger(zone_id, zone_data, event_config, user_role):
    """
    Evaluates if an alert should be sent based on CRI, Capacity, and Surge.
    Includes throttling and role/status validation.
    """
    global _last_alerts
    
    # Validation 1: User Role and Event Status
    # Event organizer must be the role, and the event must be APPROVED
    # (Checking if user is organizer is handled in the trigger call usually)
    if user_role != "event_organizer":
        return False
        
    # (Status check done at injection point where we fetch approved events)
    
    # Validation 2: Throttling (15 min)
    now = time.time()
    last_time = _last_alerts.get(zone_id, 0)
    if (now - last_time) < (Config.THROTTLE_MINUTES * 60):
        return False

    # Validation 3: Thresholds
    cri = zone_data.get('cri', 0)
    count = zone_data.get('count', 0)
    capacity = zone_data.get('capacity', 1)
    growth = zone_data.get('growth', 0)

    is_critical = cri >= Config.CRI_CRITICAL_THRESHOLD
    is_high = cri >= Config.CRI_HIGH_THRESHOLD
    is_over_capacity = count > capacity
    
    # ACCURACY FIX: Only flag surge if density is significant (>10% capacity)
    # This prevents early morning false alarms where 2 people -> 10 people = 400% surge
    is_surge = (growth >= Config.SURGE_THRESHOLD) and (count > (capacity * 0.1)) and (cri > 10)

    if is_critical or is_high or is_over_capacity or is_surge:
        return True

        
    return False

def trigger_alert(organizer_email, zone_id, zone_data, event_name):
    """Prepares alert metadata and dispatches email."""
    global _last_alerts
    
    cri = zone_data.get('cri', 0)
    count = zone_data.get('count', 0)
    capacity = zone_data.get('capacity', 1)
    growth = zone_data.get('growth', 0)
    
    # Resolve Alert Type
    if cri >= Config.CRI_CRITICAL_THRESHOLD:
        alert_type = "CRITICAL"
        action = "🚨 IMMEDIATE ACTION REQUIRED: Temporarily restrict entry and redirect attendees to alternate zones. Dispatch security personnel."
    elif growth >= Config.SURGE_THRESHOLD:
        alert_type = "SURGE"
        action = "📈 NOTIFICATION: Sudden crowd spike detected. Monitor ingress points and prepare for crowd control measures."
    elif cri >= Config.CRI_HIGH_THRESHOLD:
        alert_type = "HIGH"
        action = "⚠️ WARNING: Approaching critical density. Advise staff to implement flow management protocols."
    else:
        alert_type = "CAPACITY"
        action = "👥 NOTICE: Zone has exceeded its approved capacity limit."

    alert_metadata = {
        "event_name": event_name,
        "zone_name": zone_data.get('name', zone_id),
        "alert_type": alert_type,
        "current_count": int(count),
        "capacity": capacity,
        "cri": cri,
        "forecast": zone_data.get('forecast', 'Increasing'),
        "is_surge": alert_type == "SURGE",
        "action": action
    }


    # Update throttling state
    _last_alerts[zone_id] = time.time()
    
    # Send Email
    send_event_alert_email(organizer_email, alert_metadata)
    return True

def send_status_update_notification(organizer_email, event_name, zone_name, new_status, message=None, start_time=None, end_time=None):
    """Sends a notification for event approval, rejection, or detail change."""
    
    time_info = f" (Scheduled: {start_time} - {end_time})" if start_time and end_time else ""
    
    if not message:
        if new_status == "APPROVED":
            msg = f"Great news! Your event '{event_name}' in {zone_name}{time_info} has been approved. CrowdSense is now monitoring this zone for your safety during these hours."
        elif new_status == "REJECTED":
            msg = f"Your registration for '{event_name}' in {zone_name}{time_info} was not approved at this time."
        elif new_status == "UPDATED":
            msg = f"The details for your event '{event_name}'{time_info} have been updated in our system."
        else:
            msg = f"There has been an update to your event '{event_name}'{time_info}."
    else:
        msg = message

    alert_metadata = {
        "event_name": event_name,
        "zone_name": zone_name,
        "alert_type": new_status, # APPROVED, REJECTED, UPDATED
        "message": msg
    }
    
    send_event_alert_email(organizer_email, alert_metadata)
    return True


