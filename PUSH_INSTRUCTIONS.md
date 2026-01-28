# 🚀 تعليمات رفع التحديثات إلى GitHub

## ✨ الطريقة السريعة (3 خطوات فقط!)

### الخطوة 1: افتح PowerShell
اضغط بزر الماوس الأيمن على مجلد المشروع واختر "Open in Terminal" أو "Open PowerShell window here"

### الخطوة 2: شغّل السكريبت
```powershell
.\push-to-github.ps1
```

### الخطوة 3: انتظر حتى يكتمل!
سيقوم السكريبت تلقائياً بـ:
- ✅ إضافة جميع الملفات المعدلة
- ✅ إنشاء commit مع رسالة تفصيلية
- ✅ رفع التحديثات إلى GitHub

---

## 📝 أو استخدم الأوامر اليدوية:

```bash
# 1. انتقل إلى مجلد المشروع
cd C:\Users\2025\Documents\GitHub\alsadiqoon-website

# 2. أضف جميع الملفات
git add .

# 3. أنشئ commit
git commit -m "feat: Add activities, sections management, and read more functionality - v2.0.0"

# 4. ارفع إلى GitHub
git push origin main
```

---

## ✅ تم إنشاء الملفات التالية لمساعدتك:

1. **push-to-github.ps1** - سكريبت PowerShell (موصى به)
2. **push-to-github.bat** - سكريبت Batch
3. **GIT_PUSH_GUIDE.md** - دليل شامل لرفع التحديثات

---

## 📦 ما سيتم رفعه:

### ملفات جديدة (8):
- ✨ `public/js/admin/sections.js`
- 📚 `UPDATES.md`
- 📚 `TESTING.md`
- 📚 `SUMMARY.md`
- 📚 `QUICK_START.md`
- 📚 `CHANGELOG.md`
- 🔧 `push-to-github.ps1`
- 🔧 `push-to-github.bat`

### ملفات معدلة (6):
- ✏️ `server/views/admin_dashboard.html`
- ✏️ `public/sections/news.html`
- ✏️ `public/sections/activities.html`
- ✏️ `public/js/admin/activities.js`
- ✏️ `public/js/admin/dashboard.js`
- ✏️ `README.md`

---

## 🎯 بعد الرفع:

تحقق من GitHub:
```
https://github.com/YOUR_USERNAME/alsadiqoon-website
```

يجب أن ترى:
- ✅ Commit جديد بتاريخ اليوم
- ✅ جميع الملفات الجديدة
- ✅ التحديثات على الملفات المعدلة

---

**جاهز؟ شغّل السكريبت الآن!** 🚀
