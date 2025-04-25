// generate-secrets.js
import crypto from 'crypto';
console.log("Access Token Secret:", crypto.randomBytes(64).toString('hex'));
console.log("Refresh Token Secret:", crypto.randomBytes(64).toString('hex'));