import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Sparkles, Zap, Dumbbell, Apple, Scale, Heart } from 'lucide-react';
import { aiAPI } from '../services/api';
import { useAuthStore } from '../stores/useStore';
import './AICoach.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const QUICK_PROMPTS = [
  { label: '💪 Workout Plan', message: 'Give me a weekly workout split plan for intermediate level' },
  { label: '🍛 Indian Diet', message: 'Suggest a high-protein Indian diet plan for muscle gain' },
  { label: '💊 Supplements', message: 'What supplements should I take for muscle building?' },
  { label: '🔥 Fat Loss', message: 'How to lose belly fat effectively with diet and exercise?' },
  { label: '🏋️ Form Check', message: 'Explain proper squat and deadlift form for safety' },
  { label: '💤 Recovery', message: 'Best recovery practices after an intense workout session' },
];

function formatMessageContent(content: string): React.ReactNode {
  // Simple markdown-like rendering for bold and lists
  const lines = content.split('\n');
  return lines.map((line, i) => {
    // Bold **text** or *text*
    let formatted: React.ReactNode = line;
    if (line.includes('**')) {
      const parts = line.split(/\*\*(.*?)\*\*/g);
      formatted = parts.map((part, j) =>
        j % 2 === 1 ? <strong key={j}>{part}</strong> : part
      );
    }

    // Bullet points
    if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
      return (
        <div key={i} style={{ paddingLeft: 12, marginBottom: 4, display: 'flex', gap: 6 }}>
          <span style={{ color: 'var(--primary-400)' }}>•</span>
          <span>{typeof formatted === 'string' ? formatted.replace(/^[\*\-]\s/, '') : formatted}</span>
        </div>
      );
    }

    // Numbered items
    if (/^\d+\.\s/.test(line.trim())) {
      return (
        <div key={i} style={{ paddingLeft: 8, marginBottom: 4 }}>
          {formatted}
        </div>
      );
    }

    // Empty lines
    if (line.trim() === '') {
      return <div key={i} style={{ height: 8 }} />;
    }

    return <div key={i} style={{ marginBottom: 2 }}>{formatted}</div>;
  });
}

