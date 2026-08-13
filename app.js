param(
    [string]$CandidatePath = "",
    [string]$OutputPath = ""
)
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
if (-not $CandidatePath) { $CandidatePath = Join-Path $root 'output/candidates.json' }
if (-not $OutputPath) { $OutputPath = Join-Path $root 'output/candidate-review.md' }
if (-not (Test-Path -LiteralPath $CandidatePath)) { throw "Candidate file not found: $CandidatePath" }
$payload = Get-Content -Raw -Encoding UTF8 -LiteralPath $CandidatePath | ConvertFrom-Json
$lines = @(
    '# DestekSinyali - aday duyuru inceleme raporu',
    '',
    "Uretim zamani: $($payload.generated_at)",
    "Aday sayisi: $($payload.candidate_count)",
    "Kaynak hatasi: $(@($payload.failures).Count)",
    ''
)
if (@($payload.failures).Count) {
    $lines += @('## Erisilemeyen kaynaklar','')
    foreach ($failure in $payload.failures) { $lines += "- $($failure.source_id): $($failure.error)" }
    $lines += ''
}
if (-not @($payload.candidates).Count) {
    $lines += 'Yeni aday bulunmadi.'
} else {
    $grouped = $payload.candidates | Group-Object organization | Sort-Object Name
    foreach ($group in $grouped) {
        $lines += @("## $($group.Name)",'')
        foreach ($item in ($group.Group | Sort-Object title)) {
            $keywords = @($item.matched_keywords) -join ', '
            $lines += @(
                "### $($item.title)",
                '',
                "- Kaynak: $($item.source_id)",
                "- Eslesen kelimeler: $keywords",
                "- Baglanti: $($item.url)",
                "- Durum: insan incelemesi bekliyor",
                ''
            )
        }
    }
}
$lines -join "`n" | Set-Content -LiteralPath $OutputPath -Encoding UTF8
Write-Output "Review report ready: $OutputPath"

