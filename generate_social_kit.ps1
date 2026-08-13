param(
  [string]$CampaignFile = (Join-Path $PSScriptRoot '..\marketing\outreach.csv'),
  [datetime]$AsOf = (Get-Date)
)

$ErrorActionPreference = 'Stop'
if (-not (Test-Path -LiteralPath $CampaignFile)) { throw "Campaign file not found: $CampaignFile" }
$rows = @(Import-Csv -LiteralPath $CampaignFile)
$allowed = @('research','ready','sent','replied','interviewed','followed_up','closed','do_not_contact')
$bad = @($rows | Where-Object { $_.status -notin $allowed })
if ($bad.Count -gt 0) { throw "Invalid status: $($bad[0].id) = $($bad[0].status)" }
$duplicateIds = @($rows | Group-Object id | Where-Object Count -gt 1)
if ($duplicateIds.Count -gt 0) { throw "Duplicate campaign id: $($duplicateIds[0].Name)" }
$ready = @($rows | Where-Object status -eq 'ready')
$followups = @($rows | Where-Object { $_.status -eq 'sent' -and $_.next_action_at -and ([datetime]$_.next_action_at) -le $AsOf })
$replies = @($rows | Where-Object status -in @('replied','interviewed'))
$interviews = @($rows | Where-Object status -eq 'interviewed')
$paymentSignals = @($rows | Where-Object { $_.payment_intent -match '^(yes|evet|maybe|belki)$' })
Write-Host "DestekSinyali campaign summary - $($AsOf.ToString('yyyy-MM-dd'))"
Write-Host "Total targets: $($rows.Count)"
Write-Host "Ready to send: $($ready.Count)"
Write-Host "Follow-ups due: $($followups.Count)"
Write-Host "Replies: $($replies.Count)"
Write-Host "Interviews: $($interviews.Count)"
Write-Host "Payment intent: $($paymentSignals.Count)"
if ($ready.Count) { Write-Host "`nNext new contacts (daily max 3):"; $ready | Select-Object -First 3 id,company,channel,public_contact,personalization | Format-Table -AutoSize }
if ($followups.Count) { Write-Host "`nFollow-ups due today:"; $followups | Select-Object id,company,channel,next_action_at | Format-Table -AutoSize }
