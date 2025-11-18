const admin = require('firebase-admin');
const fs = require('fs');
let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  } catch (err) {
    console.error('Invalid FIREBASE_SERVICE_ACCOUNT_KEY JSON', err);
    throw err;
  }
} else {
  // Local fallback: serviceAccountKey.json in backend folder
  const p = './serviceAccountKey.json';
  if (fs.existsSync(p)) {
    serviceAccount = require(p);
  } else {
    throw new Error('No Firebase service account found. Set FIREBASE_SERVICE_ACCOUNT_KEY or put serviceAccountKey.json in backend/');
  }
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

module.exports = db;
