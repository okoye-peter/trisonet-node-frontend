'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageSquare,
    Users,
    Search,
    Plus,
    UserPlus,
    UserMinus,
    Trash2,
    Send,
    LogOut,
    User,
    Sparkles,
    Loader2,
    CheckCheck,
    Image as ImageIcon,
    ArrowLeft
} from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { useAppDispatch } from '@/store/hooks';
import { io, Socket } from 'socket.io-client';
import { chatApi } from '@/store/api/chatApi';
import {
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
    useMarkMessagesAsReadMutation
} from '@/store/api/chatApi';

type TabType = 'inbox' | 'groups';

const AVATAR_COLORS = [
    'bg-violet-500', 'bg-blue-500', 'bg-emerald-500', 'bg-rose-500',
    'bg-amber-500', 'bg-indigo-500', 'bg-cyan-500', 'bg-pink-500'
];

function UserAvatar({ name, className }: { name: string; className?: string }) {
    const initials = name.split(' ').map(n => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
    const bg = AVATAR_COLORS[name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length];
    return (
        <div className={`flex shrink-0 items-center justify-center text-white font-bold text-xs rounded-xl ${bg} ${className ?? ''}`}>
            {initials}
        </div>
    );
}

export default function TalkzonePage() {
    const dispatch = useAppDispatch();
    const { user, token } = useAppSelector((state) => state.auth);
    const [activeTab, setActiveTab] = useState<TabType>('inbox');
    const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [messageInput, setMessageInput] = useState('');

    const [showCreateGroup, setShowCreateGroup] = useState(false);
    const [showDiscover, setShowDiscover] = useState(false);
    const [showAddMember, setShowAddMember] = useState(false);
    const [discoverSearch, setDiscoverSearch] = useState('');

    const [newGroupName, setNewGroupName] = useState('');
    const [selectedGroupImage, setSelectedGroupImage] = useState<File | null>(null);
    const [newGroupImagePreview, setNewGroupImagePreview] = useState<string | null>(null);
    const [addMemberInput, setAddMemberInput] = useState('');

    const messageEndRef = useRef<HTMLDivElement | null>(null);
    const socketRef = useRef<Socket | null>(null);

    const { data: friendsData, isLoading: loadingFriends } = useGetUserFriendsQuery(undefined, {
        skip: !token
    });

    const { data: groupsData, isLoading: loadingGroups } = useListChatGroupsQuery(undefined, {
        skip: !token
    });

    const { data: privateMessages } = useGetChatWithFriendQuery(selectedFriendId || '', {
        skip: !selectedFriendId
    });

    const { data: groupMessagesData } = useGetGroupMessagesQuery(selectedGroupId || '', {
        skip: !selectedGroupId
    });

    const [sendPrivateMessage, { isLoading: sendingPrivate }] = useSendPrivateMessageMutation();
    const [sendGroupMessage, { isLoading: sendingGroup }] = useSendGroupMessageMutation();
    const [deletePrivateChat] = useDeletePrivateChatMutation();
    const [deleteGroupMessage] = useDeleteGroupMessageMutation();
    const [deleteChatGroup] = useDeleteChatGroupMutation();
    const [createChatGroup, { isLoading: creatingGroup }] = useCreateChatGroupMutation();
    const [joinChatGroup, { isLoading: joiningGroup }] = useJoinChatGroupMutation();
    const [exitChatGroup, { isLoading: exitingGroup }] = useExitChatGroupMutation();
    const [toggleFollow] = useToggleFollowStatusMutation();
    const [markRead] = useMarkMessagesAsReadMutation();

    const [debouncedSearch, setDebouncedSearch] = useState('');

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(discoverSearch);
        }, 300);
        return () => clearTimeout(handler);
    }, [discoverSearch]);

    const { data: discoverUsers, isFetching: fetchingDiscover } = useGetUsersToFollowQuery(
        { page: 1, q: debouncedSearch },
        { skip: !showDiscover }
    );

    const scrollToBottom = () => {
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [privateMessages, groupMessagesData]);

    useEffect(() => {
        if (!token) return;

        const socketUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api').replace('/api', '');
        const socket = io(socketUrl, { auth: { token } });
        socketRef.current = socket;

        const handleInvalidate = () => {
            dispatch(chatApi.util.invalidateTags(['Chat']));
        };

        socket.on('UserSendMessagesEvent', handleInvalidate);
        socket.on('NewChatGroupMessageEvent', handleInvalidate);
        socket.on('user-has-join-group', handleInvalidate);
        socket.on('user-has-exit-group', handleInvalidate);
        socket.on('UserHasNewFollowerEvent', handleInvalidate);
        socket.on('UserHasBeenUnfollowedEvent', handleInvalidate);
        socket.on('deleted-chat-group', handleInvalidate);
        socket.on('group-created', handleInvalidate);
        socket.on('join-chat-group', handleInvalidate);
        socket.on('exit-chat-group', handleInvalidate);

        return () => {
            socket.off('UserSendMessagesEvent', handleInvalidate);
            socket.off('NewChatGroupMessageEvent', handleInvalidate);
            socket.off('user-has-join-group', handleInvalidate);
            socket.off('user-has-exit-group', handleInvalidate);
            socket.off('UserHasNewFollowerEvent', handleInvalidate);
            socket.off('UserHasBeenUnfollowedEvent', handleInvalidate);
            socket.off('deleted-chat-group', handleInvalidate);
            socket.off('group-created', handleInvalidate);
            socket.off('join-chat-group', handleInvalidate);
            socket.off('exit-chat-group', handleInvalidate);
            socket.disconnect();
        };
    }, [token, dispatch]);

    useEffect(() => {
        if (selectedFriendId) {
            markRead(selectedFriendId);
        }
    }, [selectedFriendId, markRead]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageInput.trim()) return;

        const text = messageInput.trim();
        setMessageInput('');

        try {
            if (activeTab === 'inbox' && selectedFriendId) {
                await sendPrivateMessage({ receiver_id: selectedFriendId, msg_body: text }).unwrap();
            } else if (activeTab === 'groups' && selectedGroupId) {
                await sendGroupMessage({ groupId: selectedGroupId, msg_body: text }).unwrap();
            }
            scrollToBottom();
        } catch (err) {
            console.error('Failed to send message:', err);
        }
    };

    const handleCreateGroupSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newGroupName.trim()) return;

        const formData = new FormData();
        formData.append('name', newGroupName);
        if (selectedGroupImage) formData.append('image_url', selectedGroupImage);

        try {
            await createChatGroup(formData).unwrap();
            setNewGroupName('');
            setSelectedGroupImage(null);
            setNewGroupImagePreview(null);
            setShowCreateGroup(false);
        } catch (err) {
            console.error('Failed to create group:', err);
        }
    };

    const handleAddMemberSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!addMemberInput.trim() || !selectedGroupId) return;

        try {
            await joinChatGroup({ groupId: selectedGroupId, username_or_email: addMemberInput.trim() }).unwrap();
            setAddMemberInput('');
            setShowAddMember(false);
        } catch (err) {
            console.error('Failed to add participant:', err);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedGroupImage(file);
            setNewGroupImagePreview(URL.createObjectURL(file));
        }
    };

    const friends = friendsData?.data?.friends || [];
    const groups = groupsData || [];

    const filteredFriends = friends.filter(f =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredGroups = groups.filter(g =>
        g.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredAddMemberFriends = addMemberInput.trim()
        ? friends.filter(f =>
            f.name.toLowerCase().includes(addMemberInput.toLowerCase()) ||
            f.username.toLowerCase().includes(addMemberInput.toLowerCase()) ||
            f.email?.toLowerCase().includes(addMemberInput.toLowerCase())
          )
        : [];

    const showAddMemberSuggestions = addMemberInput.trim() &&
        filteredAddMemberFriends.length > 0 &&
        !filteredAddMemberFriends.some(f => f.username === addMemberInput || f.email === addMemberInput);

    const selectedFriend = friends.find(f => f.id === selectedFriendId);
    const selectedGroup = groups.find(g => g.id === selectedGroupId);

    return (
        <div className="flex h-[calc(100vh-220px)] md:h-[calc(100vh-120px)] w-full overflow-hidden p-4 font-sans md:p-6 lg:gap-6">

            {/* Left Sidebar Column */}
            <div className={`flex flex-col rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm transition-all duration-300 ${
                selectedFriendId || selectedGroupId ? 'hidden md:flex md:w-80 lg:w-96' : 'w-full md:w-80 lg:w-96'
            }`}>

                {/* Header Actions */}
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Sparkles className="text-violet-500" size={18} />
                        <span className="text-lg font-black tracking-tight text-zinc-900">Talkzone</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowDiscover(true)}
                            className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500 hover:bg-violet-600 hover:text-white transition-all duration-300"
                            title="Discover new friends"
                        >
                            <UserPlus size={16} />
                        </button>
                        <button
                            onClick={() => setShowCreateGroup(true)}
                            className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500 hover:bg-emerald-600 hover:text-white transition-all duration-300"
                            title="Create new group"
                        >
                            <Plus size={16} />
                        </button>
                    </div>
                </div>

                {/* Local Search Input */}
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-2.5 text-zinc-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search conversations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-xl bg-zinc-50 py-2 pl-10 pr-4 text-sm text-zinc-700 border border-zinc-200 focus:outline-none focus:border-violet-500 transition-all duration-300"
                    />
                </div>

                {/* Tabs */}
                <div className="grid grid-cols-2 rounded-xl bg-zinc-100 p-1 mb-4 border border-zinc-200">
                    <button
                        onClick={() => { setActiveTab('inbox'); setSelectedGroupId(null); }}
                        className={`flex items-center justify-center gap-2 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-300 ${
                            activeTab === 'inbox' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'
                        }`}
                    >
                        <MessageSquare size={14} />
                        Inbox
                    </button>
                    <button
                        onClick={() => { setActiveTab('groups'); setSelectedFriendId(null); }}
                        className={`flex items-center justify-center gap-2 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-300 ${
                            activeTab === 'groups' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'
                        }`}
                    >
                        <Users size={14} />
                        Groups
                    </button>
                </div>

                {/* List Body */}
                <div className="flex-1 overflow-y-auto pr-1 space-y-1">
                    {activeTab === 'inbox' ? (
                        loadingFriends ? (
                            <div className="flex h-32 items-center justify-center">
                                <Loader2 className="animate-spin text-zinc-400" size={24} />
                            </div>
                        ) : filteredFriends.length === 0 ? (
                            <div className="flex h-32 flex-col items-center justify-center text-center text-xs text-zinc-400">
                                <User size={24} className="mb-2 text-zinc-300" />
                                No active direct conversations.
                            </div>
                        ) : (
                            filteredFriends.map((friend) => (
                                <button
                                    key={friend.id}
                                    onClick={() => setSelectedFriendId(friend.id)}
                                    className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all duration-300 border ${
                                        selectedFriendId === friend.id
                                            ? 'bg-violet-50 border-violet-200'
                                            : 'bg-transparent border-transparent hover:bg-zinc-50'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <UserAvatar name={friend.name} className="h-10 w-10" />
                                            {friend.is_online && (
                                                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white" />
                                            )}
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-bold text-zinc-900 leading-tight">{friend.name}</p>
                                            <p className="text-[11px] text-zinc-500 leading-none">@{friend.username}</p>
                                        </div>
                                    </div>
                                    {friend.unread_count && friend.unread_count > 0 ? (
                                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-violet-600 px-1 text-[10px] font-black text-white">
                                            {friend.unread_count}
                                        </span>
                                    ) : null}
                                </button>
                            ))
                        )
                    ) : (
                        loadingGroups ? (
                            <div className="flex h-32 items-center justify-center">
                                <Loader2 className="animate-spin text-zinc-400" size={24} />
                            </div>
                        ) : filteredGroups.length === 0 ? (
                            <div className="flex h-32 flex-col items-center justify-center text-center text-xs text-zinc-400">
                                <Users size={24} className="mb-2 text-zinc-300" />
                                No active group chats joined.
                            </div>
                        ) : (
                            filteredGroups.map((group) => (
                                <button
                                    key={group.id}
                                    onClick={() => setSelectedGroupId(group.id)}
                                    className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all duration-300 border ${
                                        selectedGroupId === group.id
                                            ? 'bg-emerald-50 border-emerald-200'
                                            : 'bg-transparent border-transparent hover:bg-zinc-50'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <UserAvatar name={group.name} className="h-10 w-10" />
                                        <div className="text-left">
                                            <p className="text-sm font-bold text-zinc-900 leading-tight">{group.name}</p>
                                            <p className="text-[11px] text-zinc-500 leading-none">
                                                {group.users_count} {group.users_count === 1 ? 'member' : 'members'}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            ))
                        )
                    )}
                </div>
            </div>

            {/* Right Chat Column */}
            <div className={`flex-1 flex-col rounded-3xl border border-zinc-200 bg-white shadow-sm transition-all duration-300 ${
                selectedFriendId || selectedGroupId ? 'flex' : 'hidden md:flex'
            }`}>

                {/* Direct Message Pane */}
                {selectedFriendId && selectedFriend ? (
                    <div className="flex flex-1 flex-col h-full overflow-hidden">

                        {/* Chat Header */}
                        <div className="flex items-center justify-between border-b border-zinc-100 p-4 bg-white">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setSelectedFriendId(null)}
                                    className="md:hidden flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-all duration-300"
                                    title="Back to conversations"
                                >
                                    <ArrowLeft size={16} />
                                </button>
                                <div className="relative">
                                    <UserAvatar name={selectedFriend.name} className="h-10 w-10" />
                                    {selectedFriend.is_online && (
                                        <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-zinc-900">{selectedFriend.name}</h3>
                                    <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">
                                        {selectedFriend.is_online ? 'online now' : 'offline'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={async () => {
                                        await toggleFollow(selectedFriend.id);
                                        setSelectedFriendId(null);
                                    }}
                                    className="flex h-8 px-3 gap-1.5 items-center justify-center rounded-xl bg-red-50 text-xs font-bold text-red-500 border border-red-100 hover:bg-red-500 hover:text-white transition-all duration-300"
                                >
                                    <UserMinus size={13} />
                                    Unfollow
                                </button>
                                <button
                                    onClick={() => deletePrivateChat({ friendId: selectedFriend.id })}
                                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-100 text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-all duration-300"
                                    title="Delete thread"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>

                        {/* Message History */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-zinc-50/50">
                            {privateMessages && Object.keys(privateMessages).length > 0 ? (
                                Object.keys(privateMessages).map((date) => (
                                    <div key={date} className="space-y-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="h-[1px] flex-1 bg-zinc-200" />
                                            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500 bg-white px-3 py-1 rounded-full border border-zinc-200">
                                                {date}
                                            </span>
                                            <div className="h-[1px] flex-1 bg-zinc-200" />
                                        </div>
                                        {(privateMessages?.[date] || []).map((msg) => {
                                            const isOutgoing = msg.sender_id === user?.id;
                                            return (
                                                <div
                                                    key={msg.id}
                                                    className={`group flex items-end gap-2.5 ${
                                                        isOutgoing ? 'justify-end' : 'justify-start'
                                                    }`}
                                                >
                                                    {!isOutgoing && (
                                                        <UserAvatar name={msg.user.name} className="h-7 w-7 mb-1 text-[10px]" />
                                                    )}

                                                    <div className="relative flex flex-col max-w-[70%]">
                                                        <div
                                                            className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed border ${
                                                                isOutgoing
                                                                    ? 'bg-linear-to-br from-violet-600 to-indigo-700 text-white rounded-br-none border-violet-500/20'
                                                                    : 'bg-white text-zinc-800 rounded-bl-none border-zinc-200'
                                                            }`}
                                                        >
                                                            {msg.msg_body}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 mt-1 justify-end px-1">
                                                            <span className="text-[9px] text-zinc-400">
                                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                            {isOutgoing && (
                                                                <CheckCheck size={11} className={msg.read_at ? 'text-violet-500' : 'text-zinc-400'} />
                                                            )}
                                                        </div>

                                                        {isOutgoing && (
                                                            <button
                                                                onClick={() => deletePrivateChat({ friendId: selectedFriend.id, messageId: msg.id })}
                                                                className="absolute -left-6 top-3 hidden group-hover:block text-zinc-400 hover:text-red-500 transition-colors"
                                                                title="Delete message"
                                                            >
                                                                <Trash2 size={12} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))
                            ) : (
                                <div className="flex h-full flex-col items-center justify-center text-center text-xs text-zinc-400">
                                    <MessageSquare size={32} className="mb-2 text-zinc-300" />
                                    No messages yet. Send a message to start conversation!
                                </div>
                            )}
                            <div ref={messageEndRef} />
                        </div>

                    </div>
                ) : selectedGroupId && selectedGroup ? (
                    <div className="flex flex-1 flex-col h-full overflow-hidden">

                        {/* Group Header */}
                        <div className="flex items-center justify-between border-b border-zinc-100 p-4 bg-white">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setSelectedGroupId(null)}
                                    className="md:hidden flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-all duration-300"
                                    title="Back to groups"
                                >
                                    <ArrowLeft size={16} />
                                </button>
                                <UserAvatar name={selectedGroup.name} className="h-10 w-10" />
                                <div>
                                    <h3 className="text-sm font-black text-zinc-900">{selectedGroup.name}</h3>
                                    <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">
                                        {selectedGroup.users_count} {selectedGroup.users_count === 1 ? 'member' : 'members'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setShowAddMember(true)}
                                    className="flex h-8 px-3 gap-1.5 items-center justify-center rounded-xl bg-emerald-50 text-xs font-bold text-emerald-600 border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all duration-300"
                                >
                                    <UserPlus size={13} />
                                    Add Member
                                </button>
                                {selectedGroup.created_by === user?.id ? (
                                    <button
                                        onClick={async () => {
                                            await deleteChatGroup(selectedGroup.id);
                                            setSelectedGroupId(null);
                                        }}
                                        className="flex h-8 px-3 gap-1.5 items-center justify-center rounded-xl bg-red-50 text-xs font-bold text-red-500 border border-red-100 hover:bg-red-500 hover:text-white transition-all duration-300"
                                    >
                                        <Trash2 size={13} />
                                        Delete Group
                                    </button>
                                ) : (
                                    <button
                                        onClick={async () => {
                                            await exitChatGroup({ groupId: selectedGroup.id, user_id: user?.id || '' });
                                            setSelectedGroupId(null);
                                        }}
                                        className="flex h-8 px-3 gap-1.5 items-center justify-center rounded-xl bg-red-50 text-xs font-bold text-red-500 border border-red-100 hover:bg-red-500 hover:text-white transition-all duration-300"
                                    >
                                        <LogOut size={13} />
                                        Exit Group
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Group Message Stream */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-zinc-50/50">
                            {groupMessagesData?.data?.messages && Object.keys(groupMessagesData.data.messages).length > 0 ? (
                                Object.keys(groupMessagesData.data.messages).map((date) => (
                                    <div key={date} className="space-y-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="h-[1px] flex-1 bg-zinc-200" />
                                            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500 bg-white px-3 py-1 rounded-full border border-zinc-200">
                                                {date}
                                            </span>
                                            <div className="h-[1px] flex-1 bg-zinc-200" />
                                        </div>
                                        {(groupMessagesData?.data?.messages?.[date] || []).map((msg) => {
                                            const isOutgoing = msg.sender_id === user?.id;
                                            return (
                                                <div
                                                    key={msg.id}
                                                    className={`group flex items-end gap-2.5 ${
                                                        isOutgoing ? 'justify-end' : 'justify-start'
                                                    }`}
                                                >
                                                    {!isOutgoing && (
                                                        <UserAvatar name={msg.user.name} className="h-7 w-7 mb-1 text-[10px]" />
                                                    )}

                                                    <div className="relative flex flex-col max-w-[70%]">
                                                        {!isOutgoing && (
                                                            <span className="text-[10px] font-bold text-violet-600 mb-0.5 px-1 leading-none">
                                                                {msg.user.name}
                                                            </span>
                                                        )}
                                                        <div
                                                            className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed border ${
                                                                isOutgoing
                                                                    ? 'bg-linear-to-br from-violet-600 to-indigo-700 text-white rounded-br-none border-violet-500/20'
                                                                    : 'bg-white text-zinc-800 rounded-bl-none border-zinc-200'
                                                            }`}
                                                        >
                                                            {msg.msg_body}
                                                        </div>
                                                        <div className="flex items-center justify-end gap-1 mt-1 px-1">
                                                            <span className="text-[9px] text-zinc-400">
                                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>

                                                        {isOutgoing && (
                                                            <button
                                                                onClick={() => deleteGroupMessage({ groupId: selectedGroup.id, messageId: msg.id })}
                                                                className="absolute -left-6 top-3 hidden group-hover:block text-zinc-400 hover:text-red-500 transition-colors"
                                                                title="Delete message"
                                                            >
                                                                <Trash2 size={12} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))
                            ) : (
                                <div className="flex h-full flex-col items-center justify-center text-center text-xs text-zinc-400">
                                    <MessageSquare size={32} className="mb-2 text-zinc-300" />
                                    No group messages yet. Send a message to start conversation!
                                </div>
                            )}
                            <div ref={messageEndRef} />
                        </div>

                    </div>
                ) : (
                    <div className="flex flex-1 flex-col items-center justify-center p-8 text-center text-zinc-400">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                            className="flex flex-col items-center"
                        >
                            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-zinc-100 border border-zinc-200 shadow-sm">
                                <MessageSquare size={36} className="text-zinc-400" />
                            </div>
                            <h2 className="text-xl font-black text-zinc-900 tracking-tight">Talkzone Communications</h2>
                            <p className="mt-2 max-w-sm text-xs font-semibold text-zinc-500 leading-relaxed antialiased">
                                Experience ultra-private secure chat systems. Search contact channels or discover new peers to begin real-time end-to-end messaging.
                            </p>
                        </motion.div>
                    </div>
                )}

                {/* Message Input Footer */}
                {(selectedFriendId || selectedGroupId) && (
                    <form
                        onSubmit={handleSendMessage}
                        className="border-t border-zinc-100 p-4 bg-white flex items-center gap-3"
                    >
                        <input
                            type="text"
                            placeholder="Type a message..."
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            className="flex-1 rounded-2xl bg-zinc-50 py-3 px-5 text-sm text-zinc-800 border border-zinc-200 focus:outline-none focus:border-violet-500 transition-all duration-300"
                        />
                        <button
                            type="submit"
                            disabled={!messageInput.trim() || sendingPrivate || sendingGroup}
                            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-600 text-white hover:bg-violet-500 disabled:opacity-40 disabled:hover:bg-violet-600 transition-all duration-300"
                        >
                            <Send size={16} />
                        </button>
                    </form>
                )}

            </div>

            {/* CREATE GROUP MODAL */}
            <AnimatePresence>
                {showCreateGroup && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl"
                        >
                            <h3 className="text-lg font-black text-zinc-900 mb-4">Create Chat Group</h3>
                            <form onSubmit={handleCreateGroupSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Group Image</label>
                                    <div className="flex items-center gap-4">
                                        <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 flex items-center justify-center">
                                            {newGroupImagePreview ? (
                                                <img src={newGroupImagePreview} alt="Preview" className="h-full w-full object-cover" />
                                            ) : (
                                                <ImageIcon className="text-zinc-400" size={24} />
                                            )}
                                        </div>
                                        <label className="flex h-10 px-4 items-center justify-center rounded-xl bg-zinc-100 border border-zinc-200 text-xs font-bold text-zinc-600 hover:bg-zinc-200 cursor-pointer transition-all duration-300">
                                            Select File
                                            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Group Name</label>
                                    <input
                                        type="text"
                                        placeholder="Enter group name..."
                                        value={newGroupName}
                                        onChange={(e) => setNewGroupName(e.target.value)}
                                        className="w-full rounded-xl bg-zinc-50 p-3 text-sm text-zinc-800 border border-zinc-200 focus:outline-none focus:border-violet-500 transition-all duration-300"
                                        required
                                    />
                                </div>

                                <div className="flex justify-end gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateGroup(false)}
                                        className="px-4 py-2.5 rounded-xl bg-zinc-100 border border-zinc-200 text-xs font-bold text-zinc-500 hover:bg-zinc-200 transition-all duration-300"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={creatingGroup}
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-500 transition-all duration-300"
                                    >
                                        {creatingGroup && <Loader2 className="animate-spin" size={12} />}
                                        Create Group
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* DISCOVER USERS MODAL */}
            <AnimatePresence>
                {showDiscover && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full max-w-lg rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl flex flex-col max-h-[80vh]"
                        >
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-lg font-black text-zinc-900">Discover Users</h3>
                                <button
                                    onClick={() => setShowDiscover(false)}
                                    className="px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-xs font-bold text-zinc-500 hover:text-zinc-700 transition-all duration-300"
                                >
                                    Close
                                </button>
                            </div>

                            <div className="relative mb-4">
                                {fetchingDiscover ? (
                                    <Loader2 className="absolute left-3 top-2.5 text-violet-500 animate-spin" size={16} />
                                ) : (
                                    <Search className="absolute left-3 top-2.5 text-zinc-400" size={16} />
                                )}
                                <input
                                    type="text"
                                    placeholder="Search users by name or username..."
                                    value={discoverSearch}
                                    onChange={(e) => setDiscoverSearch(e.target.value)}
                                    className="w-full rounded-xl bg-zinc-50 py-2.5 pl-10 pr-4 text-sm text-zinc-800 border border-zinc-200 focus:outline-none focus:border-violet-500 transition-all duration-300"
                                />
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                                {discoverUsers?.data && discoverUsers.data.length > 0 ? (
                                    discoverUsers.data.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 border border-zinc-100"
                                        >
                                            <div className="flex items-center gap-3">
                                                <UserAvatar name={item.name} className="h-10 w-10" />
                                                <div>
                                                    <p className="text-sm font-bold text-zinc-900 leading-tight">{item.name}</p>
                                                    <p className="text-[11px] text-zinc-500 leading-none">@{item.username}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={async () => {
                                                    await toggleFollow(item.id);
                                                    dispatch(chatApi.util.invalidateTags(['Chat']));
                                                }}
                                                className="flex h-8 px-4 items-center justify-center rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-bold text-white transition-all duration-300"
                                            >
                                                Follow
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex h-32 flex-col items-center justify-center text-center text-xs text-zinc-400">
                                        <User className="mb-2 text-zinc-300" size={24} />
                                        No new users matching query found to follow.
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ADD MEMBER MODAL */}
            <AnimatePresence>
                {showAddMember && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full max-w-sm rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl"
                        >
                            <h3 className="text-lg font-black text-zinc-900 mb-2">Add Member to Group</h3>
                            <p className="text-xs font-medium text-zinc-500 mb-4">Enter a friend&apos;s exact username or email address to add them to this chat channel.</p>

                            <form onSubmit={handleAddMemberSubmit} className="space-y-4">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Username or email..."
                                        value={addMemberInput}
                                        onChange={(e) => setAddMemberInput(e.target.value)}
                                        className="w-full rounded-xl bg-zinc-50 p-3 text-sm text-zinc-800 border border-zinc-200 focus:outline-none focus:border-violet-500 transition-all duration-300"
                                        required
                                        autoFocus
                                    />
                                    {showAddMemberSuggestions && (
                                        <div className="absolute left-0 right-0 mt-1 max-h-40 overflow-y-auto rounded-xl border border-zinc-200 bg-white p-1 shadow-lg z-50">
                                            {filteredAddMemberFriends.map((friend) => (
                                                <button
                                                    key={friend.id}
                                                    type="button"
                                                    onClick={() => setAddMemberInput(friend.username)}
                                                    className="w-full flex items-center gap-2 p-2 rounded-lg text-left hover:bg-zinc-50 transition-colors"
                                                >
                                                    <UserAvatar name={friend.name} className="h-6 w-6 text-[9px]" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-bold text-zinc-900 leading-tight truncate">{friend.name}</p>
                                                        <p className="text-[10px] text-zinc-500 leading-none truncate">@{friend.username}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddMember(false)}
                                        className="px-4 py-2.5 rounded-xl bg-zinc-100 border border-zinc-200 text-xs font-bold text-zinc-500 hover:bg-zinc-200 transition-all duration-300"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={joiningGroup}
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-500 transition-all duration-300"
                                    >
                                        {joiningGroup && <Loader2 className="animate-spin" size={12} />}
                                        Add Member
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
}
