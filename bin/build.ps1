#!/usr/bin/env pwsh

Set-StrictMode -Version latest

# Any subsequent(*) commands which fail will cause the script to exit immediately
$ErrorActionPreference = "Stop"

$component = Get-Content -Path "component.json" | Out-String | ConvertFrom-Json
$image="$($component.registry)/$($component.name):$($component.version)-build"
$container=$component.name

# Remove build files
if (Test-Path "build") {
    Write-Output "Removing the build files"
    Remove-Item -Recurse -Force -Path "build"
}

# Build docker image
Write-Output "Building using [docker/Dockerfile.build]"
docker build -f docker/Dockerfile.build -t $image .

# Create and copy compiled files, then destroy
Write-Output "Creating container [$container] from Image : [$image]"
docker create --name $container $image

Write-Output "Copying build folder from container [$container] to the root solution directory"
docker cp "$($container):/app/build" ./build

Write-Output "Removing container [$container]"
docker rm $container
