@echo off
echo ============================================
echo RENAMING DIRECTORIES
echo ============================================
echo.
echo IMPORTANT: Stop your dev server before running this!
echo.
pause

cd app\(app)

echo Renaming directories...
if exist "product" (
    ren "product" "item"
    echo - product → item
)

if exist "product-review" (
    ren "product-review" "item-review"
    echo - product-review → item-review
)

if exist "shop" (
    ren "shop" "provider"
    echo - shop → provider
)

echo.
echo ============================================
echo DONE! Directories renamed successfully.
echo ============================================
echo.
echo Next steps:
echo 1. Update any remaining import paths
echo 2. Restart your dev server
echo.
pause
