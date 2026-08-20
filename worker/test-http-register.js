async function testHttpRegister() {
  const formData = new FormData();
  formData.append('fullName', 'Manan Patel');
  formData.append('age', '18');
  formData.append('mobileNumber', '9876543210');
  formData.append('bloodGroup', 'B+');
  formData.append('city', 'Ahmedabad');

  const pngBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );
  const file = new Blob([pngBuffer], { type: 'image/png' });
  formData.append('photo', file, 'test.png');

  console.log("Sending POST to http://localhost:8787/api/register ...");
  const response = await fetch('http://localhost:8787/api/register', {
    method: 'POST',
    body: formData,
  });

  const json = await response.json();
  console.log("RESPONSE HTTP STATUS:", response.status);
  console.log("RESPONSE BODY:", json);
}

testHttpRegister().catch((err) => {
  console.error("HTTP Register Error:", err);
});
