//using .env file when not in production
require("dotenv").config();

//setting up firebase
const firebase = require("firebase-admin");
const googleServiceAccountCreds = process.env.GOOGLE_CONFIG_BASE64; //base64 encoded credentials saved in environment variables for security
if (!googleServiceAccountCreds) {
  throw new Error(
    "The $GOOGLE_SERVICE_ACCOUNT_CREDS environment variable was not found!"
  );
}
//initialize firebase
firebaseAdminApp = firebase.initializeApp({
  credential: firebase.credential.cert(
    //decode the base64 encoded service account credentials
    JSON.parse(
      Buffer.from(process.env.GOOGLE_CONFIG_BASE64, "base64").toString("ascii")
    )
  ),
});

module.exports = { firebaseAdminApp };
