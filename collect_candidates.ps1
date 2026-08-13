$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$public = Join-Path $root 'public'
$data = Get-Content -Raw -Encoding UTF8 -LiteralPath (Join-Path $root 'data/opportunities.json') | ConvertFrom-Json
$sitemap = Get-Content -Raw -Encoding UTF8 -LiteralPath (Join-Path $public 'sitemap.xml')
$generated = @(Get-ChildItem -LiteralPath (Join-Path $public 'firsatlar') -Filter '*.html' -File)

if ($generated.Count -ne $data.opportunities.Count) {
    throw "Fırsat sayfası sayısı uyuşmuyor: veri=$($data.opportunities.Count), sayfa=$($generated.Count)"
}

foreach ($item in $data.opportunities) {
    $relative = "firsatlar/$($item.id).html"
    $pagePath = Join-Path $public $relative
    if (-not (Test-Path -LiteralPath $pagePath)) { throw "Eksik fırsat sayfası: $relative" }
    if (-not $sitemap.Contains($relative)) { throw "Sitemap fırsatı içermiyor: $($item.id)" }
    $page = Get-Content -Raw -Encoding UTF8 -LiteralPath $pagePath
    foreach ($needle in @($item.title, $item.source_url, 'application/ld+json')) {
        if (-not $page.Contains([System.Net.WebUtility]::HtmlEncode([string]$needle)) -and -not $page.Contains([string]$needle)) {
            throw "Fırsat sayfasında içerik eksik: $($item.id)"
        }
    }
}

$textFiles = @(Get-ChildItem -LiteralPath $public -Recurse -File | Where-Object Extension -in @('.html','.js','.json','.xml'))
foreach ($file in $textFiles) {
    $content = Get-Content -Raw -Encoding UTF8 -LiteralPath $file.FullName
    $suspicious = @([char]0x00C3, [char]0x00C4, [char]0x00C5, [char]0xFFFD)
    foreach ($marker in $suspicious) {
        if ($content.Contains([string]$marker)) { throw "Possible character encoding issue: $($file.FullName)" }
    }
}

Write-Output "Yayın denetimi başarılı: $($generated.Count) fırsat sayfası"
