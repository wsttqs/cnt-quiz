$ErrorActionPreference = "Stop"
$cw = @{
    "Structure"   = @(10, 14, 12, 14, 12, 32, 42, 26, 14, 42)
    "OptionTags"  = @(12, 16, 14, 10)
}
Write-Host ("OK keys=" + ($cw.Keys -join ","))
Write-Host ("Structure widths=" + ($cw["Structure"].Length))