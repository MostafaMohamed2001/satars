const admin = require("firebase-admin");
const { sendEmail } = require("../utils/emails/forgotPass"); // استيراد دالة sendEmail

// دالة لجلب جميع المستخدمين
const getUsers = async (req, res) => {
  const usersRef = admin.firestore().collection("users");

  try {
    const snapshot = await usersRef.get();

    if (snapshot.empty) {
      return res.status(404).send("لا توجد مستخدمين في المجموعة");
    }

    let usersData = [];
    snapshot.forEach((doc) => {
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

  const usersRef = admin.firestore().collection("users");

  try {
    const snapshot = await usersRef.where("email", "==", email).get();

    if (snapshot.empty) {
      return res
        .status(404)
        .send("لم يتم العثور على مستخدم بهذا البريد الإلكتروني");
    }

    let userData = [];
    let userId; // لتخزين معرّف المستخدم
    snapshot.forEach((doc) => {
      console.log("User ID:", doc.id);
      console.log("User Data:", doc.data());
      userId = doc.id; // تخزين معرّف المستخدم
      userData.push({ id: doc.id, ...doc.data() });
    });

    // توليد رمز التحقق (OTP)
    const otp = Math.floor(1000 + Math.random() * 9000).toString(); // رمز مكون من 6 أرقام

    // تخزين رمز التحقق في مستند المستخدم
    await usersRef.doc(userId).update({ otp }); // تحديث مستند المستخدم برمز التحقق

    // إعداد نص البريد الإلكتروني
    const subject = "رمز التحقق الخاص بك";
    const text = `رمز التحقق الخاص بك هو: ${otp}`;

    // إرسال البريد الإلكتروني
    await sendEmail(email, subject, text);

    return res
      .status(200)
      .json({ message: "تم إرسال البريد الإلكتروني بنجاح" });
  } catch (error) {
    console.error("خطأ في جلب المستخدمين أو إرسال البريد:", error);
    return res
      .status(500)
      .send("حدث خطأ أثناء جلب المستخدمين أو إرسال البريد الإلكتروني");
  }
};

const verifyOtp = async (req, res) => {
  const { otp } = req.body;
  console.log("-=-=-", otp);
  const usersRef = admin.firestore().collection("users");
  try {
    const snapshot = await usersRef.where("otp", "==", otp).get();
    // console.log("-=-=-=-=-" , snapshot);
    if (snapshot.empty) {
      return res.status(404).json({ message: "رمز التحقق غير متوفر" });
    }

    let userData = [];
    let userId;
    let userEmail;
    snapshot.forEach((doc) => {
      console.log("User ID:", doc.id);
      console.log("User Data:", doc.data());  
      userId = doc.id;
      userEmail = doc.data().email;
      userData.push({ id: doc.id, ...doc.data() });
    });
    console.log("-=-=-=-=-" , userEmail)
    console.log("-=-=-=-=-" , userId)
    console.log("-=-=-=-=-" , userData)
    return res.status(200).json({
      message: "لقد تم التحقق من otp",
      email: userEmail,
    });
  } catch (error) {
    console.error("خطأ في التحقق من الرمز التحقق:", error);
    return res.status(500).send("حدث خطأ أثناء التحقق من الرمز التحقق");
  }
};

const resetPass = async (req, res) => {
  const { email, password, passwordConfirm } = req.body;

  // التحقق من إدخال كلمة المرور وتأكيد كلمة المرور
  if (!password || !passwordConfirm) {
    return res.status(400).json({ message: "ادخل password و password confirm" });
  }

  // التحقق من تطابق كلمتي المرور
  if (password !== passwordConfirm) {
    return res.status(400).json({ message: "كلمة المرور غير متطابقة" });
  }

  // البحث عن المستخدم في قاعدة البيانات
  const userRef = admin.firestore().collection('users').where('email', '==', email).limit(1);

  try {
    const snapshot = await userRef.get();
    
    // التحقق من وجود المستخدم
    if (snapshot.empty) {
      return res.status(404).json({ message: "المستخدم غير موجود" });
    }

    // الحصول على معرف المستخدم وتحديث كلمة المرور
    let userId;
    snapshot.forEach((doc) => {
      userId = doc.id;
    });

    // تحديث كلمة المرور في قاعدة البيانات
    await admin.firestore().collection('users').doc(userId).update({
      password: password
    });

    return res.status(200).json({ message: "تم تحديث كلمة المرور بنجاح" });

  } catch (error) {
    console.error("خطأ أثناء تحديث كلمة المرور:", error);
    return res.status(500).json({ message: "حدث خطأ أثناء تحديث كلمة المرور" });
  }
};


module.exports = { getUsers, forgotPass , verifyOtp , resetPass };
