import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { adminApi } from "../../services/adminApi";

const GREEN = "#2ecc71";

const CATEGORIES = ["movies", "tv", "anime", "general", "bollywood", "hollywood"];
const DIFFICULTIES = ["easy", "medium", "hard"];

interface QuizData {
  id?: string;
  title?: string;
  description?: string;
  difficulty?: string;
  category?: string;
  featured?: boolean;
}

interface CreateQuizModalProps {
  quiz?: QuizData | null;
  onClose: () => void;
  onSuccess: (data: any) => void;
}

export function CreateQuizModal({ quiz, onClose, onSuccess }: CreateQuizModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    difficulty: "easy",
    category: "movies",
    featured: false,
  });

  useEffect(() => {
    if (quiz) {
      setFormData({
        title: quiz.title || "",
        description: quiz.description || "",
        difficulty: quiz.difficulty || "easy",
        category: quiz.category || "movies",
        featured: quiz.featured || false,
      });
    }
  }, [quiz]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    try {
      setLoading(true);
      const res = quiz
        ? await adminApi.updateQuiz(quiz.id!, formData)
        : await adminApi.createQuiz(formData);
      onSuccess(res || formData);
      onClose();
    } catch (err) {
      console.error("Quiz save error", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(8px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 540,
          background: "#0d0d1a",
          border: "1px solid rgba(255,255,255,0.09)",
          borderRadius: 16,
          boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <h3
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 20,
              letterSpacing: 1.5,
              color: "#f0f0f8",
              margin: 0,
            }}
          >
            {quiz ? "EDIT QUIZ" : "CREATE NEW QUIZ"}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "rgba(240,240,248,0.5)",
              cursor: "pointer",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}
        >
          <div>
            <label
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 10,
                fontWeight: 700,
                color: "rgba(240,240,248,0.4)",
                textTransform: "uppercase",
                display: "block",
                marginBottom: 6,
              }}
            >
              Quiz Title*
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Marvel Cinematic Universe Trivia"
              required
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
                padding: "8px 12px",
                color: "#fff",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 13,
                outline: "none",
              }}
            />
          </div>

          <div>
            <label
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 10,
                fontWeight: 700,
                color: "rgba(240,240,248,0.4)",
                textTransform: "uppercase",
                display: "block",
                marginBottom: 6,
              }}
            >
              Description*
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the quiz..."
              rows={3}
              required
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
                padding: "8px 12px",
                color: "#fff",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 13,
                outline: "none",
                resize: "none",
              }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: 10,
                  fontWeight: 700,
                  color: "rgba(240,240,248,0.4)",
                  textTransform: "uppercase",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                style={{
                  width: "100%",
                  background: "#141424",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  padding: "8px 12px",
                  color: "#fff",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: 12,
                }}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: 10,
                  fontWeight: 700,
                  color: "rgba(240,240,248,0.4)",
                  textTransform: "uppercase",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Difficulty
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                style={{
                  width: "100%",
                  background: "#141424",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  padding: "8px 12px",
                  color: "#fff",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: 12,
                }}
              >
                {DIFFICULTIES.map((diff) => (
                  <option key={diff} value={diff}>
                    {diff.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 14px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 8,
            }}
          >
            <input
              type="checkbox"
              id="featured"
              checked={formData.featured}
              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              style={{ cursor: "pointer" }}
            />
            <label
              htmlFor="featured"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 12,
                color: "#f0f0f8",
                cursor: "pointer",
              }}
            >
              Mark as Featured Quiz
            </label>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "8px 18px",
                borderRadius: 8,
                background: GREEN,
                border: "none",
                color: "#000",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {quiz ? "Update Quiz" : "Create Quiz"}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "8px 18px",
                borderRadius: 8,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(240,240,248,0.7)",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
