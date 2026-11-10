# 动态 Quiz Excel 模板生成脚本（v2 - 4 sheet：Structure / OptionTags / Routing / ResultPages）
$ErrorActionPreference = "Stop"
Add-Type -AssemblyName "System.IO.Compression"
Add-Type -AssemblyName "System.IO.Compression.FileSystem"

$dataPath = "E:\Codex\CNT\scripts\data-v2.json"
$outputPath = "E:\Codex\CNT\docs\requirements\quiz-dynamic-template-v2.xlsx"

$jsonText = [System.IO.File]::ReadAllText($dataPath, [System.Text.UTF8Encoding]::new($false))
$data = $jsonText | ConvertFrom-Json
Write-Output "Sheets count: $($data.sheets.Count)"

$strings = New-Object System.Collections.ArrayList
function Add-String([string]$s) {
    $idx = $strings.IndexOf($s)
    if ($idx -lt 0) { [void]$strings.Add($s); return $strings.Count - 1 }
    return $idx
}

function Escape-Xml([string]$text) {
    if ($null -eq $text) { return "" }
    return $text.Replace("&", "&amp;").Replace("<", "&lt;").Replace(">", "&gt;").Replace("`"", "&quot;").Replace("'", "&apos;")
}

function ColLetter([int]$col) {
    $s = ""; $n = $col
    while ($n -gt 0) {
        $rem = ($n - 1) % 26
        $s = [char](65 + $rem) + $s
        $n = [int][math]::Floor(($n - 1) / 26)
    }
    return $s
}

function Cell-Xml([int]$col, [int]$row, [string]$value, [bool]$isString = $true) {
    $ref = "$(ColLetter $col)$row"
    if ($isString) {
        $idx = Add-String $value
        return "<c r=`"$ref`" t=`"s`"><v>$idx</v></c>"
    } else {
        return "<c r=`"$ref`"><v>$value</v></c>"
    }
}

function Sheet-Xml($sheet, [string[]]$dataValidations, [int[]]$widths) {
    $sb = New-Object System.Text.StringBuilder
    [void]$sb.AppendLine('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>')
    [void]$sb.AppendLine('<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">')
    [void]$sb.AppendLine('  <sheetViews><sheetView tabSelected="0" workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>')
    [void]$sb.AppendLine('  <sheetFormatPr defaultRowHeight="15"/>')
    [void]$sb.AppendLine('  <cols>')
    $headers = @($sheet.headers)
    for ($c = 1; $c -le $headers.Count; $c++) {
        $w = $widths[$c - 1]
        [void]$sb.AppendLine("    <col min=`"$c`" max=`"$c`" width=`"$w`" customWidth=`"1`"/>")
    }
    [void]$sb.AppendLine('  </cols>')
    [void]$sb.AppendLine('  <sheetData>')
    [void]$sb.Append('    <row r="1">')
    for ($c = 1; $c -le $headers.Count; $c++) {
        [void]$sb.Append((Cell-Xml $c 1 ([string]$headers[$c-1]) $true))
    }
    [void]$sb.AppendLine('</row>')
    $numCols = @('quiz_num', 'score', 'correct_answer')
    $rows = @($sheet.rows)
    for ($r = 0; $r -lt $rows.Count; $r++) {
        $rowNum = $r + 2
        [void]$sb.Append("    <row r=`"$rowNum`">")
        $rowData = @($rows[$r])
        for ($c = 1; $c -le $headers.Count; $c++) {
            $raw = $rowData[$c-1]
            if ($null -eq $raw) { $raw = "" }
            $val = [string]$raw
            $colName = $headers[$c-1]
            $isStr = -not ($numCols -contains $colName -and $val -match '^-?\d+$')
            [void]$sb.Append((Cell-Xml $c $rowNum $val $isStr))
        }
        [void]$sb.AppendLine('</row>')
    }
    [void]$sb.AppendLine('  </sheetData>')
    if ($dataValidations -and $dataValidations.Count -gt 0) {
        [void]$sb.AppendLine("  <dataValidations count=`"$($dataValidations.Count)`">")
        foreach ($dv in $dataValidations) {
            [void]$sb.AppendLine($dv)
        }
        [void]$sb.AppendLine('  </dataValidations>')
    }
    [void]$sb.AppendLine('</worksheet>')
    return $sb.ToString()
}

# 数据验证规则（v1.4：5 sheet 结构，Routing + ResultPages 各有独立下拉）
$colWidths = @{
    'Structure'   = @(10, 14, 12, 14, 12, 32, 42, 26, 14, 42)
    'OptionTags'  = @(12, 16, 14, 10)
    'Routing'     = @(10, 16, 16, 20)
    'ResultPages' = @(16, 40, 42)
}

$validationsBySheet = @{
    'OptionTags' = @(
        '<dataValidation type="list" allowBlank="1" showInputMessage="1" promptTitle="question_option" prompt="A=第 1 个选项, B=第 2 个选项..." sqref="B2:B1000"><formula1>"A,B,C,D,E,F,G,H,I,J"</formula1></dataValidation>',
        '<dataValidation type="list" allowBlank="1" showInputMessage="1" promptTitle="score" prompt="正整数，分值越高严重程度越高" sqref="D2:D1000"><formula1>"1,2,3,4,5,6,7,8,9,10"</formula1></dataValidation>'
    )
    'Routing' = @(
        '<dataValidation type="list" allowBlank="1" showInputMessage="1" promptTitle="type" prompt="group=跳到下一层 group；result=直接出结果页" sqref="A2:A1000"><formula1>"group,result"</formula1></dataValidation>',
        '<dataValidation type="list" allowBlank="1" showInputMessage="1" promptTitle="tag" prompt="(DEFAULT) 表示无匹配时的兜底路由" sqref="C2:C1000"><formula1>"(DEFAULT)"</formula1></dataValidation>'
    )
}
$xmlFiles = @{}
for ($i = 0; $i -lt $data.sheets.Count; $i++) {
    $sheet = $data.sheets[$i]
    $name = $sheet.name
    $dvs = $validationsBySheet[$name]
    if ($null -eq $dvs) { $dvs = @() }
    $widths = $colWidths[$name]; if ($null -eq $widths) { $widths = @(12) * $sheet.headers.Count }; $xmlFiles[$name] = Sheet-Xml $sheet $dvs $widths
    Write-Output "  Generated: $name"
}

$sb = New-Object System.Text.StringBuilder
[void]$sb.AppendLine('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>')
[void]$sb.AppendLine("<sst xmlns=`"http://schemas.openxmlformats.org/spreadsheetml/2006/main`" count=`"$($strings.Count)`" uniqueCount=`"$($strings.Count)`">")
foreach ($s in $strings) {
    [void]$sb.AppendLine("  <si><t xml:space=`"preserve`">$(Escape-Xml $s)</t></si>")
}
[void]$sb.AppendLine('</sst>')
$sharedStrings = $sb.ToString()
Write-Output "Shared strings: $($strings.Count)"

$workbook = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' + "`n" + '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' + "`n" + '  <sheets>' + "`n" + '    <sheet name="Structure"   sheetId="1" r:id="rId1"/>' + "`n" + '    <sheet name="Questions"   sheetId="2" r:id="rId2"/>' + "`n" + '    <sheet name="OptionTags"  sheetId="3" r:id="rId3"/>' + "`n" + '    <sheet name="Routing"     sheetId="4" r:id="rId4"/>' + "`n" + '    <sheet name="ResultPages" sheetId="5" r:id="rId5"/>' + "`n" + '  </sheets>' + "`n" + '</workbook>'

$rels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' + "`n" + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' + "`n" + '  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' + "`n" + '</Relationships>'

$workbookRels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' + "`n" + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' + "`n" + '  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>' + "`n" + '  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/>' + "`n" + '  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet3.xml"/>' + "`n" + '  <Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet4.xml"/>' + "`n" + '  <Relationship Id="rId5" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet5.xml"/>' + "`n" + '  <Relationship Id="rId6" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/>' + "`n" + '</Relationships>'

$contentTypes = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' + "`n" + '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' + "`n" + '  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' + "`n" + '  <Default Extension="xml" ContentType="application/xml"/>' + "`n" + '  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' + "`n" + '  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' + "`n" + '  <Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' + "`n" + '  <Override PartName="/xl/worksheets/sheet3.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' + "`n" + '  <Override PartName="/xl/worksheets/sheet4.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' + "`n" + '  <Override PartName="/xl/worksheets/sheet5.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' + "`n" + '  <Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/>' + "`n" + '</Types>'

if (Test-Path $outputPath) { Remove-Item $outputPath -Force }

$zipStream = New-Object System.IO.MemoryStream
$archive = New-Object System.IO.Compression.ZipArchive($zipStream, [System.IO.Compression.ZipArchiveMode]::Create)

function Add-ZipEntry([System.IO.Compression.ZipArchive]$archive, [string]$path, [string]$content) {
    $entry = $archive.CreateEntry($path)
    $writer = New-Object System.IO.StreamWriter($entry.Open(), [System.Text.Encoding]::UTF8)
    $writer.Write($content)
    $writer.Close()
}

Add-ZipEntry $archive "[Content_Types].xml"       $contentTypes
Add-ZipEntry $archive "_rels/.rels"                $rels
Add-ZipEntry $archive "xl/workbook.xml"            $workbook
Add-ZipEntry $archive "xl/_rels/workbook.xml.rels" $workbookRels
Add-ZipEntry $archive "xl/sharedStrings.xml"       $sharedStrings

$sheetMap = @{ 'Structure' = 1; 'OptionTags' = 2; 'Routing' = 3; 'ResultPages' = 4 }
foreach ($name in @('Structure', 'OptionTags', 'Routing', 'ResultPages')) {
    Add-ZipEntry $archive "xl/worksheets/sheet$($sheetMap[$name]).xml" $xmlFiles[$name]
}

$archive.Dispose()
[System.IO.File]::WriteAllBytes($outputPath, $zipStream.ToArray())
$zipStream.Dispose()

Write-Output ""
Write-Output "OK xlsx generated: $outputPath"
Write-Output ("   Size: {0:N1} KB" -f ((Get-Item $outputPath).Length / 1KB))