export default function AICoach() {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hey ${user?.firstName || 'there'}! 👋 I'm your Athrix AI fitness coach.\n\nI can help you with:\n* Custom workout plans & training splits\n* Indian & international diet plans with macros\n* Exercise form & technique guidance\n* Supplement recommendations\n* Weight loss & muscle gain strategies\n\nWhat would you like to work on today?`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || loading) return;
    const userMsg: Message = { role: 'user', content, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await aiAPI.chat({ message: content, history: messages.map(m => ({ role: m.role, content: m.content })) });
      const responseText = res.data?.data?.response || res.data?.response || '';
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: responseText,
        timestamp: new Date()
      }]);
    } catch {
      // Intelligent offline responses based on keywords
      const lower = content.toLowerCase();
      let response = '';

      if (lower.includes('workout') || lower.includes('split') || lower.includes('plan') || lower.includes('routine')) {
        response = "Here's a recommended Push-Pull-Legs split:\n\n**Push Day (Chest, Shoulders, Triceps)**\n* Bench Press — 4×8\n* Overhead Press — 3×10\n* Incline Dumbbell Press — 3×12\n* Tricep Dips — 3×12\n\n**Pull Day (Back, Biceps)**\n* Deadlifts — 4×5\n* Barbell Rows — 4×10\n* Pull-ups — 3×Max\n* Bicep Curls — 3×12\n\n**Legs Day (Quads, Hamstrings, Calves)**\n* Squats — 4×10\n* Romanian Deadlifts — 3×12\n* Leg Press — 3×15\n* Calf Raises — 4×20";
      } else if (lower.includes('indian') || lower.includes('diet') || lower.includes('food') || lower.includes('dal') || lower.includes('paneer')) {
        response = "Here's a high-protein Indian diet plan:\n\n**Breakfast (8:00 AM)**\n* 3 Egg Whites + 1 Whole Egg Omelette — 180 kcal | 18g protein\n* Multigrain Roti (1 pc) — 120 kcal\n\n**Mid-Morning (10:30 AM)**\n* Sattu Drink (2 tbsp) — 150 kcal | 9g protein\n\n**Lunch (1:00 PM)**\n* Chicken Tikka (100g) — 165 kcal | 25g protein\n* Brown Rice (1 cup) — 215 kcal\n* Dal Tadka (1 bowl) — 120 kcal | 8g protein\n\n**Evening Snack (5:00 PM)**\n* Paneer Tikka (80g) — 210 kcal | 14g protein\n\n**Dinner (8:00 PM)**\n* Grilled Fish (150g) — 200 kcal | 30g protein\n* Salad — 50 kcal";
      } else if (lower.includes('supplement')) {
        response = "**Recommended supplements for fitness goals:**\n\n* **Whey Protein** — 1 scoop post-workout (25g protein). Best for muscle recovery.\n* **Creatine Monohydrate** — 5g daily. Proven to increase strength and power output.\n* **Multivitamins** — Fill nutritional gaps from diet.\n* **Fish Oil (Omega-3)** — 1000mg daily for joint health and recovery.\n* **Vitamin D3** — 2000 IU daily, especially if limited sun exposure.\n\nAlways consult your doctor before starting any supplement regimen.";
      } else if (lower.includes('fat') || lower.includes('weight loss') || lower.includes('lose')) {
        response = "**Science-backed fat loss strategy:**\n\n* Maintain a caloric deficit of 300-500 kcal/day\n* Prioritize protein (1.6-2g per kg body weight) to preserve muscle\n* Combine resistance training (3-4x/week) with moderate cardio (2-3x/week)\n* Sleep 7-9 hours for optimal hormone regulation\n* Drink 3+ liters of water daily\n* Avoid processed foods and refined sugars\n\nConsistency over intensity is key. Track your progress weekly!";
      } else if (lower.includes('form') || lower.includes('squat') || lower.includes('deadlift') || lower.includes('technique')) {
        response = "**Barbell Squat Form Guide:**\n\n1. Place bar on upper traps, not on your neck\n2. Stand feet shoulder-width apart, toes slightly out\n3. Brace core, push hips back like sitting in a chair\n4. Descend until thighs are parallel to the floor\n5. Drive through heels to stand back up\n6. Keep knees tracking over toes throughout\n\n**Deadlift Form Guide:**\n\n1. Stand with feet hip-width, bar over mid-foot\n2. Hinge at hips, grip bar just outside shins\n3. Flat back, chest up, shoulders retracted\n4. Brace core, drive through the floor\n5. Keep bar close to your body throughout\n6. Lock out by pushing hips forward";
      } else {
        response = `Great question! As your AI fitness coach, I can help with:\n\n* **Workout plans** — PPL, Upper/Lower, Full Body splits\n* **Nutrition guidance** — Indian & international meal plans with macros\n* **Exercise form** — Proper technique for compound and isolation movements\n* **Supplements** — Evidence-based supplement recommendations\n* **Weight management** — Fat loss and muscle gain strategies\n* **Recovery** — Sleep, stretching, and active recovery tips\n\nTry asking me something specific like "Give me a chest workout" or "What should I eat for muscle gain?"`;
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response,
        timestamp: new Date()
      }]);
    }
    setLoading(false);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="ai-coach-container">
      <div className="ai-coach-header">
        <div className="flex-between">
          <div>
            <h2>
              <Sparkles size={22} style={{ color: 'var(--primary-400)' }} />
              AI Coach
            </h2>
            <p>Get personalized fitness & nutrition advice from Athrix AI</p>
          </div>
          <span className="ai-header-badge">
            <Zap size={10} /> Online
          </span>
        </div>
      </div>

      <div className="ai-chat-card">
        {/* Messages */}
        <div className="ai-messages-area">
          {messages.map((msg, i) => (
            <div key={i} className={`ai-message ${msg.role}`}>
              <div className="ai-message-avatar">
                {msg.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
              </div>
              <div>
                <div className="ai-message-content">
                  {formatMessageContent(msg.content)}
                </div>
                <span className="ai-message-time">{formatTime(msg.timestamp)}</span>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="ai-typing-indicator">
              <div className="ai-message-avatar">
                <Bot size={16} />
              </div>
              <div className="typing-dots">
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick prompts */}
        {messages.length <= 1 && (
          <div className="ai-suggestion-chips">
            {QUICK_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                className="ai-chip"
                onClick={() => sendMessage(prompt.message)}
              >
                {prompt.label}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="ai-input-bar">
          <input
            placeholder="Ask Athrix anything about fitness..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
            disabled={loading}
          />
          <button
            className="ai-send-btn"
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
