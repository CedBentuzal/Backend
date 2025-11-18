//test if backend reaches Firestore

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

console.log('Initializing Firebase Admin SDK...');

try {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('Firebase Admin initialized.');
  }
} catch (err) {
  console.error('Failed to initialize Firebase Admin:', err);
  process.exit(1);
}

const db = admin.firestore();

async function testWrite() {
  try {
    console.log('Attempting to write to Firestore...');
    const docRef = await db.collection('test').add({
      message: 'Hello Firestore!',
      ts: new Date().toISOString(),
    });
    console.log('Document written with ID:', docRef.id);
  } catch (err) {
    console.error('Error writing document:', err);
  }
}

testWrite();
