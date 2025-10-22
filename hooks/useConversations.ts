import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export interface Conversation {
  userId: string
  userName: string
  userProfileImage?: string | null
  userHeadline?: string | null
  lastMessage: string
  lastMessageTime: Date
  unreadCount: number
  status?: 'online' | 'offline' | 'dnd'
}

/**
 * Hook to fetch conversations list
 *
 * Features:
 * - Automatic caching (30s stale time)
 * - Background refetching
 * - Request deduplication (multiple calls = 1 request)
 * - Optimistic updates for new messages
 */
export function useConversations(userId: string | undefined) {
  return useQuery({
    queryKey: ['conversations', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID required')

      const res = await fetch(`/api/conversations?userId=${userId}`)
      if (!res.ok) throw new Error('Failed to fetch conversations')

      const data = await res.json()
      // Parse dates from JSON
      return data.map((conv: any) => ({
        ...conv,
        lastMessageTime: new Date(conv.lastMessageTime),
      })) as Conversation[]
    },
    enabled: !!userId,
    // Refetch every 15 seconds when window is focused
    refetchInterval: (query) => {
      // Only poll if window is focused and user is viewing DMs
      return document.hidden ? false : 15000
    },
    staleTime: 10 * 1000, // Consider data fresh for 10 seconds
  })
}

/**
 * Hook to update conversation locally when sending a message
 * This provides instant UI updates without waiting for server
 */
export function useUpdateConversation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      userId,
      otherUserId,
      message,
    }: {
      userId: string
      otherUserId: string
      message: string
    }) => {
      // This is handled by the send message mutation
      // This hook just updates the cache
      return { userId, otherUserId, message }
    },
    onMutate: async ({ userId, otherUserId, message }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['conversations', userId] })

      // Snapshot previous value
      const previousConversations = queryClient.getQueryData<Conversation[]>([
        'conversations',
        userId,
      ])

      // Optimistically update conversation list
      queryClient.setQueryData<Conversation[]>(
        ['conversations', userId],
        (old = []) => {
          const existing = old.find((c) => c.userId === otherUserId)

          if (existing) {
            // Update existing conversation
            return [
              { ...existing, lastMessage: message, lastMessageTime: new Date() },
              ...old.filter((c) => c.userId !== otherUserId),
            ]
          } else {
            // This shouldn't happen in normal flow, but handle it
            return old
          }
        }
      )

      return { previousConversations }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousConversations) {
        queryClient.setQueryData(
          ['conversations', variables.userId],
          context.previousConversations
        )
      }
    },
    onSettled: (data, error, variables) => {
      // Always refetch after mutation
      queryClient.invalidateQueries({ queryKey: ['conversations', variables.userId] })
    },
  })
}
