$ErrorActionPreference = 'Stop'
$base = 'http://localhost:3000'

# login as admin first so /admin/* pages are checked authenticated
$loginBody = @{ email = 'owner@example.com'; password = 'dev-password-123' } | ConvertTo-Json -Compress
$null = Invoke-RestMethod -Uri "$base/api/admin/auth/login" -Method Post -ContentType 'application/json' -Body $loginBody -SessionVariable sess -TimeoutSec 30

# find a real product slug from the storefront API
$cat = Invoke-RestMethod -Uri "$base/api/products?limit=5" -TimeoutSec 30
$slug = $cat.products[0].slug
if (-not $slug) { throw 'no slug in catalogue' }
Write-Host ("using product slug: {0}" -f $slug)

# find an order number for the success page
$adminOrders = Invoke-RestMethod -Uri "$base/api/admin/orders?limit=1" -WebSession $sess -TimeoutSec 30
$orderNumber = $adminOrders.orders[0].orderNumber
if (-not $orderNumber) { throw 'no orders found' }
Write-Host ("using order number: {0}" -f $orderNumber)

$publicPages = @('/', '/shop', ("/product/" + $slug), '/cart', '/checkout', '/track-order', ("/order-success/" + $orderNumber), '/admin/login')
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
