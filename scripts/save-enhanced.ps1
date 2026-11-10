param(
  [Parameter(Mandatory = $true)][string]$SourcePath,
  [Parameter(Mandatory = $true)][string]$Name,
  [ValidateSet('jpg', 'png')][string]$Format = 'jpg'
)

$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$destination = Join-Path $root 'public\assets\images\enhanced'
New-Item -ItemType Directory -Force -Path $destination | Out-Null
$target = Join-Path $destination "$Name.$Format"
if ($Format -eq 'png') {
  Copy-Item -LiteralPath $SourcePath -Destination $target -Force
} else {
  Add-Type -AssemblyName System.Drawing
  $source = [System.Drawing.Image]::FromFile($SourcePath)
  try {
    $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/jpeg'
    $quality = [System.Drawing.Imaging.EncoderParameters]::new(1)
    $quality.Param[0] = [System.Drawing.Imaging.EncoderParameter]::new([System.Drawing.Imaging.Encoder]::Quality, [long]88)
    $source.Save($target, $codec, $quality)
  } finally {
    $source.Dispose()
  }
}
Get-Item -LiteralPath $target | Select-Object FullName, Length
