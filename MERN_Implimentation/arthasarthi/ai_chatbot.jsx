import React, { useState, useRef, useEffect } from 'react';
import { Mic, Send, Bot, User, Volume2, Sparkles, Loader2, StopCircle, RefreshCw } from 'lucide-react';

// --- CONFIGURATION ---
const API_KEY = "AIzaSyDMu8wOkj4U-SLkU1622cPo-u4h56b5Fc4"; // 🔴 PASTE YOUR GEMINI API KEY HERE

const SUGGESTIONS = [
  "💰 How to get a KCC loan?",
  "🌾 Best savings scheme for farmers?",
  "🚜 Government subsidy for tractors",
  "🛡️ How to avoid online scams?"
];

const AISathi = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Namaste! I am AI Sathi. Your personal financial assistant. Ask me about loans, banking, or schemes!", sender: 'bot' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const chatEndRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // --- LOGIC: GEMINI API ---
  const callGeminiAI = async (userQuery) => {
    setIsLoading(true);
    try {
      if (!API_KEY) throw new Error("API Key is missing");

      const systemPrompt = `You are 'AI Sathi', a friendly and knowledgeable financial assistant for rural India. 
      Your goal is to help farmers and villagers with banking, loans (like KCC), government subsidies, and financial literacy.
      Keep your answers simple, concise (max 3-4 sentences), and easy to understand. 
      If the user speaks in Hindi/Hinglish, reply in that language. Use emojis to make it friendly.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            role: "user",
            parts: [{ text: systemPrompt + "\n\nUser Query: " + userQuery }]
          }]
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);

      const botResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't process that.";
      
      addMessage(botResponse, 'bot');
      speakText(botResponse); 

    } catch (error) {
      console.error("AI Error:", error);
      addMessage("⚠️ Sorry, I am having trouble connecting to the server. Please check your internet or API Key.", 'bot');
    } finally {
      setIsLoading(false);
    }
  };

  // --- LOGIC: CHAT HANDLERS ---
  const addMessage = (text, sender) => {
    setMessages(prev => [...prev, { id: Date.now(), text, sender }]);
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    addMessage(inputText, 'user');
    callGeminiAI(inputText);
    setInputText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  // --- LOGIC: VOICE INPUT ---
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN'; 
    recognition.continuous = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
      setTimeout(() => {
          addMessage(transcript, 'user');
          callGeminiAI(transcript);
          setInputText('');
      }, 800);
    };

    recognition.start();
  };

  // --- LOGIC: TEXT TO SPEECH ---
  const speakText = (text) => {
    window.speechSynthesis.cancel(); 
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'hi-IN'; 
    utterance.rate = 1.0;
    utterance.pitch = 1.05;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 min-h-screen flex flex-col justify-center bg-slate-50 font-sans">
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-message {
          animation: fadeInUp 0.4s ease-out forwards;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-white/50 overflow-hidden flex flex-col h-[700px] relative ring-1 ring-slate-900/5">
        
        {/* Header with Pattern */}
        <div className="relative bg-gradient-to-r from-violet-600 to-indigo-600 p-6 flex items-center justify-between shadow-lg z-10">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md border border-white/10 shadow-inner">
              <Bot className="w-8 h-8 text-white drop-shadow-md" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-wide drop-shadow-sm">AI Sathi</h2>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
                <p className="text-violet-100 text-xs font-semibold tracking-wider uppercase">Online Assistant</p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 relative z-10">
            {isSpeaking && (
              <button onClick={stopSpeaking} className="bg-white/20 hover:bg-white/30 text-white p-2.5 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg backdrop-blur-sm group">
                  <StopCircle className="w-6 h-6 group-hover:text-red-300 transition-colors" />
              </button>
            )}
            <button onClick={() => setMessages([])} className="bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-full transition-all duration-300 hover:rotate-180" title="Reset Chat">
              <RefreshCw className="w-5 h-5 opacity-80" />
            </button>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-6 scroll-smooth relative">
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none"></div>
          
          <div className="text-center pb-4 relative z-10">
            <span className="bg-slate-200/60 text-slate-500 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest backdrop-blur-sm">Today</span>
          </div>

          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-message relative z-10`}>
              <div className={`flex max-w-[85%] md:max-w-[75%] gap-3 items-end ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                
                {/* Avatar */}
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 shadow-md ring-2 ring-white ${msg.sender === 'user' ? 'bg-gradient-to-br from-violet-100 to-indigo-100 text-indigo-600' : 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white'}`}>
                  {msg.sender === 'user' ? <User size={18} /> : <Sparkles size={18} />}
                </div>

                {/* Message Bubble */}
                <div className={`p-4 rounded-2xl shadow-sm text-[15px] leading-relaxed transition-all hover:shadow-md ${
                  msg.sender === 'user' 
                    ? 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-br-none' 
                    : 'bg-white text-slate-700 rounded-bl-none border border-slate-100'
                }`}>
                  {msg.text}
                  {msg.sender === 'bot' && (
                    <div className="mt-3 flex justify-between items-center border-t border-slate-100 pt-2">
                        <span className="text-[10px] text-slate-400 font-medium">Just now</span>
                        <button onClick={() => speakText(msg.text)} className="text-slate-400 hover:text-indigo-600 transition-colors p-1 rounded-full hover:bg-indigo-50">
                            <Volume2 size={16} />
                        </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start animate-message relative z-10">
               <div className="flex max-w-[85%] gap-3 items-end">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center flex-shrink-0 ring-2 ring-white shadow-md">
                    <Sparkles size={18} />
                  </div>
                  <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-3 text-slate-500">
                    <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                    <span className="text-sm font-medium">Processing your request...</span>
                  </div>
               </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white p-5 border-t border-slate-100 relative z-20">
          
          {/* Suggestions */}
          <div className="flex gap-2.5 overflow-x-auto pb-4 no-scrollbar mb-1 mask-linear">
            {SUGGESTIONS.map((sug, idx) => (
              <button 
                key={idx} 
                onClick={() => { setInputText(sug.replace(/^[^\s]+\s/, '')); handleSend(); }}
                className="whitespace-nowrap px-4 py-2 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-600 hover:text-indigo-700 rounded-full text-xs font-semibold transition-all duration-300 shadow-sm hover:shadow active:scale-95"
              >
                {sug}
              </button>
            ))}
          </div>

          <div className="flex gap-3 items-center bg-slate-50/80 p-2 rounded-[20px] border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-300 transition-all shadow-inner">
            <button 
              onClick={startListening}
              className={`p-3 rounded-full transition-all duration-300 shadow-sm ${
                isListening 
                  ? 'bg-red-500 text-white animate-pulse shadow-red-200' 
                  : 'bg-white text-slate-500 hover:text-indigo-600 hover:bg-indigo-50'
              }`}
              title="Voice Input"
            >
              <Mic className="w-5 h-5" />
            </button>

            <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your question here..." 
                className="flex-1 bg-transparent border-none text-slate-800 placeholder-slate-400 focus:ring-0 text-base font-medium px-2"
            />

            <button 
              onClick={handleSend}
              disabled={!inputText.trim() || isLoading}
              className={`p-3 rounded-full transition-all duration-300 shadow-md flex items-center justify-center transform active:scale-90 ${
                !inputText.trim() || isLoading
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-indigo-500/30'
              }`}
            >
              <Send className="w-5 h-5 ml-0.5" />
            </button>
          </div>
          
          <div className="text-center mt-3 flex justify-center items-center gap-1.5 opacity-60">
            <Sparkles className="w-3 h-3 text-indigo-500" />
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Powered by Google Gemini</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AISathi;
