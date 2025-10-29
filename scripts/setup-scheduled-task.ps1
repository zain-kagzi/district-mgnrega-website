# setup-scheduled-task.ps1
# Run as Administrator

$TaskName = "MGNREGA-DataFetch"
$ProjectPath = "C:\Users\Asus\Desktop\mgnrega-dashboard"
$ScriptPath = "$ProjectPath\scripts\windows-task.bat"

# Check if task already exists
$ExistingTask = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue

if ($ExistingTask) {
    Write-Host "Task already exists. Removing..." -ForegroundColor Yellow
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
}

# Create the action
$Action = New-ScheduledTaskAction -Execute $ScriptPath -WorkingDirectory $ProjectPath

# Create the trigger (Daily at 6 AM, repeat every 6 hours)
$Trigger = New-ScheduledTaskTrigger -Daily -At 6:00AM
$Trigger.Repetition = $(New-ScheduledTaskTrigger -Once -At 6:00AM -RepetitionInterval (New-TimeSpan -Hours 6) -RepetitionDuration (New-TimeSpan -Days 365)).Repetition

# Create settings
$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable

# Register the task
Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger -Settings $Settings -Description "Fetches MGNREGA district data every 6 hours"

Write-Host "`n✓ Scheduled task created successfully!" -ForegroundColor Green
Write-Host "Task Name: $TaskName" -ForegroundColor Cyan
Write-Host "Schedule: Every 6 hours starting at 6:00 AM" -ForegroundColor Cyan
Write-Host "`nTo view: Open Task Scheduler and look for '$TaskName'" -ForegroundColor Yellow