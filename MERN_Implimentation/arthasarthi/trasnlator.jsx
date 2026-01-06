import React, { useState, useEffect } from 'react';
import { Mic, Volume2, ArrowRightLeft, Sparkles, Loader2, X, Copy } from 'lucide-react';

// --- CONFIGURATION ---
const API_KEY = ""; // 🔴 PASTE YOUR GEMINI API KEY HERE

const LANGUAGE_DATA = {
  haryanvi: {
    name: "Haryanvi",
    prompt: "Haryanvi (Desi dialect)",
    voice: "hi-IN", // Hindi accent as proxy
    phrases: ["Money for seeds", "Where is the bank?", "Interest rate"]
  },
  bhojpuri: {
    name: "Bhojpuri",
    prompt: "Bhojpuri language",
    voice: "hi-IN",
    phrases: ["Biya khatir paisa", "Bank kaha ba?", "Byaaj dar"]
  },
  tamil: {
    name: "Tamil",
    prompt: "Tamil language",
    voice: "ta-IN",
    phrases: ["Vithaigalukku panam", "Vanki enge?", "Vatti vigitham"]
  }
};

const Translator = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [activeLang, setActiveLang] = useState('haryanvi');
  const [direction, setDirection] = useState('eng-to-target'); // 'eng-to-target' or 'target-to-eng'
  const [isTranslating, setIsTranslating] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // --- LOGIC: TRANSLATE WITH GEMINI ---
  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    setIsTranslating(true);
    setOutputText('');

    const currentLangConfig = LANGUAGE_DATA[activeLang];
    const source = direction === 'eng-to-target' ? 'English' : currentLangConfig.prompt;
    const target = direction === 'eng-to-target' ? currentLangConfig.prompt : 'English';

    try {
      if (!API_KEY) throw new Error("API Key is missing");

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: `Translate the following text from ${source} to ${target}. Output ONLY the translated text, nothing else.\n\nText: "${inputText}"` }]
          }]
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      
      const result = data.candidates?.[0]?.content?.parts?.[0]?.text || "Translation failed.";
      setOutputText(result.trim());

    } catch (error) {
      console.error("Translation Error:", error);
      setOutputText("Error: Could not connect to AI. Check API Key.");
    } finally {
      setIsTranslating(false);
    }
  };

  // --- LOGIC: VOICE INPUT ---
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    // Set language based on input direction
    recognition.lang = direction === 'eng-to-target' ? 'en-US' : LANGUAGE_DATA[activeLang].voice;
    recognition.continuous = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
      // Optional: Auto-translate after voice input
      // handleTranslate(); 
    };

    recognition.start();
  };

  // --- LOGIC: TEXT TO SPEECH ---
  const speakOutput = () => {
    if (!outputText) return;
    const utterance = new SpeechSynthesisUtterance(outputText);
    // Set voice based on output direction
    utterance.lang = direction === 'eng-to-target' ? LANGUAGE_DATA[activeLang].voice : 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  // --- LOGIC: TOGGLE DIRECTION ---
  const toggleDirection = () => {
    setDirection(prev => prev === 'eng-to-target' ? 'target-to-eng' : 'eng-to-target');
    setInputText(outputText); // Swap text for convenience
    setOutputText(inputText);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 bg-slate-50 min-h-screen">
      
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        {/* Header Control Bar */}
        <div className="bg-slate-50 p-4 border-b border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Language Direction Toggle */}
          <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
            <span className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${direction === 'eng-to-target' ? 'bg-orange-100 text-orange-700' : 'text-slate-500'}`}>
              English
            </span>
            <button onClick={toggleDirection} className="p-2 hover:bg-slate-100 rounded-full transition text-slate-400 mx-1">
              <ArrowRightLeft className="w-4 h-4" />
            </button>
            <span className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${direction === 'target-to-eng' ? 'bg-orange-100 text-orange-700' : 'text-slate-500'}`}>
              {LANGUAGE_DATA[activeLang].name}
            </span>
          </div>

          {/* Language Selector */}
          <select 
            value={activeLang} 
            onChange={(e) => setActiveLang(e.target.value)}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            {Object.keys(LANGUAGE_DATA).map(key => (
              <option key={key} value={key}>{LANGUAGE_DATA[key].name}</option>
            ))}
          </select>
        </div>

        {/* Translation Area */}
        <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          
          {/* Input Section */}
          <div className="p-6 flex flex-col h-64 md:h-80 relative">
            <textarea
              className="flex-1 w-full resize-none text-xl bg-transparent border-none focus:ring-0 placeholder:text-slate-300 outline-none"
              placeholder={direction === 'eng-to-target' ? "Type text to translate..." : `Type in ${LANGUAGE_DATA[activeLang].name}...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            
            <div className="flex justify-between items-center mt-4">
              <button 
                onClick={startListening}
                className={`p-3 rounded-full transition-all duration-300 ${isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
              >
                <Mic className="w-5 h-5" />
              </button>
              
              {inputText && (
                <button onClick={() => setInputText('')} className="text-xs font-semibold text-slate-400 hover:text-red-500 uppercase">
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Output Section */}
          <div className="p-6 flex flex-col h-64 md:h-80 relative bg-orange-50/30">
            <div className="flex-1 overflow-y-auto">
              {isTranslating ? (
                <div className="flex flex-col items-center justify-center h-full text-orange-500">
                  <Loader2 className="w-8 h-8 animate-spin mb-2" />
                  <span className="text-sm font-medium">Translating...</span>
                </div>
              ) : outputText ? (
                <p className="text-xl md:text-2xl font-medium text-slate-800 leading-relaxed">
                  {outputText}
                </p>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-300">
                  <Sparkles className="w-10 h-10 mb-2 opacity-50" />
                  <span>Translation</span>
                </div>
              )}
            </div>

            <div className="flex justify-end mt-4">
              <button 
                onClick={speakOutput}
                disabled={!outputText}
                className="p-3 bg-white border border-slate-200 rounded-full text-slate-600 hover:text-orange-600 hover:border-orange-200 transition shadow-sm disabled:opacity-50"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-4 bg-white border-t border-slate-100 flex flex-col items-center gap-4">
          <button 
            onClick={handleTranslate}
            disabled={isTranslating || !inputText}
            className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-3 px-12 rounded-xl shadow-lg transform active:scale-95 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isTranslating ? 'Processing...' : 'Translate Now'}
          </button>

          {/* Quick Phrases Chips */}
          <div className="flex flex-wrap justify-center gap-2">
            {LANGUAGE_DATA[activeLang].phrases.map((phrase, idx) => (
              <button
                key={idx}
                onClick={() => setInputText(phrase)}
                className="px-3 py-1 bg-slate-50 hover:bg-orange-50 border border-slate-200 rounded-full text-xs text-slate-600 transition"
              >
                {phrase}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Translator;
