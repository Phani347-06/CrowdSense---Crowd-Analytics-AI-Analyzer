import os

class Config:
    # Email Settings
    # Defaulting to the requested sender email
    EMAIL_ADDRESS = os.environ.get('EMAIL_ADDRESS', '24071A6945@vnrvjiet.in')
    EMAIL_PASSWORD = os.environ.get('EMAIL_PASSWORD', '') # App password should be in env
    
    SMTP_SERVER = "smtp.gmail.com" # Defaulting for vnr mail (likely google suite)
    SMTP_PORT = 587
    
    # Alert Settings
    THROTTLE_MINUTES = 15
    CRI_CRITICAL_THRESHOLD = 85
    CRI_HIGH_THRESHOLD = 70
    SURGE_THRESHOLD = 0.30
