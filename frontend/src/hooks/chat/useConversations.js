import { useQuery } from '@tanstack/react-query';
import { chatService } from '../../services/chat/index.js';

export function useConversations() {
  return useQuery({
    queryKey: ['chat', 'conversations'],
    queryFn: () => chatService.getConversations(),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}


