import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5500;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.get("/api/usage", async (req, res) => {
  try {
    const iccid = req.query.iccid;
    if (!iccid) return res.status(400).json({ error: "ICCID مطلوب" });

    const loginResponse = await fetch("https://esimcard.com/api/developer/reseller/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "dream-bh@hotmail.com",
        password: "37774188??Abc"  // عدل هنا كلمة السر
      })
    });

    const loginData = await loginResponse.json();
    if (!loginData.access_token) {
      return res.status(401).json({ error: "فشل تسجيل الدخول", loginData });
    }

    const token = loginData.access_token;

    const usageResponse = await fetch(`https://esimcard.com/api/developer/reseller/my-sim/${iccid}/usage`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    const usageData = await usageResponse.json();

    // إذا كانت الرسالة "No data found" أو البيانات غير موجودة
    if (usageData.message && usageData.message.toLowerCase().includes("no data found")) {
      return res.json({ status: false, message: "لا توجد بيانات لهذا الـ ICCID." });
    }

    res.json(usageData);

  } catch (error) {
    console.error("حدث خطأ:", error);
    res.status(500).json({ error: "حدث خطأ في الخادم" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 الخادم يعمل على http://localhost:${PORT}`);
});
