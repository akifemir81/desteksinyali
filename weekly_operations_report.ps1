param(
    [string]$OutputPath = "",
    [datetimeoffset]$Now = [datetimeoffset]::Now
)
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
if (-not $OutputPath) { $OutputPath = Join-Path $root 'output/weekly-digest.md' }
$outputDir = Split-Path -Parent $OutputPath
if (-not (Test-Path $outputDir)) { New-Item -ItemType Directory -Path $outputDir | Out-Null }
$payload = Get-Content -Raw -Encoding UTF8 -LiteralPath (Join-Path $root 'data/opportunities.json') | ConvertFrom-Json
$active = @($payload.opportunities | Where-Object { $_.status -in @('open','evergreen') })

$lines = @(
    '# DestekSinyali - Haftalik firsat ozeti',
    '',
    "**Yayin tarihi:** $($Now.ToString('dd.MM.yyyy'))",
    '',
    "Bu hafta radarda **$($active.Count) firsat** var. Basvuru yapmadan once resmi kaynagi kontrol edin.",
    ''
)

foreach ($item in $active) {
    $timing = 'Donemsel / surekli kontrol'
    if ($item.deadline) {
        $deadline = [datetimeoffset]::Parse($item.deadline)
        $days = [math]::Ceiling(($deadline - $Now).TotalDays)
        $timing = "Son tarih: $($deadline.ToString('dd.MM.yyyy HH:mm')) - $days gun kaldi"
    }
    $lines += @(
        "## $($item.title)",
        '',
        "**Kurum:** $($item.organization)  ",
        "**Zaman:** $timing  ",
        '',
        $item.summary,
        '',
        "**Kimler icin?** $($item.who_is_it_for)",
        '',
        "**Ilk adim:** $($item.first_step)",
        '',
        "[Resmi kaynagi ac]($($item.source_url))",
        '',
        '---',
        ''
    )
}

$lines += @(
    'DestekSinyali bilgi ve yonlendirme hizmetidir; mali veya hukuki danismanlik sunmaz.',
    'Bu e-postayi istemiyorsaniz abonelikten cikma baglantisini kullanabilirsiniz.'
)
$lines -join "`n" | Set-Content -LiteralPath $OutputPath -Encoding utf8
Write-Output "Bulten taslagi hazir: $OutputPath"
