$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$public = Join-Path $root 'public'
$htmlFiles = @(Get-ChildItem -LiteralPath $public -Recurse -Filter '*.html' -File)

foreach ($file in $htmlFiles) {
    $html = Get-Content -Raw -Encoding UTF8 -LiteralPath $file.FullName
    if ($html -notmatch '<html[^>]+lang="tr"') { throw "Missing Turkish language marker: $($file.FullName)" }
    foreach ($imageMatch in [regex]::Matches($html, '<img\b[^>]*>')) {
        if ($imageMatch.Value -notmatch '\balt="[^"]*"') { throw "Image without alt text: $($file.FullName)" }
    }
    foreach ($blankMatch in [regex]::Matches($html, '<a\b[^>]*target="_blank"[^>]*>')) {
        if ($blankMatch.Value -match '\bhref="https?://' -and $blankMatch.Value -notmatch '\brel="[^"]*noopener') { throw "Unsafe external target blank link: $($file.FullName)" }
    }
    foreach ($fieldMatch in [regex]::Matches($html, '<(input|select|textarea)\b[^>]*\bid="([^"]+)"[^>]*>')) {
        if ($fieldMatch.Value -match '\btype="hidden"') { continue }
        $id = [regex]::Escape($fieldMatch.Groups[2].Value)
        if ($html -notmatch ('<label\b[^>]*for="' + $id + '"')) { throw "Form field without label: $($file.FullName) #$id" }
    }
    foreach ($assetMatch in [regex]::Matches($html, '(?:href|src)="([^"]+)"')) {
        $reference = $assetMatch.Groups[1].Value.Split('?')[0].Split('#')[0]
        if (-not $reference -or $reference -match '^(https?:|mailto:|tel:|data:)') { continue }
        $decoded = [uri]::UnescapeDataString($reference)
        $target = Join-Path $file.DirectoryName $decoded
        if (-not (Test-Path -LiteralPath $target)) { throw "Broken internal reference: $reference in $($file.FullName)" }
    }
}

Write-Output "Site quality audit passed: $($htmlFiles.Count) HTML files"
