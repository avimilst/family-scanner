// Cloudflare Worker API endpoint
const API_URL = 'https://family-scanner.avimilst.workers.dev';

/**
 * Scan a product by barcode or name
 */
export async function scanProduct({ barcode, productName }) {
  const response = await fetch(`${API_URL}/scan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ barcode, productName }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Check if the API is healthy
 */
export async function checkHealth() {
  const response = await fetch(`${API_URL}/health`);
  return response.json();
}
