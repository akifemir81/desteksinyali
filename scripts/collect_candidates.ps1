param(
    [string]$OutputPath = "",
    [int]$DelayMilliseconds = 1200
)
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
if (-not $OutputPath) { $OutputPath = Join-Path $root 'output/candidates.json' }
$outputDir = Split-Path -Parent $OutputPath
if (-not (Test-Path $outputDir)) { New-Item -ItemType Directory -Path $outputDir | Out-Null }

$registry = Get-Content -Raw -Encoding UTF8 -LiteralPath (Join-Path $root 'data/sources.json') | ConvertFrom-Json
$keywords = @('destek', 'cagri', 'çağrı', 'hibe', 'teşvik', 'tesvik', 'ihracat', 'ar-ge', 'arge', 'yapay zeka', 'yapay zekâ', 'kobi')
$candidates = @()
$failures = @()
$seen = @{}

foreach ($source in ($registry.sources | Sort-Object priority)) {
    try {
        $response = Invoke-WebRequest -UseBasicParsing -Uri $source.url -Method Get -MaximumRedirection 5 -TimeoutSec 30 -Headers @{
            'User-Agent' = 'DestekSinyali/0.1 (+public-source-monitor; one-request-per-source)'
        }
        $linkPattern = '(?is)<a\b[^>]*?href\s*=\s*["''](?<href>[^"'']+)["''][^>]*>(?<text>.*?)</a>'
        foreach ($match in [regex]::Matches([string]$response.Content, $linkPattern)) {
            $rawText = [regex]::Replace($match.Groups['text'].Value, '<[^>]+>', ' ')
            $title = [System.Net.WebUtility]::HtmlDecode($rawText).Trim()
            $title = [regex]::Replace($title, '\s+', ' ')
            $href = [System.Net.WebUtility]::HtmlDecode($match.Groups['href'].Value)
            if ([string]::IsNullOrWhiteSpace($title) -or [string]::IsNullOrWhiteSpace($href)) { continue }
            $normalized = $title.ToLowerInvariant()
            $matched = @($keywords | Where-Object { $normalized.Contains($_) })
            if ($matched.Count -eq 0) { continue }
            try { $absolute = [uri]::new([uri]$source.url, $href) } catch { continue }
            if ($absolute.Scheme -ne 'https') { continue }
            $pathAllowed = $false
            foreach ($pathPattern in $source.include_path_patterns) {
                if ($absolute.AbsolutePath -match $pathPattern) { $pathAllowed = $true; break }
            }
            if (-not $pathAllowed) { continue }
            $key = $absolute.AbsoluteUri.TrimEnd('/').ToLowerInvariant()
            if ($seen.ContainsKey($key)) { continue }
            $seen[$key] = $true
            $candidates += [ordered]@{
                title = $title
                url = $absolute.AbsoluteUri
                source_id = $source.id
                organization = $source.organization
                matched_keywords = $matched
                discovered_at = [datetimeoffset]::Now.ToString('o')
                review_status = 'pending'
            }
        }
    } catch {
        $failures += [ordered]@{ source_id=$source.id; error=$_.Exception.Message }
    }
    Start-Sleep -Milliseconds $DelayMilliseconds
}

[ordered]@{
    generated_at = [datetimeoffset]::Now.ToString('o')
    candidate_count = $candidates.Count
    candidates = $candidates
    failures = $failures
} | ConvertTo-Json -Depth 7 | Set-Content -LiteralPath $OutputPath -Encoding UTF8

Write-Output "Candidate scan complete: $($candidates.Count) candidates, $($failures.Count) failures"
if ($failures.Count -eq $registry.sources.Count) { exit 2 }
