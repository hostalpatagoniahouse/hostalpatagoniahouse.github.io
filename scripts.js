var SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

function getClientId() {
  return document.getElementById('client-id').value;
}

function getDocumentId() {
  return document.getElementById('document-id').value;
}
/**
 * Handle response from authorization server.
 *
 * @param {Object} authResult Authorization result.
 */
function handleAuthResult(authResult) {
  var authorizeDiv = document.getElementById('authorize-div');
  if (authResult && !authResult.error) {
    // Hide auth UI, then load client library.
    authorizeDiv.style.display = 'none';
    loadSheetsApi();
  } else {
    // Show auth UI, allowing the user to initiate authorization by
    // clicking authorize button.
    authorizeDiv.style.display = 'block';
  }
}

/**
 * Initiate auth flow in response to user clicking authorize button.
 *
 * @param {Event} event Button click event.
 */
function handleAuthClick(event) {
  gapi.auth.authorize(
    {client_id: getClientId(), scope: SCOPES, immediate: false},
    handleAuthResult);
  return false;
}

/**
 * Load Sheets API client library.
 */
function loadSheetsApi() {
  var discoveryUrl =
      'https://sheets.googleapis.com/$discovery/rest?version=v4';
  gapi.client.load(discoveryUrl).then(testChange);
}

function testChange() {
  addBookingRow({
    name: 'Test',
    date: Date.now(),
    days: 3,
    room: 'X'
  });
}

/**
 * Print the names and majors of students in a sample spreadsheet:
 * https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 */
function addBookingRow(data) {
  gapi.client.sheets.spreadsheets.values.update({
    spreadsheetId: getDocumentId(),
    range: 'Hoja 2!A1:D1',
    valueInputOption: 'RAW',
    values: [[data.name, data.date, data.days, data.room]]
  }).then(function(response) {
    console.log(response);
  }, function(response) {
    appendPre('Error: ' + response.result.error.message);
  });
}

/**
 * Append a pre element to the body containing the given message
 * as its text node.
 *
 * @param {string} message Text to be placed in pre element.
 */
function appendPre(message) {
  var pre = document.getElementById('output');
  var textContent = document.createTextNode(message + '\n');
  pre.appendChild(textContent);
}
