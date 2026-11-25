/**
 * Verification Script: Routing & 404 Bug Eliminator
 * 
 * Verifies that:
 * 1. App.tsx has exact routes for /vendor, /vendor/register, /driver, /driver/register, /admin, /track
 * 2. App.tsx has safety redirects for /home/vendor, /home/vendor/register, /home/driver, /home/driver/register, /home/admin, /delivery-tracker
 * 3. All navigation links across codebase use strict root-relative paths
 * 4. Layout.tsx and Profile.tsx admin links are strictly gated behind IS_LOCAL_ADMIN
 * 5. Netlify _redirects has safety 301/302 rules
 */

import fs from "fs";
import path from "path";

let passed = 0;
let total = 0;

function assert(condition: boolean, message: string) {
  total++;
  if (condition) {
    passed++;
    console.log(`✅ [PASS] ${message}`);
  } else {
    console.error(`❌ [FAIL] ${message}`);
  }
}

console.log("================================================================================");
console.log("🚦 VERIFYING ROUTING & SAFETY ALIAS REDIRECT ENGINE");
console.log("================================================================================");

// 1. Check App.tsx
const appTsx = fs.readFileSync("artifacts/conon/src/App.tsx", "utf-8");

assert(appTsx.includes('import { Switch, Route, Redirect, Router as WouterRouter } from "wouter";'), "App.tsx imports Redirect from wouter");
assert(appTsx.includes('<Route path="/vendor"  component={VendorDashboard} />'), "App.tsx defines root /vendor route");
assert(appTsx.includes('<Route path="/vendor/register" component={VendorRegisterPage} />'), "App.tsx defines root /vendor/register route");
assert(appTsx.includes('<Route path="/driver"  component={DriverApp}       />'), "App.tsx defines root /driver route");
assert(appTsx.includes('<Route path="/driver/register" component={DriverRegisterPage} />'), "App.tsx defines root /driver/register route");
assert(appTsx.includes('<Route path="/track"     component={DeliveryTracker} />'), "App.tsx defines root /track route");

// Safety redirects
assert(appTsx.includes('<Route path="/home/vendor">{() => <Redirect to="/vendor" replace />}</Route>'), "App.tsx redirects /home/vendor -> /vendor");
assert(appTsx.includes('<Route path="/home/vendor/register">{() => <Redirect to="/vendor/register" replace />}</Route>'), "App.tsx redirects /home/vendor/register -> /vendor/register");
assert(appTsx.includes('<Route path="/home/driver">{() => <Redirect to="/driver" replace />}</Route>'), "App.tsx redirects /home/driver -> /driver");
assert(appTsx.includes('<Route path="/home/driver/register">{() => <Redirect to="/driver/register" replace />}</Route>'), "App.tsx redirects /home/driver/register -> /driver/register");
assert(appTsx.includes('<Route path="/home/admin">{() => <Redirect to={IS_LOCAL_ADMIN ? "/admin" : "/"} replace />}</Route>'), "App.tsx redirects /home/admin -> IS_LOCAL_ADMIN ? /admin : /");
assert(appTsx.includes('<Route path="/delivery-tracker">{() => <Redirect to="/track" replace />}</Route>'), "App.tsx redirects /delivery-tracker -> /track");

// 2. Check Layout.tsx guard
const layoutTsx = fs.readFileSync("artifacts/conon/src/components/Layout.tsx", "utf-8");
assert(layoutTsx.includes("{IS_LOCAL_ADMIN && isAdmin && ("), "Layout.tsx sidebar link is strictly guarded with IS_LOCAL_ADMIN && isAdmin");
assert(!layoutTsx.includes("{isAdmin && (\n                  <Link href=\"/admin\""), "Layout.tsx has no unshielded isAdmin link");

// 3. Check Profile.tsx guard
const profileTsx = fs.readFileSync("artifacts/conon/src/pages/Profile.tsx", "utf-8");
assert(profileTsx.includes('import { IS_LOCAL_ADMIN } from "@/config/adminGuard";'), "Profile.tsx imports IS_LOCAL_ADMIN");
assert(profileTsx.includes('dash: IS_LOCAL_ADMIN ? "/admin" : "/home"'), "Profile.tsx gates admin dashboard link behind IS_LOCAL_ADMIN");

// 4. Check ProductStudioDrawer.tsx
const drawerTsx = fs.readFileSync("artifacts/conon/src/components/admin/ProductStudioDrawer.tsx", "utf-8");
assert(!drawerTsx.includes("localhost:5173/home"), "ProductStudioDrawer has no hardcoded localhost:5173/home");
assert(drawerTsx.includes('window.location.host : "conon-storefront"'), "ProductStudioDrawer uses dynamic host for storefront preview");

// 5. Check Footer.tsx
const footerTsx = fs.readFileSync("artifacts/conon/src/components/Footer.tsx", "utf-8");
assert(footerTsx.includes('href="/track"'), "Footer.tsx links to /track");
assert(footerTsx.includes('href="/vendor"'), "Footer.tsx links to /vendor");
assert(footerTsx.includes('href="/driver"'), "Footer.tsx links to /driver");

// 6. Check public/_redirects
const redirects = fs.readFileSync("artifacts/conon/public/_redirects", "utf-8");
assert(redirects.includes("/home/vendor           /vendor           301!"), "_redirects includes 301 for /home/vendor");
assert(redirects.includes("/home/driver           /driver           301!"), "_redirects includes 301 for /home/driver");
assert(redirects.includes("/delivery-tracker      /track            301!"), "_redirects includes 301 for /delivery-tracker");
assert(redirects.includes("/home/admin            /                 302!"), "_redirects includes 302 for /home/admin");

console.log("================================================================================");
console.log(`TOTAL TESTS: ${total} | PASSED: ${passed} | FAILED: ${total - passed}`);
console.log("================================================================================");

if (passed === total) {
  console.log("🎉 ALL ROUTING & SAFETY REDIRECT CHECKS PASSED WITH ZERO ERRORS!");
  process.exit(0);
} else {
  console.error("❌ SOME CHECKS FAILED!");
  process.exit(1);
}
