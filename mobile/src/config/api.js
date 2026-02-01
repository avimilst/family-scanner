export const API_URL = 'https://family-scanner.avimilst.workers.dev';

export async function scanContent(title, contentType) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title,
      content_type: contentType,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || 'Failed to scan content');
  }

  return response.json();
}
