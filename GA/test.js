var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;
var config = require('./config.json');
var concat = require('concatenate-files');

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/gmail-nodejs-quickstart.json
var SCOPES = config.scopes;

// Load client secrets from a local file.
fs.readFile('./client_secret_clientId.json', function processClientSecrets(err, content) {
  if (err) {
    console.log('Error loading client secret file: ' + err);
    return;
  }
  // Authorize a client with the loaded credentials, then call the
  // Gmail API.
  content = JSON.parse(content);
  authorize(content, function(tokens) {
    console.log(tokens.refresh_token);
    fs.writeFile('script.txt', 'SET vClient_id = ' + content.web.client_id + ';'
                            + 'SET vClient_secret = ' + content.web.client_secret + ';'
                            + 'SET vRefresh_token = ' + tokens.refresh_token + ';', function(err) {
      if(err) throw(err);
      concat(['script.txt', 'refresh_script.txt'], './total.txt', function(err, result) {
        console.log('Please copy the following script or everyting in the total.txt file to your data-load-eiditor');
        console.log(result.outputData);
      })
    })
  });
});

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  var clientSecret = credentials.web.client_secret;
  var clientId = credentials.web.client_id;
  var redirectUrl = credentials.web.redirect_uris[1];
  var oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);
  var url = oauth2Client.generateAuthUrl({
    access_type: 'offline', // 'online' (default) or 'offline' (gets refresh_token)
    scope: SCOPES, // If you only need one scope you can pass it as string
    approval_prompt: 'force'
  });

  console.log('Visit the url in your browser and click Allow: ', url);
  rl.question('Enter the code from the website here: ', function (code) {
    rl.close();
    // request access token
    oauth2Client.getToken(code, function (err, tokens) {
      if (err) {
        return callback(err);
      }

      callback(tokens);
    });
  })
}
