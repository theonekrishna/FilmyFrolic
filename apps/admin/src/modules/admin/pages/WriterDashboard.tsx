import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart3, FileText, Eye, Heart, MessageCircle,
  TrendingUp, Plus, Edit3, Trash2, Send, Save,
  MoreVertical, Search, Filter, ArrowLeft,
  Image as ImageIcon, AlignLeft, Heading, List, Link2,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const ACCENT = "#1fd1a8";
const GOLD = "#f5c518";
const RED = "#e84545";
const BLUE = "#3b82f6";

type Tab = "overview" | "content" | "analytics" | "new";

interface Article {
  id: string;
  title: string;
  status: "draft" | "published" | "scheduled";
  views: number;
  likes: number;
  comments: number;
  createdAt: string;
  publishedAt?: string;
  thumbnail?: string;
}

const MOCK_ARTICLES: Article[] = [
  {
    id: "1",
    title: "The Evolution of Cinema: From Silent Films to Streaming",
    status: "published",
    views: 12400,
    likes: 856,
    comments: 124,
    createdAt: "2026-05-15",
    publishedAt: "2026-05-16",
  },
  {
    id: "2",
    title: "Top 10 Underrated Sci-Fi Movies You Need to Watch",
    status: "published",
    views: 8900,
    likes: 642,
    comments: 89,
    createdAt: "2026-05-10",
    publishedAt: "2026-05-12",
  },
  {
    id: "3",
    title: "Behind the Scenes: How Movie Magic is Created",
    status: "draft",
    views: 0,
    likes: 0,
    comments: 0,
    createdAt: "2026-05-20",
  },
  {
    id: "4",
    title: "The Rise of AI in Film Production",
    status: "scheduled",
    views: 0,
    likes: 0,
    comments: 0,
    createdAt: "2026-05-18",
    publishedAt: "2026-05-25",
  },
];

const VIEWS_DATA = [
  { date: "May 15", views: 1200 },
  { date: "May 16", views: 1800 },
  { date: "May 17", views: 1500 },
  { date: "May 18", views: 2200 },
  { date: "May 19", views: 1900 },
  { date: "May 20", views: 2400 },
  { date: "May 21", views: 2100 },
];

const ENGAGEMENT_DATA = [
  { name: "Mon", likes: 120, comments: 45 },
  { name: "Tue", likes: 150, comments: 52 },
  { name: "Wed", likes: 180, comments: 68 },
  { name: "Thu", likes: 140, comments: 50 },
  { name: "Fri", likes: 200, comments: 75 },
  { name: "Sat", likes: 220, comments: 82 },
  { name: "Sun", likes: 190, comments: 70 },
];

// ─── Components ───────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, trend, color }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend?: string;
  color: string;
}) {
  return (
    <div style={{
      background: "#12121e",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 14,
      padding: "20px",
      display: "flex",
      flexDirection: "column",
      gap: 12,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: `${color}15`,
          border: `1px solid ${color}30`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: color,
        }}>
          {icon}
        </div>
        {trend && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontFamily: "'Outfit', sans-serif",
            fontSize: 11,
            fontWeight: 600,
            color: ACCENT,
          }}>
            <TrendingUp size={12} />
            {trend}
          </div>
        )}
      </div>
      <div>
        <div style={{
          fontFamily: "'Bebas Neue', cursive",
          fontSize: 28,
          letterSpacing: 1,
          color: "#f0f0f8",
          lineHeight: 1,
        }}>
          {value}
        </div>
        <div style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: 12,
          color: "rgba(240,240,248,0.4)",
          marginTop: 4,
        }}>
          {label}
        </div>
      </div>
    </div>
  );
}

