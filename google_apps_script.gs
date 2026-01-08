// Paste this into the Apps Script editor (Tools → Script editor) for your Google Sheet
// This function handles POST requests from the landing page and writes into the active sheet
// It also sends an email notification for each new lead. Update `recipient` as needed.

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSheet();
    var timestamp = new Date();
    var data = {};

    // Form data comes as e.parameter when submitted via iframe
    // e.parameter is already parsed by Google Apps Script
    if (e && e.parameter) {
      data.name = e.parameter.name || '';
      data.email = e.parameter.email || '';
      data.phone = e.parameter.phone || '';
      data.description = e.parameter.description || '';
      data.website = e.parameter.website || '';
    } else if (e && e.postData && e.postData.contents) {
      // Fallback: try to parse JSON if it was sent as JSON
      try {
        data = JSON.parse(e.postData.contents);
      } catch (jsonErr) {
        // If not JSON, just use empty data
      }
    }

    // Anti-spam: if honeypot field "website" is filled, log as SPAM
    if (data.website && String(data.website || '').trim()) {
      sheet.appendRow([timestamp, 'SPAM', data.email || '', data.phone || '', data.description || '', 'honeypot=' + (data.website || '')]);
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', spam: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Log the lead if we have at least a name or email
    if (data.name || data.email) {
      sheet.appendRow([timestamp, data.name || '', data.email || '', data.phone || '', data.description || '']);
    } else {
      // Log error if no valid data
      sheet.appendRow([new Date(), 'ERROR: No valid data received', JSON.stringify(e)]);
      return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'No valid data' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Email notification
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
      MailApp.sendEmail({
        to: recipients.join(','),
        subject: subject,
        body: body
      });
    } catch (mailErr) {
      sheet.appendRow([new Date(), 'ERROR: MailApp.sendEmail failed', mailErr.toString()]);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    // Log any critical errors to the sheet
    SpreadsheetApp.getActiveSheet().appendRow([new Date(), 'CRITICAL ERROR in doPost', err.toString()]);
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
