# QlikRestConnector


## Quick Start
Open the terminal on your computer, clone this repo and cd to the cloned folder

First, copy the content of your credentials downloaded from https://console.developers.google.com of your app to the file named client_secret_clientId.json then save it

Do the following command:
```
npm install
```
the run:
```
node googleAnalytics.js
```

If you run test.js then it gives you error with lack module, then do following:
```
npm install validator
npm install concatenate-files
```


## Instruction

If you run into troubles with the instruction in this app, you may find detailed info from this.


1. run the app with node googleAnalytics.js

2. visit the url

3. click Allow button that google asked you(you can change the scope from config.json)

4. copy either the code that your browser tell you or copy the url of current website and paste it into terminal

5. open your googleAnalytics app in qlik sense and go to "data loat editor", click "Qlik REST Connector"

6. in the pop up window, fill the url that you want to make the api calls, you can find it out in https://developers.google.com/apis-explorer/ (ex: https://www.googleapis.com/analytics/v3/management/accountSummaries?key={your api key}); fill "Query Headers" with Name: Authorization and Value: Bearer {your access_token}; this is shown on the terminal

7. give your app a fancy name and click "Test Connection" to test whether it works, if it is click "Create"

8. insert the connector by click the second button "Select Data", you should select data that you want to see on the dashboard and if success you should be able to see a full script with certain properties in the script editor

9. find the text 'FROM JSON (wrap on) xxxx ;', usually in the last line under "RestConnectorMasterTable" tag, and replace it with 'FROM JSON (wrap on) xxxx WITH CONNECTION (    HTTPHEADER "Authorization" "Bearer $(vAccessToken)"  );'

10. insert the script that shown on your terminal "ABOVE" the script that REST connector created for you to make the access_token refreshed automatically

11. click load data button to test whether it works still, the best way is to test after a hour(3600 second) which is the expire time for the current token



## Errors
(Will update new one when we face the error)

### 1. When run node xxx.js command
If you get the error:
```
undefined:1

SyntaxError: Unexpected end of input
```

Reason:
The client_secret_clientId.json file is empty

Solution:
Simply fit in your client_secret_clientId.json file with the credentials.

## Notice

1. Right now this simple only works with web google app, any other type like: installed, server, etc. are not currently supported.
2. Now the scopes are set as all the google analytics v3 and v4 engine in the config.json, you can change it if you want. The required scope of your REST calls will be able to find in https://developers.google.com/apis-explorer/
