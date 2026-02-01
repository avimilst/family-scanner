import { ScanRequest, ScanResponse, ContentType } from '../types';

// Cloudflare Worker URL
const WORKER_URL = 'https://falling-moon-82d1.avimilst.workers.dev';

export async function scanContent(
  title: string,
  contentType: ContentType
): Promise<ScanResponse> {
  try {
    const response = await fetch(`${WORKER_URL}/scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        content_type: contentType,
      } as ScanRequest),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      data: data.data || data,
      cached: data.cached || false,
    };
  } catch (error) {
    console.error('Scan error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to scan content',
    };
  }
}

export async function healthCheck(): Promise<boolean> {
  try {
    const response = await fetch(`${WORKER_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}
