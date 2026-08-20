async function testLogin() {
  console.log("Testing Admin Login with new credentials...");
  const res = await fetch("http://localhost:8787/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "ganpatibapamorya",
      password: "unityalive2026"
    })
  });

  const json = await res.json();
  console.log("Status:", res.status);
  console.log("Response:", json);
  console.log("Cookie header:", res.headers.get("set-cookie"));
}

testLogin().catch(console.error);
