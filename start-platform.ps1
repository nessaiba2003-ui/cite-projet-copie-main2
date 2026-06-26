param(
    [string]$JdkHome = "C:\Program Files\Java\jdk-21"
)

if (-not (Test-Path "$JdkHome\bin\java.exe")) {
    Write-Error "JDK introuvable dans '$JdkHome'. Modifie le parametre -JdkHome."
    exit 1
}

$env:JAVA_HOME = $JdkHome
$env:Path = "$JdkHome\bin;$env:Path"

Write-Host "JAVA_HOME = $env:JAVA_HOME"
Write-Host "Build backend..."
./mvnw -DskipTests package
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Demarrage backend..."
Start-Process powershell -ArgumentList "-NoExit","-Command","cd '$PSScriptRoot'; `$env:JAVA_HOME='$JdkHome'; `$env:Path='$JdkHome\bin;'+`$env:Path; java -jar target\cite-project-0.0.1-SNAPSHOT.jar"

Write-Host "Demarrage frontend..."
Start-Process powershell -ArgumentList "-NoExit","-Command","cd '$PSScriptRoot\frontend'; npm install; npm run dev"

Write-Host "Plateforme demarree:"
Write-Host "- Backend: http://localhost:8080"
Write-Host "- Frontend: http://localhost:5173"
