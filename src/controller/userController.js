const admin = require('firebase-admin');
const { sendEmail } = require("../utils/emails/forgotPass"); // استيراد دالة sendEmail

// دالة لجلب جميع المستخدمين
const getUsers = async (req, res) => {
  const usersRef = admin.firestore().collection('users');

  try {
    const snapshot = await usersRef.get();

    if (snapshot.empty) {
      return res.status(404).send("لا توجد مستخدمين في المجموعة");
    }

    let usersData = [];
    snapshot.forEach(doc => {
      console.log("User ID:", doc.id);
      console.log("User Data:", doc.data());
      usersData.push({ id: doc.id, ...doc.data() });
    });

    return res.status(200).json(usersData);
  } catch (error) {
    console.error("خطأ في جلب المستخدمين:", error);
    return res.status(500).send("حدث خطأ أثناء جلب المستخدمين");
  }
};

// دالة لجلب مستخدم حسب البريد الإلكتروني
const forgotPass = async (req, res) => {
    const email = req.params.email; // استلام البريد الإلكتروني من جسم الطلب
  
    if (!email) {
      return res.status(400).send("البريد الإلكتروني مطلوب");
    }
  
    const usersRef = admin.firestore().collection('users');
  
    try {
      const snapshot = await usersRef.where('email', '==', email).get();
  
      if (snapshot.empty) {
        return res.status(404).send("لم يتم العثور على مستخدم بهذا البريد الإلكتروني");
      }
  
      let userData = [];
      let userId; // لتخزين معرّف المستخدم
      snapshot.forEach(doc => {
        console.log("User ID:", doc.id);
        console.log("User Data:", doc.data());
        userId = doc.id; // تخزين معرّف المستخدم
        userData.push({ id: doc.id, ...doc.data() });
      });
  
      // توليد رمز التحقق (OTP)
      const otp = Math.floor(1000 + Math.random() * 9000); // رمز مكون من 6 أرقام
  
      // تخزين رمز التحقق في مستند المستخدم
      await usersRef.doc(userId).update({ otp }); // تحديث مستند المستخدم برمز التحقق
  
      // إعداد نص البريد الإلكتروني
      const subject = 'رمز التحقق الخاص بك';
      const text = `رمز التحقق الخاص بك هو: ${otp}`;
  
      // إرسال البريد الإلكتروني
      await sendEmail(email, subject, text);
  
      return res.status(200).json({ message: "تم إرسال البريد الإلكتروني بنجاح" });
    } catch (error) {
      console.error("خطأ في جلب المستخدمين أو إرسال البريد:", error);
      return res.status(500).send("حدث خطأ أثناء جلب المستخدمين أو إرسال البريد الإلكتروني");
    }
  };



module.exports = { getUsers, forgotPass };
