$strings = New-Object System.Collections.ArrayList
function Add-String($s) {
    $idx = $strings.IndexOf($s)
    if ($idx -lt 0) { [void]$strings.Add($s); return $strings.Count - 1 }
    return $idx
}

$idx1 = Add-String "quiz_id"
$idx2 = Add-String "title"
$idx3 = Add-String "宠物毛发&split&灰尘"
$idx4 = Add-String "quiz_id"  # duplicate

Write-Output "quiz_id index: $idx1"
Write-Output "title index: $idx2"
Write-Output "pet hair index: $idx3"
Write-Output "quiz_id duplicate index: $idx4"
Write-Output "Strings count: $($strings.Count)"
Write-Output "Strings:"
$strings | ForEach-Object { Write-Output "  [$_] len=$($_.Length)" }
