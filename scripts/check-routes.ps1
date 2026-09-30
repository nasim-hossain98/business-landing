$ErrorActionPreference = 'Stop'
$base = 'http://localhost:3000'

# Credentials: process env wins, then .env.local (what the dev server reads),
# then dev defaults.
$envFilePath = Join-Path (Split-Path -Parent $PSScriptRoot) '.env.local'
$envFile = @{}
if (Test-Path $envFilePath) {
  foreach ($line in Get-Content $envFilePath) {
    if ($line -match '^\s*([A-Za-z0-9_]+)\s*=\s*(.*)$') { $envFile[$matches[1]] = $matches[2].Trim() }
  }
}
$adminEmail = if ($env:ADMIN_EMAIL) { $env:ADMIN_EMAIL } elseif ($envFile['ADMIN_EMAIL']) { $envFile['ADMIN_EMAIL'] } else { 'owner@example.com' }
$adminPassword = if ($env:ADMIN_PASSWORD) { $env:ADMIN_PASSWORD } elseif ($envFile['ADMIN_PASSWORD']) { $envFile['ADMIN_PASSWORD'] } else { 'dev-password-123' }

# login as admin first so /admin/* pages are checked authenticated
$loginBody = @{ email = $adminEmail; password = $adminPassword } | ConvertTo-Json -Compress
$null = Invoke-RestMethod -Uri "$base/api/admin/auth/login" -Method Post -ContentType 'application/json' -Body $loginBody -SessionVariable sess -TimeoutSec 30

# find a real product slug from the storefront API
$cat = Invoke-RestMethod -Uri "$base/api/products?limit=5" -TimeoutSec 30
$slug = $cat.products[0].slug
if (-not $slug) { throw 'no slug in catalogue' }
Write-Host ("using product slug: {0}" -f $slug)

# find an order number for the success page (the store may be empty on a
# fresh run — then the order-success page is skipped, which is a valid state)
$orderNumber = $null
$adminOrders = Invoke-RestMethod -Uri "$base/api/admin/orders?limit=1" -WebSession $sess -TimeoutSec 30
if ($adminOrders.orders.Count -gt 0) { $orderNumber = $adminOrders.orders[0].orderNumber }
if ($orderNumber) { Write-Host ("using order number: {0}" -f $orderNumber) }
else { Write-Host 'no orders yet - skipping /order-success (empty state)' }

$publicPages = @('/', '/shop', ("/product/" + $slug), '/cart', '/checkout', '/track-order', '/admin/login')
if ($orderNumber) { $publicPages += ("/order-success/" + $orderNumber) }
foreach ($p in $publicPages) {
  $r = Invoke-WebRequest -Uri ($base + $p) -UseBasicParsing -TimeoutSec 120
  Write-Host ("PUBLIC {0,-40} {1}" -f $p, $r.StatusCode)
  if ($r.StatusCode -ne 200) { throw "public page $p -> $($r.StatusCode)" }
}

$adminPages = @('/admin', '/admin/orders', '/admin/products', '/admin/customers', '/admin/analytics')
foreach ($p in $adminPages) {
  $r = Invoke-WebRequest -Uri ($base + $p) -WebSession $sess -UseBasicParsing -TimeoutSec 120
  Write-Host ("ADMIN  {0,-40} {1}" -f $p, $r.StatusCode)
  if ($r.StatusCode -ne 200) { throw "admin page $p -> $($r.StatusCode)" }
}

Write-Host 'ALL ROUTES OK' -ForegroundColor Green
