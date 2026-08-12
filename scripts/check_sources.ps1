param([string]$OutputPath = "")
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
if (-not $OutputPath) { $OutputPath = Join-Path $root 'data/source-health.json' }
$registry = Get-Content -Raw -Encoding UTF8 -LiteralPath (Join-Path $root 'data/sources.json') | ConvertFrom-Json
$results = @()

foreach ($source in $registry.sources) {
    $checkedAt = [datetimeoffset]::Now.ToString('o')
    try {
        $response = Invoke-WebRequest -UseBasicParsing -Uri $source.url -Method Get -MaximumRedirection 5 -TimeoutSec 25 -Headers @{'User-Agent'='DestekSinyali/0.1 source-monitor'}
        $results += [ordered]@{ id=$source.id; ok=($response.StatusCode -eq 200); status=[int]$response.StatusCode; checked_at=$checkedAt }
    } catch {
        $status = if ($_.Exception.Response) { [int]$_.Exception.Response.StatusCode } else { 0 }
        $results += [ordered]@{ id=$source.id; ok=$false; status=$status; checked_at=$checkedAt; error=$_.Exception.Message }
    }
}

[ordered]@{ generated_at=[datetimeoffset]::Now.ToString('o'); sources=$results } |
    ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $OutputPath -Encoding utf8
Write-Output "Kaynak kontrolü tamamlandı: $($results.Count) kaynak"
