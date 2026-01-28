# رفع التحديثات إلى GitHub
# Push Updates to GitHub

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "رفع التحديثات إلى GitHub" -ForegroundColor Green
Write-Host "Pushing Updates to GitHub" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Change to script directory
Set-Location -Path $PSScriptRoot

Write-Host "[1/4] إضافة جميع الملفات المعدلة..." -ForegroundColor Yellow
git add .

Write-Host ""
Write-Host "[2/4] إنشاء commit..." -ForegroundColor Yellow
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

Write-Host ""
Write-Host "[3/4] رفع التحديثات إلى GitHub..." -ForegroundColor Yellow
git push origin main

Write-Host ""
Write-Host "[4/4] اكتمل!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ تم رفع جميع التحديثات بنجاح!" -ForegroundColor Green
Write-Host "✅ All updates pushed successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Read-Host "اضغط Enter للإغلاق / Press Enter to close"
