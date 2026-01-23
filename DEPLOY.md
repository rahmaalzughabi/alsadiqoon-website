# دليل نشر موقع الصادقون على نطاق IQ

هذا الدليل يشرح خطوات حجز النطاق (Domain) والاستضافة (Hosting) ورفع الموقع ليعمل بشكل كامل على الإنترنت.

## 1. حجز نطاق IQ (Domain Registration)
لحجز نطاق ينتهي بـ `.iq` (نطاق العراق الرسمي)، يجب التعامل مع هيئة الإعلام والاتصالات (CMC) أو أحد المسجلين المعتمدين.
> **ملاحظة:** حجز نطاق .iq يتطلب عادة وثائق رسمية للمؤسسات.

### المسجلون المعتمدون:
1. **هيئة الإعلام والاتصالات (CMC)**: الجهة الرسمية.
2. **شركات الاستضافة العراقية**: توفر خدمات الوساطة للتسجيل مثل:
   - Iraq Hosting
   - EarthLink
   - IQ Networks

**الخطوات:**
1. اختر شركة استضافة توفر تسجيل `.iq`.
2. قدم طلب حجز النطاق (مثلاً `alsadiqoon.iq`).
3. قد يطلب منك وثائق تسجيل الكيان السياسي (لأن النطاق لمؤسسة).

## 2. حجز الخادم (VPS Hosting)
بما أن الموقع يستخدم **Node.js** و **SQLite**، يفضل استخدام خادم VPS لضمان الأداء والتحكم.

**المواصفات المقترحة:**
- **System**: Ubuntu 22.04 LTS
- **RAM**: 2GB or 4GB
- **CPU**: 2 vCPU
- **Disk**: 50GB SSD

## 3. إعداد الخادم (Server Setup)
بعد الحصول على الخادم (IP Address)، اتصل به عبر SSH ونفذ الأوامر التالية:

### أ. تحديث النظام وتثبيت المتطلبات
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y nodejs npm nginx git
```

### ب. رفع ملفات الموقع
يمكنك رفع الملفات باستخدام FTP (FileZilla) أو Git.
```bash
# إنشاء مجلد للموقع
mkdir -p /var/www/alsadiqoon
cd /var/www/alsadiqoon

# (هنا قم برفع ملفات مجلد shadow-filament بالكامل)
```

### ج. تشغيل المشروع
```bash
# تثبيت المكتبات
npm install

# تثبيت PM2 لإدارة التشغيل في الخلفية
sudo npm install -g pm2

# تشغيل التطبيق
pm2 start server/server.js --name "alsadiqoon"
pm2 save
pm2 startup
```

## 4. إعداد النطاق مع Nginx (Reverse Proxy)
لربط النطاق `alsadiqoon.iq` بالخادم:

1. أنشئ ملف إعداد جديد:
```bash
sudo nano /etc/nginx/sites-available/alsadiqoon
```

2. ألصق الإعدادات التالية (مع تغيير النطاق):
```nginx
server {
    listen 80;
    server_name alsadiqoon.iq www.alsadiqoon.iq;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

3. تفعيل الموقع وإعادة تشغيل Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/alsadiqoon /etc/nginx/sites-enabled/
sudo systemctl restart nginx
```

## 5. تأمين الموقع (SSL Certificate)
لتفعيل HTTPS مجاناً باستخدام Certbot:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d alsadiqoon.iq -d www.alsadiqoon.iq
```

---
## 6. النشر السهل (بديل للأستضافة السحابية)
إذا كنت تفضل منصات سحابية حديثة (مثل Railway أو Render) بدلاً من إدارة خادم VPS يدوياً:

لقد قمت بإضافة ملف `Dockerfile` للمشروع. هذا يجعله جاهزاً للنشر فوراً على أي منصة تدعم Docker.

### خطوات النشر على Railway (مثال):
1. ارفع المشروع إلى GitHub.
2. أنشئ حساباً على [Railway.app](https://railway.app).
3. اختر "New Project" واختار مستودع GitHub الخاص بك.
4. سيقوم Railway بكشف ملف Dockerfile وتشغيل الموقع تلقائياً.
5. لضمان عدم حذف البيانات، أضف "Volume" للمسار `/app`.

هذا الخيار أسهل بكثير من إدارة خادم Linux يدوياً وأسرع في التشغيل.
