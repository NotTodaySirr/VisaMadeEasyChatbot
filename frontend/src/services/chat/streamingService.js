import API_ENDPOINTS from '../api/endpoints.js';
import { TokenManager } from '../api/apiClient.js';

// Minimal SSE helper with auth header support via polyfill
export function openStream(streamId, { onChunk, onComplete, onError }) {
  const url = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + API_ENDPOINTS.CHAT.STREAM(streamId);
  const token = TokenManager.getAccessToken();

  // Use fetch + ReadableStream to handle SSE with Authorization header
  fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
    .then(async (res) => {
      if (!res.ok || !res.body) throw new Error('Stream connection failed');
      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');

      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let idx;
        while ((idx = buffer.indexOf('\n\n')) !== -1) {
          const raw = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 2);
          // Expect lines like: "event: chunk" / "data: {...}"
          const lines = raw.split('\n');
          const typeLine = lines.find((l) => l.startsWith('event:')) || '';
          const dataLine = lines.find((l) => l.startsWith('data:')) || '';
          const event = typeLine.replace('event:', '').trim();
          const payload = dataLine.replace('data:', '').trim();
          try {
            const parsed = payload ? JSON.parse(payload) : null;
            if (event === 'chunk' && onChunk) onChunk(parsed);
            if (event === 'complete' && onComplete) onComplete(parsed);
            if (event === 'error' && onError) onError(parsed);
          } catch (e) {
            // ignore parse errors
          }
        }
      }
      if (onComplete) onComplete();
    })
    .catch((err) => {
      if (onError) onError(err);
    });
}