function ArticleCard({ article, onEdit, onDelete }: {
  article: Article;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);

  const statusColors = {
    draft: "rgba(240,240,248,0.3)",
    published: ACCENT,
    scheduled: GOLD,
  };

  return (
    <div style={{
      background: "#12121e",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 14,
      padding: "18px",
      position: "relative",
    }}>
      <div style={{ display: "flex", gap: 14 }}>
        {/* Thumbnail placeholder */}
        <div style={{
          width: 100,
          height: 100,
          borderRadius: 10,
          background: "linear-gradient(135deg, rgba(31,209,168,0.15), rgba(59,130,246,0.15))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}>
          <ImageIcon size={32} color="rgba(240,240,248,0.2)" />
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
            <h3 style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 16,
              fontWeight: 700,
              color: "#f0f0f8",
              margin: 0,
              lineHeight: 1.3,
            }}>
              {article.title}
            </h3>
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 8,
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  minHeight: "unset",
                }}
              >
                <MoreVertical size={16} color="rgba(240,240,248,0.5)" />
              </button>

              {showMenu && (
                <div style={{
                  position: "absolute",
                  right: 0,
                  top: 36,
                  background: "#1a1a2a",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 10,
                  overflow: "hidden",
                  zIndex: 10,
                  minWidth: 140,
                }}>
                  <button
                    onClick={() => { onEdit(); setShowMenu(false); }}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      background: "transparent",
                      border: "none",
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: 12,
                      color: "#f0f0f8",
                      cursor: "pointer",
                      textAlign: "left",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      minHeight: "unset",
                    }}
                  >
                    <Edit3 size={12} /> Edit
                  </button>
                  <button
                    onClick={() => { onDelete(); setShowMenu(false); }}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      background: "transparent",
                      border: "none",
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: 12,
                      color: RED,
                      cursor: "pointer",
                      textAlign: "left",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      minHeight: "unset",
                    }}
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span style={{
              padding: "3px 10px",
              borderRadius: 100,
              background: `${statusColors[article.status]}15`,
              border: `1px solid ${statusColors[article.status]}30`,
              fontFamily: "'Outfit', sans-serif",
              fontSize: 10,
              fontWeight: 700,
              color: statusColors[article.status],
              textTransform: "uppercase",
            }}>
              {article.status}
            </span>
            <span style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 11,
              color: "rgba(240,240,248,0.3)",
            }}>
              {article.publishedAt ? `Published ${article.publishedAt}` : `Created ${article.createdAt}`}
            </span>
          </div>

          {article.status === "published" && (
            <div style={{ display: "flex", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Eye size={14} color="rgba(240,240,248,0.4)" />
                <span style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: 12,
                  color: "rgba(240,240,248,0.5)",
                }}>
                  {article.views.toLocaleString()}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Heart size={14} color="rgba(240,240,248,0.4)" />
                <span style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: 12,
                  color: "rgba(240,240,248,0.5)",
                }}>
                  {article.likes.toLocaleString()}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <MessageCircle size={14} color="rgba(240,240,248,0.4)" />
                <span style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: 12,
                  color: "rgba(240,240,248,0.5)",
                }}>
                  {article.comments}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function WriterDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [articles] = useState<Article[]>(MOCK_ARTICLES);

  const publishedArticles = articles.filter(a => a.status === "published");
  const totalViews = publishedArticles.reduce((sum, a) => sum + a.views, 0);
  const totalLikes = publishedArticles.reduce((sum, a) => sum + a.likes, 0);
  const totalComments = publishedArticles.reduce((sum, a) => sum + a.comments, 0);

  return (
    <div style={{ minHeight: "100vh", background: "#080810" }}>
      {/* Header */}
      <div style={{
        background: "#0d0d18",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        padding: "20px 28px",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => navigate("/")}
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                minHeight: "unset",
              }}
            >
              <ArrowLeft size={18} color="rgba(240,240,248,0.6)" />
            </button>
            <div>
              <h1 style={{
                fontFamily: "'Bebas Neue', cursive",
                fontSize: 28,
                letterSpacing: 2,
                color: "#f0f0f8",
                margin: 0,
                lineHeight: 1,
              }}>
                Writer Dashboard
              </h1>
              <p style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: 12,
                color: "rgba(240,240,248,0.4)",
                margin: "4px 0 0 0",
              }}>
                Manage your content and track performance
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab("new")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 20px",
              background: ACCENT,
              border: `1px solid ${ACCENT}`,
              borderRadius: 10,
              fontFamily: "'Outfit', sans-serif",
              fontSize: 13,
              fontWeight: 700,
              color: "#fff",
              cursor: "pointer",
              minHeight: "unset",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = "#1bbb96"}
            onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = ACCENT}
          >
            <Plus size={16} />
            New Article
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8 }}>
          {[
            { id: "overview", label: "Overview", icon: <BarChart3 size={14} /> },
            { id: "content", label: "Content", icon: <FileText size={14} /> },
            { id: "analytics", label: "Analytics", icon: <TrendingUp size={14} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "10px 18px",
                background: activeTab === tab.id ? `${ACCENT}18` : "transparent",
                border: `1px solid ${activeTab === tab.id ? `${ACCENT}35` : "transparent"}`,
                borderRadius: 10,
                fontFamily: "'Outfit', sans-serif",
                fontSize: 12,
                fontWeight: activeTab === tab.id ? 700 : 500,
                color: activeTab === tab.id ? ACCENT : "rgba(240,240,248,0.5)",
                cursor: "pointer",
                minHeight: "unset",
                transition: "all 0.2s",
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "28px" }}>
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div>
            {/* Stats Grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 16,
              marginBottom: 24,
            }}>
              <StatCard
                icon={<FileText size={20} />}
                label="Published Articles"
                value={publishedArticles.length.toString()}
                color={ACCENT}
              />
              <StatCard
                icon={<Eye size={20} />}
                label="Total Views"
                value={totalViews.toLocaleString()}
                trend="+12%"
                color={BLUE}
              />
              <StatCard
                icon={<Heart size={20} />}
                label="Total Likes"
                value={totalLikes.toLocaleString()}
                trend="+8%"
                color={RED}
              />
              <StatCard
                icon={<MessageCircle size={20} />}
                label="Total Comments"
                value={totalComments.toString()}
                trend="+15%"
                color={GOLD}
              />
            </div>

            {/* Charts */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
              gap: 20,
              marginBottom: 24,
            }}>
              {/* Views Chart */}
              <div style={{
                background: "#12121e",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 14,
                padding: "20px",
              }}>
                <h3 style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#f0f0f8",
                  marginBottom: 16,
                }}>
                  Views This Week
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={VIEWS_DATA}>
                    <defs>
                      <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={BLUE} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={BLUE} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" stroke="rgba(240,240,248,0.3)" style={{ fontSize: 11 }} />
                    <YAxis stroke="rgba(240,240,248,0.3)" style={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        background: "#1a1a2a",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                    <Area type="monotone" dataKey="views" stroke={BLUE} fill="url(#colorViews)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Engagement Chart */}
              <div style={{
                background: "#12121e",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 14,
                padding: "20px",
              }}>
                <h3 style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#f0f0f8",
                  marginBottom: 16,
                }}>
                  Engagement This Week
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={ENGAGEMENT_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" stroke="rgba(240,240,248,0.3)" style={{ fontSize: 11 }} />
                    <YAxis stroke="rgba(240,240,248,0.3)" style={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        background: "#1a1a2a",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="likes" fill={RED} radius={[8, 8, 0, 0]} />
                    <Bar dataKey="comments" fill={GOLD} radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Articles */}
            <div>
              <h2 style={{
                fontFamily: "'Bebas Neue', cursive",
                fontSize: 20,
                letterSpacing: 2,
                color: "#f0f0f8",
                marginBottom: 16,
              }}>
                Recent Articles
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {articles.slice(0, 3).map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    onEdit={() => setActiveTab("new")}
                    onDelete={() => {}}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Content Tab */}
        {activeTab === "content" && (
          <div>
            {/* Filters */}
            <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
              <div style={{ position: "relative", flex: 1, maxWidth: 400 }}>
                <Search
                  size={16}
                  color="rgba(240,240,248,0.3)"
                  style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}
                />
                <input
                  type="text"
                  placeholder="Search articles..."
                  style={{
                    width: "100%",
                    padding: "12px 14px 12px 40px",
                    background: "#12121e",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 10,
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: 13,
                    color: "#f0f0f8",
                    outline: "none",
                  }}
                />
              </div>
              <button style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 18px",
                background: "#12121e",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 10,
                fontFamily: "'Outfit', sans-serif",
                fontSize: 13,
                color: "rgba(240,240,248,0.6)",
                cursor: "pointer",
                minHeight: "unset",
              }}>
                <Filter size={16} />
                Filter
              </button>
            </div>

            {/* Articles List */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {articles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  onEdit={() => setActiveTab("new")}
                  onDelete={() => {}}
                />
              ))}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div>
            <h2 style={{
              fontFamily: "'Bebas Neue', cursive",
              fontSize: 24,
              letterSpacing: 2,
              color: "#f0f0f8",
              marginBottom: 20,
            }}>
              Performance Analytics
            </h2>

            {/* Top Performing Articles */}
            <div style={{
              background: "#12121e",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 14,
              padding: "20px",
              marginBottom: 20,
            }}>
              <h3 style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: 14,
                fontWeight: 700,
                color: "#f0f0f8",
                marginBottom: 16,
              }}>
                Top Performing Articles
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {publishedArticles
                  .sort((a, b) => b.views - a.views)
                  .slice(0, 5)
                  .map((article, index) => (
                    <div
                      key={article.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        padding: "12px",
                        background: "rgba(255,255,255,0.02)",
                        borderRadius: 10,
                      }}
                    >
                      <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: `${ACCENT}15`,
                        border: `1px solid ${ACCENT}30`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: "'Bebas Neue', cursive",
                        fontSize: 16,
                        color: ACCENT,
                      }}>
                        {index + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontFamily: "'Outfit', sans-serif",
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#f0f0f8",
                          marginBottom: 2,
                        }}>
                          {article.title}
                        </div>
                        <div style={{
                          display: "flex",
                          gap: 12,
                          fontFamily: "'Outfit', sans-serif",
                          fontSize: 11,
                          color: "rgba(240,240,248,0.4)",
                        }}>
                          <span>{article.views.toLocaleString()} views</span>
                          <span>•</span>
                          <span>{article.likes.toLocaleString()} likes</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Audience Insights */}
            <div style={{
              background: "#12121e",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 14,
              padding: "20px",
            }}>
              <h3 style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: 14,
                fontWeight: 700,
                color: "#f0f0f8",
                marginBottom: 16,
              }}>
                Audience Insights
              </h3>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: 16,
              }}>
                <div>
                  <div style={{
                    fontFamily: "'Bebas Neue', cursive",
                    fontSize: 24,
                    color: ACCENT,
                    marginBottom: 4,
                  }}>
                    2,400
                  </div>
                  <div style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: 11,
                    color: "rgba(240,240,248,0.4)",
                  }}>
                    Followers
                  </div>
                </div>
                <div>
                  <div style={{
                    fontFamily: "'Bebas Neue', cursive",
                    fontSize: 24,
                    color: BLUE,
                    marginBottom: 4,
                  }}>
                    68%
                  </div>
                  <div style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: 11,
                    color: "rgba(240,240,248,0.4)",
                  }}>
                    Engagement Rate
                  </div>
                </div>
                <div>
                  <div style={{
                    fontFamily: "'Bebas Neue', cursive",
                    fontSize: 24,
                    color: GOLD,
                    marginBottom: 4,
                  }}>
                    4.2
                  </div>
                  <div style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: 11,
                    color: "rgba(240,240,248,0.4)",
                  }}>
                    Avg. Rating
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* New Article Tab */}
        {activeTab === "new" && (
          <div style={{
            background: "#12121e",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 14,
            padding: "24px",
            maxWidth: 900,
            margin: "0 auto",
          }}>
            <h2 style={{
              fontFamily: "'Bebas Neue', cursive",
              fontSize: 24,
              letterSpacing: 2,
              color: "#f0f0f8",
              marginBottom: 20,
            }}>
              Create New Article
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Title */}
              <div>
                <label style={{
                  display: "block",
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "rgba(240,240,248,0.7)",
                  marginBottom: 8,
                }}>
                  Article Title
                </label>
                <input
                  type="text"
                  placeholder="Enter a compelling title..."
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 10,
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: 16,
                    fontWeight: 600,
                    color: "#f0f0f8",
                    outline: "none",
                  }}
                />
              </div>

              {/* Toolbar */}
              <div style={{
                display: "flex",
                gap: 8,
                padding: "12px",
                background: "rgba(255,255,255,0.02)",
                borderRadius: 10,
                flexWrap: "wrap",
              }}>
                {[
                  { icon: <Heading size={16} />, label: "Heading" },
                  { icon: <AlignLeft size={16} />, label: "Paragraph" },
                  { icon: <List size={16} />, label: "List" },
                  { icon: <ImageIcon size={16} />, label: "Image" },
                  { icon: <Link2 size={16} />, label: "Link" },
                ].map((tool) => (
                  <button
                    key={tool.label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "8px 12px",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 8,
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: 11,
                      color: "rgba(240,240,248,0.6)",
                      cursor: "pointer",
                      minHeight: "unset",
                    }}
                  >
                    {tool.icon}
                    {tool.label}
                  </button>
                ))}
              </div>

              {/* Editor */}
              <div>
                <textarea
                  placeholder="Start writing your article..."
                  style={{
                    width: "100%",
                    minHeight: 400,
                    padding: "16px",
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 10,
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: 14,
                    lineHeight: 1.7,
                    color: "#f0f0f8",
                    outline: "none",
                    resize: "vertical",
                  }}
                />
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                <button
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "12px 20px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 10,
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "rgba(240,240,248,0.6)",
                    cursor: "pointer",
                    minHeight: "unset",
                  }}
                >
                  <Save size={16} />
                  Save Draft
                </button>
                <button
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "12px 20px",
                    background: ACCENT,
                    border: `1px solid ${ACCENT}`,
                    borderRadius: 10,
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#fff",
                    cursor: "pointer",
                    minHeight: "unset",
                  }}
                >
                  <Send size={16} />
                  Publish
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default WriterDashboard;
