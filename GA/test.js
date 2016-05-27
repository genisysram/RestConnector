var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;
var config = require('./config.json');
var concat = require('concatenate-files');
var validator = require('validator');

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/gmail-nodejs-quickstart.json
var SCOPES = config.scopes;

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Load client secrets from a local file.
fs.readFile('./client_secret_clientId.json', function processClientSecrets(err, content) {
  if (err) {
    console.log('Error loading client secret file: ' + err);
    return;
  }

  content = JSON.parse(content);
  authorize(content, function(tokens) {
    fs.writeFile('script.txt', 'SET vClient_id = ' + content.web.client_id + ';\n'
                            + 'SET vClient_secret = ' + content.web.client_secret + ';\n'
                            + 'SET vRefresh_token = ' + tokens.refresh_token + ';\n', function(err) {
      if(err) throw(err);
      concat(['script.txt', 'refresh_script.txt'], './total.txt', function(err, result) {
        console.log(result.outputData);
      })
    })
  });
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
  var redirectUrl = credentials.web.redirect_uris[0];
  var oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);
  var url = oauth2Client.generateAuthUrl({
    access_type: 'offline', // 'online' (default) or 'offline' (gets refresh_token)
    scope: SCOPES, // If you only need one scope you can pass it as string
    approval_prompt: 'force'
  });

  console.log('Visit the url in your browser and click Allow:\n', url);
  rl.question('Please copy and paste the url after click Allow or directly enter the code from the website here: ', function (codeOrUrl) {
    rl.close();
    // request access token
    if(validator.isURL(codeOrUrl)) {
      codeOrUrl = codeOrUrl.substr(codeOrUrl.indexOf('=') + 1);
    }
    oauth2Client.getToken(codeOrUrl, function (err, tokens) {
      if (err) {
        return callback(err);
      }
      console.log('\n\nThis is your token, please copy and paste the following fields to the REST Connector "Query Header" with\n\nName: Authorization\nValue: Bearer '
                  + tokens.access_token);
      callback(tokens);
    });
  })
}
