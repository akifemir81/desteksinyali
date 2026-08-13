param(
    [string]$OutputPath = "",
    [switch]$FailOnError
)
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
if (-not $OutputPath) { $OutputPath = Join-Path $root 'data/source-health.json' }
$registry = Get-Content -Raw -Encoding UTF8 -LiteralPath (Join-Path $root 'data/sources.json') | ConvertFrom-Json
$opportunities = Get-Content -Raw -Encoding UTF8 -LiteralPath (Join-Path $root 'data/opportunities.json') | ConvertFrom-Json
$targets = @()
foreach ($source in $registry.sources) {
    $targets += [pscustomobject]@{ id=$source.id; type='registry'; url=$source.url }
}
foreach ($opportunity in $opportunities.opportunities) {
    $targets += [pscustomobject]@{ id=$opportunity.id; type='opportunity'; url=$opportunity.source_url }
}
$targets = @($targets | Sort-Object url -Unique)
$results = @()

foreach ($source in $targets) {
    $checkedAt = [datetimeoffset]::Now.ToString('o')
    $lastError = $null
    $response = $null
    foreach ($attempt in 1..2) {
        try {
            $response = Invoke-WebRequest -UseBasicParsing -Uri $source.url -Method Get -MaximumRedirection 5 -TimeoutSec 25 -Headers @{'User-Agent'='DestekSinyali/0.1 source-monitor'}
            break
        } catch {
            $lastError = $_
            if ($attempt -lt 2) { Start-Sleep -Seconds 2 }
        }
    }
    if ($response) {
        $results += [ordered]@{ id=$source.id; type=$source.type; url=$source.url; ok=($response.StatusCode -eq 200); status=[int]$response.StatusCode; checked_at=$checkedAt }
    } else {
        $status = if ($lastError.Exception.Response) { [int]$lastError.Exception.Response.StatusCode } else { 0 }
        $results += [ordered]@{ id=$source.id; type=$source.type; url=$source.url; ok=$false; status=$status; checked_at=$checkedAt; error=$lastError.Exception.Message }
    }
}

[ordered]@{ generated_at=[datetimeoffset]::Now.ToString('o'); sources=$results } |
    ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $OutputPath -Encoding utf8
Write-Output "Kaynak kontrolü tamamlandı: $($results.Count) kaynak"
if ($FailOnError) {
    $failed = @($results | Where-Object { -not $_.ok })
    if ($failed.Count) {
        throw "Erişilemeyen resmi bağlantı: $($failed[0].id) ($($failed[0].status)) $($failed[0].url)"
    }
}
