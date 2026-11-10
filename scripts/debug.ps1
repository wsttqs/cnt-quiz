$ErrorActionPreference = "Stop"
try {
    $cw = @{
        "Structure"   = @(10, 14, 12, 14, 12, 32, 42, 26, 14, 42)
        "OptionTags"  = @(12, 16, 14, 10)
    }
    Write-Host "colWidths OK: keys=$($cw.Keys -join ',')"

    $vs = @{
        "OptionTags" = @("dv1", "dv2")
    }
    Write-Host "validationsBySheet OK"
} catch {
    Write-Host "CAUGHT: $($_.Exception.Message)"
    Write-Host "AT: $($_.ScriptStackTrace)"
}