$Prefix = "http://localhost:8000/"
$Listener = New-Object System.Net.HttpListener
$Listener.Prefixes.Add($Prefix)
$Listener.Start()
Write-Output "Serving $Prefix from $(Get-Location)"
while ($Listener.IsListening) {
  $Context = $Listener.GetContext()
  $req = $Context.Request
  $path = $req.Url.AbsolutePath.TrimStart('/') -replace '/','\\'
  if ([string]::IsNullOrEmpty($path)) { $path = 'index.html' }
  $file = Join-Path (Get-Location) $path
  if (-not (Test-Path $file)) {
    $Context.Response.StatusCode = 404
    $bytes = [System.Text.Encoding]::UTF8.GetBytes('Not Found')
    $Context.Response.ContentType = 'text/plain'
  } else {
    $bytes = [System.IO.File]::ReadAllBytes($file)
    $Context.Response.StatusCode = 200
    switch ([IO.Path]::GetExtension($file).ToLower()) {
      '.html' { $Context.Response.ContentType = 'text/html' }
      '.css' { $Context.Response.ContentType = 'text/css' }
      '.js' { $Context.Response.ContentType = 'application/javascript' }
      '.jpg' { $Context.Response.ContentType = 'image/jpeg' }
      '.jpeg' { $Context.Response.ContentType = 'image/jpeg' }
      '.png' { $Context.Response.ContentType = 'image/png' }
      '.svg' { $Context.Response.ContentType = 'image/svg+xml' }
      '.json' { $Context.Response.ContentType = 'application/json' }
      default { $Context.Response.ContentType = 'application/octet-stream' }
    }
  }
  $Context.Response.ContentLength64 = $bytes.Length
  $Context.Response.OutputStream.Write($bytes,0,$bytes.Length)
  $Context.Response.OutputStream.Close()
}
