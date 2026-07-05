$files = Get-ChildItem -Recurse -Include *.html,*.js,*.json,*.css
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    if ($content -match 'tammuz-dental\.com') {
        $updated = $content -replace 'info@tammuz-dental\.com', 'info@tammuzmedical.com'
        $updated = $updated -replace 'tammuz-dental\.com', 'tammuzmedical.com'
        Set-Content -Path $file.FullName -Value $updated -Encoding UTF8 -NoNewline
        Write-Host "Updated: $($file.Name)"
    }
}
Write-Host "Done."
