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
node test.js
```

If you run test.js then it gives you error with lack module, then do following:
```
npm install validator
npm install concatenate-files
```

## Notice
At this point the googleAnalytics.js is useless but at later version there will
have no test.js, we are going to run googleAnalytics.js instead
