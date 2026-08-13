$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$out = Join-Path $root 'public'

if (Test-Path -LiteralPath $out) { Remove-Item -LiteralPath $out -Recurse -Force }
New-Item -ItemType Directory -Path $out | Out-Null
New-Item -ItemType Directory -Path (Join-Path $out 'data') | Out-Null
New-Item -ItemType Directory -Path (Join-Path $out 'config') | Out-Null

Copy-Item -Path (Join-Path $root 'site/*') -Destination $out -Recurse
Copy-Item -LiteralPath (Join-Path $root 'data/opportunities.json') -Destination (Join-Path $out 'data/opportunities.json')
Copy-Item -LiteralPath (Join-Path $root 'config/site.json') -Destination (Join-Path $out 'config/site.json')

& (Join-Path $PSScriptRoot 'generate_opportunity_pages.ps1') -OutputRoot $out

Write-Output "Site paketi hazır: $out"
