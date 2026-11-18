import assert from "node:assert/strict";
import fs from "node:fs";
const origin = "http://localhost:5173";
const request = (path, options = {}) => fetch(origin + path, options);
for (const path of [
  "/",
  "/vehicules",
  "/vehicules/mercedes-amg-gt",
  "/reservation/mercedes-amg-gt",
  "/admin",
]) {
  const response = await request(path);
  assert.equal(response.status, 200, path);
  assert.match(await response.text(), /root/);
}
for (const name of [
  "hero",
  "mercedes",
  "porsche",
  "range",
  "bmw",
  "audi",
  "mini",
  "monastir-marina",
  "monastir-ribat",
  "facebook-profile",
]) {
  const response = await request(`/images/${name}.webp`);
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type"), /webp/);
}
for (const path of ['/logo.webp', '/flags/tn.svg', '/flags/fr.svg', '/flags/gb.svg', '/flags/it.svg', '/flags/es.svg', '/credits.html']) {
  assert.equal((await request(path)).status,200,path);
}
assert.equal((await request("/api/admin/session")).status, 401);
assert.equal((await request("/api/admin/bookings")).status, 401);
const post = (body, headers = {}) => ({
  method: "POST",
  headers: { "Content-Type": "application/json", ...headers },
  body: JSON.stringify(body),
});
assert.equal(
  (await request("/api/admin/login", post({ code: "incorrect" }))).status,
  401,
);
assert.equal(
  (
    await request(
      "/api/admin/login",
      post({ code: "incorrect" }, { Origin: "https://wrong-origin.example" }),
    )
  ).status,
  403,
);
const env = fs.readFileSync(".env.local", "utf8");
const code = env.match(/^ADMIN_ACCESS_CODE=(.+)$/m)[1].trim();
const login = await request("/api/admin/login", post({ code }));
assert.equal(login.status, 200);
const cookie = login.headers.get("set-cookie");
assert.match(cookie, /HttpOnly/);
assert.match(cookie, /SameSite=Strict/);
const headers = { Cookie: cookie.split(";")[0] };
assert.equal((await request("/api/admin/session", { headers })).status, 200);
assert.equal(
  (
    await request("/api/admin/session", {
      headers: { Cookie: headers.Cookie.replace(/.$/, "x") },
    })
  ).status,
  401,
);
assert.equal(
  (await request("/api/bookings", post({ vehicleId: "fake" }))).status,
  400,
);
assert.equal(
  (
    await request("/api/admin/bookings", {
      method: "PATCH",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ id: "bad", status: "Confirmée" }),
    })
  ).status,
  400,
);
const logout = await request("/api/admin/logout", { method: "POST", headers });
assert.equal(logout.status, 200);
assert.match(logout.headers.get("set-cookie"), /Max-Age=0/);
console.log(
  "HTTP smoke checks passed: pages, 10 local WebP images, logo, 5 flags, credits, admin auth, signed cookies, origin checks and validation.",
);
