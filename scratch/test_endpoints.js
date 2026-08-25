const http = require("http");

function post(path, data) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const req = http.request(
      {
        hostname: "localhost",
        port: 5000,
        path: path,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
        },
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => resolve({ status: res.statusCode, body: JSON.parse(body || "{}") }));
      }
    );
    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

async function run() {
  console.log("--- Testing /api/auth/check-email ---");
  const r1 = await post("/api/auth/check-email", { email: "test@example.com" });
  console.log("check-email:", r1);

  console.log("\n--- Testing /api/auth/signup ---");
  const r2 = await post("/api/auth/signup", {});
  console.log("signup:", r2);

  console.log("\n--- Testing /api/auth/forgot-password ---");
  const r3 = await post("/api/auth/forgot-password", { email: "test@example.com" });
  console.log("forgot-password:", r3);
}

run().catch(console.error);
