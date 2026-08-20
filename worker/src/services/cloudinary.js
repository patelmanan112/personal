// worker/src/services/cloudinary.js
// Cloudinary image upload using the REST API with signed requests.
// Works in Cloudflare Workers — no Node.js SDK needed.

/**
 * Generates a SHA-1 hex digest using the Web Crypto API.
 */
async function sha1Hex(message) {
  const data = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Builds a Cloudinary upload signature.
 * Params must be sorted alphabetically (excluding api_key, file, resource_type).
 */
async function buildSignature(params, apiSecret) {
  const sortedKeys = Object.keys(params).sort();
  const paramString = sortedKeys.map((k) => `${k}=${params[k]}`).join('&');
  return sha1Hex(paramString + apiSecret);
}

/**
 * Uploads a file (Blob/File) to Cloudinary.
 * Returns { secure_url, public_id }.
 */
export async function uploadToCloudinary(file, env) {
  const cloudName = env.CLOUDINARY_CLOUD_NAME || 'pplcot0h';
  const apiKey = env.CLOUDINARY_API_KEY || '953761345214678';
  const apiSecret = env.CLOUDINARY_API_SECRET || 'tG-Kv7U9n8fPK-juJZXOf9PDL20';
  const folder = 'unity-a-live-group';

  const timestamp = Math.floor(Date.now() / 1000).toString();

  // Parameters to sign (must match what we send)
  const paramsToSign = {
    folder,
    timestamp,
  };

  const signature = await buildSignature(paramsToSign, apiSecret);

  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp);
  formData.append('signature', signature);
  formData.append('folder', folder);

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Cloudinary upload failed: ${response.status} — ${errText}`);
  }

  const result = await response.json();

  return {
    secure_url: result.secure_url,
    public_id: result.public_id,
  };
}

/**
 * Deletes an image from Cloudinary by public_id.
 */
export async function deleteFromCloudinary(publicId, env) {
  const cloudName = env.CLOUDINARY_CLOUD_NAME || 'pplcot0h';
  const apiKey = env.CLOUDINARY_API_KEY || '953761345214678';
  const apiSecret = env.CLOUDINARY_API_SECRET || 'tG-Kv7U9n8fPK-juJZXOf9PDL20';

  const timestamp = Math.floor(Date.now() / 1000).toString();

  const paramsToSign = {
    public_id: publicId,
    timestamp,
  };

  const signature = await buildSignature(paramsToSign, apiSecret);

  const formData = new FormData();
  formData.append('public_id', publicId);
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp);
  formData.append('signature', signature);

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`;

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Cloudinary delete failed: ${response.status} — ${errText}`);
  }

  return response.json();
}
