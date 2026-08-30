import React, { useState } from "react";
import { ForumPost, ForumComment, Language, UserRole } from "../types";
import { translations } from "../data/translations";
import { 
  MessageSquare, 
  ThumbsUp, 
  Share2, 
  Send, 
  PlusCircle, 
  Search, 
  Sparkles, 
  CheckCircle, 
  UserCheck,
  Tag,
  HelpCircle,
  Leaf,
  X
} from "lucide-react";

interface CommunityForumProps {
  posts: ForumPost[];
  language: Language;
  userRole: UserRole;
  onAddPost: (post: Omit<ForumPost, "id" | "likes" | "commentsCount" | "comments">) => void;
  onLikePost: (postId: string) => void;
  onAddComment: (postId: string, commentText: string) => void;
}

export const CommunityForum: React.FC<CommunityForumProps> = ({
  posts,
  language,
  userRole,
  onAddPost,
  onLikePost,
  onAddComment,
}) => {
  const t = translations[language];
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});

  // New Post Form State
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState<ForumPost["category"]>("pest_control");
  const [newTags, setNewTags] = useState("");

  const categories = [
    { id: "all", labelHi: "सभी चर्चाएं", labelEn: "All Discussions" },
    { id: "pest_control", labelHi: "कीट व रोग निवारण", labelEn: "Pest & Disease Control" },
    { id: "organic_farming", labelHi: "जैविक खेती व खाद", labelEn: "Organic Farming" },
    { id: "market_advice", labelHi: "सीधी बिक्री व मंडी सलाह", labelEn: "Market & Selling" },
    { id: "weather_tips", labelHi: "मौसम व सिंचाई", labelEn: "Weather & Irrigation" },
    { id: "gov_schemes", labelHi: "सरकारी योजनाएं", labelEn: "Govt Schemes (PM Kisan)" },
  ];

  const filteredPosts = (posts || []).filter((p) => {
    if (!p) return false;
    const sLower = (searchTerm || "").toLowerCase().trim();
    const matchesSearch = !sLower ||
      (p.title || "").toLowerCase().includes(sLower) ||
      (p.content || "").toLowerCase().includes(sLower) ||
      (p.authorName || "").toLowerCase().includes(sLower);

    const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    onAddPost({
      authorName: userRole === "farmer" ? "रमेश कुमार वर्मा (सत्यापित किसान)" : "उपभोक्ता सदस्य",
      authorRole: userRole === "farmer" ? "farmer" : "buyer",
      authorAvatar: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=120&auto=format&fit=crop&q=80",
      authorLocation: userRole === "farmer" ? "सीहोर, मध्य प्रदेश" : "भारत",
      date: language === "hi" ? "अभी-अभी" : "Just now",
      title: newTitle,
      content: newContent,
      category: newCategory,
      categoryLabelHi: newCategory === "pest_control" ? "कीट व रोग निवारण" : "जैविक खेती",
      categoryLabelEn: newCategory === "pest_control" ? "Pest Control" : "Organic Farming",
      tags: newTags ? newTags.split(",").map((t) => t.trim()) : ["कृषि चौपाल"],
      imageUrl: undefined,
    });

    setNewTitle("");
    setNewContent("");
    setNewTags("");
    setIsCreatingPost(false);
  };

  const handleCommentSubmit = (postId: string) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;
    onAddComment(postId, text.trim());
    setCommentInputs({ ...commentInputs, [postId]: "" });
  };

  return (
    <div className="space-y-4">
      {/* Forum Header Banner */}
      <div className="bg-[#1B3B18] text-white rounded-xl p-4 sm:p-5 shadow-xs border border-[#2D5A27] relative overflow-hidden">
        <div className="max-w-2xl space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-[#FEF3C7] text-[#92400E] text-[10px] font-bold px-2 py-0.5 rounded-sm border border-[#FDE68A]">
            <Sparkles className="w-3 h-3 text-[#D97706]" />
            <span>{language === "hi" ? "किसान भाईचारा व अनुभव मंच" : "Farmer Knowledge & Peer Forum"}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#FAF8F5]">
            {t.forumTitle}
          </h1>
          <p className="text-xs sm:text-sm text-[#D5E8D2] leading-relaxed">
            {t.forumSubtitle}
          </p>

          <div className="pt-1">
            <button
              onClick={() => setIsCreatingPost(true)}
              className="bg-[#2D5A27] hover:bg-[#234A1F] text-white text-xs font-bold px-3.5 py-1.5 rounded-lg border border-[#3E7D37] shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{t.askQuestion}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="space-y-2.5">
        <div className="relative w-full">
          <Search className="w-3.5 h-3.5 text-[#75716B] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={language === "hi" ? "चौपाल में खोजें (उदा. जैविक कीटनाशक, धान की रोपाई, खाद...)" : "Search discussions..."}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#DCD7CC] rounded-lg shadow-xs text-[#2D2D2D] focus:ring-1 focus:ring-[#2D5A27] focus:outline-none"
          />
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? "bg-[#2D5A27] text-white shadow-xs"
                  : "bg-white text-[#5C5850] border border-[#DCD7CC] hover:bg-[#FAF8F5]"
              }`}
            >
              {language === "hi" ? cat.labelHi : cat.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Posts Stream */}
      <div className="space-y-3">
        {filteredPosts.map((post) => (
          <div
            key={post.id}
            className="bg-white p-4 rounded-xl border border-[#DCD7CC] shadow-xs space-y-3 hover:border-[#2D5A27] transition-colors"
          >
            {/* Author Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src={post.authorAvatar}
                  alt={post.authorName}
                  className="w-8 h-8 rounded-full object-cover border border-[#DCD7CC]"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-[#2D2D2D] text-xs sm:text-sm">{post.authorName}</span>
                    {post.authorRole === "farmer" && (
                      <span className="bg-[#EBF5EA] text-[#2D5A27] border border-[#B7DDB5] text-[9px] font-bold px-1.5 py-0.2 rounded-sm">
                        {language === "hi" ? "किसान" : "Farmer"}
                      </span>
                    )}
                    {post.authorRole === "agronomist" && (
                      <span className="bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD] text-[9px] font-bold px-1.5 py-0.2 rounded-sm">
                        {language === "hi" ? "कृषि वैज्ञानिक" : "Agronomist"}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-[#75716B]">
                    {post.authorLocation} • {post.date}
                  </div>
                </div>
              </div>

              <span className="text-[10px] bg-[#FAF8F5] text-[#5C5850] border border-[#DCD7CC] px-2 py-0.5 rounded-sm font-semibold">
                {language === "hi" ? post.categoryLabelHi : post.categoryLabelEn}
              </span>
            </div>

            {/* Post Title & Content */}
            <div className="space-y-1.5">
              <h3 className="font-bold text-[#2D2D2D] text-sm sm:text-base leading-snug">
                {post.title}
              </h3>
              <p className="text-xs text-[#5C5850] leading-relaxed whitespace-pre-line">
                {post.content}
              </p>

              {post.imageUrl && (
                <div className="rounded-lg overflow-hidden max-h-64 bg-[#FAF8F5] mt-2 border border-[#DCD7CC]">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-1 pt-0.5">
                {post.tags.map((tg, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-medium bg-[#FAF8F5] text-[#2D5A27] border border-[#DCD7CC] px-1.5 py-0.2 rounded-sm flex items-center gap-0.5"
                  >
                    <Tag className="w-2.5 h-2.5" />
                    #{tg}
                  </span>
                ))}
              </div>
            </div>

            {/* Interaction Bar (Upvote & Comments Counter) */}
            <div className="flex items-center gap-3 pt-2.5 border-t border-[#EDE8DF] text-xs font-semibold text-[#5C5850]">
              <button
                onClick={() => onLikePost(post.id)}
                className="flex items-center gap-1 hover:text-[#2D5A27] bg-[#FAF8F5] hover:bg-[#EBF5EA] border border-[#DCD7CC] px-2.5 py-1 rounded-md text-[11px] transition-colors"
              >
                <ThumbsUp className="w-3.5 h-3.5 text-[#2D5A27]" />
                <span>{post.likes} {t.upvotes}</span>
              </button>

              <div className="flex items-center gap-1 text-[#75716B] text-[11px]">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{post.comments.length} {t.comments}</span>
              </div>
            </div>

            {/* Comments List */}
            {post.comments.length > 0 && (
              <div className="space-y-2 pt-1 bg-[#FAF8F5] p-2.5 rounded-lg border border-[#DCD7CC]">
                {post.comments.map((cmt) => (
                  <div key={cmt.id} className="text-xs space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#2D2D2D] text-[11px]">
                        {cmt.authorName}
                        <span className="text-[10px] text-[#75716B] font-normal ml-1">
                          ({cmt.authorLocation})
                        </span>
                      </span>
                      <span className="text-[9px] text-[#75716B]">{cmt.date}</span>
                    </div>
                    <p className="text-[#5C5850] text-[11px] leading-relaxed">{cmt.content}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Add Comment Input */}
            <div className="flex items-center gap-1.5 pt-0.5">
              <input
                type="text"
                value={commentInputs[post.id] || ""}
                onChange={(e) =>
                  setCommentInputs({ ...commentInputs, [post.id]: e.target.value })
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCommentSubmit(post.id);
                }}
                placeholder={t.writeComment}
                className="flex-1 text-xs py-1.5 px-2.5 bg-[#FAF8F5] border border-[#DCD7CC] rounded-lg text-[#2D2D2D] focus:ring-1 focus:ring-[#2D5A27] focus:outline-none"
              />
              <button
                onClick={() => handleCommentSubmit(post.id)}
                className="bg-[#2D5A27] hover:bg-[#234A1F] text-white p-1.5 rounded-lg transition-colors"
              >
                <Send className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create New Discussion Modal */}
      {isCreatingPost && (
        <div className="fixed inset-0 z-50 bg-[#121212]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 border border-[#DCD7CC] shadow-xl space-y-3 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-[#DCD7CC] pb-2.5">
              <h3 className="font-extrabold text-[#2D2D2D] text-base">
                {t.askQuestion}
              </h3>
              <button
                onClick={() => setIsCreatingPost(false)}
                className="p-1 rounded-md text-[#75716B] hover:text-[#2D2D2D] hover:bg-[#FAF8F5]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-2.5 text-xs">
              <div>
                <label className="font-bold text-[#2D2D2D] block mb-1">{t.postCategory}</label>
                <select
                  value={newCategory}
                  onChange={(e: any) => setNewCategory(e.target.value)}
                  className="w-full py-1.5 px-2.5 bg-[#FAF8F5] border border-[#DCD7CC] rounded-lg font-medium text-[#2D2D2D]"
                >
                  <option value="pest_control">{t.categoryPest}</option>
                  <option value="organic_farming">{t.categoryOrganic}</option>
                  <option value="market_advice">{t.categoryMarket}</option>
                  <option value="weather_tips">{t.categoryWeather}</option>
                  <option value="gov_schemes">{t.categorySchemes}</option>
                  <option value="general">{t.categoryGeneral}</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#2D2D2D] block mb-1">{t.postTitle}</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder={language === "hi" ? "उदा. गेहूं में पीला रतुआ का इलाज क्या है?" : "e.g. Organic treatment for yellow rust in wheat?"}
                  className="w-full py-1.5 px-2.5 bg-[#FAF8F5] border border-[#DCD7CC] rounded-lg text-[#2D2D2D]"
                />
              </div>

              <div>
                <label className="font-bold text-[#2D2D2D] block mb-1">{t.postContent}</label>
                <textarea
                  rows={3}
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder={t.postContent}
                  className="w-full py-1.5 px-2.5 bg-[#FAF8F5] border border-[#DCD7CC] rounded-lg text-[#2D2D2D]"
                />
              </div>

              <div>
                <label className="font-bold text-[#2D2D2D] block mb-1">
                  टैग्स (Tags - अल्पविराम से अलग करें)
                </label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="गेहूं, देसी खाद, जैविक उपचार"
                  className="w-full py-1.5 px-2.5 bg-[#FAF8F5] border border-[#DCD7CC] rounded-lg text-[#2D2D2D]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DCD7CC]">
                <button
                  type="button"
                  onClick={() => setIsCreatingPost(false)}
                  className="px-3 py-1.5 rounded-lg text-[#5C5850] font-bold hover:bg-[#FAF8F5]"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#2D5A27] hover:bg-[#234A1F] text-white font-bold shadow-xs"
                >
                  {t.postBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
