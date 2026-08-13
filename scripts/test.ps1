$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot

& (Join-Path $PSScriptRoot 'validate_data.ps1')
& (Join-Path $PSScriptRoot 'build.ps1')
& (Join-Path $PSScriptRoot 'generate_digest.ps1')
& (Join-Path $PSScriptRoot 'campaign_queue.ps1')
& (Join-Path $PSScriptRoot 'weekly_operations_report.ps1')
& (Join-Path $PSScriptRoot 'generate_campaign_messages.ps1')

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
foreach ($needle in @('campaign_source', 'campaign_id', 'landing_variant')) {
    if (-not $source.Contains($needle)) { throw "Missing campaign attribution marker: $needle" }
}
if (-not $source.Contains('paid_alert_interest')) { throw 'Missing paid alert interest field' }

$automation = Join-Path $root 'automation/google-apps-script/Code.gs'
if (-not (Test-Path -LiteralPath $automation)) { throw 'Missing Google Apps Script automation' }
$automationSource = Get-Content -Raw -Encoding UTF8 -LiteralPath $automation
foreach ($needle in @('setupDestekSinyali', 'processRegistrationEmails', 'sendWeeklyDigest', 'processUnsubscribeEmails', 'MailApp.getRemainingDailyQuota')) {
    if (-not $automationSource.Contains($needle)) { throw "Missing automation marker: $needle" }
}
$manifestPath = Join-Path $root 'automation/google-apps-script/appsscript.json'
$manifest = Get-Content -Raw -Encoding UTF8 -LiteralPath $manifestPath | ConvertFrom-Json
if ($manifest.timeZone -ne 'Europe/Istanbul') { throw 'Invalid Apps Script timezone' }
if ('https://mail.google.com/' -notin $manifest.oauthScopes) { throw 'Missing Gmail automation scope' }

$digest = Get-Content -Raw -Encoding UTF8 -LiteralPath (Join-Path $root 'output/weekly-digest.md')
$data = Get-Content -Raw -Encoding UTF8 -LiteralPath (Join-Path $root 'data/opportunities.json') | ConvertFrom-Json
foreach ($item in $data.opportunities) {
    if ($item.status -in @('open','evergreen') -and -not $digest.Contains($item.title)) {
        throw "Active opportunity absent from digest: $($item.id)"
    }
}

Write-Output 'All checks passed.'
