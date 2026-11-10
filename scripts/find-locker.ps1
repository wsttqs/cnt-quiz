Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
using System.Text;
public class RmApi {
    [DllImport("rstrtmgr.dll", CharSet = CharSet.Unicode)]
    public static extern int RmStartSession(out uint pSessionHandle, int dwSessionFlags, string strSessionKey);
    [DllImport("rstrtmgr.dll", CharSet = CharSet.Unicode)]
    public static extern int RmRegisterResources(uint pSessionHandle, uint nFiles, string[] rgsFilenames, uint nApplications, IntPtr rgApplications, uint nServices, IntPtr rgsServiceNames);
    [DllImport("rstrtmgr.dll", CharSet = CharSet.Unicode)]
    public static extern int RmGetList(uint dwSessionHandle, out uint pnProcInfoNeeded, ref uint pnProcInfo, [In, Out] RM_PROCESS_INFO[] rgAffectedApps, ref uint lpdwRebootReasons);
    [DllImport("rstrtmgr.dll")]
    public static extern int RmEndSession(uint pSessionHandle);
    [StructLayout(LayoutKind.Sequential)]
    public struct RM_PROCESS_INFO {
        public RM_UNIQUE_PROCESS Process;
        [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 256)]
        public string strAppName;
        [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 64)]
        public string strServiceShortName;
        public RM_APP_TYPE ApplicationType;
        public uint AppStatus;
        public uint TSSessionId;
        [MarshalAs(UnmanagedType.Bool)]
        public bool bRestartable;
    }
    [StructLayout(LayoutKind.Sequential)]
    public struct RM_UNIQUE_PROCESS {
        public int dwProcessId;
        public System.Runtime.InteropServices.ComTypes.FILETIME ProcessStartTime;
    }
    public enum RM_APP_TYPE {
        RmUnknownApp = 0, RmMainWindow = 1, RmOtherWindow = 2, RmService = 3, RmExplorer = 4, RmConsole = 5, RmCritical = 1000
    }
}
"@

$sessionHandle = 0
$sessionKey = [Guid]::NewGuid().ToString()
$result = [RmApi]::RmStartSession([ref]$sessionHandle, 0, $sessionKey)
if ($result -ne 0) {
    Write-Host "RmStartSession failed: $result"
    exit
}

$filePath = 'E:\Codex\CNT\docs\requirements\quiz-dynamic-template-v3.xlsx'
$files = @($filePath)
$result = [RmApi]::RmRegisterResources($sessionHandle, 1, $files, 0, [IntPtr]::Zero, 0, [IntPtr]::Zero)
if ($result -ne 0) {
    Write-Host "RmRegisterResources failed: $result"
    [RmApi]::RmEndSession($sessionHandle) | Out-Null
    exit
}

$procInfoNeeded = 0
$procInfo = 0
$rebootReasons = 0
$result = [RmApi]::RmGetList($sessionHandle, [ref]$procInfoNeeded, [ref]$procInfo, $null, [ref]$rebootReasons)
if ($result -eq 234) {
    $procInfo = $procInfoNeeded
    $infoArray = New-Object 'RmApi+RM_PROCESS_INFO[]' $procInfoNeeded
    $result = [RmApi]::RmGetList($sessionHandle, [ref]$procInfoNeeded, [ref]$procInfo, $infoArray, [ref]$rebootReasons)
    if ($result -eq 0) {
        for ($i = 0; $i -lt $procInfo; $i++) {
            $procId = $infoArray[$i].Process.dwProcessId
            try {
                $proc = Get-Process -Id $procId -ErrorAction Stop
                Write-Host "PID: $procId, Name: $($proc.ProcessName), Path: $($proc.Path)"
            } catch {
                Write-Host "PID: $procId (process not found), App: $($infoArray[$i].strAppName)"
            }
        }
    }
}

[RmApi]::RmEndSession($sessionHandle) | Out-Null
