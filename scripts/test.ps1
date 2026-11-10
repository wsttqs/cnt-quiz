# 生成动态 Quiz Excel 配置模板
Add-Type -AssemblyName "System.IO.Compression"
Add-Type -AssemblyName "System.IO.Compression.FileSystem"
$ErrorActionPreference = "Stop"
$outputPath = "E:\Codex\CNT\docs\requirements\quiz-dynamic-template.xlsx"
Write-Output "Output: $outputPath"
Write-Output "Step 1: 验证 .NET..."
[System.IO.Compression.ZipArchive]::new([System.IO.MemoryStream]::new(), [System.IO.Compression.ZipArchiveMode]::Create).Dispose()
Write-Output "Step 2: .NET ZipArchive OK"
