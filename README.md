SMS Exercise Reminder & Logger
This project uses Google Apps Script and the Twilio API to run a simple, automated SMS-based reminder and logging system. Its purpose is to send a recurring reminder to a small, predefined list of phone numbers and record their "Yes" or "No" responses in a Google Sheet.

How It Works
The system is built entirely within the Google Workspace ecosystem, making it serverless and easy to manage.

Automated Reminders: A time-driven trigger in Google Apps Script periodically runs a function that sends a custom SMS message (e.g., "Do 2 lunges and respond with a Y for Yes or a N for No") to a list of phone numbers via the Twilio API.

Response Logging: The script is also deployed as a web app, providing a webhook URL for Twilio. When a user replies to the SMS, Twilio forwards the message to this webhook.

Google Sheet as a Database: The script validates the incoming response. If it's a "Y" or "N", it appends a new row to a designated Google Sheet, creating a historical log with a timestamp, the sender's phone number, and their response.

Technology Stack
Google Apps Script: The core logic for sending messages and handling incoming webhooks.
Google Sheets: The database for logging all sent reminders and received responses.
Twilio API: The service used for SMS messaging.
This project is intended for personal, non-commercial use and serves as a practical example of integrating a powerful third-party API with Google Workspace.
