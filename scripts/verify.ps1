$ErrorActionPreference = 'Stop'
# The whole app (storefront + admin) runs from ONE Next.js server, so both
# sides are verified against the same origin. Override with VERIFY_BASE_URL
# if you run `npm run dev` on a different port.
$base = if ($env:VERIFY_BASE_URL) { $env:VERIFY_BASE_URL } else { 'http://localhost:3000' }
$adminEmail = if ($env:ADMIN_EMAIL) { $env:ADMIN_EMAIL } else { 'owner@example.com' }
$adminPassword = if ($env:ADMIN_PASSWORD) { $env:ADMIN_PASSWORD } else { 'dev-password-123' }
function Step($name) { Write-Host "-> $name" -ForegroundColor DarkGray }

# --- public: smoke suite -------------------------------------------------
$env:SMOKE_BASE_URL = $base
node scripts/smoke-test.mjs
if ($LASTEXITCODE -ne 0) { throw "smoke-test failed" }

# --- admin: wrong password rejected --------------------------------------
Step "admin login rejects wrong password"
try {
  $badBody = @{ email = $adminEmail; password = 'wrong' } | ConvertTo-Json -Compress
  Invoke-RestMethod -Uri "$base/api/admin/auth/login" -Method Post -ContentType 'application/json' -Body $badBody -TimeoutSec 30 | Out-Null
  throw "expected 401"
} catch {
  if ($_.Exception.Response.StatusCode.value__ -ne 401) { throw "expected 401, got $($_.Exception.Response.StatusCode.value__)" }
}

# --- admin: login ---------------------------------------------------------
Step "admin login"
$loginBody = @{ email = $adminEmail; password = $adminPassword } | ConvertTo-Json -Compress
$login = Invoke-RestMethod -Uri "$base/api/admin/auth/login" -Method Post -ContentType 'application/json' -Body $loginBody -SessionVariable sess -TimeoutSec 30
if (-not $login.ok) { throw "login failed" }
Write-Host "  ok $($login.admin.email)"

# --- admin: /admin renders with cookie, redirects without -----------------
Step "/admin auth gate"
$withCookie = Invoke-WebRequest -Uri "$base/admin" -WebSession $sess -UseBasicParsing -TimeoutSec 60
if ($withCookie.StatusCode -ne 200) { throw "admin page status $($withCookie.StatusCode)" }
try {
  Invoke-WebRequest -Uri "$base/admin" -UseBasicParsing -MaximumRedirection 0 -TimeoutSec 30 -ErrorAction Stop | Out-Null
  throw "expected redirect"
} catch {
  if ($_.Exception.Message -notmatch 'redirect') { throw "expected redirect exception, got $($_.Exception.Message)" }
}
$noCookie = & curl.exe -s -o NUL -w "%{http_code}" "$base/admin"
if ($noCookie -ne '307') { throw "expected 307 without cookie, got $noCookie" }

# --- admin: unauthenticated product mutation rejected ---------------------
Step "unauthenticated PATCH rejected"
try {
  Invoke-WebRequest -Uri "$base/api/admin/products/does-not-exist" -Method Patch -ContentType 'application/json' -Body '{"price":1}' -UseBasicParsing -TimeoutSec 30 -ErrorAction Stop | Out-Null
  throw "expected 401"
} catch {
  if ($_.Exception.Response.StatusCode.value__ -ne 401) { throw "expected 401, got $($_.Exception.Response.StatusCode.value__)" }
}

# --- admin: create product -------------------------------------------------
Step "create product"
$new = Invoke-RestMethod -Uri "$base/api/admin/products" -Method Post -WebSession $sess -ContentType 'application/json' -Body '{"name":"Smoke Test Cap","description":"temporary product created by verify.ps1","price":9.99,"stockQuantity":3,"category":"others","image":"https://picsum.photos/seed/smokecap/800/800","status":"active"}' -TimeoutSec 30
$capId = $new.product.id
if (-not $capId) { throw "no product id returned" }
Write-Host "  created $capId"

