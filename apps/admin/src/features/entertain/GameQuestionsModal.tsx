import { useState } from "react";
import { X, Plus, Trash2, Check, Loader2 } from "lucide-react";

const GREEN = "#2ecc71";
const RED = "#e84545";
const A = "#7c5cfc";

export interface Question {
  id?: string;
  question_text: string;
  options: string[];
  correct_option_index: number;
}

interface GameQuestionsModalProps {
  quizTitle: string;
  initialQuestions?: Question[];
  onClose: () => void;
  onSave: (questions: Question[]) => void;
}

export function GameQuestionsModal({
  quizTitle,
  initialQuestions = [],
  onClose,
  onSave,
}: GameQuestionsModalProps) {
  const [questions, setQuestions] = useState<Question[]>(
    initialQuestions.length > 0
      ? initialQuestions
      : [
          {
            question_text: "",
            options: ["", "", "", ""],
            correct_option_index: 0,
          },
        ]
  );
  const [saving, setSaving] = useState(false);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question_text: "",
        options: ["", "", "", ""],
        correct_option_index: 0,
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestionText = (index: number, text: string) => {
    const next = [...questions];
    next[index].question_text = text;
    setQuestions(next);
  };

  const updateOptionText = (qIndex: number, oIndex: number, text: string) => {
    const next = [...questions];
    next[qIndex].options[oIndex] = text;
    setQuestions(next);
  };

  const updateCorrectOption = (qIndex: number, oIndex: number) => {
    const next = [...questions];
    next[qIndex].correct_option_index = oIndex;
    setQuestions(next);
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      onSave(questions);
      setSaving(false);
      onClose();
    }, 400);
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
          maxWidth: 680,
          background: "#0d0d1a",
          border: "1px solid rgba(255,255,255,0.09)",
          borderRadius: 16,
          boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
          display: "flex",
          flexDirection: "column",
          maxHeight: "90vh",
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
          <div>
            <h3
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 20,
                letterSpacing: 1.5,
                color: "#f0f0f8",
                margin: 0,
              }}
            >
              MANAGE QUESTIONS
            </h3>
            <p
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 11,
                color: "rgba(240,240,248,0.4)",
                margin: "2px 0 0",
              }}
            >
              {quizTitle}
            </p>
          </div>
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

        {/* Scrollable Questions List */}
        <div
          style={{
            overflowY: "auto",
            padding: 20,
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {questions.map((q, qIdx) => (
            <div
              key={qIdx}
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 12,
                padding: 16,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 10,
                }}
              >
                <span
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: 14,
                    letterSpacing: 1,
                    color: A,
                  }}
                >
                  QUESTION #{qIdx + 1}
                </span>
                {questions.length > 1 && (
                  <button
                    onClick={() => removeQuestion(qIdx)}
                    style={{
                      background: "none",
                      border: "none",
                      color: RED,
                      cursor: "pointer",
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              <input
                type="text"
                placeholder="Enter question prompt..."
                value={q.question_text}
                onChange={(e) => updateQuestionText(qIdx, e.target.value)}
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
                  marginBottom: 12,
                }}
              />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {q.options.map((opt, oIdx) => {
                  const isCorrect = q.correct_option_index === oIdx;
                  return (
                    <div
                      key={oIdx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        background: isCorrect ? `${GREEN}12` : "rgba(255,255,255,0.03)",
                        border: `1px solid ${isCorrect ? `${GREEN}35` : "rgba(255,255,255,0.08)"}`,
                        borderRadius: 8,
                        padding: "4px 8px",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => updateCorrectOption(qIdx, oIdx)}
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          background: isCorrect ? GREEN : "rgba(255,255,255,0.1)",
                          border: "none",
                          color: isCorrect ? "#000" : "transparent",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          flexShrink: 0,
                        }}
                      >
                        <Check size={12} />
                      </button>
                      <input
                        type="text"
                        placeholder={`Option ${oIdx + 1}`}
                        value={opt}
                        onChange={(e) => updateOptionText(qIdx, oIdx, e.target.value)}
                        style={{
                          width: "100%",
                          background: "transparent",
                          border: "none",
                          color: "#fff",
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontSize: 12,
                          outline: "none",
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <button
            onClick={addQuestion}
            style={{
              padding: "10px 0",
              borderRadius: 10,
              background: "rgba(255,255,255,0.03)",
              border: "1px dashed rgba(255,255,255,0.15)",
              color: "rgba(240,240,248,0.7)",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <Plus size={14} /> Add Another Question
          </button>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 10,
            padding: "14px 20px",
            borderTop: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <button
            onClick={handleSave}
            disabled={saving}
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
            {saving && <Loader2 size={14} className="animate-spin" />}
            Save Questions
          </button>
          <button
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
      </div>
    </div>
  );
}
