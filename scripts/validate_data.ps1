$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$dataPath = Join-Path $root 'data/opportunities.json'
$payload = Get-Content -Raw -Encoding UTF8 -LiteralPath $dataPath | ConvertFrom-Json
$required = @('id','title','organization','source_url','summary','checked_at','status','confidence')
$seen = @{}
$allowedHosts = @('tubitak.gov.tr','www.tubitak.gov.tr','ticaret.gov.tr','www.ticaret.gov.tr','kosgeb.gov.tr','www.kosgeb.gov.tr')

foreach ($row in $payload.opportunities) {
    foreach ($field in $required) {
        if (-not $row.PSObject.Properties.Name.Contains($field) -or [string]::IsNullOrWhiteSpace([string]$row.$field)) {
            throw "Eksik alan '$field': $($row.id)"
        }
    }
    if ($seen.ContainsKey($row.id)) { throw "Tekrarlanan id: $($row.id)" }
    $seen[$row.id] = $true
    $uri = [uri]$row.source_url
    if ($uri.Scheme -ne 'https') { throw "HTTPS olmayan kaynak: $($row.id)" }
    if ($allowedHosts -notcontains $uri.Host.ToLowerInvariant()) { throw "Resmi izin listesinde olmayan kaynak: $($row.id)" }
    if ($row.deadline -and [datetimeoffset]::Parse($row.deadline) -lt [datetimeoffset]::Parse($row.checked_at)) {
        throw "Süresi geçmiş fırsat açık veri setinde: $($row.id)"
    }
}

Write-Output "Doğrulandı: $($payload.opportunities.Count) fırsat"
