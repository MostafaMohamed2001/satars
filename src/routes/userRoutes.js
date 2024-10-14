const express = require('express');
const { getUsers ,forgotPass , verifyOtp, resetPass } = require('../controller/userController'); // استيراد وحدة التحكم

const router = express.Router();


router.get('/', getUsers);
router.post('/forgotPass/:email', forgotPass); 
router.post('/verifyOtp', verifyOtp); 
router.post('/resetPassword', resetPass); 

module.exports = router; 
