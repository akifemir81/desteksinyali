param([string]$OutputRoot = (Join-Path (Split-Path -Parent $PSScriptRoot) 'public'))
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$payload = Get-Content -Raw -Encoding UTF8 -LiteralPath (Join-Path $root 'data/opportunities.json') | ConvertFrom-Json
$pageRoot = Join-Path $OutputRoot 'firsatlar'
New-Item -ItemType Directory -Path $pageRoot -Force | Out-Null

function HtmlEncode([object]$value) { return [System.Net.WebUtility]::HtmlEncode([string]$value) }
function TurkishDate([object]$value) {
    if (-not $value) { return 'Resmi kaynaktaki guncel donemi kontrol edin.' }
    return ([datetimeoffset]::Parse([string]$value)).ToString('dd.MM.yyyy')
}

$siteUrl = 'https://akifemir81.github.io/desteksinyali/'
$sitemapUrls = @(
    [pscustomobject]@{ loc=$siteUrl; lastmod=([datetimeoffset]::Parse($payload.updated_at)).ToString('yyyy-MM-dd'); priority='1.0' },
    [pscustomobject]@{ loc=$siteUrl + 'gizlilik.html'; lastmod='2026-08-13'; priority='0.3' },
    [pscustomobject]@{ loc=$siteUrl + 'yontemimiz.html'; lastmod='2026-08-13'; priority='0.6' },
    [pscustomobject]@{ loc=$siteUrl + 'pilot.html'; lastmod='2026-08-14'; priority='0.7' }
)

foreach ($item in $payload.opportunities) {
    $canonical = $siteUrl + 'firsatlar/' + $item.id + '.html'
    $deadline = TurkishDate $item.deadline
    $preRegistration = TurkishDate $item.pre_registration_deadline
    $checkedAt = ([datetimeoffset]::Parse($item.checked_at)).ToString('dd.MM.yyyy')
    $structured = [ordered]@{
        '@context'='https://schema.org'; '@type'='Article'; headline=$item.title;
        description=$item.summary; dateModified=$item.checked_at; inLanguage='tr-TR';
        mainEntityOfPage=$canonical; publisher=[ordered]@{'@type'='Organization'; name='DestekSinyali'}
    } | ConvertTo-Json -Compress -Depth 5
    $html = @"
<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>$(HtmlEncode $item.title) &mdash; DestekSinyali</title><meta name="description" content="$(HtmlEncode $item.summary)"><meta name="robots" content="index,follow">
<link rel="canonical" href="$canonical"><link rel="icon" href="../assets/favicon.svg" type="image/svg+xml">
<meta property="og:type" content="article"><meta property="og:title" content="$(HtmlEncode $item.title)"><meta property="og:description" content="$(HtmlEncode $item.summary)"><meta property="og:url" content="$canonical">
<script type="application/ld+json">$structured</script>
<style>body{margin:0;background:#f4f7fa;color:#0c2238;font:16px/1.7 system-ui}main{width:min(780px,calc(100% - 36px));margin:50px auto}a{color:#0d4eb3}.back{text-decoration:none;font-weight:750}.card{margin-top:24px;padding:clamp(26px,6vw,52px);border:1px solid #dfe7ef;border-radius:24px;background:#fff;box-shadow:0 20px 60px #0c223812}h1{font-size:clamp(36px,7vw,58px);line-height:1.05;letter-spacing:-.045em}.org{color:#1769e0;font-weight:800}.meta{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin:28px 0}.meta div{padding:15px;border-radius:12px;background:#f4f7fa}.meta small{display:block;color:#607286}.box{margin:18px 0;padding:18px;border-left:4px solid #28c1c8;background:#eefafa}.source{display:inline-block;margin-top:18px;padding:13px 17px;border-radius:10px;background:#1769e0;color:#fff;text-decoration:none;font-weight:800}.note{margin-top:28px;color:#607286;font-size:13px}@media(max-width:560px){.meta{grid-template-columns:1fr}}</style></head>
<body><main><a class="back" href="../">&larr; T&uuml;m f&#305;rsatlar</a><article class="card"><div class="org">$(HtmlEncode $item.organization)</div><h1>$(HtmlEncode $item.title)</h1><p>$(HtmlEncode $item.summary)</p><div class="meta"><div><small>&Ouml;n kay&#305;t son g&uuml;n&uuml;</small><strong>$(HtmlEncode $preRegistration)</strong></div><div><small>Son ba&#351;vuru</small><strong>$(HtmlEncode $deadline)</strong></div><div><small>Son do&#287;rulama</small><strong>$(HtmlEncode $checkedAt)</strong></div></div><h2>Kimler i&ccedil;in?</h2><p>$(HtmlEncode $item.who_is_it_for)</p><div class="box"><strong>&#304;lk ad&#305;m:</strong><br>$(HtmlEncode $item.first_step)</div><a class="source" href="$(HtmlEncode $item.source_url)" target="_blank" rel="noopener">Resm&icirc; duyuruyu a&ccedil; &rarr;</a><p class="note">DestekSinyali ba&#287;&#305;ms&#305;z bir bilgi hizmetidir. Uygunluk ve tarihler i&ccedil;in ba&#351;vuru &ouml;ncesinde resm&icirc; &ccedil;a&#287;r&#305; metnini do&#287;rulay&#305;n.</p></article></main></body></html>
"@
    Set-Content -LiteralPath (Join-Path $pageRoot ($item.id + '.html')) -Value $html -Encoding UTF8
    $sitemapUrls += [pscustomobject]@{ loc=$canonical; lastmod=$item.checked_at; priority='0.8' }
}

$entries = $sitemapUrls | ForEach-Object { "  <url><loc>$([System.Security.SecurityElement]::Escape($_.loc))</loc><lastmod>$($_.lastmod)</lastmod><priority>$($_.priority)</priority></url>" }
$sitemap = "<?xml version=`"1.0`" encoding=`"UTF-8`"?>`n<urlset xmlns=`"http://www.sitemaps.org/schemas/sitemap/0.9`">`n$($entries -join "`n")`n</urlset>"
Set-Content -LiteralPath (Join-Path $OutputRoot 'sitemap.xml') -Value $sitemap -Encoding UTF8
$rssItems = $payload.opportunities | Where-Object { $_.status -in @('open','evergreen') } | ForEach-Object {
    $link = $siteUrl + 'firsatlar/' + $_.id + '.html'
    $pubDate = ([datetimeoffset]::Parse($_.checked_at)).ToString('r')
    "  <item><title>$([System.Security.SecurityElement]::Escape([string]$_.title))</title><link>$([System.Security.SecurityElement]::Escape($link))</link><guid isPermaLink=`"true`">$([System.Security.SecurityElement]::Escape($link))</guid><pubDate>$pubDate</pubDate><description>$([System.Security.SecurityElement]::Escape([string]$_.summary))</description></item>"
}
$rss = "<?xml version=`"1.0`" encoding=`"UTF-8`"?>`n<rss version=`"2.0`"><channel><title>DestekSinyali - Guncel Firsatlar</title><link>$siteUrl</link><description>Resmi kaynaklardan dogrulanan acik destek ve tesvik firsatlari.</description><language>tr-TR</language>`n$($rssItems -join "`n")`n</channel></rss>"
Set-Content -LiteralPath (Join-Path $OutputRoot 'feed.xml') -Value $rss -Encoding UTF8
Write-Output "Opportunity pages ready: $($payload.opportunities.Count)"
