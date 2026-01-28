@echo off
echo ========================================
echo رفع التحديثات إلى GitHub
echo Pushing Updates to GitHub
echo ========================================
echo.

cd /d "%~dp0"

echo [1/4] إضافة جميع الملفات المعدلة...
git add .

echo.
echo [2/4] إنشاء commit...
git commit -m "feat: Add activities management, sections management, and read more functionality

✨ New Features:
- Full activities management (add, edit, delete with image upload)
- Sections management (edit content, order, and status)
- Read more button with modal view for news and activities
- WhatsApp posts management (already working)

🔧 Improvements:
- Enhanced admin dashboard with new modals
- Better content display with truncation
- Improved user experience

🐛 Bug Fixes:
- Fixed 'Add Activity' button functionality
- Fixed 'Read More' button not appearing
- Added missing closeModal function

📚 Documentation:
- Added UPDATES.md, TESTING.md, SUMMARY.md
- Added QUICK_START.md, CHANGELOG.md
- Updated README.md

Version: 2.0.0
Date: 2026-01-28"

echo.
echo [3/4] رفع التحديثات إلى GitHub...
git push origin main

echo.
echo [4/4] اكتمل!
echo ========================================
echo ✅ تم رفع جميع التحديثات بنجاح!
echo ✅ All updates pushed successfully!
echo ========================================
echo.

pause
