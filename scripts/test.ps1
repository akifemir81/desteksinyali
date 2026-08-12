$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot

& (Join-Path $PSScriptRoot 'validate_data.ps1')
& (Join-Path $PSScriptRoot 'build.ps1')
& (Join-Path $PSScriptRoot 'generate_digest.ps1')

$public = Join-Path $root 'public'
$requiredFiles = @(
    'index.html',
    'gizlilik.html',
    'app.js',
    'data/opportunities.json',
    'config/site.json'
)
foreach ($file in $requiredFiles) {
    if (-not (Test-Path -LiteralPath (Join-Path $public $file))) { throw "Missing build artifact: $file" }
}

$source = Get-Content -Raw -Encoding UTF8 -LiteralPath (Join-Path $public 'index.html')
foreach ($needle in @('id="signup-form"', 'id="opportunities"', 'app.js', 'gizlilik.html')) {
    if (-not $source.Contains($needle)) { throw "Missing site marker: $needle" }
}

$digest = Get-Content -Raw -Encoding UTF8 -LiteralPath (Join-Path $root 'output/weekly-digest.md')
$data = Get-Content -Raw -Encoding UTF8 -LiteralPath (Join-Path $root 'data/opportunities.json') | ConvertFrom-Json
foreach ($item in $data.opportunities) {
    if ($item.status -in @('open','evergreen') -and -not $digest.Contains($item.title)) {
        throw "Active opportunity absent from digest: $($item.id)"
    }
}

Write-Output 'All checks passed.'
