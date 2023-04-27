const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');
// Load the API client library
gapi.load("client", initClient);

// Set up Gmail API client
const gmail = google.gmail({ version: 'v1', auth: oauth2Client });



// Initialize the API client library
function initClient() {
  // Initialize the client with the API key and necessary scopes
  gapi.client
    .init({
      apiKey: "YOUR_API_KEY",
      clientId: "YOUR_CLIENT_ID",
      scope: "https://www.googleapis.com/auth/gmail.readonly",
      discoveryDocs: [
        "https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest",
      ],
    })
    .then(function () {
      console.log("Gmail API enabled successfully!");
    })
    .catch(function (error) {
      console.error("An error occurred: " + error);
    });
}






const CLIENT_ID = '<YOUR_CLIENT_ID>';
const CLIENT_SECRET = '<YOUR_CLIENT_SECRET>';
const REDIRECT_URI = '<YOUR_REDIRECT_URI>';

const oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const SCOPES = ['https://www.googleapis.com/auth/gmail.labels', 'https://www.googleapis.com/auth/gmail.modify', 'https://www.googleapis.com/auth/gmail.readonly'];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
});

console.log(`Authorize this app by visiting this URL: ${authUrl}`);

// After user grants permission, exchange authorization code for access token and refresh token

const authCode = '<AUTHORIZATION_CODE>';

oauth2Client.getToken(authCode, (err, token) => {
  if (err) return console.error('Error retrieving access token', err);

  oauth2Client.setCredentials(token);
  console.log('Access token:', token.access_token);
  console.log('Refresh token:', token.refresh_token);
});





const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');



// Retrieve unread emails
async function getUnreadEmails() {
  try {
    // Authorize the client and get access token
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/gmail.readonly'],
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const code = '<code-from-redirected-url>';
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Retrieve unread emails
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: 'is:unread',
    });
    const messages = response.data.messages || [];
    for (const message of messages) {
      const messageResponse = await gmail.users.messages.get({
        userId: 'me',
        id: message.id,
      });
      const messageObject = messageResponse.data;
      console.log('Email subject:', messageObject.payload.headers.find(header => header.name === 'Subject').value);
    }
  } catch (error) {
    console.error('Error retrieving unread emails:', error);
  }
}

// Call the function to retrieve unread emails
getUnreadEmails();


