param([string]$OutputPath = "")
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
if (-not $OutputPath) { $OutputPath = Join-Path $root 'output/weekly-operations.md' }
$campaign = @(Import-Csv -LiteralPath (Join-Path $root 'marketing/outreach.csv'))
$metrics = @(Import-Csv -LiteralPath (Join-Path $root 'operations/weekly-metrics.csv'))
$signals = @(Import-Csv -LiteralPath (Join-Path $root 'operations/demand-signals.csv'))
$opportunities = Get-Content -Raw -Encoding UTF8 -LiteralPath (Join-Path $root 'data/opportunities.json') | ConvertFrom-Json
$ready = @($campaign | Where-Object status -eq 'ready').Count
$sent = @($campaign | Where-Object status -in @('sent','replied','interviewed','followed_up','closed')).Count
$replies = @($campaign | Where-Object status -in @('replied','interviewed')).Count
$interviews = @($campaign | Where-Object status -eq 'interviewed').Count
$intent = @($campaign | Where-Object { $_.payment_intent -match '^(yes|evet|maybe|belki)$' }).Count
$active = @($opportunities.opportunities | Where-Object status -in @('open','evergreen')).Count
$lines = @(
    '# DestekSinyali - haftalik isletim raporu','',
    "Rapor tarihi: $((Get-Date).ToString('yyyy-MM-dd'))",'',
    '## Urun sagligi','',
    "- Yayindaki aktif firsat: $active",
    "- Kayitli talep sinyali: $($signals.Count)",'',
    '## Dagitim hunisi','',
    "- Arastirilan hedef: $($campaign.Count)",
    "- Gonderime hazir: $ready",
    "- Temas edilen: $sent",
    "- Cevap: $replies",
    "- Gorusme: $interviews",
    "- Odeme niyeti: $intent",'',
    '## Sonraki karar',''
)
if ($sent -lt 20) { $lines += "Dagitim testi tamamlanmadi: 20 dogru temastan $sent tanesi yapildi." }
elseif ($interviews -lt 5) { $lines += 'Yeterli problem gorusmesi yok; urun gelistirmeden once gorusmelere devam et.' }
elseif ($intent -lt 3) { $lines += 'Odeme niyeti kanitlanmadi; ucretli ozellik gelistirme.' }
else { $lines += 'Ilk fiyat testi icin gerekli sinyal olustu.' }
$lines -join "`n" | Set-Content -LiteralPath $OutputPath -Encoding UTF8
Write-Output "Weekly operations report ready: $OutputPath"

