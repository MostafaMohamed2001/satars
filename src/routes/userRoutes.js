const express = require('express');
const { getUsers ,forgotPass } = require('../controller/userController'); // استيراد وحدة التحكم

const router = express.Router();


router.get('/', getUsers);
router.post('/forgotPass/:email', forgotPass); 

module.exports = router; 
