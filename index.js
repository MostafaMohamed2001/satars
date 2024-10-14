const express = require('express');
const admin = require('firebase-admin');
const bodyParser = require('body-parser');
const userRoutes = require('./src/routes/userRoutes'); // استيراد مسارات المستخدمين


const app = express();
const port = 3000;


app.use(bodyParser.json());


const serviceAccount = require('./firebaseConnected.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

app.use('/users', userRoutes); 


app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
