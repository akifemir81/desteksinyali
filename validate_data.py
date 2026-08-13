param(
    [string]$CampaignFile = (Join-Path $PSScriptRoot '..\marketing\outreach.csv'),
    [string]$OutputPath = (Join-Path $PSScriptRoot '..\output\campaign-messages.md')
)
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$rows = @(Import-Csv -LiteralPath $CampaignFile)
$ready = @($rows | Where-Object status -eq 'ready')
$emailTemplate = Get-Content -Raw -Encoding UTF8 -LiteralPath (Join-Path $root 'marketing/templates/email.txt')
$linkedinTemplate = Get-Content -Raw -Encoding UTF8 -LiteralPath (Join-Path $root 'marketing/templates/linkedin.txt')
$lines = @('# DestekSinyali - gonderime hazir kampanya mesajlari','')
foreach ($row in $ready) {
    $greeting = if ($row.name) { "Merhaba $($row.name)," } else { 'Merhaba,' }
    $url = "https://akifemir81.github.io/desteksinyali/?ref=outreach&cid=$($row.id)"
    $template = if ($row.channel -eq 'Email') { $emailTemplate } else { $linkedinTemplate }
    $message = $template.Replace('{{GREETING}}',$greeting).Replace('{{COMPANY}}',$row.company).Replace('{{PERSONALIZATION}}',$row.personalization).Replace('{{URL}}',$url).Trim()
    $lines += @(
        "## $($row.id) - $($row.company)",'',
        "Kanal: $($row.channel)",
        $(if ($row.public_contact) { "Alici: $($row.public_contact)" } else { 'Alici: hedef roldeki kisi dogrulanacak' }),
        '',
        $message,'',
        '---',''
    )
}
$lines -join "`n" | Set-Content -LiteralPath $OutputPath -Encoding UTF8
Write-Output "Campaign messages ready: $OutputPath ($($ready.Count) contacts)"
