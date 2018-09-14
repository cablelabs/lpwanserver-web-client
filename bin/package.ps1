#!/usr/bin/env pwsh

Set-StrictMode -Version latest

# Any subsequent(*) commands which fail will cause the script to exit immediately
$ErrorActionPreference = "Stop"

$component = Get-Content -Path "component.json" | Out-STring | ConvertFrom-Json
$image="$($component.registry)/$($component.name):$($component.version)-$($component.build)-rc"
$latestImage="$($component.registry)/$($component.name):latest"

# Build docker image
docker build -f docker/Dockerfile -t $image -t $latestImage .

# Set environment variables
$env:IMAGE = $image

# Set docker host address
$dockerMachineHost = $env:DOCKER_MACHINE_HOST
if ($dockerMachineHost -eq $null) {
    $dockerMachineHost = "localhost"
}

Write-Output "Docker Machine Host set to [$dockerMachineHost]"
Write-Host "The container was successfully built."
