import { apiSlice, type AppResponse } from './apiSlice';

export interface ChatUser {
    id: string;
    name: string;
    email: string;
    username: string;
    picture_url: string;
    pictureUrl: string;
    is_online: boolean;
    last_seen?: string;
    unread_count?: number;
}

export interface ChatMessage {
    id: string;
    sender_id: string;
    receiver_id: string | null;
    chat_group_id: string | null;
    msg_body: string;
    msg_image: string | null;
    read_at: string | null;
    created_at: string;
    updated_at: string;
    user: ChatUser;
}

export interface ChatGroup {
    id: string;
    name: string;
    image_url: string;
    cloudinary_public_id: string | null;
    created_by: string;
    users_count: number;
    created_at: string;
}

export const chatApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getUserFriends: builder.query<AppResponse<{ friends: ChatUser[]; unread_count: any[] }>, void>({
            query: () => 'talkzone/friends',
            providesTags: ['Chat'],
        }),
        getChatWithFriend: builder.query<Record<string, ChatMessage[]>, string>({
            query: (friendId) => `talkzone/friends/messages/${friendId}`,
            providesTags: (result, error, friendId) => [{ type: 'Chat', id: `direct-${friendId}` }, 'Chat'],
        }),
        sendPrivateMessage: builder.mutation<AppResponse<{ message: ChatMessage }>, { receiver_id: string; msg_body: string }>({
            query: (body) => ({
                url: 'talkzone/friends/messages',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Chat'],
        }),
        deletePrivateChat: builder.mutation<AppResponse<void>, { friendId: string; messageId?: string }>({
            query: ({ friendId, messageId }) => ({
                url: `talkzone/chats/${friendId}/delete${messageId ? `/${messageId}` : ''}`,
                method: 'POST',
            }),
            invalidatesTags: ['Chat'],
        }),
        listChatGroups: builder.query<ChatGroup[], void>({
            query: () => 'talkzone/group_chats',
            providesTags: ['Chat'],
        }),
        createChatGroup: builder.mutation<AppResponse<ChatGroup>, FormData>({
            query: (body) => ({
                url: 'talkzone/group_chats',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Chat'],
        }),
        joinChatGroup: builder.mutation<AppResponse<any>, { groupId: string; username_or_email: string }>({
            query: ({ groupId, ...body }) => ({
                url: `talkzone/group_chats/${groupId}/join`,
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Chat'],
        }),
        exitChatGroup: builder.mutation<AppResponse<any>, { groupId: string; user_id: string }>({
            query: ({ groupId, ...body }) => ({
                url: `talkzone/group_chats/${groupId}/exit`,
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Chat'],
        }),
        getGroupMessages: builder.query<AppResponse<{ messages: Record<string, ChatMessage[]>; users: ChatUser[] }>, string>({
            query: (groupId) => `talkzone/group_chats/${groupId}/messages`,
            providesTags: (result, error, groupId) => [{ type: 'Chat', id: `group-${groupId}` }, 'Chat'],
        }),
        sendGroupMessage: builder.mutation<AppResponse<{ message: ChatMessage }>, { groupId: string; msg_body: string }>({
            query: ({ groupId, ...body }) => ({
                url: `talkzone/group_chats/${groupId}/messages`,
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Chat'],
        }),
        deleteGroupMessage: builder.mutation<AppResponse<void>, { groupId: string; messageId?: string }>({
            query: ({ groupId, messageId }) => ({
                url: `talkzone/group_chats/${groupId}/messages/delete${messageId ? `/${messageId}` : ''}`,
                method: 'POST',
            }),
            invalidatesTags: ['Chat'],
        }),
        deleteChatGroup: builder.mutation<AppResponse<void>, string>({
            query: (groupId) => ({
                url: `talkzone/group_chats/${groupId}/delete`,
                method: 'POST',
            }),
            invalidatesTags: ['Chat'],
        }),
        getUsersToFollow: builder.query<{ data: ChatUser[]; current_page: number; last_page: number; total: number }, { page?: number; q?: string }>({
            query: (params) => ({
                url: 'talkzone/users/not_following',
                params,
            }),
            providesTags: ['Chat'],
        }),
        toggleFollowStatus: builder.mutation<AppResponse<string>, string>({
            query: (friendId) => ({
                url: `talkzone/users/${friendId}/follow/toggle`,
                method: 'POST',
            }),
            invalidatesTags: ['Chat'],
        }),
        markMessagesAsRead: builder.mutation<AppResponse<void>, string>({
            query: (friendId) => ({
                url: `talkzone/users/${friendId}/message/mark_as_read`,
                method: 'POST',
            }),
            invalidatesTags: ['Chat'],
        }),
    }),
});

export const {
    useGetUserFriendsQuery,
    useGetChatWithFriendQuery,
    useSendPrivateMessageMutation,
    useDeletePrivateChatMutation,
    useListChatGroupsQuery,
    useCreateChatGroupMutation,
    useJoinChatGroupMutation,
    useExitChatGroupMutation,
    useGetGroupMessagesQuery,
    useSendGroupMessageMutation,
    useDeleteGroupMessageMutation,
    useDeleteChatGroupMutation,
    useGetUsersToFollowQuery,
    useToggleFollowStatusMutation,
    useMarkMessagesAsReadMutation,
} = chatApi;
