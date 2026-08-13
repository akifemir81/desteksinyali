param([datetimeoffset]$Now = [datetimeoffset]::Now)
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$data = Get-Content -Raw -Encoding UTF8 -LiteralPath (Join-Path $root 'data/opportunities.json') | ConvertFrom-Json
$copy = Get-Content -Raw -Encoding UTF8 -LiteralPath (Join-Path $root 'marketing/templates/social-copy.json') | ConvertFrom-Json
$active = @($data.opportunities | Where-Object { $_.status -in @('open','evergreen') } | Sort-Object { if ($_.deadline) { [datetimeoffset]::Parse($_.deadline) } else { [datetimeoffset]::MaxValue } })
$output = Join-Path $root 'output/social-kit.md'
New-Item -ItemType Directory -Path (Split-Path -Parent $output) -Force | Out-Null
$site = 'https://akifemir81.github.io/desteksinyali/'
$lines = @(
    ('# ' + $copy.title), '',
    ($copy.generated + ': ' + $Now.ToString('dd.MM.yyyy')), '',
    ('## ' + $copy.linkedin_heading), '',
    ([string]$copy.radar_intro).Replace('{count}', [string]$active.Count), ''
)
foreach ($item in $active) {
    $deadline = if ($item.deadline) { ([datetimeoffset]::Parse($item.deadline)).ToString('dd.MM.yyyy') } else { 'Donemsel' }
    $lines += "- $($item.title) - $($copy.deadline): $deadline"
}
$lines += @(
    '', $copy.radar_value, '',
    ($site + '?ref=linkedin&cid=AUTO-WEEKLY'), '', $copy.hashtags, '',
    ('## ' + $copy.community_heading), '',
    $copy.community_body, '',
    ($site + '?ref=community&cid=AUTO-WEEKLY'), '',
    $copy.community_close, '',
    ('## ' + $copy.short_heading), ''
)
if ($active.Count -gt 0) {
    $first = $active[0]
    $lines += @(
        ($copy.nearest + ': ' + $first.title), '', "$($first.summary)", '',
        ($site + 'firsatlar/' + $first.id + '.html?ref=social&cid=AUTO-NEAREST')
    )
}
$lines += @('', ('## ' + $copy.check_heading), '')
$lines += @($copy.checks | ForEach-Object { '- ' + $_ })
Set-Content -LiteralPath $output -Value ($lines -join "`r`n") -Encoding UTF8
Write-Output "Social kit ready: $output"
