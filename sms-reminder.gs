// ===============================================================
// ===                 GLOBAL CONFIGURATION                    ===
// ===============================================================

// --- Twilio Credentials ---
// Replace with your actual Twilio Account SID and Auth Token.
const TWILIO_ACCOUNT_SID = 'YOUR_TWILIO_ACCOUNT_SID';
const TWILIO_AUTH_TOKEN = 'YOUR_TWILIO_AUTH_TOKEN';
// Replace with your actual Twilio phone number.
const TWILIO_PHONE_NUMBER = 'YOUR_TWILIO_PHONE_NUMBER';


// --- Reminder Configuration ---
// Add the phone numbers you want to send reminders to in this list.
// Use E.164 format (e.g., +15551234567).
const RECIPIENT_PHONE_NUMBERS = ['+15551234567', '+15557654321'];

// The reminder question you want to send.
const REMINDER_QUESTION = 'Do 2 lunges and respond with a Y for Yes or a N for No';


// ===============================================================
// ===              CORE SCRIPT LOGIC (SEND SMS)               ===
// ===============================================================

/**
 * Sends an SMS message using the Twilio API.
 * This is a helper function used by sendReminders.
 * @param {string} phoneNumber The recipient's phone number.
 * @param {string} message The text message to send.
 */
function sendSms(phoneNumber, message) {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
  const options = {
    'method': 'post',
    'headers': {
      'Authorization': 'Basic ' + Utilities.base64Encode(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)
    },
    'payload': {
      'To': phoneNumber,
      'From': TWILIO_PHONE_NUMBER,
      'Body': message
    },
    'muteHttpExceptions': true // Prevents script from stopping on an error
  };
  
  try {
    const response = UrlFetchApp.fetch(url, options);
    Logger.log('SMS Sent to ' + phoneNumber + '. Response: ' + response.getContentText());
  } catch (e) {
    Logger.log('Error sending SMS to ' + phoneNumber + ': ' + e.toString());
  }
}

/**
 * Iterates through the recipient list, sends the reminder,
 * and logs the action to the Google Sheet.
 * This function should be run by a time-driven trigger.
 */
function sendReminders() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Log');
  
  RECIPIENT_PHONE_NUMBERS.forEach(phoneNumber => {
    sendSms(phoneNumber, REMINDER_QUESTION);
    
    // Log that a reminder was sent
    sheet.appendRow([
      new Date(),       // Timestamp
      phoneNumber,      // To whom it was sent
      'Sent Reminder',  // Event Type
      REMINDER_QUESTION // The message/question content
    ]);
  });
}


// ===============================================================
// ===         CORE SCRIPT LOGIC (RECEIVE & LOG SMS)           ===
// ===============================================================

/**
 * This function is a webhook that runs when Twilio receives an SMS.
 * It validates the response and logs it to the Google Sheet.
 * @param {object} e The event object from the HTTP POST request.
 */
function doPost(e) {
  try {
    const params = e.parameter;
    const fromNumber = params.From;
    const responseBody = params.Body.trim().toUpperCase();

    // Only log responses that are 'Y' or 'N'
    if (responseBody === 'Y' || responseBody === 'N') {
      const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Log');
      
      // Append a new row for the received response
      sheet.appendRow([
        new Date(),           // Timestamp
        fromNumber,           // Who sent the response
        'Received Response',  // Event Type
        '',                   // Message/Question (N/A for responses)
        responseBody          // The actual response
      ]);
    }
    
    // Twilio expects a valid XML response to acknowledge receipt.
    return ContentService.createTextOutput('<Response></Response>').setMimeType(ContentService.MimeType.XML);

  } catch (error) {
    // Log any errors to help with debugging
    Logger.log('Error in doPost: ' + error.toString());
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Log');
    sheet.appendRow([new Date(), 'ERROR', 'doPost Failed', error.toString()]);
    return ContentService.createTextOutput('<Response></Response>').setMimeType(ContentService.MimeType.XML);
  }
}