# --- storefront sees it -----------------------------------------------------
Step "storefront sees the new product"
Start-Sleep -Seconds 2
$found = Invoke-RestMethod -Uri "$base/api/products?q=Smoke%20Test%20Cap&limit=5" -TimeoutSec 30
$cap = $found.products | Where-Object { $_.id -eq $capId }
if (-not $cap) { throw "product not visible on storefront" }
if ([math]::Abs($cap.price - 9.99) -gt 0.001) { throw "wrong price on storefront" }

# --- admin: update product ---------------------------------------------------
Step "update product price"
$null = Invoke-RestMethod -Uri "$base/api/admin/products/$capId" -Method Patch -WebSession $sess -ContentType 'application/json' -Body '{"name":"Smoke Test Cap","description":"temporary product created by verify.ps1","price":14.99,"stockQuantity":5,"category":"others","image":"https://picsum.photos/seed/smokecap/800/800","status":"active"}' -TimeoutSec 30
Start-Sleep -Seconds 2
$found = Invoke-RestMethod -Uri "$base/api/products?q=Smoke%20Test%20Cap&limit=5" -TimeoutSec 30
$cap = $found.products | Where-Object { $_.id -eq $capId }
if ([math]::Abs($cap.price - 14.99) -gt 0.001) { throw "storefront still shows old price: $($cap.price)" }

# --- buy the cap, then change status as admin --------------------------------
Step "buy the cap"
$order = Invoke-RestMethod -Uri "$base/api/orders" -Method Post -ContentType 'application/json' -Body ('{"items":[{"productId":"' + $capId + '","quantity":1}],"customer":{"fullName":"Admin Flow Tester","email":"flow@example.com","phone":"01700000042","address":"House 9, Road 4","city":"Chattogram","postalCode":"4000"},"paymentMethod":"cod"}') -TimeoutSec 30
$adminList = Invoke-RestMethod -Uri "$base/api/admin/orders?q=$($order.orderNumber)&limit=5" -WebSession $sess -TimeoutSec 30
$adminOrder = $adminList.orders | Where-Object { $_.orderNumber -eq $order.orderNumber } | Select-Object -First 1
if (-not $adminOrder) { throw "order not visible to admin list API" }
$tracking = Invoke-RestMethod -Uri "$base/api/orders/$($order.orderNumber)?phone=01700000042" -TimeoutSec 30
if ($tracking.order.orderStatus -ne 'pending') { throw "expected pending, got $($tracking.order.orderStatus)" }
Write-Host "  order $($order.orderNumber) (id $($adminOrder.id)) is pending"

Step "admin marks it shipped"
$null = Invoke-RestMethod -Uri "$base/api/admin/orders/$($adminOrder.id)" -Method Patch -WebSession $sess -ContentType 'application/json' -Body '{"orderStatus":"shipped"}' -TimeoutSec 30
$tracking = Invoke-RestMethod -Uri "$base/api/orders/$($order.orderNumber)?phone=01700000042" -TimeoutSec 30
if ($tracking.order.orderStatus -ne 'shipped') { throw "expected shipped, got $($tracking.order.orderStatus)" }
Write-Host "  tracking now shows: $($tracking.order.orderStatus)"

# --- stock decremented ---------------------------------------------------------
Step "stock decremented"
$found = Invoke-RestMethod -Uri "$base/api/products?q=Smoke%20Test%20Cap&limit=5" -TimeoutSec 30
$cap = $found.products | Where-Object { $_.id -eq $capId }
if ($cap.stockQuantity -ne 4) { throw "expected stock 4, got $($cap.stockQuantity)" }

# --- invalid status rejected ----------------------------------------------------
Step "invalid status rejected"
try {
  Invoke-WebRequest -Uri "$base/api/admin/orders/$($adminOrder.id)" -Method Patch -WebSession $sess -ContentType 'application/json' -Body '{"orderStatus":"not-a-status"}' -UseBasicParsing -TimeoutSec 30 -ErrorAction Stop | Out-Null
  throw "expected 400"
} catch {
  if ($_.Exception.Response.StatusCode.value__ -ne 400) { throw "expected 400, got $($_.Exception.Response.StatusCode.value__)" }
}

Write-Host ""
Write-Host "ALL CHECKS PASSED" -ForegroundColor Green
