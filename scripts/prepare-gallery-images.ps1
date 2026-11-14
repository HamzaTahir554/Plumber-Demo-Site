# Resize the supplied illustrative assets for responsive delivery; never alter originals.
Add-Type -AssemblyName System.Drawing
$projectRoot = Split-Path $PSScriptRoot -Parent
$destination = Join-Path $projectRoot 'public/assets/images/gallery'
New-Item -ItemType Directory -Path $destination -Force | Out-Null
$encoder = [Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/jpeg'
$parameters = New-Object Drawing.Imaging.EncoderParameters(1)
$parameters.Param[0] = New-Object Drawing.Imaging.EncoderParameter([Drawing.Imaging.Encoder]::Quality, [long]86)
try {
  foreach ($name in @('service-leak-repair', 'service-water-heater', 'commercial-pipe-system')) {
    $source = [Drawing.Image]::FromFile((Join-Path $projectRoot "public/assets/images/enhanced/$name.jpg"))
    try {
      foreach ($targetWidth in @(640, 960)) {
        $targetHeight = [int][Math]::Round($source.Height * $targetWidth / $source.Width)
        $bitmap = New-Object Drawing.Bitmap($targetWidth, $targetHeight)
        $graphics = [Drawing.Graphics]::FromImage($bitmap)
        try {
          $graphics.InterpolationMode = [Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
          $graphics.PixelOffsetMode = [Drawing.Drawing2D.PixelOffsetMode]::HighQuality
          $graphics.DrawImage($source, 0, 0, $targetWidth, $targetHeight)
          $bitmap.Save((Join-Path $destination "$name-$targetWidth.jpg"), $encoder, $parameters)
        } finally { $graphics.Dispose(); $bitmap.Dispose() }
      }
      Write-Output "$name : source $($source.Width)x$($source.Height); responsive sizes 640 and 960"
    } finally { $source.Dispose() }
  }
} finally { $parameters.Dispose() }
