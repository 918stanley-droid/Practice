// Paste this into the Apps Script editor (Tools → Script editor) for your Google Sheet
// This function handles POST requests from the landing page and writes into the active sheet
// It also sends an email notification for each new lead. Update `recipient` as needed.

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSheet();
  var timestamp = new Date();
  var data = {};

  try {
    data = JSON.parse(e.postData.contents || '{}');
  } catch (err) {
    // fallback to parameters (in case form posts as application/x-www-form-urlencoded)
    data.name = e.parameter && e.parameter.name;
    data.email = e.parameter && e.parameter.email;
    data.phone = e.parameter && e.parameter.phone;
    data.description = e.parameter && e.parameter.description;
  }

  // Basic anti-spam: if honeypot field "website" is filled, log as SPAM and do not treat as a valid lead
  if (data.website && String(data.website || '').trim()) {
    sheet.appendRow([timestamp, 'SPAM', data.email || '', data.phone || '', data.description || '', 'honeypot=' + (data.website || '')]);
    return ContentService.createTextOutput(JSON.stringify({ status: 'success', spam: true }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  sheet.appendRow([timestamp, data.name || '', data.email || '', data.phone || '', data.description || '']);

  // Email notification — change recipients to the addresses you want to notify
  // You can add multiple emails to the array below. They will all receive the notification.
  var recipients = ['918stanley@gmail.com', 'getmoving4u@gmail.com']; 
  var subject = 'New lead from Moving 4U' + (data.name ? (': ' + data.name) : '');
  var body = 'You have a new lead from your landing page.\n\n' +
             'Name: ' + (data.name || '') + '\n' +
             'Email: ' + (data.email || '') + '\n' +
             'Phone: ' + (data.phone || '') + '\n' +
             'Description: ' + (data.description || '') + '\n\n' +
             'Received: ' + timestamp.toString() + '\n\n' +
             'This message was sent automatically by your Google Apps Script.';

  try {
    // Send to multiple recipients (comma-separated)
    MailApp.sendEmail({
      to: recipients.join(','),
      subject: subject,
      body: body
    });
  } catch (mailErr) {
    // If sending email fails, log it to the sheet (optional)
    sheet.appendRow([new Date(), 'ERROR: MailApp.sendEmail failed', mailErr.toString()]);
  }

  return ContentService.createTextOutput(JSON.stringify({ status: 'success' }))
    .setMimeType(ContentService.MimeType.JSON);
}
