'use client';

import { useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Heart,
    MessageCircle,
    Repeat2,
    Loader2,
    Send,
    Pencil,
    X,
} from 'lucide-react';
import { toast } from 'sonner';
import {
    useGetPostQuery,
    useToggleLikeMutation,
    useAddCommentMutation,
    useRetweetPostMutation,
    type Post,
    type PostComment,
} from '@/store/api/gistsZoneApi';

const AVATAR_COLORS = [
    'bg-violet-500', 'bg-blue-500', 'bg-emerald-500',
    'bg-rose-500', 'bg-amber-500', 'bg-indigo-500',
    'bg-cyan-500', 'bg-pink-500',
];

function UserAvatar({ name, className }: { name: string; className?: string }) {
    const initials = name.split(' ').map(n => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
    const bg = AVATAR_COLORS[name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length];
    return (
        <div className={`flex shrink-0 items-center justify-center text-white font-bold rounded-xl ${bg} ${className ?? ''}`}>
            {initials}
        </div>
    );
}

function RetweetPreview({ post }: { post: Post }) {
    if (!post.retweetable) return null;
    const rt = post.retweetable;
    return (
        <div className="mt-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-3">
            <div className="flex items-center gap-2 mb-1.5">
                <UserAvatar name={rt.user.name} className="h-6 w-6 text-[9px]" />
                <span className="text-xs font-bold text-zinc-800">{rt.user.name}</span>
                <span className="text-[11px] text-zinc-400">@{rt.user.username}</span>
            </div>
            {(rt.status || rt.retweetMsg) && (
                <p className="text-sm text-zinc-700 leading-relaxed">{rt.status ?? rt.retweetMsg}</p>
            )}
            {rt.img && (
                <img
                    src={rt.img}
                    alt="media"
                    className="mt-2 max-h-48 w-full rounded-xl object-cover border border-zinc-200"
                />
            )}
        </div>
    );
}

function CommentItem({ comment }: { comment: PostComment }) {
    return (
        <div className="flex gap-3 py-3 border-b border-zinc-100 last:border-0">
            <UserAvatar name={comment.user.name} className="h-8 w-8 text-[10px] mt-0.5" />
            <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-sm font-bold text-zinc-900">{comment.user.name}</span>
                    <span className="text-[11px] text-zinc-400">@{comment.user.username}</span>
                    <span className="text-[10px] text-zinc-400 ml-auto">{comment.formattedDate}</span>
                </div>
                <p className="text-sm text-zinc-700 leading-relaxed">{comment.comment}</p>
            </div>
        </div>
    );
}

export default function GistDetailPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();

    const id = params.id as string;
    const type = (searchParams.get('type') ?? 'tweet') as 'tweet' | 'retweet';

    const { data, isLoading, isError } = useGetPostQuery({ id, type });

    const [toggleLike, { isLoading: liking }] = useToggleLikeMutation();
    const [addComment, { isLoading: commenting }] = useAddCommentMutation();
    const [retweetPost, { isLoading: retweeting }] = useRetweetPostMutation();

    const [commentText, setCommentText] = useState('');
    const [showQuoteModal, setShowQuoteModal] = useState(false);
    const [showRetweetMenu, setShowRetweetMenu] = useState(false);
    const [quoteText, setQuoteText] = useState('');

    const post = data?.data?.post;
    const comments = data?.data?.comments ?? [];

    const handleLike = async () => {
        if (!post) return;
        try {
            await toggleLike({ id: post.id, type: post.type }).unwrap();
        } catch {
            toast.error('Failed to like post');
        }
    };

    const handleComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!post || !commentText.trim()) return;
        try {
            await addComment({ id: post.id, type: post.type, comment: commentText }).unwrap();
            setCommentText('');
            toast.success('Comment added');
        } catch {
            toast.error('Failed to add comment');
        }
    };

    const handleRepost = async () => {
        if (!post) return;
        try {
            await retweetPost({ id: post.id, type: post.type }).unwrap();
            setShowRetweetMenu(false);
            toast.success('Reposted');
        } catch {
            toast.error('Failed to repost');
        }
    };

    const handleQuote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!post || !quoteText.trim()) return;
        try {
            await retweetPost({ id: post.id, type: post.type, retweetMsg: quoteText }).unwrap();
            setQuoteText('');
            setShowQuoteModal(false);
            toast.success('Quote posted');
        } catch {
            toast.error('Failed to quote post');
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="animate-spin text-violet-500" size={32} />
            </div>
        );
    }

    if (isError || !post) {
        return (
            <div className="flex h-64 flex-col items-center justify-center text-center text-zinc-400 gap-3">
                <p className="text-sm font-semibold">Post not found.</p>
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-100 text-xs font-bold text-zinc-600 hover:bg-zinc-200 transition-all"
                >
                    <ArrowLeft size={14} /> Go back
                </button>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-2xl px-4 py-6">

            {/* Back nav */}
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 mb-5 text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors"
            >
                <ArrowLeft size={16} />
                Back
            </button>

            {/* Post card */}
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm mb-4"
            >
                {/* Author */}
                <div className="flex items-center gap-3 mb-4">
                    <UserAvatar name={post.user.name} className="h-11 w-11 text-sm" />
                    <div>
                        <p className="text-sm font-black text-zinc-900">{post.user.name}</p>
                        <p className="text-[11px] text-zinc-400">@{post.user.username} · {post.formattedDate}</p>
                    </div>
                    {post.type === 'retweet' && (
                        <span className="ml-auto flex items-center gap-1 text-[10px] font-bold text-violet-500 uppercase tracking-wider">
                            <Repeat2 size={12} /> Repost
                        </span>
                    )}
                </div>

                {/* Body */}
                {post.status && (
                    <p className="text-base text-zinc-800 leading-relaxed mb-3">{post.status}</p>
                )}
                {post.img && (
                    <img
                        src={post.img}
                        alt="post media"
                        className="w-full max-h-96 rounded-2xl object-cover border border-zinc-100 mb-3"
                    />
                )}
                {post.retweetable && <RetweetPreview post={post} />}

                {/* Stats row */}
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-zinc-100 text-xs text-zinc-500 font-semibold">
                    <span>{post.totalComments} comments</span>
                    <span>{post.totalRetweets} reposts</span>
                    <span>{post.totalLikes} likes</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 mt-3">
                    {/* Comment */}
                    <button
                        onClick={() => document.getElementById('comment-input')?.focus()}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-zinc-400 hover:text-violet-600 hover:bg-violet-50 transition-all text-xs font-bold"
                    >
                        <MessageCircle size={15} />
                        <span>{post.totalComments}</span>
                    </button>

                    {/* Repost menu */}
                    <div className="relative">
                        <button
                            onClick={() => setShowRetweetMenu(v => !v)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all text-xs font-bold"
                        >
                            <Repeat2 size={15} />
                            <span>{post.totalRetweets}</span>
                        </button>
                        {showRetweetMenu && (
                            <div className="absolute left-0 top-9 z-20 w-40 rounded-2xl border border-zinc-200 bg-white shadow-xl overflow-hidden">
                                <button
                                    onClick={handleRepost}
                                    disabled={retweeting}
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
                            </div>
                        )}
                    </div>

                    {/* Like */}
                    <button
                        onClick={handleLike}
                        disabled={liking}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all text-xs font-bold ${
                            post.isLiked ? 'text-rose-500 hover:bg-rose-50' : 'text-zinc-400 hover:text-rose-500 hover:bg-rose-50'
                        }`}
                    >
                        <Heart size={15} fill={post.isLiked ? 'currentColor' : 'none'} />
                        <span>{post.totalLikes}</span>
                    </button>
                </div>
            </motion.div>

            {/* Add comment */}
            <div className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm mb-4">
                <form onSubmit={handleComment} className="flex gap-3">
                    <textarea
                        id="comment-input"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Write a comment..."
                        rows={2}
                        className="flex-1 rounded-2xl bg-zinc-50 px-4 py-2.5 text-sm text-zinc-800 border border-zinc-200 focus:outline-none focus:border-violet-400 resize-none transition-all"
                    />
                    <button
                        type="submit"
                        disabled={!commentText.trim() || commenting}
                        className="flex h-10 w-10 shrink-0 items-center justify-center self-end rounded-2xl bg-violet-600 text-white hover:bg-violet-500 disabled:opacity-40 transition-all"
                    >
                        {commenting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                    </button>
                </form>
            </div>

            {/* Comments list */}
            <div className="rounded-3xl border border-zinc-200 bg-white px-5 shadow-sm">
                <h3 className="py-4 text-sm font-black text-zinc-900 border-b border-zinc-100">
                    Comments ({comments.length})
                </h3>
                {comments.length === 0 ? (
                    <div className="py-10 text-center text-sm text-zinc-400">
                        No comments yet. Be the first to comment!
                    </div>
                ) : (
                    comments.map(c => <CommentItem key={c.id} comment={c} />)
                )}
            </div>

            {/* Quote modal */}
            {showQuoteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-black text-zinc-900">Quote Post</h3>
                            <button onClick={() => setShowQuoteModal(false)} className="p-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-500 transition-all">
                                <X size={16} />
                            </button>
                        </div>
                        <div className="mb-4 p-3 rounded-2xl bg-zinc-50 border border-zinc-100">
                            <div className="flex items-center gap-2 mb-1">
                                <UserAvatar name={post.user.name} className="h-5 w-5 text-[9px]" />
                                <span className="text-xs font-bold text-zinc-700">{post.user.name}</span>
                            </div>
                            <p className="text-xs text-zinc-400 line-clamp-2">{post.status}</p>
                        </div>
                        <form onSubmit={handleQuote} className="space-y-3">
                            <textarea
                                value={quoteText}
                                onChange={(e) => setQuoteText(e.target.value)}
                                placeholder="Add your thoughts..."
                                rows={3}
                                className="w-full rounded-2xl bg-zinc-50 p-3 text-sm text-zinc-800 border border-zinc-200 focus:outline-none focus:border-violet-400 resize-none transition-all"
                                required
                                autoFocus
                            />
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setShowQuoteModal(false)} className="px-4 py-2 rounded-xl bg-zinc-100 text-xs font-bold text-zinc-500 hover:bg-zinc-200 transition-all">
                                    Cancel
                                </button>
                                <button type="submit" disabled={retweeting || !quoteText.trim()} className="flex items-center gap-2 px-5 py-2 rounded-xl bg-violet-600 text-xs font-bold text-white hover:bg-violet-500 disabled:opacity-40 transition-all">
                                    {retweeting && <Loader2 size={12} className="animate-spin" />}
                                    Post Quote
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
