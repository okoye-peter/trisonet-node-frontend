'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Image as ImageIcon,
    Heart,
    MessageCircle,
    Repeat2,
    Eye,
    X,
    Send,
    Pencil,
    Loader2,
    Sparkles,
} from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { toast } from 'sonner';
import {
    useGetPostsQuery,
    useCreatePostMutation,
    useToggleLikeMutation,
    useAddCommentMutation,
    useRetweetPostMutation,
    type Post,
} from '@/store/api/gistsZoneApi';

// ─── Avatar with initials ─────────────────────────────────────────────────────

const AVATAR_COLORS = [
    'bg-violet-500', 'bg-blue-500', 'bg-emerald-500',
    'bg-rose-500', 'bg-amber-500', 'bg-indigo-500',
    'bg-cyan-500', 'bg-pink-500',
];

function UserAvatar({ name, className }: { name: string; className?: string }) {
    const initials = name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
    const bg = AVATAR_COLORS[name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length];
    return (
        <div className={`flex shrink-0 items-center justify-center text-white font-bold text-xs rounded-xl ${bg} ${className}`}>
            {initials}
        </div>
    );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function RetweetPreview({ post }: { post: Post }) {
    if (!post.retweetable) return null;
    const rt = post.retweetable;
    return (
        <div className="mt-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-3">
            <div className="flex items-center gap-2 mb-1.5">
                <UserAvatar name={rt.user.name} className="h-6 w-6" />
                <span className="text-xs font-bold text-zinc-800">{rt.user.name}</span>
                <span className="text-[11px] text-zinc-400">@{rt.user.username}</span>
            </div>
            <p className="text-sm text-zinc-700 leading-relaxed">
                {rt.status ?? rt.retweetMsg}
            </p>
            {rt.img && (
                <img
                    src={rt.img}
                    alt="retweet media"
                    className="mt-2 max-h-48 w-full rounded-xl object-cover border border-zinc-200"
                />
            )}
        </div>
    );
}

function PostCard({ post }: { post: Post }) {
    const [commentText, setCommentText] = useState('');
    const [quoteText, setQuoteText] = useState('');
    const [showCommentModal, setShowCommentModal] = useState(false);
    const [showQuoteModal, setShowQuoteModal] = useState(false);
    const [showRetweetMenu, setShowRetweetMenu] = useState(false);

    const [toggleLike, { isLoading: liking }] = useToggleLikeMutation();
    const [addComment, { isLoading: commenting }] = useAddCommentMutation();
    const [retweetPost, { isLoading: retweeting }] = useRetweetPostMutation();

    const handleLike = async () => {
        try {
            await toggleLike({ id: post.id, type: post.type }).unwrap();
        } catch {
            toast.error('Failed to like post');
        }
    };

    const handleComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        try {
            await addComment({ id: post.id, type: post.type, comment: commentText }).unwrap();
            toast.success('Comment added');
            setCommentText('');
            setShowCommentModal(false);
        } catch {
            toast.error('Failed to add comment');
        }
    };

    const handleDirectRetweet = async () => {
        setShowRetweetMenu(false);
        try {
            await retweetPost({ id: post.id, type: post.type }).unwrap();
            toast.success('Reposted');
        } catch {
            toast.error('Failed to repost');
        }
    };

    const handleQuoteRetweet = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await retweetPost({ id: post.id, type: post.type, retweetMsg: quoteText }).unwrap();
            toast.success('Quote reposted');
            setQuoteText('');
            setShowQuoteModal(false);
        } catch {
            toast.error('Failed to quote repost');
        }
    };

    return (
        <>
            <div className="rounded-3xl border border-zinc-100 bg-white shadow-sm p-5 hover:shadow-md transition-all duration-300">
                {/* Post Header */}
                <div className="flex items-start gap-3 mb-3">
                    <UserAvatar name={post.user.name} className="h-10 w-10" />
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-black text-zinc-900">{post.user.name}</span>
                            <span className="text-[11px] text-zinc-400">@{post.user.username}</span>
                            <span className="text-[11px] text-zinc-400">· {post.formattedDate}</span>
                        </div>
                        {post.type === 'retweet' && (
                            <span className="text-[10px] font-bold uppercase tracking-widest text-violet-500 flex items-center gap-1 mt-0.5">
                                <Repeat2 size={11} /> Reposted
                            </span>
                        )}
                    </div>
                </div>

                <p className="text-sm text-zinc-800 leading-relaxed mb-3 whitespace-pre-wrap">
                    {post.status}
                </p>

                {post.img && (
                    <img
                        src={post.img}
                        alt="post media"
                        className="w-full max-h-72 rounded-2xl object-cover border border-zinc-100 mb-3"
                    />
                )}

                {post.type === 'retweet' && <RetweetPreview post={post} />}

                {/* Reactions */}
                <div className="flex items-center gap-1 mt-4 pt-3 border-t border-zinc-100">
                    <button
                        onClick={() => setShowCommentModal(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-zinc-400 hover:text-sky-500 hover:bg-sky-50 transition-all text-xs font-bold"
                    >
                        <MessageCircle size={15} />
                        <span>{post.totalComments}</span>
                    </button>

                    <div className="relative">
                        <button
                            onClick={() => setShowRetweetMenu(!showRetweetMenu)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-zinc-400 hover:text-emerald-500 hover:bg-emerald-50 transition-all text-xs font-bold"
                        >
                            {retweeting ? <Loader2 size={15} className="animate-spin" /> : <Repeat2 size={15} />}
                            <span>{post.totalRetweets}</span>
                        </button>
                        <AnimatePresence>
                            {showRetweetMenu && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                    className="absolute left-0 top-full mt-1 z-20 min-w-[160px] rounded-2xl border border-zinc-200 bg-white shadow-lg overflow-hidden"
                                >
                                    <button
                                        onClick={handleDirectRetweet}
                                        className="flex w-full items-center gap-2 px-4 py-3 text-xs font-bold text-zinc-600 hover:bg-zinc-50 hover:text-emerald-600 transition-all"
                                    >
                                        <Repeat2 size={14} /> Repost
                                    </button>
                                    <button
                                        onClick={() => { setShowRetweetMenu(false); setShowQuoteModal(true); }}
                                        className="flex w-full items-center gap-2 px-4 py-3 text-xs font-bold text-zinc-600 hover:bg-zinc-50 hover:text-violet-600 transition-all"
                                    >
                                        <Pencil size={14} /> Quote Post
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <button
                        onClick={handleLike}
                        disabled={liking}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all text-xs font-bold ${
                            post.isLiked
                                ? 'text-rose-500 hover:bg-rose-50'
                                : 'text-zinc-400 hover:text-rose-500 hover:bg-rose-50'
                        }`}
                    >
                        <Heart size={15} fill={post.isLiked ? 'currentColor' : 'none'} />
                        <span>{post.totalLikes}</span>
                    </button>

                    <a
                        href={`/gists-zone/${post.id}?type=${post.type}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-all text-xs font-bold ml-auto"
                    >
                        <Eye size={15} />
                    </a>
                </div>
            </div>

            {/* Comment Modal */}
            <AnimatePresence>
                {showCommentModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 16 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 16 }}
                            className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-base font-black text-zinc-900">Add a comment</h3>
                                <button
                                    onClick={() => setShowCommentModal(false)}
                                    className="p-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-500 transition-all"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                            <div className="mb-4 p-3 rounded-2xl bg-zinc-50 border border-zinc-100">
                                <div className="flex items-center gap-2 mb-1">
                                    <UserAvatar name={post.user.name} className="h-5 w-5 text-[10px]" />
                                    <span className="text-xs font-bold text-zinc-700">{post.user.name}</span>
                                </div>
                                <p className="text-xs text-zinc-400 line-clamp-2">{post.status}</p>
                            </div>
                            <form onSubmit={handleComment} className="space-y-3">
                                <textarea
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    placeholder="Write your comment..."
                                    rows={3}
                                    className="w-full rounded-2xl bg-zinc-50 p-3 text-sm text-zinc-800 border border-zinc-200 focus:outline-none focus:border-violet-400 resize-none transition-all"
                                    required
                                />
                                <div className="flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowCommentModal(false)}
                                        className="px-4 py-2 rounded-xl bg-zinc-100 text-xs font-bold text-zinc-500 hover:bg-zinc-200 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={commenting || !commentText.trim()}
                                        className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-bold text-white disabled:opacity-50 transition-all"
                                    >
                                        {commenting && <Loader2 size={12} className="animate-spin" />}
                                        Comment
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Quote Modal */}
            <AnimatePresence>
                {showQuoteModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 16 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 16 }}
                            className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-base font-black text-zinc-900">Quote Post</h3>
                                <button
                                    onClick={() => setShowQuoteModal(false)}
                                    className="p-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-500 transition-all"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                            <form onSubmit={handleQuoteRetweet} className="space-y-3">
                                <textarea
                                    value={quoteText}
                                    onChange={(e) => setQuoteText(e.target.value)}
                                    placeholder="Add your thoughts..."
                                    rows={3}
                                    className="w-full rounded-2xl bg-zinc-50 p-3 text-sm text-zinc-800 border border-zinc-200 focus:outline-none focus:border-violet-400 resize-none transition-all"
                                />
                                <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-100">
                                    <div className="flex items-center gap-2 mb-1">
                                        <UserAvatar name={post.user.name} className="h-5 w-5 text-[10px]" />
                                        <span className="text-xs font-bold text-zinc-700">{post.user.name}</span>
                                        <span className="text-[11px] text-zinc-400">@{post.user.username}</span>
                                    </div>
                                    <p className="text-xs text-zinc-500 line-clamp-2">{post.status}</p>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowQuoteModal(false)}
                                        className="px-4 py-2 rounded-xl bg-zinc-100 text-xs font-bold text-zinc-500 hover:bg-zinc-200 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={retweeting}
                                        className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white disabled:opacity-50 transition-all"
                                    >
                                        {retweeting && <Loader2 size={12} className="animate-spin" />}
                                        <Repeat2 size={12} /> Repost
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function GistsZonePage() {
    const { user } = useAppSelector((state) => state.auth);

    const [page, setPage] = useState(1);
    const [allPosts, setAllPosts] = useState<Post[]>([]);
    const [hasMore, setHasMore] = useState(true);

    const [postText, setPostText] = useState('');
    const [postImage, setPostImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const { data: postsResponse, isFetching } = useGetPostsQuery({ page });
    const [createPost, { isLoading: creating }] = useCreatePostMutation();

    useEffect(() => {
        const posts = postsResponse?.data?.data;
        if (!posts) return;
        setAllPosts((prev) => {
            const existingIds = new Set(prev.map((p) => p.id));
            return [...prev, ...posts.filter((p) => !existingIds.has(p.id))];
        });
        const meta = postsResponse?.data;
        if (meta && meta.current_page >= meta.last_page) setHasMore(false);
    }, [postsResponse]);

    const observerRef = useRef<IntersectionObserver | null>(null);
    const lastPostRef = useCallback(
        (node: HTMLDivElement | null) => {
            if (isFetching) return;
            if (observerRef.current) observerRef.current.disconnect();
            observerRef.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasMore) setPage((prev) => prev + 1);
            });
            if (node) observerRef.current.observe(node);
        },
        [isFetching, hasMore]
    );

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) { setPostImage(file); setImagePreview(URL.createObjectURL(file)); }
    };

    const handleCreatePost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!postText.trim()) return;
        const formData = new FormData();
        formData.append('status', postText.trim());
        if (postImage) formData.append('image', postImage);
        try {
            await createPost(formData).unwrap();
            setPostText(''); setPostImage(null); setImagePreview(null);
            setAllPosts([]); setPage(1); setHasMore(true);
            toast.success('Post published');
        } catch {
            toast.error('Failed to publish post');
        }
    };

    return (
        <div className="py-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto space-y-5">

                <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="text-violet-500" size={18} />
                    <h1 className="text-xl font-black tracking-tight text-zinc-900">Gists Zone</h1>
                </div>

                {/* Create Post */}
                <div className="rounded-3xl border border-zinc-100 bg-white shadow-sm p-5">
                    <form onSubmit={handleCreatePost} className="space-y-3">
                        <div className="flex gap-3">
                            <UserAvatar name={user?.name ?? 'U'} className="h-10 w-10" />
                            <textarea
                                value={postText}
                                onChange={(e) => setPostText(e.target.value)}
                                placeholder="What's happening?"
                                rows={3}
                                className="flex-1 rounded-2xl bg-zinc-50 p-3 text-sm text-zinc-800 border border-zinc-200 focus:outline-none focus:border-violet-400 resize-none transition-all placeholder:text-zinc-400 placeholder:font-semibold"
                            />
                        </div>

                        {imagePreview && (
                            <div className="relative ml-13">
                                <img src={imagePreview} alt="preview" className="max-h-48 rounded-2xl object-cover border border-zinc-100" />
                                <button
                                    type="button"
                                    onClick={() => { setPostImage(null); setImagePreview(null); }}
                                    className="absolute top-2 right-2 p-1 rounded-full bg-white/80 text-zinc-500 hover:text-zinc-900 hover:bg-white transition-all shadow"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        )}

                        <div className="flex items-center justify-between">
                            <label className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl bg-zinc-100 text-zinc-400 hover:text-violet-500 hover:bg-violet-50 transition-all">
                                <ImageIcon size={16} />
                                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                            </label>
                            <button
                                type="submit"
                                disabled={creating || !postText.trim()}
                                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-black text-white disabled:opacity-50 transition-all uppercase tracking-wider"
                            >
                                {creating ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                                Post
                            </button>
                        </div>
                    </form>
                </div>

                {/* Feed */}
                <div className="space-y-4">
                    {allPosts.map((post, index) => {
                        const isLast = index === allPosts.length - 1;
                        return (
                            <div key={post.id} ref={isLast ? lastPostRef : undefined}>
                                <PostCard post={post} />
                            </div>
                        );
                    })}

                    {isFetching && (
                        <div className="flex items-center justify-center py-6">
                            <Loader2 className="animate-spin text-zinc-300" size={24} />
                        </div>
                    )}

                    {!hasMore && allPosts.length > 0 && (
                        <p className="text-center text-xs text-zinc-400 font-bold uppercase tracking-widest py-6">
                            You&apos;re all caught up
                        </p>
                    )}

                    {!isFetching && allPosts.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <Sparkles size={32} className="mb-3 text-zinc-300" />
                            <p className="text-sm font-bold text-zinc-500">No posts yet.</p>
                            <p className="text-xs text-zinc-400 mt-1">Be the first to share something.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
