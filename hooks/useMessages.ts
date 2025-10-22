import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'

export interface DirectMessage {
  id: string
  senderId: string
  receiverId: string
  content: string
  type: string
  createdAt: Date
  senderName?: string
  senderProfileImage?: string | null
  read?: boolean
}

/**
 * Hook to fetch messages between two users
 *
 * Features:
 * - Automatic caching
 * - Background refetching when window focused
 * - Optimistic updates for sending
 */
export function useMessages(userId: string | undefined, otherUserId: string | null) {
  return useQuery({
    queryKey: ['messages', userId, otherUserId],
    queryFn: async () => {
      if (!userId || !otherUserId) throw new Error('User IDs required')

      const res = await fetch(
        `/api/messages?userId=${userId}&otherUserId=${otherUserId}&limit=50`
      )
      if (!res.ok) throw new Error('Failed to fetch messages')

      const data = await res.json()
      // Parse dates from JSON
      return data.map((msg: any) => ({
        ...msg,
        createdAt: new Date(msg.createdAt),
      })) as DirectMessage[]
    },
    enabled: !!userId && !!otherUserId,
    // Only refetch when window is focused
    refetchOnWindowFocus: true,
    // Consider data fresh for 5 seconds
    staleTime: 5 * 1000,
  })
}

/**
 * Hook to send a message with optimistic update
 */
export function useSendMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      senderId,
      receiverId,
      content,
    }: {
      senderId: string
      receiverId: string
      content: string
    }) => {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId, receiverId, content }),
      })

      if (!res.ok) throw new Error('Failed to send message')
      return res.json()
    },
    onMutate: async ({ senderId, receiverId, content }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ['messages', senderId, receiverId],
      })

      // Snapshot previous value
      const previousMessages = queryClient.getQueryData<DirectMessage[]>([
        'messages',
        senderId,
        receiverId,
      ])

      // Optimistically add message
      const optimisticMessage: DirectMessage = {
        id: `temp-${Date.now()}`,
        senderId,
        receiverId,
        content,
        type: 'text',
        createdAt: new Date(),
        read: false,
      }

      queryClient.setQueryData<DirectMessage[]>(
        ['messages', senderId, receiverId],
        (old = []) => [...old, optimisticMessage]
      )

      return { previousMessages, optimisticMessage }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousMessages) {
        queryClient.setQueryData(
          ['messages', variables.senderId, variables.receiverId],
          context.previousMessages
        )
      }
    },
    onSuccess: (newMessage, variables, context) => {
      // Replace optimistic message with real one
      queryClient.setQueryData<DirectMessage[]>(
        ['messages', variables.senderId, variables.receiverId],
        (old = []) => [
          ...old.filter((m) => m.id !== context?.optimisticMessage.id),
          {
            ...newMessage,
            createdAt: new Date(newMessage.createdAt),
          },
        ]
      )
    },
    onSettled: (data, error, variables) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({
        queryKey: ['messages', variables.senderId, variables.receiverId],
      })
    },
  })
}

/**
 * Hook to fetch channel posts with infinite scrolling support
 */
export function useChannelPosts(topic: string | null, limit = 50) {
  return useQuery({
    queryKey: ['posts', topic],
    queryFn: async () => {
      const url = topic
        ? `/api/posts?limit=${limit}&topic=${encodeURIComponent(topic)}`
        : `/api/posts?limit=${limit}`

      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed to fetch posts')

      const data = await res.json()
      // Parse dates and ensure IDs are strings
      return data.map((post: any) => ({
        ...post,
        id: String(post.id),
        userId: String(post.userId),
        createdAt: new Date(post.createdAt),
      }))
    },
    // Refetch when window is focused
    refetchOnWindowFocus: true,
    // Consider data fresh for 10 seconds
    staleTime: 10 * 1000,
  })
}

/**
 * Hook to send a post with optimistic update
 */
export function useSendPost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      userId,
      content,
      topic,
    }: {
      userId: string
      content: string
      topic: string | null
    }) => {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, content, topic }),
      })

      if (!res.ok) throw new Error('Failed to send post')
      return res.json()
    },
    onMutate: async ({ userId, content, topic }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['posts', topic] })

      // Snapshot previous value
      const previousPosts = queryClient.getQueryData(['posts', topic])

      // Optimistically add post
      const optimisticPost = {
        id: `temp-${Date.now()}`,
        userId,
        content,
        topic,
        createdAt: new Date(),
        likes: 0,
        commentsCount: 0,
        userName: '', // Will be filled by query
        userProfileImage: null,
      }

      queryClient.setQueryData(['posts', topic], (old: any = []) => [
        ...old,
        optimisticPost,
      ])

      return { previousPosts, optimisticPost }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousPosts) {
        queryClient.setQueryData(['posts', variables.topic], context.previousPosts)
      }
    },
    onSettled: (data, error, variables) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['posts', variables.topic] })
    },
  })
}
