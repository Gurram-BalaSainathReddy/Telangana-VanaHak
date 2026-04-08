import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const SUGGESTIONS = [
  "Which district has the highest FRA claim approval rate?",
  "Summarize the overall FRA implementation status in Telangana",
  "What are the main challenges in FRA implementation?",
  "Compare individual vs community claims across districts",
];

export default function AIAssistant() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  const { data: districts = [] } = useQuery({
    queryKey: ['districts'],
    queryFn: () => base44.entities.District.list(),
  });
  const { data: claims = [] } = useQuery({
    queryKey: ['claims'],
    queryFn: () => base44.entities.FRAClaim.list('-created_date', 500),
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const buildContext = () => {
    const districtSummary = districts.map(d => 
      `${d.name}: Filed=${d.total_claims_filed}, Approved=${d.claims_approved}, Rejected=${d.claims_rejected}, Pending=${d.claims_pending}, Land=${d.total_land_distributed_acres}ac, ForestArea=${d.forest_area_sq_km}sqkm, TribalPop=${d.tribal_population}`
    ).join('\n');

    const totalFiled = districts.reduce((s, d) => s + (d.total_claims_filed || 0), 0);
    const totalApproved = districts.reduce((s, d) => s + (d.claims_approved || 0), 0);
    const totalRejected = districts.reduce((s, d) => s + (d.claims_rejected || 0), 0);
    const totalPending = districts.reduce((s, d) => s + (d.claims_pending || 0), 0);
    const totalLand = districts.reduce((s, d) => s + (d.total_land_distributed_acres || 0), 0);

    return `You are an AI expert on Forest Rights Act (FRA) implementation in Telangana, India. 
You have access to the following data:

OVERALL SUMMARY:
- Total Districts: ${districts.length}
- Total Claims Filed: ${totalFiled}
- Total Approved: ${totalApproved} (${totalFiled > 0 ? ((totalApproved/totalFiled)*100).toFixed(1) : 0}%)
- Total Rejected: ${totalRejected}
- Total Pending: ${totalPending}
- Total Land Distributed: ${totalLand} acres
- Total Individual Claims in DB: ${claims.filter(c => c.claim_type === 'individual').length}
- Total Community Claims in DB: ${claims.filter(c => c.claim_type === 'community').length}

DISTRICT-WISE DATA:
${districtSummary}

Answer questions accurately based on this data. Provide insightful analysis. Use markdown formatting. If data is not available, say so.`;
  };

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `${buildContext()}\n\nUser question: ${text}`,
    });

    setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    setLoading(false);
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="p-6 lg:p-8 pb-0">
        <h1 className="text-2xl font-bold text-foreground">AI Assistant</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Ask questions about FRA implementation data</p>
      </div>

      {/* Chat Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 lg:px-8 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <div className="text-center">
              <h2 className="text-lg font-semibold text-foreground">FRA Intelligence Assistant</h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-md">
                Ask me about FRA claims, district performance, approval rates, or any analysis you need.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl w-full">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(s)}
                  className="text-left text-sm p-3 rounded-xl border border-border hover:bg-muted/50 hover:border-primary/30 transition-all text-muted-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot className="w-4 h-4 text-primary" />
              </div>
            )}
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
              msg.role === 'user'
                ? 'bg-primary text-primary-foreground'
                : 'bg-card border border-border'
            }`}>
              {msg.role === 'user' ? (
                <p className="text-sm">{msg.content}</p>
              ) : (
                <ReactMarkdown className="text-sm prose prose-sm prose-slate max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                  {msg.content}
                </ReactMarkdown>
              )}
            </div>
            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                <User className="w-4 h-4 text-primary-foreground" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div className="bg-card border border-border rounded-2xl px-4 py-3">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 lg:px-8 border-t border-border bg-card/50 backdrop-blur-sm">
        <form
          onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
          className="flex gap-3 max-w-3xl mx-auto"
        >
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about FRA implementation..."
            className="flex-1"
            disabled={loading}
          />
          <Button type="submit" disabled={loading || !input.trim()} size="icon">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}