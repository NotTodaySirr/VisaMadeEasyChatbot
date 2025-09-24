import { useRef } from 'react';
import { streamingService as openStream } from '../../services/chat/index.js';

export function useStreaming() {
  const currentStreamRef = useRef(null);

  const start = (streamId, handlers) => {
    currentStreamRef.current = { streamId };
    openStream(streamId, handlers);
  };

  const stop = () => {
    // Using fetch stream; nothing to cancel without AbortController in our impl
    currentStreamRef.current = null;
  };

  return { start, stop };
}


