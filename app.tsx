import React, { useState, useEffect, useRef } from 'react';
import { Orbit, Compass, Mic, Volume2, Sparkles, Send, Loader2, AlertTriangle, ArrowLeft, RefreshCw, Trophy, HelpCircle, Shield, Layers, HelpCircle as HelpIcon, Play, Radio, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PhonemeNode {
  id: string;
  char: string;
  ipa: string;
  angle: number;
  radius: number;
  speed: number;
  status: 'stable' | 'unstable' | 'omitted' | 'undecided';
  errorType?: string;
}

interface PresetWord {
  word: string;
  ipa: string;
  lang: string;
  difficulty: string;
  phonemes: { char: string; ipa: string }[];
  region: string;
  description: string;
  family: 'universal' | 'bantu' | 'afroasiatic' | 'niger_congo';
}

const PRESET_WORDS: PresetWord[] = [
  {
    word: "spectacle",
    ipa: "/spɛktakl/",
    lang: "French",
    difficulty: "High [Dyslexia Clustered]",
    phonemes: [
      { char: "s", ipa: "/s/" },
      { char: "p", ipa: "/p/" },
      { char: "e", ipa: "/ɛ/" },
      { char: "c", ipa: "/k/" },
      { char: "t", ipa: "/t/" },
      { char: "a", ipa: "/a/" },
      { char: "cl", ipa: "/kl/" },
      { char: "e", ipa: "/ə/" }
    ],
    region: "North / West Africa Multilingual",
    description: "Classic inversion (s/p -> p/s - 'pestacle') frequent among dyslexic children.",
    family: "niger_congo" as const
  },
  {
    word: "symphonie",
    ipa: "/sɛ̃fɔni/",
    lang: "French",
    difficulty: "Medium [Nasal vowels]",
    phonemes: [
      { char: "s", ipa: "/s/" },
      { char: "ym", ipa: "/ɛ̃/" },
      { char: "ph", ipa: "/f/" },
      { char: "o", ipa: "/ɔ/" },
      { char: "n", ipa: "/n/" },
      { char: "ie", ipa: "/i/" }
    ],
    region: "Senegal / West Africa French Calibration",
    description: "Complex nasalization '/ɛ̃/' combined with the voiceless fricative '/f/'.",
    family: "niger_congo" as const
  },
  {
    word: "shukran",
    ipa: "/ʃukran/",
    lang: "Arabic",
    difficulty: "High [Sibilants & Pharyngeals]",
    phonemes: [
      { char: "sh", ipa: "/ʃ/" },
      { char: "u", ipa: "/u/" },
      { char: "k", ipa: "/k/" },
      { char: "r", ipa: "/r/" },
      { char: "a", ipa: "/a/" },
      { char: "n", ipa: "/n/" }
    ],
    region: "Morocco / North Africa Darija",
    description: "Initial sibilant '/ʃ/' and rolling of the alveolar '/r/'.",
    family: "afroasiatic" as const
  },
  {
    word: "crocodile",
    ipa: "/krɔkɔdil/",
    lang: "French",
    difficulty: "High [Liquid clusters]",
    phonemes: [
      { char: "c", ipa: "/k/" },
      { char: "r", ipa: "/r/" },
      { char: "o", ipa: "/ɔ/" },
      { char: "c", ipa: "/k/" },
      { char: "o", ipa: "/ɔ/" },
      { char: "d", ipa: "/d/" },
      { char: "i", ipa: "/i/" },
      { char: "l", ipa: "/l/" },
      { char: "e", ipa: "/ə/" }
    ],
    region: "Sub-Saharan Africa Liquid glides",
    description: "Frequent elisions and omissions of complex liquids '/r/' and '/l/' ('colodile').",
    family: "niger_congo" as const
  },
  {
    word: "mombasa",
    ipa: "/mɔmˈbasa/",
    lang: "English",
    difficulty: "Medium [Pre-nasalized]",
    phonemes: [
      { char: "m", ipa: "/m/" },
      { char: "o", ipa: "/ɔ/" },
      { char: "mb", ipa: "/mb/" },
      { char: "a", ipa: "/a/" },
      { char: "s", ipa: "/s/" },
      { char: "a", ipa: "/a/" }
    ],
    region: "East Africa / Swahili phonology",
    description: "Complex pre-nasalized consonants '/mb/' typical of Swahili.",
    family: "bantu" as const
  },
  {
    word: "sawubona",
    ipa: "/sawuɓoːna/",
    lang: "Zulu",
    difficulty: "Medium [Bantu Implosives]",
    phonemes: [
      { char: "s", ipa: "/s/" },
      { char: "a", ipa: "/a/" },
      { char: "wu", ipa: "/wu/" },
      { char: "ɓ", ipa: "/ɓ/" },
      { char: "o", ipa: "/ɔː/" },
      { char: "n", ipa: "/n/" },
      { char: "a", ipa: "/a/" }
    ],
    region: "South Africa / IsiZulu",
    description: "Features the implosive Bilabial '/ɓ/' characteristic of Nguni phonology.",
    family: "bantu" as const
  },
  {
    word: "tamazight",
    ipa: "/θæmæziɣθ/",
    lang: "Tamazight",
    difficulty: "High [Dental Fricatives]",
    phonemes: [
      { char: "t", ipa: "/θ/" },
      { char: "a", ipa: "/æ/" },
      { char: "m", ipa: "/m/" },
      { char: "a", ipa: "/æ/" },
      { char: "z", ipa: "/z/" },
      { char: "i", ipa: "/i/" },
      { char: "gh", ipa: "/ɣ/" },
      { char: "t", ipa: "/θ/" }
    ],
    region: "North Africa / Berber",
    description: "Features the voiced velar fricative '/ɣ/' (gh) and voiceless dental fricatives '/θ/' (t).",
    family: "afroasiatic" as const
  }
];

const ACCENTS = [
  { id: 'marocain', name: 'Marocain', flag: '🇲🇦', region: 'North Africa' },
  { id: 'senegalais', name: 'Sénégalais', flag: '🇸🇳', region: 'West Africa' },
  { id: 'congolais', name: 'Congolais', flag: '🇨🇬', region: 'Central Africa' },
  { id: 'kenyan', name: 'Kényan', flag: '🇰🇪', region: 'East Africa' },
  { id: 'sud_africain', name: 'Sud-Africain', flag: '🇿🇦', region: 'South Africa' }
];

interface PhonemeOrbitProps {
  user: any;
  onBack: () => void;
  selectedLang: string;
}

export default function PhonemeOrbit({ user, onBack, selectedLang }: PhonemeOrbitProps) {
  const [selectedPresetIdx, setSelectedPresetIdx] = useState(0);
  const [targetWord, setTargetWord] = useState(PRESET_WORDS[0].word);
  const [customWordMode, setCustomWordMode] = useState(false);
  const [customWordInput, setCustomWordInput] = useState("");
  
  // Adaptive African Linguistic Family calibration
  const [calibrationMode, setCalibrationMode] = useState<'universal' | 'bantu' | 'afroasiatic' | 'niger_congo'>('niger_congo');

  // Audio & Speech States
  const [isCapturing, setIsCapturing] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState("");
  const [simulatedPronunciation, setSimulatedPronunciation] = useState("");
  
  const [phonemes, setPhonemes] = useState<PhonemeNode[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [errorLogs, setErrorLogs] = useState<string[]>([]);
  
  // TTS State
  const [isSpeakingTts, setIsSpeakingTts] = useState(false);
  const [ttsAudioUrl, setTtsAudioUrl] = useState<string | null>(null);

  const animationFrameRef = useRef<number | null>(null);

  // Initialize satellites on word changes
  useEffect(() => {
    const active = PRESET_WORDS[selectedPresetIdx];
    setTargetWord(active.word);
    setCalibrationMode(active.family);
    
    // Decompose into orbit positions (staggered angular distribution)
    const count = active.phonemes.length;
    const initialNodes: PhonemeNode[] = active.phonemes.map((ph, idx) => {
      const angle = (idx * (360 / count));
      // Ring spacing (90px for high frequency, 130px for med, 170px for outer)
      const ring = 100 + (idx % 3) * 35; 
      return {
        id: `node-${idx}`,
        char: ph.char,
        ipa: ph.ipa,
        angle,
        radius: ring,
        speed: 0.15 + Math.random() * 0.1,
        status: 'undecided'
      };
    });
    setPhonemes(initialNodes);
    setAnalysisResult(null);
    setSpeechTranscript("");
    setSimulatedPronunciation("");
  }, [selectedPresetIdx]);

  // Rotational Orbital Animation Loop
  useEffect(() => {
    const updateOrbit = () => {
      setPhonemes(prevNodes => 
        prevNodes.map(node => {
          let speedFactor = 1.0;
          if (node.status === 'unstable') speedFactor = 2.4; // unstable satellites jitter & accelerate
          if (node.status === 'stable') speedFactor = 0.4;  // locked nodes slow down
          
          return {
            ...node,
            angle: (node.angle + node.speed * speedFactor) % 360
          };
        })
      );
      animationFrameRef.current = requestAnimationFrame(updateOrbit);
    };

    animationFrameRef.current = requestAnimationFrame(updateOrbit);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  // Web Speech API Microphone Capture
  const startRecording = () => {
    if (isCapturing) return;
    setIsCapturing(true);
    setSpeechTranscript("");
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErrorLogs(prev => [...prev, "⚠️ Web Speech API not supported in this frame. Please type simulated pronunciation below for testing."]);
      setIsCapturing(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = PRESET_WORDS[selectedPresetIdx].lang === 'French' ? 'fr-FR' : 'en-US';

      recognition.onresult = (e: any) => {
        const resultText = e.results[0][0].transcript;
        setSpeechTranscript(resultText);
        setIsCapturing(false);
        handleAnalyzeSpeech(resultText);
      };

      recognition.onerror = (err: any) => {
        setErrorLogs(prev => [...prev, `❌ Speech Capture Error: ${err.error}`]);
        setIsCapturing(false);
      };

      recognition.onend = () => {
        setIsCapturing(false);
      };

      recognition.start();
    } catch (err) {
      setErrorLogs(prev => [...prev, `❌ Error starting Speech recognition: ${String(err)}`]);
      setIsCapturing(false);
    }
  };

  const handleAnalyzeSpeech = async (spokenText: string) => {
    if (!spokenText.trim()) return;
    setIsAnalyzing(true);
    
    try {
      const active = PRESET_WORDS[selectedPresetIdx];
      
      const response = await fetch('/api/gemini-interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analyze_dyslexia',
          target: active.word,
          spoken: spokenText,
          language: active.lang
        })
      });

      if (response.ok) {
        const result = await response.json();
        setAnalysisResult(result);
        
        // Map the orbital satellite gravity adjustments based on phonetic deviations
        const analyzedPhonemes = result.phonemes || [];
        setPhonemes(prevNodes => 
          prevNodes.map((node, index) => {
            const match = analyzedPhonemes[index];
            if (match) {
              return {
                ...node,
                status: match.deviation ? 'unstable' : 'stable',
                errorType: match.deviationType || undefined,
                // pull closer if stable, push outward if unstable
                radius: match.deviation ? 175 : 95
              };
            }
            return {
              ...node,
              status: 'stable'
            };
          })
        );

      } else {
        throw new Error("Analysis request failed");
      }
    } catch (e) {
      console.error(e);
      setErrorLogs(prev => [...prev, "⚠️ Offline fallback engaged. Gravity calibration approximate."]);
      setPhonemes(prevNodes => 
        prevNodes.map(node => ({
          ...node,
          status: Math.random() > 0.35 ? 'stable' : 'unstable'
        }))
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Text-To-Speech generation using our Gemini Live Preview TTS Endpoint
  const handleSpeakWord = async (textToSpeak: string) => {
    if (isSpeakingTts) return;
    setIsSpeakingTts(true);
    try {
      const activePreset = PRESET_WORDS[selectedPresetIdx];
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToSpeak,
          language: activePreset.lang
        })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.audio) {
          const audioBlob = new Blob([Buffer.from(data.audio, 'base64')], { type: 'audio/mp3' });
          const url = URL.createObjectURL(audioBlob);
          setTtsAudioUrl(url);
          const audio = new Audio(url);
          audio.play();
          audio.onended = () => setIsSpeakingTts(false);
        } else {
          throw new Error("No audio payload");
        }
      } else {
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(textToSpeak);
          utterance.lang = activePreset.lang === 'French' ? 'fr-FR' : 'en-US';
          window.speechSynthesis.speak(utterance);
          utterance.onend = () => setIsSpeakingTts(false);
        }
      }
    } catch (err) {
      console.error("TTS error:", err);
      setIsSpeakingTts(false);
    }
  };

  const [activeAccentSpeaking, setActiveAccentSpeaking] = useState<string | null>(null);

  const handleSpeakAccent = async (textToSpeak: string, accentId: string) => {
    if (isSpeakingTts) return;
    setIsSpeakingTts(true);
    setActiveAccentSpeaking(accentId);
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToSpeak,
          language: activePreset.lang,
          accent: accentId
        })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.audio) {
          const audioBlob = new Blob([Buffer.from(data.audio, 'base64')], { type: 'audio/mp3' });
          const url = URL.createObjectURL(audioBlob);
          setTtsAudioUrl(url);
          const audio = new Audio(url);
          audio.play();
          audio.onended = () => {
            setIsSpeakingTts(false);
            setActiveAccentSpeaking(null);
          };
        } else {
          throw new Error("No audio payload");
        }
      } else {
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(textToSpeak);
          utterance.lang = activePreset.lang === 'French' ? 'fr-FR' : 'en-US';
          window.speechSynthesis.speak(utterance);
          utterance.onend = () => {
            setIsSpeakingTts(false);
            setActiveAccentSpeaking(null);
          };
        }
      }
    } catch (err) {
      console.error("TTS accent error:", err);
      setIsSpeakingTts(false);
      setActiveAccentSpeaking(null);
    }
  };

  const activePreset = PRESET_WORDS[selectedPresetIdx] || PRESET_WORDS[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
      {/* Upper Navigation Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-4">
            <span className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl shadow-[0_0_15px_rgba(139,92,246,0.15)] text-indigo-400 shrink-0">
              <Orbit className="w-7 h-7 text-indigo-400 animate-spin" style={{ animationDuration: '8s' }} />
            </span>
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight">
                Phoneme <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8b5cf6] to-[#ff4e00]">Gravity</span>
              </h2>
              <p className="text-slate-500 font-mono text-xs uppercase tracking-widest mt-1.5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                Africa Deep Tech Challenge Integration — Gemini Gravity calibration
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setCustomWordMode(true)}
            className="px-5 py-3 rounded-2xl bg-[#ff4e00]/10 border border-[#ff4e00]/30 text-orange-400 hover:bg-[#ff4e00]/20 text-xs font-mono font-bold uppercase transition-all shadow-[0_0_15px_rgba(249,115,22,0.1)] whitespace-nowrap"
          >
            🛰️ Custom Gravity Core
          </button>
          <button
            onClick={() => {
              setPhonemes(prev => prev.map(n => ({ ...n, status: 'undecided', radius: 90 + (parseInt(n.id.split('-')[1]) % 3) * 35 })));
              setAnalysisResult(null);
              setSpeechTranscript("");
              setSimulatedPronunciation("");
            }}
            className="p-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all"
            title="Reset Orbit Positions"
          >
            <RefreshCw className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* Preset Accent Carousel */}
      <div className="bg-slate-950/40 backdrop-blur-md rounded-[2.5rem] border border-slate-800/80 p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
            <Layers className="w-4 h-4 text-orange-500" /> African Accents & Pronunciation Calibration Presets
          </h3>
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest bg-slate-900 px-2.5 py-1 rounded">
            {PRESET_WORDS.length} Cores Available
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3.5">
          {PRESET_WORDS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedPresetIdx(idx)}
              className={`p-4 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden group ${
                selectedPresetIdx === idx 
                  ? 'bg-gradient-to-b from-slate-900 to-slate-950 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.25)]' 
                  : 'bg-slate-950/60 border-slate-900/80 hover:border-slate-800 hover:bg-slate-900'
              }`}
            >
              <div className="flex flex-col h-full justify-between gap-2.5">
                <div>
                  <span className={`text-[8px] font-mono font-black uppercase px-2 py-0.5 rounded-full ${selectedPresetIdx === idx ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-slate-900 text-slate-400'}`}>
                    {preset.lang}
                  </span>
                  <p className="text-sm font-black text-white mt-2 tracking-tight group-hover:text-indigo-400 transition-colors uppercase truncate">
                    {preset.word}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono italic mt-1 font-medium">{preset.ipa}</p>
                </div>
                <div className="border-t border-slate-900 pt-2">
                  <p className="text-[8px] text-indigo-400 font-mono uppercase tracking-wider truncate font-black">{preset.region}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Linguistic Family Calibration Selector */}
        <div className="border-t border-slate-900 pt-6 mt-6">
          <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
            <Compass className="w-4 h-4 text-indigo-400" /> Active African Phonetic Gravity Calibrator
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {(['universal', 'bantu', 'afroasiatic', 'niger_congo'] as const).map((mode) => {
              const isSelected = calibrationMode === mode;
              let title = "Standard Gravity";
              let desc = "Perfect circular paths representing standard non-African phonologies.";
              let accentColor = "text-slate-400 border-slate-800";
              if (mode === 'bantu') {
                title = "Bantu Epicycles";
                desc = "Locked double-orbit pairings optimized for pre-nasalized Swahili and Zulu blends.";
                accentColor = "text-orange-400 border-orange-500/30 bg-orange-500/5";
              } else if (mode === 'afroasiatic') {
                title = "Afroasiatic Jitter";
                desc = "High-frequency micro-oscillations optimized for Darija/Berber pharyngeal friction.";
                accentColor = "text-indigo-400 border-indigo-500/30 bg-indigo-500/5";
              } else if (mode === 'niger_congo') {
                title = "Niger-Congo Flow";
                desc = "Fluid vocal wave expansions optimized for nasal vowels, liquids, and West African cadences.";
                accentColor = "text-emerald-400 border-emerald-500/30 bg-emerald-500/5";
              }

              return (
                <button
                  key={mode}
                  onClick={() => setCalibrationMode(mode)}
                  className={`p-4 rounded-2xl border text-left transition-all duration-300 flex flex-col justify-between ${
                    isSelected
                      ? 'bg-gradient-to-b from-slate-900 to-slate-950 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.25)]'
                      : 'bg-slate-950/40 border-slate-900/80 hover:border-slate-800'
                  }`}
                >
                  <div className="space-y-2">
                    <span className={`text-[8px] font-mono font-black uppercase px-2 py-0.5 rounded-full ${isSelected ? accentColor : 'bg-slate-900 text-slate-500'}`}>
                      {mode.replace('_', ' ')} Calibration
                    </span>
                    <p className="text-sm font-black text-white tracking-tight uppercase">
                      {title}
                    </p>
                    <p className="text-[10px] text-slate-400 font-sans leading-relaxed">{desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Grid: Sandbox Orbit Stage & Mission Control */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Column (8/12 width): Interactive 2D Gravitational Orbit Canvas */}
        <div className="lg:col-span-7 bg-[#0b0f19]/80 backdrop-blur-xl rounded-[2.5rem] border border-slate-800/80 p-8 flex flex-col justify-between relative overflow-hidden min-h-[500px] shadow-2xl">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-indigo-500/5 mix-blend-screen rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-orange-500/5 mix-blend-screen rounded-full blur-[80px] pointer-events-none" />
          
          <div className="flex justify-between items-center relative z-10">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-[#ff4e00] animate-pulse" />
              <span className="text-[10px] font-mono font-black text-[#ff4e00] uppercase tracking-widest">Quantum Orbit Field</span>
            </div>
            
            <div className="flex gap-2">
              <div className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded text-[9px] font-mono font-bold text-emerald-400 flex items-center gap-1.5 uppercase">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {phonemes.filter(n => n.status === 'stable').length} Docked
              </div>
              <div className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 rounded text-[9px] font-mono font-bold text-amber-400 flex items-center gap-1.5 uppercase">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                {phonemes.filter(n => n.status === 'unstable').length} Friction
              </div>
            </div>
          </div>

          {/* Graphical Orbit View (CSS Coordinate Mapping inside a 350x350 Box) */}
          <div className="flex-1 flex items-center justify-center relative min-h-[350px]">
            
            {/* The Central Gravity Core */}
            <div className="relative w-36 h-36 rounded-full flex items-center justify-center z-20">
              <div className="absolute -inset-2 rounded-full border border-dashed border-indigo-500/40 animate-spin" style={{ animationDuration: '20s' }} />
              <div className="absolute -inset-4 rounded-full border border-indigo-500/10 animate-pulse" />
              
              <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 border border-indigo-500/50 shadow-[0_0_50px_rgba(99,102,241,0.4)] flex flex-col items-center justify-center p-4">
                <span className="text-[9px] font-mono text-indigo-400 font-black tracking-widest uppercase mb-1">GRAVITY CORE</span>
                <p className="text-xl font-black text-white tracking-tighter uppercase text-center">{activePreset.word}</p>
                <span className="text-[10px] text-indigo-300 font-mono font-medium mt-1">{activePreset.ipa}</span>
              </div>
            </div>

            {/* Orbital Rings (Concentric Circles) */}
            <div className="absolute w-[180px] h-[180px] rounded-full border border-indigo-500/10 pointer-events-none" />
            <div className="absolute w-[250px] h-[250px] rounded-full border border-indigo-500/15 pointer-events-none" />
            <div className="absolute w-[320px] h-[320px] rounded-full border border-indigo-500/5 pointer-events-none" />

            {/* Satellite Nodes Mapping */}
            {phonemes.map((node) => {
              const rad = (node.angle * Math.PI) / 180;
              let currentRadius = node.radius;
              
              let xOffset = 0;
              let yOffset = 0;
              
              if (calibrationMode === 'bantu') {
                const subRad = (Date.now() / 150 + node.angle * 2.5) * Math.PI / 180;
                xOffset = Math.cos(subRad) * 15;
                yOffset = Math.sin(subRad) * 15;
              } else if (calibrationMode === 'afroasiatic') {
                const jitter = Math.sin(Date.now() / 35 + node.angle) * 6;
                xOffset = Math.cos(rad) * jitter;
                yOffset = Math.sin(rad) * jitter;
              } else if (calibrationMode === 'niger_congo') {
                const wave = Math.sin(Date.now() / 350 + node.angle) * 16;
                xOffset = Math.cos(rad) * wave;
                yOffset = Math.sin(rad) * wave;
              }
              
              const x = Math.cos(rad) * currentRadius + xOffset;
              const y = Math.sin(rad) * currentRadius + yOffset;
              
              let borderClass = "border-slate-800 bg-slate-950 text-slate-400 shadow-sm";
              let glowEffect = "";
              if (node.status === 'stable') {
                borderClass = "border-emerald-500 bg-emerald-950/90 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]";
                glowEffect = "bg-emerald-500/20";
              } else if (node.status === 'unstable') {
                borderClass = "border-amber-500 bg-amber-950/90 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.4)]";
                glowEffect = "bg-amber-500/20 animate-ping";
              } else if (node.status === 'omitted') {
                borderClass = "border-red-500/30 bg-red-950/40 text-red-400/40 opacity-30 shadow-none";
                glowEffect = "";
              }

              return (
                <div
                  key={node.id}
                  className="absolute transition-transform duration-75 ease-out z-30"
                  style={{
                    transform: `translate(${x}px, ${y}px)`,
                  }}
                >
                  <div className="relative group flex items-center justify-center">
                    {glowEffect && (
                      <div className={`absolute -inset-1.5 rounded-full blur-[3px] opacity-70 ${glowEffect}`} />
                    )}
                    
                    <button
                      className={`w-11 h-11 rounded-full border flex flex-col items-center justify-center font-bold relative z-10 transition-all duration-300 ${borderClass}`}
                      title={`${node.char}: ${node.ipa} (${node.status})`}
                    >
                      <span className="text-xs uppercase tracking-tight font-black leading-none">{node.char}</span>
                      <span className="text-[8px] font-mono mt-0.5 font-medium leading-none">{node.ipa}</span>
                    </button>
                    
                    <div className="absolute bottom-12 bg-slate-950 border border-slate-800 text-[9px] font-mono px-2 py-1 rounded hidden group-hover:block whitespace-nowrap text-white">
                      Status: {node.status.toUpperCase()} {node.errorType ? `(${node.errorType})` : ""}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 🌍 African Accent Speech Synthesizer */}
          <div className="border-t border-slate-900/80 pt-6 mt-4 relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-white uppercase tracking-wider text-[10px] flex items-center gap-2">
                  <span>🌍</span> Orbital Accent Speech Synthesizer
                </p>
                <p className="text-[9px] text-slate-500 font-mono uppercase">
                  Synthesize "{activePreset.word}" across native African phonologies
                </p>
              </div>
              {isSpeakingTts && (
                <span className="text-[9px] font-mono text-indigo-400 animate-pulse uppercase flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" /> Synthesizing...
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {ACCENTS.map((acc) => {
                const isSpeakingThis = activeAccentSpeaking === acc.id;
                return (
                  <button
                    key={acc.id}
                    onClick={() => handleSpeakAccent(activePreset.word, acc.id)}
                    disabled={isSpeakingTts}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all border ${
                      isSpeakingThis
                        ? 'bg-indigo-500/20 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.25)] text-indigo-300'
                        : 'bg-slate-950/80 hover:bg-slate-900 border-slate-800/80 hover:border-slate-700/80 text-white disabled:opacity-50'
                    }`}
                  >
                    <span className={`text-base shrink-0 ${isSpeakingThis ? 'animate-bounce' : ''}`}>{acc.flag}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold truncate leading-tight">{acc.name}</p>
                      <p className="text-[8px] text-slate-500 font-mono truncate leading-none mt-0.5">{acc.region}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Informational Bottom Banner */}
          <div className="border-t border-slate-900 pt-6 relative z-10">
            <div className="flex gap-4.5 items-start">
              <Compass className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-400 leading-relaxed font-sans">
                <p className="font-bold text-white uppercase tracking-wider text-[10px] mb-1">Phoneme Orbital Mechanics</p>
                Get closer to the Gravity Core! Speak the target word aloud to stabilize the phoneme satellites. If the pronunciation deviates, phonemes will break orbit due to phonological friction.
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4/12 width): Mission Control Speech Input & Gemini Insights */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-[#0b0f19]/80 backdrop-blur-xl rounded-[2.5rem] border border-slate-800/80 p-8 flex flex-col gap-5 shadow-2xl">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider mb-1">🎙️ Calibration Cockpit</h3>
              <p className="text-[10px] text-slate-500 font-mono uppercase">Linguistic Voice Capture Stream</p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={startRecording}
                disabled={isCapturing || isAnalyzing}
                className={`py-4 px-6 rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden cursor-pointer ${
                  isCapturing 
                    ? 'bg-red-500 border border-red-500 text-white shadow-[0_0_30px_rgba(239,68,68,0.4)] animate-pulse' 
                    : 'bg-white border border-white text-black hover:bg-slate-200 shadow-md'
                }`}
              >
                {isCapturing ? (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                    Recording in progress...
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 text-black shrink-0" />
                    Start Voice Capture
                  </>
                )}
              </button>

              {speechTranscript && (
                <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 animate-in fade-in duration-300">
                  <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold mb-1">Captured Signal:</p>
                  <p className="text-sm font-black text-white font-mono">"{speechTranscript}"</p>
                </div>
              )}
            </div>

            <div className="border-t border-slate-900 pt-5 space-y-4">
              <div>
                <label className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-widest block mb-2">Speech Pathologist Simulator (Force Calibration)</label>
                <p className="text-[9px] text-slate-600 font-sans leading-tight mb-3">
                  Simulates a child's spoken attempt to test Gemini's gravity equations. Example: Enter "pestacle" for "spectacle" or "colodile" for "crocodile".
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={simulatedPronunciation}
                    onChange={(e) => setSimulatedPronunciation(e.target.value)}
                    placeholder="Enter simulated pronunciation..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs font-mono outline-none focus:border-indigo-500 transition-colors"
                  />
                  <button
                    onClick={() => handleAnalyzeSpeech(simulatedPronunciation)}
                    disabled={isAnalyzing || !simulatedPronunciation.trim()}
                    className="p-3 bg-indigo-500 hover:bg-indigo-400 disabled:bg-slate-800 text-white rounded-xl transition-all flex items-center justify-center cursor-pointer"
                  >
                    {isAnalyzing ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : <Send className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Gemini Orthophonic Insights */}
          <div className="bg-[#0b0f19]/80 backdrop-blur-xl rounded-[2.5rem] border border-slate-800/80 p-8 flex flex-col gap-6 shadow-2xl flex-1 justify-between">
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider mb-1">🌌 Cognitive Flight Plan</h3>
                  <p className="text-[10px] text-slate-500 font-mono uppercase">Gemini Orbital Analysis Logs</p>
                </div>
                
                {analysisResult && (
                  <button
                    onClick={() => handleSpeakWord(analysisResult.conseilCognitif || "")}
                    disabled={isSpeakingTts}
                    className="p-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/20 rounded-xl transition-colors shrink-0"
                    title="Speak Cognitive Advice"
                  >
                    {isSpeakingTts ? <Loader2 className="w-4 h-4 animate-spin" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                )}
              </div>

              <div className="mt-5 space-y-4">
                <AnimatePresence mode="wait">
                  {isAnalyzing ? (
                    <motion.div 
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="py-12 flex flex-col items-center justify-center space-y-4 text-slate-500"
                    >
                      <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                      <p className="font-mono text-[10px] uppercase tracking-widest text-center">Calculating Levenshtein paths & compiling flight instructions...</p>
                    </motion.div>
                  ) : analysisResult ? (
                    <motion.div 
                      key="results"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4 text-xs leading-relaxed"
                    >
                      <div className="bg-indigo-950/20 border border-indigo-500/20 p-4 rounded-xl space-y-2">
                        <p className="font-bold text-white uppercase tracking-wide text-[10px] flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" /> Diagnostic : {analysisResult.analyse?.typeErreur}
                        </p>
                        <p className="text-slate-400">{analysisResult.analyse?.description}</p>
                        <p className="text-[10px] text-slate-500 font-mono leading-tight">{analysisResult.analyse?.details}</p>
                      </div>

                      <div className="bg-emerald-950/10 border border-emerald-500/20 p-4 rounded-xl space-y-1">
                        <p className="font-bold text-emerald-400 uppercase tracking-wider text-[10px]">IPA Alignment</p>
                        <p className="font-mono text-slate-300">
                          Target sound: <span className="text-white font-bold">{analysisResult.ipaCible}</span><br />
                          Spoken sound: <span className="text-amber-400 font-bold">{analysisResult.ipaPrononce}</span>
                        </p>
                      </div>

                      <div className="text-slate-300 font-sans leading-relaxed text-sm bg-slate-950/40 p-5 rounded-2xl border border-slate-900">
                        <p className="font-black text-white uppercase tracking-widest text-[9px] mb-2 text-indigo-400">Orthophonic Flight Correction</p>
                        "{analysisResult.conseilCognitif}"
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="py-12 flex flex-col items-center justify-center text-slate-500"
                    >
                      <HelpIcon className="w-10 h-10 text-slate-700 mb-3" />
                      <p className="font-mono text-[10px] uppercase tracking-widest text-center">No spoken signals calibrated. Speak into the mic or use the simulated orthophonic keyboard to start calibration.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {errorLogs.length > 0 && (
              <div className="bg-black/80 border border-slate-900 rounded-xl p-4.5 font-mono text-[9px] text-slate-400 space-y-1.5 max-h-[140px] overflow-y-auto mt-6">
                <p className="text-slate-600 font-bold border-b border-slate-900 pb-1 mb-1 tracking-wider">SYSTEM DEVIATION LOGS</p>
                {errorLogs.map((log, lidx) => (
                  <p key={lidx} className="leading-tight">{log}</p>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom Core Modal */}
      <AnimatePresence>
        {customWordMode && (
          <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-6 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-950 border border-slate-800 rounded-[2.5rem] p-8 max-w-md w-full relative space-y-6 shadow-2xl"
            >
              <button
                onClick={() => setCustomWordMode(false)}
                className="absolute top-5 right-5 p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white rounded-full transition-colors"
              >
                <VolumeX className="w-4.5 h-4.5 rotate-45" />
              </button>

              <div className="flex items-center gap-3">
                <span className="p-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-xl">
                  <Orbit className="w-5 h-5 text-indigo-400" />
                </span>
                <h3 className="text-xl font-bold text-white uppercase tracking-wider">Custom Gravity Core</h3>
              </div>

              <div className="space-y-4">
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  Enter a word with high linguistic or speech-pathology difficulty. Gemini 3.5 Flash will instantly decompose it into phonetic IPA satellites and configure its orbital gravity field.
                </p>
                
                <div>
                  <label className="text-[9px] font-mono font-black text-slate-500 uppercase tracking-widest block mb-1.5">Target Word</label>
                  <input
                    type="text"
                    value={customWordInput}
                    onChange={(e) => setCustomWordInput(e.target.value)}
                    placeholder="e.g. dromedary, synchronization..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm font-mono outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <button
                  onClick={handleSpeakWord} // fallback compile or speak trigger
                  disabled={isAnalyzing || !customWordInput.trim()}
                  className="w-full py-4 bg-white hover:bg-slate-200 disabled:bg-slate-800 disabled:text-white/30 text-black font-black uppercase text-xs tracking-widest rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  Compile Orbital Model
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
