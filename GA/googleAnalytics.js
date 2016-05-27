var google = require('googleapis');
var config = require('./config.json');
// var fs = require('fs');

response_type=code&client_id=218772642678-dlp5nqutp9cf24ah2j0ovmoki7hr6bk4.apps.googleusercontent.com&access_type=offline

var authorization_endpoint = 'https://accounts.google.com/o/oauth2/auth';
var token_endpoint = 'https://www.googleapis.com/oauth2/v4/token',
var token_location = 'bearer';

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function(err, token) {
    if (err) {
      getNewToken(oauth2Client, callback);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      callback(oauth2Client);
    }
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', function(code) {
    rl.close();
    oauth2Client.getToken(code, function(err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client);
    });
  });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
}

/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listLabels(auth) {
  var gmail = google.gmail('v1');
  gmail.users.labels.list({
    auth: auth,
    userId: 'me',
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    var labels = response.labels;
    if (labels.length == 0) {
      console.log('No labels found.');
    } else {
      console.log('Labels:');
      for (var i = 0; i < labels.length; i++) {
        var label = labels[i];
        console.log('- %s', label.name);
      }
    }
  });
}

function findChoice(input) {
  input = process.stdin.read();
  while(isNaN(input) || input > 2 || input < 1) {
    console.log('Please enter valid option');
    findChoice(input);
  }
}

function choose() {
  console.log('Welcome to Google Analytics auto-refresh script generator!');
  console.log('Please choose one of the following authorization ways to generate your script:');
  console.log('1. Have Current client_secret.json file downloaded from google api console.');
  console.log('2. Have NOT downloaded the secret file, needed to input the client_id and secret');

  var choice;

  findChoice(choice).then(function(choice) {
    if(choice == 1) {
      console.log('Please enter the path of client_secret.json');
      var path;
      path = process.stdin.read();
      fs.readFile(path, function(err, content) {
        if(err) {
          console.log(err);
          return;
        }

        authorize(JSON.parse(content));
      })
    }
  })
}


choose();