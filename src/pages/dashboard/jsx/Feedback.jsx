import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase, getUserSafe } from "@/lib/supabase";
import {
  Heart,
  MessageCircle,
  Share2,
  Send,
  MoreHorizontal,
  Lightbulb,
  Bug,
  Zap,
  TrendingUp,
  Eye,
  ExternalLink,
  X,
  UserPlus,
  UserCheck,
  Bookmark,
  Flag,
  Tag,
  Hash
} from "lucide-react";

// Utility function
const cn = (...classes) => {
  return classes.filter(Boolean).join(" ");
};

// Format date to relative time
const formatRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;

  return new Date(dateString).toLocaleDateString('en-US');
};

// Avatar Component
const Avatar = ({ src, fallback, className = "" }) => {
  return (
    <div className={cn("w-10 h-10 rounded-full bg-gradient-to-r from-gray-600 to-gray-800 flex items-center justify-center text-white font-semibold", className)}>
      {src ? (
        <img src={src} alt="Avatar" className="w-full h-full rounded-full object-cover" />
      ) : (
        <span className="text-sm">{fallback}</span>
      )}
    </div>
  );
};

// Badge Component
const Badge = ({ children, variant = "default", className = "", onRemove, removable = false }) => {
  const variants = {
    default: "bg-gray-100 text-gray-700",
    feature: "bg-blue-100 text-blue-600",
    bug: "bg-red-100 text-red-600",
    idea: "bg-purple-100 text-purple-600",
    general: "bg-gray-100 text-gray-700",
    tag: "bg-green-100 text-green-700"
  };

  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border border-transparent",
      variants[variant], 
      className
    )}>
      <Hash className="w-3 h-3" />
      {children}
      {removable && (
        <button
          onClick={onRemove}
          className="ml-1 hover:text-gray-500 focus:outline-none"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
};

// Button Component
const Button = ({ children, variant = "default", size = "default", onClick, className = "", ...props }) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2";

  const variants = {
    default: "bg-gray-800 text-white hover:bg-gray-900 shadow-lg hover:shadow-xl",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50",
    ghost: "text-gray-500 hover:text-gray-700 hover:bg-gray-100",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200"
  };

  const sizes = {
    default: "px-4 py-2 text-sm rounded-xl",
    sm: "px-3 py-1.5 text-xs rounded-lg",
    lg: "px-6 py-3 text-base rounded-xl",
    icon: "p-2 rounded-lg"
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

// Textarea Component
const Textarea = ({ value, onChange, placeholder, className = "", ...props }) => {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={cn(
        "w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-gray-500 focus:border-transparent resize-none",
        className
      )}
      {...props}
    />
  );
};

// Input Component
const Input = ({ value, onChange, placeholder, className = "", ...props }) => {
  return (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={cn(
        "w-full px-4 py-2 border border-gray-300 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-gray-500 focus:border-transparent",
        className
      )}
      {...props}
    />
  );
};

// Tags Input Component
const TagsInput = ({ tags, onAddTag, onRemoveTag, placeholder = "Add tags...", className = "" }) => {
  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = inputValue.trim().replace(/,/g, '');
      if (tag && !tags.includes(tag)) {
        onAddTag(tag);
        setInputValue("");
      }
    }
  };

  const handleAddClick = () => {
    const tag = inputValue.trim();
    if (tag && !tags.includes(tag)) {
      onAddTag(tag);
      setInputValue("");
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <Badge 
            key={index} 
            variant="tag" 
            removable 
            onRemove={() => onRemoveTag(tag)}
          >
            {tag}
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button onClick={handleAddClick} size="sm" style={{borderRadius: '10px'}}>
          <Tag className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

// Tabs Components
const Tabs = ({ value, onValueChange, children, className = "" }) => {
  return (
    <div className={className}>
      {children}
    </div>
  );
};

const TabsList = ({ children, className = "" }) => {
  return (
    <div className={cn("inline-flex bg-gray-100 p-1 rounded-xl", className)}>
      {children}
    </div>
  );
};

const TabsTrigger = ({ value, children, active = false, onClick, className = "" }) => {
  return (
    <button
      onClick={() => onClick(value)}
      className={cn(
        "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
        active 
          ? "bg-white text-gray-900 shadow-sm" 
          : "text-gray-500 hover:text-gray-700",
        className
      )}
    >
      {children}
    </button>
  );
};

const TabsContent = ({ value, children, active = false, className = "" }) => {
  if (!active) return null;

  return (
    <div className={cn("mt-6", className)}>
      {children}
    </div>
  );
};

// Separator Component
const Separator = ({ className = "" }) => {
  return (
    <div className={cn("w-full h-px bg-gray-200", className)} />
  );
};

// Card Components
const Card = ({ children, className = "" }) => {
  return (
    <div className={cn("bg-white rounded-2xl border border-gray-200 shadow-lg", className)}>
      {children}
    </div>
  );
};

const CardHeader = ({ children, className = "" }) => {
  return (
    <div className={cn("p-6", className)}>
      {children}
    </div>
  );
};

const CardContent = ({ children, className = "" }) => {
  return (
    <div className={cn("p-6 pt-0", className)}>
      {children}
    </div>
  );
};

const CardFooter = ({ children, className = "" }) => {
  return (
    <div className={cn("p-6 pt-0", className)}>
      {children}
    </div>
  );
};

// Comment Component with Twitter-style nesting
const Comment = ({ comment, onLike, onReply, currentUser, depth = 0, parentAuthor = null }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(comment.likes || 0);
  const [replies, setReplies] = useState(comment.replies || []);

  // Maximum depth for nesting (Twitter-like: usually 2-3 levels)
  const maxDepth = 3;

  useEffect(() => {
    checkLikeStatus();
  }, [comment.id, currentUser]);

  const checkLikeStatus = async () => {
    try {
      const { data: { user } } = await getUserSafe();
      if (!user) return;

      const { data: likeData, error } = await supabase
        .from('comment_likes')
        .select('id')
        .eq('comment_id', comment.id)
        .eq('client_id', user.id)
        .single();

      setIsLiked(!!likeData);
    } catch (error) {
      console.error('Error checking like status:', error);
    }
  };

  const handleLike = async () => {
    try {
      const { data: { user } } = await getUserSafe();
      if (!user) return;

      const newLikeState = !isLiked;
      setIsLiked(newLikeState);
      setLikeCount(newLikeState ? likeCount + 1 : likeCount - 1);

      if (newLikeState) {
        // Add like
        const { error } = await supabase
          .from('comment_likes')
          .insert([{
            comment_id: comment.id,
            client_id: user.id
          }]);

        if (error) throw error;

        // Update comment likes count
        await supabase
          .from('feedback_comments')
          .update({ likes_count: likeCount + 1 })
          .eq('id', comment.id);
      } else {
        // Remove like
        const { error } = await supabase
          .from('comment_likes')
          .delete()
          .eq('comment_id', comment.id)
          .eq('client_id', user.id);

        if (error) throw error;

        // Update comment likes count
        await supabase
          .from('feedback_comments')
          .update({ likes_count: likeCount - 1 })
          .eq('id', comment.id);
      }

      if (onLike) onLike(comment.id, newLikeState);
    } catch (error) {
      console.error('Error updating comment like:', error);
      // Revert on error
      setIsLiked(!isLiked);
      setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    }
  };

  const handleSubmitReply = async () => {
    if (!replyContent.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Please login first');

      const { data: newReply, error } = await supabase
        .from('feedback_comments')
        .insert([{
          client_id: user.id,
          feedback_id: comment.feedback_id,
          parent_id: comment.id,
          content: replyContent
        }])
        .select(`
          *,
          client:client_id (
            first_name,
            second_name,
            avatar_url,
            role
          )
        `)
        .single();

      if (error) throw error;

      const transformedReply = {
        id: newReply.id,
        author: {
          name: `${newReply.client?.first_name || 'User'} ${newReply.client?.second_name || ''}`,
          avatar: newReply.client?.avatar_url,
          role: newReply.client?.role || 'Member'
        },
        content: newReply.content,
        timestamp: 'Just now',
        likes: 0,
        replies: [],
        feedback_id: comment.feedback_id,
        parent_id: comment.id
      };

      // Add to local replies
      setReplies(prev => [...prev, transformedReply]);

      if (onReply) {
        onReply(comment.id, transformedReply);
      }

      setReplyContent("");
      setShowReplyForm(false);
    } catch (error) {
      console.error('Error creating reply:', error);
    }
  };

  const handleNestedReply = (parentCommentId, reply) => {
    // This handles replies to replies (nested)
    setReplies(prev => prev.map(cmt => 
      cmt.id === parentCommentId 
        ? { ...cmt, replies: [...(cmt.replies || []), reply] }
        : cmt
    ));
  };

  return (
    <div className={`flex gap-3 ${depth > 0 ? 'ml-8' : ''}`}>
      {/* Connection line for nested comments */}
      {depth > 0 && (
        <div className="w-6 flex-shrink-0 relative">
          <div className="absolute top-0 left-3 bottom-0 w-0.5 bg-gray-200"></div>
        </div>
      )}

      <div className="flex-1">
        <div className="flex gap-3 bg-gray-50 p-4 rounded-xl">
          <Avatar 
            src={comment.author.avatar} 
            fallback={comment.author.name[0]}
            className="w-8 h-8 flex-shrink-0" 
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-semibold text-sm text-gray-900">{comment.author.name}</span>
              <span className="text-xs text-gray-600">{comment.author.role}</span>
              <span className="text-xs text-gray-600">• {comment.timestamp}</span>
              {parentAuthor && (
                <span className="text-xs text-blue-600">
                  Replying to @{parentAuthor}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-900 mb-2 break-words">{comment.content}</p>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={`h-7 text-xs ${isLiked ? 'text-red-500' : ''}`}
              >
                <Heart className={`w-3 h-3 ml-1 ${isLiked ? 'fill-current' : ''}`} />
                {likeCount}
              </Button>
              {depth < maxDepth && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="h-7 text-xs"
                >
                  <MessageCircle className="w-3 h-3 ml-1" />
                  Reply
                </Button>
              )}
            </div>

            {showReplyForm && depth < maxDepth && (
              <div className="mt-3 flex gap-2">
                <Input
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder={`Replying to ${comment.author.name}...`}
                  className="flex-1 text-sm"
                />
                <Button size="sm" onClick={handleSubmitReply}>
                  <Send className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Nested Replies */}
        {replies.length > 0 && (
          <div className="mt-2 space-y-2">
            {replies.map((reply) => (
              <Comment 
                key={reply.id} 
                comment={reply} 
                onLike={onLike}
                onReply={handleNestedReply}
                currentUser={currentUser}
                depth={depth + 1}
                parentAuthor={comment.author.name}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Post Detail Modal Component
const PostDetailModal = ({ post, isOpen, onClose, onLike, onShare, onFollow, onAddComment, currentUser }) => {
  const [newComment, setNewComment] = useState("");
  const [isFollowing, setIsFollowing] = useState(false);
  const [comments, setComments] = useState(post?.comments || []);

  useEffect(() => {
    if (post && currentUser) {
      checkFollowStatus();
      setComments(post.comments || []);
    }
  }, [post, currentUser]);

  const checkFollowStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !post?.author?.id) return;

      const { data: followData, error } = await supabase
        .from('user_follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', post.author.id)
        .single();

      setIsFollowing(!!followData);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  if (!isOpen || !post) return null;

  const shareUrl = `${window.location.origin}/community/post/${post.id}`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Community Post',
          text: post.content.substring(0, 100) + '...',
          url: shareUrl,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert('Link copied to clipboard!');
      });
    }
    onShare(post.id);
  };

  const handleFollow = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !post.author.id) return;

      const newFollowState = !isFollowing;
      setIsFollowing(newFollowState);

      if (newFollowState) {
        // Follow
        const { error } = await supabase
          .from('user_follows')
          .insert([{
            follower_id: user.id,
            following_id: post.author.id
          }]);

        if (error) throw error;
      } else {
        // Unfollow
        const { error } = await supabase
          .from('user_follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', post.author.id);

        if (error) throw error;
      }

      if (onFollow) onFollow(post.author.id, newFollowState);
    } catch (error) {
      console.error('Error updating follow:', error);
      // Revert on error
      setIsFollowing(!isFollowing);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Please login first');

      const { data: newCommentData, error } = await supabase
        .from('feedback_comments')
        .insert([{
          client_id: user.id,
          feedback_id: post.id,
          content: newComment
        }])
        .select(`
          *,
          client:client_id (
            first_name,
            second_name,
            avatar_url,
            role
          )
        `)
        .single();

      if (error) throw error;

      const transformedComment = {
        id: newCommentData.id,
        author: {
          name: `${newCommentData.client?.first_name || 'User'} ${newCommentData.client?.second_name || ''}`,
          avatar: newCommentData.client?.avatar_url,
          role: newCommentData.client?.role || 'Member'
        },
        content: newCommentData.content,
        timestamp: 'Just now',
        likes: 0,
        replies: [],
        feedback_id: post.id
      };

      // Update local state
      setComments(prev => [...prev, transformedComment]);

      if (onAddComment) {
        onAddComment(post.id, transformedComment);
      }

      setNewComment("");
    } catch (error) {
      console.error('Error creating comment:', error);
    }
  };

  const handleCommentLike = (commentId, newLikeState) => {
    // Update local state
    setComments(prev => prev.map(comment => 
      comment.id === commentId 
        ? { ...comment, likes: newLikeState ? comment.likes + 1 : comment.likes - 1 }
        : comment
    ));
  };

  const handleReply = (parentCommentId, reply) => {
    // Update local state for nested replies
    setComments(prev => prev.map(comment => 
      comment.id === parentCommentId 
        ? { ...comment, replies: [...(comment.replies || []), reply] }
        : comment
    ));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Post Details</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="space-y-6">
            {/* Author Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar 
                  src={post.author.avatar} 
                  fallback={post.author.name[0]} 
                />
                <div>
                  <h3 className="font-semibold text-gray-900">{post.author.name}</h3>
                  <p className="text-sm text-gray-600">{post.author.role} • {post.timestamp}</p>
                </div>
              </div>
              <Button
                variant={isFollowing ? "outline" : "default"}
                size="sm"
                onClick={handleFollow}
              >
                {isFollowing ? (
                  <>
                    <UserCheck className="w-4 h-4 ml-2" />
                    Following
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 ml-2" />
                    Follow
                  </>
                )}
              </Button>
            </div>

            {/* Post Content */}
            <div>
              <p className="text-gray-900 leading-relaxed text-lg">{post.content}</p>
              {post.tags.length > 0 && (
                <div className="flex gap-2 mt-4 flex-wrap">
                  {post.tags.map((tag, index) => (
                    <Badge key={index} variant="tag" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onLike(post.id)}
                className={post.isLiked ? 'text-red-500' : ''}
              >
                <Heart className={`w-4 h-4 ml-2 ${post.isLiked ? 'fill-current' : ''}`} />
                {post.likes}
              </Button>
              <Button variant="ghost" size="sm">
                <MessageCircle className="w-4 h-4 ml-2" />
                {comments.length}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4 ml-2" />
                Share
              </Button>
              <Button variant="ghost" size="sm">
                <Bookmark className="w-4 h-4 ml-2" />
                Save
              </Button>
              <Button variant="ghost" size="sm">
                <Flag className="w-4 h-4 ml-2" />
                Report
              </Button>
            </div>

            {/* Add Comment (Reply to Post) */}
            <div className="flex gap-3">
              <Avatar 
                src={currentUser?.avatar_url} 
                fallback={currentUser?.first_name?.[0] || 'U'} 
                className="w-8 h-8"
              />
              <div className="flex-1 flex gap-2">
                <Input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Post your reply..."
                  className="flex-1"
                />
                <Button onClick={handleSubmitComment} disabled={!newComment.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Comments */}
            {comments.length > 0 && (
              <div className="space-y-4">
                <Separator />
                <h4 className="font-semibold text-gray-900">Replies ({comments.length})</h4>
                {comments.map((comment) => (
                  <Comment 
                    key={comment.id} 
                    comment={comment} 
                    onLike={handleCommentLike}
                    onReply={handleReply}
                    currentUser={currentUser}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Main Community Feedback Component
const CommunityFeedback = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [newPost, setNewPost] = useState('');
  const [selectedType, setSelectedType] = useState('general');
  const [newPostTags, setNewPostTags] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [followingUsers, setFollowingUsers] = useState(new Set());

  useEffect(() => {
    fetchPosts();
    fetchUser();
    fetchFollowingUsers();
  }, []);

  const fetchUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userData } = await supabase
          .from('client')
          .select('*')
          .eq('id', user.id)
          .single();
        setUser(userData);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const fetchFollowingUsers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: follows, error } = await supabase
        .from('user_follows')
        .select('following_id')
        .eq('follower_id', user.id);

      if (error) throw error;

      const followingSet = new Set(follows?.map(follow => follow.following_id) || []);
      setFollowingUsers(followingSet);
    } catch (error) {
      console.error('Error fetching following users:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);

      const { data: postsData, error } = await supabase
        .from('feedback')
        .select(`
          *,
          client:client_id (
            id,
            first_name,
            second_name,
            avatar_url,
            role
          ),
          comments:feedback_comments (
            id,
            content,
            created_at,
            likes_count,
            feedback_id,
            parent_id,
            client:client_id (
              first_name,
              second_name,
              avatar_url,
              role
            )
          ),
          feedback_likes!left (
            id,
            client_id
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get current user to check likes
      const { data: { user } } = await supabase.auth.getUser();
      const currentUserId = user?.id;

      // Transform data
      const transformedPosts = (postsData || []).map(post => {
        // Build nested comments structure
        const commentsMap = {};
        const topLevelComments = [];

        (post.comments || []).forEach(comment => {
          commentsMap[comment.id] = {
            id: comment.id,
            author: {
              name: `${comment.client?.first_name || 'User'} ${comment.client?.second_name || ''}`,
              avatar: comment.client?.avatar_url,
              role: comment.client?.role || 'Member'
            },
            content: comment.content,
            timestamp: formatRelativeTime(comment.created_at),
            likes: comment.likes_count || 0,
            feedback_id: comment.feedback_id,
            parent_id: comment.parent_id,
            replies: []
          };
        });

        // Build nested structure
        Object.values(commentsMap).forEach(comment => {
          if (comment.parent_id) {
            const parentComment = commentsMap[comment.parent_id];
            if (parentComment) {
              parentComment.replies.push(comment);
            }
          } else {
            topLevelComments.push(comment);
          }
        });

        return {
          id: post.id,
          author: {
            id: post.client?.id,
            name: `${post.client?.first_name || 'User'} ${post.client?.second_name || ''}`,
            avatar: post.client?.avatar_url,
            role: post.client?.role || 'Member',
            isFollowing: followingUsers.has(post.client?.id)
          },
          content: post.message,
          timestamp: formatRelativeTime(post.created_at),
          likes: post.likes_count || 0,
          comments: topLevelComments,
          type: post.category,
          tags: post.tags || [],
          isLiked: post.feedback_likes?.some(like => like.client_id === currentUserId) || false,
          shares: post.shares_count || 0,
          views: post.views_count || 0
        };
      });

      setPosts(transformedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPosts(getSamplePosts());
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const post = posts.find(p => p.id === postId);
      const isCurrentlyLiked = post.isLiked;

      // Optimistic update
      const updatedPosts = posts.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              likes: isCurrentlyLiked ? post.likes - 1 : post.likes + 1, 
              isLiked: !isCurrentlyLiked 
            }
          : post
      );
      setPosts(updatedPosts);

      if (isCurrentlyLiked) {
        // Unlike: delete the like record
        const { error } = await supabase
          .from('feedback_likes')
          .delete()
          .eq('feedback_id', postId)
          .eq('client_id', user.id);

        if (error) throw error;

        // Update likes count
        await supabase
          .from('feedback')
          .update({ likes_count: post.likes - 1 })
          .eq('id', postId);
      } else {
        // Like: insert new like record
        const { error } = await supabase
          .from('feedback_likes')
          .insert([{
            feedback_id: postId,
            client_id: user.id
          }]);

        if (error) throw error;

        // Update likes count
        await supabase
          .from('feedback')
          .update({ likes_count: post.likes + 1 })
          .eq('id', postId);
      }
    } catch (error) {
      console.error('Error updating like:', error);
      // Revert on error
      setPosts(posts);
    }
  };

  const handleShare = async (postId) => {
    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      // Update share count in database
      const { error } = await supabase.rpc('increment_feedback_shares', {
        feedback_id: postId
      });

      if (error) throw error;

      // Optimistic update
      const updatedPosts = posts.map(post => 
        post.id === postId 
          ? { ...post, shares: (post.shares || 0) + 1 }
          : post
      );
      setPosts(updatedPosts);

      console.log(`Shared post ${postId}`);
    } catch (error) {
      console.error('Error updating share count:', error);
    }
  };

  const handleFollow = async (userId, followState) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const newFollowingUsers = new Set(followingUsers);
      if (followState) {
        newFollowingUsers.add(userId);
        // Follow: insert follow record
        const { error } = await supabase
          .from('user_follows')
          .insert([{
            follower_id: user.id,
            following_id: userId
          }]);

        if (error) throw error;
      } else {
        newFollowingUsers.delete(userId);
        // Unfollow: delete follow record
        const { error } = await supabase
          .from('user_follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', userId);

        if (error) throw error;
      }

      setFollowingUsers(newFollowingUsers);

      // Update posts to reflect follow status
      const updatedPosts = posts.map(post => 
        post.author.id === userId 
          ? { 
              ...post, 
              author: { ...post.author, isFollowing: followState } 
            }
          : post
      );
      setPosts(updatedPosts);

      // Update selected post if it's the same one
      if (selectedPost && selectedPost.author.id === userId) {
        setSelectedPost({
          ...selectedPost,
          author: { ...selectedPost.author, isFollowing: followState }
        });
      }
    } catch (error) {
      console.error('Error updating follow:', error);
    }
  };

  const handleAddComment = (postId, newComment) => {
    const updatedPosts = posts.map(post => 
      post.id === postId 
        ? { ...post, comments: [...post.comments, newComment] }
        : post
    );
    setPosts(updatedPosts);

    // Update selected post if it's the same one
    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost({
        ...selectedPost,
        comments: [...selectedPost.comments, newComment]
      });
    }
  };

  const handleAddTag = (tag) => {
    if (tag && !newPostTags.includes(tag)) {
      setNewPostTags([...newPostTags, tag]);
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setNewPostTags(newPostTags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmitPost = async () => {
    if (!newPost.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Please login first');

      const { data: newPostData, error } = await supabase
        .from('feedback')
        .insert([{
          client_id: user.id,
          rating: 5,
          category: selectedType,
          title: newPost.substring(0, 100),
          message: newPost,
          tags: newPostTags,
          status: 'pending',
          likes_count: 0,
          shares_count: 0
        }])
        .select(`
          *,
          client:client_id (
            first_name,
            second_name,
            avatar_url,
            role
          )
        `)
        .single();

      if (error) throw error;

      // Add to local state
      const transformedPost = {
        id: newPostData.id,
        author: {
          id: user.id,
          name: `${newPostData.client?.first_name || 'User'} ${newPostData.client?.second_name || ''}`,
          avatar: newPostData.client?.avatar_url,
          role: newPostData.client?.role || 'Member',
          isFollowing: false
        },
        content: newPostData.message,
        timestamp: 'Just now',
        likes: 0,
        comments: [],
        type: newPostData.category,
        tags: newPostData.tags || [],
        isLiked: false,
        shares: 0,
        views: 0
      };

      setPosts([transformedPost, ...posts]);
      setNewPost('');
      setNewPostTags([]);
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const openPostDetail = (post) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'feature': return <Lightbulb className="w-4 h-4" />;
      case 'bug': return <Bug className="w-4 h-4" />;
      case 'idea': return <Zap className="w-4 h-4" />;
      default: return <MessageCircle className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'feature': return 'Feature Request';
      case 'bug': return 'Bug Report';
      case 'idea': return 'Idea';
      default: return 'General';
    }
  };

  const getTypeBadgeVariant = (type) => {
    switch (type) {
      case 'feature': return 'feature';
      case 'bug': return 'bug';
      case 'idea': return 'idea';
      default: return 'general';
    }
  };

  const filteredPosts = activeTab === 'all' 
    ? posts 
    : posts.filter(post => post.type === activeTab);

  // Sample data fallback
  const getSamplePosts = () => [
    {
      id: '1',
      author: {
        id: 'user1',
        name: 'Ahmed Mohamed',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed',
        role: 'Frontend Developer',
        isFollowing: false
      },
      content: 'I suggest adding a dark mode feature to the application. It would be very useful for users who work at night and help reduce eye strain.',
      timestamp: '2 hours ago',
      likes: 24,
      comments: [
        {
          id: 'c1',
          author: {
            name: 'Sara Ali',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sara',
            role: 'UI/UX Designer'
          },
          content: 'Excellent idea! We could also add an option for automatic switching based on time of day.',
          timestamp: '1 hour ago',
          likes: 8,
          replies: [
            {
              id: 'c1-1',
              author: {
                name: 'John Doe',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
                role: 'Developer'
              },
              content: 'I agree, this would be a great addition!',
              timestamp: '45 minutes ago',
              likes: 3,
              replies: []
            }
          ]
        }
      ],
      type: 'feature',
      tags: ['improvement', 'user-interface'],
      isLiked: false,
      shares: 5,
      views: 120
    },
    {
      id: '2',
      author: {
        id: 'user2',
        name: 'Mahmoud Hassan',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mahmoud',
        role: 'Product Manager',
        isFollowing: true
      },
      content: 'I noticed an issue with image loading when using slow internet. Can we add image compression before upload?',
      timestamp: '4 hours ago',
      likes: 15,
      comments: [],
      type: 'bug',
      tags: ['performance', 'images'],
      isLiked: true,
      shares: 2,
      views: 85
    },
    {
      id: '3',
      author: {
        id: 'user3',
        name: 'Fatima Ahmed',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fatima',
        role: 'Backend Developer',
        isFollowing: false
      },
      content: 'What do you think about adding a real-time notification system for important updates? It would help improve communication with users.',
      timestamp: '6 hours ago',
      likes: 32,
      comments: [
        {
          id: 'c2',
          author: {
            name: 'Omar Khaled',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Omar',
            role: 'Full Stack Developer'
          },
          content: 'We can use WebSockets for this purpose. I will work on a prototype.',
          timestamp: '5 hours ago',
          likes: 12,
          replies: []
        }
      ],
      type: 'idea',
      tags: ['new-feature', 'notifications'],
      isLiked: false,
      shares: 8,
      views: 200
    }
  ];

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8 px-4 mr-10">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-2 mb-8">
            <h1 className="text-4xl font-bold text-gray-900">Development Community</h1>
            <p className="text-gray-600 text-lg">Share your ideas and connect with the community</p>
          </div>

          {/* Create Post Card */}
          <Card className="border-gray-200 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Avatar 
                  src={user?.avatar_url} 
                  fallback={user?.first_name?.[0] || 'U'} 
                />
                <div className="flex-1">
                  <Textarea
                    placeholder="Share your idea, suggest a feature, or report a problem..."
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    className="min-h-[100px] resize-none border-gray-300"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <TagsInput
                tags={newPostTags}
                onAddTag={handleAddTag}
                onRemoveTag={handleRemoveTag}
                placeholder="Add tags (press Enter or comma to add)"
                className="mt-4"
              />
            </CardContent>
            <CardFooter className="flex justify-between items-center">
              <div className="flex gap-2">
                <Button
                  variant={selectedType === 'general' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedType('general')}
                  style={{borderRadius: '10px'}}
                >
                  <MessageCircle className="w-4 h-4 ml-2 mr-2" />
                  General
                </Button>
                <Button
                  variant={selectedType === 'feature' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedType('feature')}
                  style={{borderRadius: '10px'}}
                >
                  <Lightbulb className="w-4 h-4 ml-2 mr-2" />
                  Feature
                </Button>
                <Button
                  variant={selectedType === 'bug' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedType('bug')}
                  style={{borderRadius: '10px'}}
                >
                  <Bug className="w-4 h-4 ml-2 mr-2" />
                  Bug
                </Button>
                <Button
                  variant={selectedType === 'idea' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedType('idea')}
                  style={{borderRadius: '10px'}}
                >
                  <Zap className="w-4 h-4 ml-2 mr-2" />
                  Idea
                </Button>
              </div>
              <Button onClick={handleSubmitPost} disabled={!newPost.trim()} style={{borderRadius: '10px'}} >
                <Send className="w-4 h-4 ml-2 mr-2" />
                Post
              </Button>
            </CardFooter>
          </Card>

          {/* Tabs Filter */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full bg-gray-100">
              <TabsTrigger 
                value="all" 
                active={activeTab === 'all'}
                onClick={setActiveTab}
              >
                All
              </TabsTrigger>
              <TabsTrigger 
                value="general" 
                active={activeTab === 'general'}
                onClick={setActiveTab}
              >
                General
              </TabsTrigger>
              <TabsTrigger 
                value="feature" 
                active={activeTab === 'feature'}
                onClick={setActiveTab}
              >
                Features
              </TabsTrigger>
              <TabsTrigger 
                value="bug" 
                active={activeTab === 'bug'}
                onClick={setActiveTab}
              >
                Bugs
              </TabsTrigger>
              <TabsTrigger 
                value="idea" 
                active={activeTab === 'idea'}
                onClick={setActiveTab}
              >
                Ideas
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} active={true} className="space-y-4">
              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                          <div className="space-y-2 flex-1">
                            <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                            <div className="h-3 bg-gray-300 rounded w-1/6"></div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-300 rounded"></div>
                          <div className="h-4 bg-gray-300 rounded w-5/6"></div>
                          <div className="h-4 bg-gray-300 rounded w-4/6"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                filteredPosts.map((post) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="border-gray-200 shadow-md hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar 
                              src={post.author.avatar} 
                              fallback={post.author.name[0]} 
                            />
                            <div>
                              <h3 className="font-semibold text-gray-900">{post.author.name}</h3>
                              <p className="text-sm text-gray-600">{post.author.role} • {post.timestamp}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={getTypeBadgeVariant(post.type)}>
                              {getTypeIcon(post.type)}
                              <span className="ml-1">{getTypeLabel(post.type)}</span>
                            </Badge>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-900 leading-relaxed text-lg">{post.content}</p>
                        {post.tags.length > 0 && (
                          <div className="flex gap-2 mt-4 flex-wrap">
                            {post.tags.map((tag, index) => (
                              <Badge key={index} variant="tag" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="flex flex-col gap-4">
                        <div className="flex items-center gap-4 w-full">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLike(post.id)}
                            className={post.isLiked ? 'text-red-500' : ''}
                          >
                            <Heart className={`w-4 h-4 ml-2  mr-2 ${post.isLiked ? 'fill-current' : ''}`} />
                            {post.likes}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openPostDetail(post)}>
                            <MessageCircle className="w-4 h-4 ml-2 mr-2" />
                            {post.comments.length}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleShare(post.id)}>
                            <Share2 className="w-4 h-4 ml-2 mr-2" />
                            {post.shares || 0}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openPostDetail(post)}>
                            <Eye className="w-4 h-4 ml-2 mr-2" />
                            View Details
                          </Button>
                          <Button 
                            variant={post.author.isFollowing ? "outline" : "default"}
                            size="sm" 
                            className="mr-auto"
                            onClick={() => handleFollow(post.author.id, !post.author.isFollowing)}
                            style={{borderRadius: '5px'}}
                          >
                            {post.author.isFollowing ? (
                              <>
                                <UserCheck className="w-4 h-4 ml-2 mr-2" />
                                Following
                              </>
                            ) : (
                              <>
                                <UserPlus className="w-4 h-4 ml-2 mr-2" />
                                Follow
                              </>
                            )}
                          </Button>
                        </div>

                        {post.comments.length > 0 && (
                          <>
                            <Separator />
                            <div className="w-full space-y-4">
                              {post.comments.slice(0, 2).map((comment) => (
                                <Comment 
                                  key={comment.id} 
                                  comment={comment} 
                                  currentUser={user}
                                />
                              ))}
                              {post.comments.length > 2 && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => openPostDetail(post)}
                                  className="w-full"
                                >
                                  View all {post.comments.length} comments
                                </Button>
                              )}
                            </div>
                          </>
                        )}
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Post Detail Modal */}
      <PostDetailModal
        post={selectedPost}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onLike={handleLike}
        onShare={handleShare}
        onFollow={handleFollow}
        onAddComment={handleAddComment}
        currentUser={user}
      />
    </>
  );
};

export default CommunityFeedback;
