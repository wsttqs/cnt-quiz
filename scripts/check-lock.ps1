Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public class Win32 {
    [DllImport("kernel32.dll", SetLastError = true)]
    public static extern IntPtr CreateFile(string lpFileName, uint dwDesiredAccess, uint dwShareMode, IntPtr lpSecurityAttributes, uint dwCreationDisposition, uint dwFlagsAndAttributes, IntPtr hTemplateFile);
    [DllImport("kernel32.dll")]
    public static extern bool CloseHandle(IntPtr hObject);
    public const uint GENERIC_READ = 0x80000000;
    public const uint OPEN_EXISTING = 3;
}
"@
$filePath = 'E:\Codex\CNT\docs\requirements\quiz-dynamic-template-v3.xlsx'
$handle = [Win32]::CreateFile($filePath, [Win32]::GENERIC_READ, 0, [IntPtr]::Zero, [Win32]::OPEN_EXISTING, 0, [IntPtr]::Zero)
if ($handle -eq [IntPtr]::Zero -or $handle -eq -1) {
    $err = [System.Runtime.InteropServices.Marshal]::GetLastWin32Error()
    Write-Host "FILE LOCKED - Error code: $err"
} else {
    Write-Host "FILE NOT LOCKED - Handle: $handle"
    [Win32]::CloseHandle($handle) | Out-Null
}
