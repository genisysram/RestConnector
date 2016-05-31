var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;
var config = require('./config.json');
var concat = require('concatenate-files');
var validator = require('validator');
var async = require("async");

var SCOPES = config.scopes;

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

var Credentials = function() {
    this.client_id = 'client_id',
        this.client_secret = 'client_secret',
        this.redirect_uris = ['redirectUris'];
}


// The main/start of the app
Credentials.prototype.start = function() {
    console.log('Welcome to Google Analytics auto-refresh script generator!');
    console.log('Please choose one of the following authorization ways to generate your script:\n\
              1. Have Current client_secret.json file downloaded from google api console.\n\
              2. Have NOT downloaded the secret file, needed to input the client_id and secret\n');
    rl.question('', function(choice) {
        credential.findChoice(choice, function(validChoice) {
            if (validChoice == 1) {
                credential.givePath(function(content) {
                  content = content.web;
                  credential.authorize(content, false,function(token) {
                      credential.giveOutToken(content, token);
                  })
                })
            } else {
                credential.inputCredentials(function(content) {
                  credential.authorize(content, true,function(token) {
                      credential.giveOutToken(content, token);
                  })
                })
            }
        })
    })
}


// find the choice 1 or 2 only, otherwise ask for re-write
Credentials.prototype.findChoice = function(input, callback) {
    if (isNaN(input) || input < 1 || input > 2) {
        rl.question('Please enter valid option: \n', function(answer) {
            credential.findChoice(answer, callback);
        })
    } else {
        callback(input);
    }
}

// Option1: Load client secrets from a local file.
Credentials.prototype.givePath = function(callback) {
  rl.question('Enter the simple path of the file(For example: if file is in the current folder then type ./client_secret.json):', function(path) {

      try {
        fs.readFile(path, function processClientSecrets(err, content) {
            if (err) {
                throw(err)
            }
            callback(JSON.parse(content));
        })
      } catch(err) {
        console.log('Invalid path, please try again!');
        credential.givePath(callback);
      }
  })
}

// Option2: User input credentials
// If what it to be able to handle more error and go back, we can add function
// to handle each field and loop if we get the wrong input
// Now it can only reinput the whole credentials once you write something wrong
Credentials.prototype.inputCredentials = function(callback) {
  console.log('Please enter the following parameters of your app:');
  credential.getCredentialFields("client_id", function(id) {
    credential.client_id = id;
    credential.getCredentialFields("client_secret",function(secret) {
      credential.client_secret = secret;
      credential.getCredentialFields("redirectUrl", function(rediurl) {
        credential.redirect_uris[0] = rediurl;
        callback(credential);
      })
    })
  })
}

Credentials.prototype.getCredentialFields = function(fieldName, callback) {
    rl.question('Please enter your ' + fieldName + ' ', function(inputField) {
      credential.validCredentials(fieldName, function(isValid) {
        if(isValid) {
          callback(inputField);
        } else {
          credential.getCredentialFields(fieldName, callback);
        }
      })
    })
}

Credentials.prototype.validCredentials = function(subName, callback) {
  console.log('Please verify your ' + subName);
  rl.question('Press Y to continue or N to re-enter: ', function(reply) {
    if(reply == 'Y' || reply == 'y') {
      callback(true);
    } else if(reply == 'N' || reply == 'n') {
      callback(false);
    } else {
      credential.validCredentials(credential, callback);
    }
  })
}

Credentials.prototype.giveOutToken = function(content, tokens) {
    fs.writeFile('script.txt', 'SET vClient_id = ' + content.client_id + ';\n' + 'SET vClient_secret = ' + content.client_secret + ';\n' + 'SET vRefresh_token = ' + tokens.refresh_token + ';\n', function(err) {
        if (err) throw (err);
        concat(['script.txt', 'refresh_script.txt'], './total.txt', function(err, result) {
            console.log('Please do the following:');
            console.log('1. Go to your app and Insert the full script that rest connector created for you(By pressing second button: select data).');
            console.log('2. Find  FROM JSON (wrap on) xxx;  and replace it with   FROM JSON (wrap on) xxx WITH CONNECTION (  HTTPHEADER "Authorization" "Bearer $(vAccessToken)");');
            console.log('3. Insert the following script to your script file "ABOVE" the script that REST connector created for you:\n');
            console.log(result.outputData);
            console.log('\n4. Click the load data button to test whether it works');
        })
    })
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
Credentials.prototype.authorize = function(credentials, isInput, callback) {
    var clientId = credentials.client_id;
    var clientSecret = credentials.client_secret;
    var redirectUrl = credentials.redirect_uris[0];


    var oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);
    var url = oauth2Client.generateAuthUrl({
        access_type: 'offline', // 'online' (default) or 'offline' (gets refresh_token)
        scope: SCOPES, // If you only need one scope you can pass it as string
        approval_prompt: 'force'
    });

    console.log('Visit the url in your browser and click Allow:\n', url);
    rl.question('Please copy and paste the url after click Allow or directly enter the code from the website here:', function(codeOrUrl) {
        console.log("0 ");

        // if input url, convert to code to verify
        if (validator.isURL(codeOrUrl)) {
            codeOrUrl = codeOrUrl.substr(codeOrUrl.indexOf('=') + 1);
        }
        console.log("1 " + codeOrUrl);

        oauth2Client.getToken(codeOrUrl, function(err, tokens) {
          console.log("2");
            if (err) throw (err)
            console.log('\n\nThis is your token, please copy and paste the following fields to the REST Connector "Query Header" with\n\nName: Authorization\nValue: Bearer ' + tokens.access_token);
            if (isInput) {
                console.log(JSON.stringify(oauth2Client));
                callback(oauth2Client, tokens);
            } else {
                callback(tokens);
            }
            rl.close();
        });
    })
}

var credential = new Credentials();
credential.start();
