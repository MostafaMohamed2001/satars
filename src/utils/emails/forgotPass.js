const nodemailer = require('nodemailer');

// إعدادات النقل (transport) للبريد
const transporter = nodemailer.createTransport({
  host: 'sandbox.smtp.mailtrap.io', // استبدلها بخادم SMTP الخاص بك
  port: 587, // عادة ما يكون 587 للبريد الآمن
  secure: false, // يجب أن تكون true إذا كنت تستخدم المنفذ 465
  auth: {
    user: '91d023cf001258', // استبدلها ببريدك الإلكتروني
    pass: 'd7d2936a6ea9ca' // استبدلها بكلمة مرور بريدك الإلكتروني
  }
});

// دالة لإرسال البريد الإلكتروني
const sendEmail = async (to, subject, text) => {
  const mailOptions = {
    from: 'satars@gmail.com', // نفس البريد الإلكتروني المستخدم في إعداد النقل
    to,
    subject,
    text,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('رسالة البريد الإلكتروني أرسلت: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('خطأ في إرسال البريد الإلكتروني:', error);
    throw error; // إعادة الخطأ ليتسنى التعامل معه في مكان آخر
  }
};

module.exports = { sendEmail };
