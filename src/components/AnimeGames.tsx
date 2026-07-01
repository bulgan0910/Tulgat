import React, { useState, useEffect, useRef } from 'react';
import {
  Heart,
  Trophy,
  Timer,
  RefreshCw,
  HelpCircle,
  Zap,
  Play,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  ArrowRight,
  BookOpen,
  Award
} from 'lucide-react';
import { ANIME_QUESTIONS, AnimeQuestion } from '../data/animeQuestions';

interface EmojiQuestion {
  id: number;
  emojis: string;
  answer: string;
  options: string[];
}

interface AnimeGamesProps {
  onClose: () => void;
  showToast: (msg: string) => void;
}

// Interactive sound synthesizers using the Web Audio API
const playSoundEffect = (type: 'ding' | 'buzz', enabled: boolean) => {
  if (!enabled) return;
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (type === 'ding') {
      // High pitched double synth ding (harmonious, satisfying)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc1.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1); // A5
      
      gain1.gain.setValueAtTime(0.12, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.3);

      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(880, ctx.currentTime); // A5
        osc2.frequency.exponentialRampToValueAtTime(1174.66, ctx.currentTime + 0.15); // D6
        
        gain2.gain.setValueAtTime(0.12, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start();
        osc2.stop(ctx.currentTime + 0.4);
      }, 70);
    } else {
      // Buzzy wrong answer sound
      const osc = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(115, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(85, ctx.currentTime + 0.3);
      
      osc2.type = 'square';
      osc2.frequency.setValueAtTime(118, ctx.currentTime);
      osc2.frequency.linearRampToValueAtTime(88, ctx.currentTime + 0.3);
      
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      
      osc.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc2.start();
      
      osc.stop(ctx.currentTime + 0.4);
      osc2.stop(ctx.currentTime + 0.4);
    }
  } catch (error) {
    console.error("Failed to play synth sound:", error);
  }
};

export default function AnimeGames({ onClose, showToast }: AnimeGamesProps) {
  // Game Setup States
  const [gameMode, setGameMode] = useState<'trivia' | 'emoji' | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  
  // High Scores (persisted via localStorage)
  const [triviaHighScore, setTriviaHighScore] = useState<number>(() => {
    return Number(localStorage.getItem('anime_trivia_high_score') || '0');
  });
  const [emojiHighScore, setEmojiHighScore] = useState<number>(() => {
    return Number(localStorage.getItem('anime_emoji_high_score') || '0');
  });

  // Question lists
  const [triviaQuestions, setTriviaQuestions] = useState<AnimeQuestion[]>([]);
  const [emojiQuestions, setEmojiQuestions] = useState<EmojiQuestion[]>([]);
  const [isLoadingEmojis, setIsLoadingEmojis] = useState<boolean>(false);

  // Core Game Loop States
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [timeLeft, setTimeLeft] = useState<number>(15);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState<boolean>(false);
  const [shakingOption, setShakingOption] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [showBonusSpark, setShowBonusSpark] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isVictory, setIsVictory] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Shuffle array helper to ensure dynamic, unbiased playthroughs (Fisher-Yates)
  const shuffleArray = <T,>(array: T[]): T[] => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
    }
    return arr;
  };

  // Initialize Trivia Questions
  const startTriviaGame = () => {
    const shuffled = shuffleArray(ANIME_QUESTIONS).slice(0, 15).map(q => ({
      ...q,
      options: shuffleArray(q.options)
    })); // Pick 15 random questions and shuffle their options
    setTriviaQuestions(shuffled);
    setCurrentQuestionIdx(0);
    setScore(0);
    setStreak(0);
    setLives(3);
    setTimeLeft(15);
    setSelectedOption(null);
    setHasAnswered(false);
    setShakingOption(null);
    setIsGameOver(false);
    setIsVictory(false);
    setShowHint(false);
    setGameMode('trivia');
    showToast("Монгол аниме таавар эхэллээ! 🧠");
  };

  // Initialize Emoji Game
  const startEmojiGame = async () => {
    setIsLoadingEmojis(true);
    try {
      const response = await fetch('/data.json');
      if (!response.ok) {
        throw new Error("Failed to load questions");
      }
      const data: EmojiQuestion[] = await response.json();
      const shuffled = shuffleArray(data).map(q => ({
        ...q,
        options: shuffleArray(q.options)
      }));
      setEmojiQuestions(shuffled);
      setCurrentQuestionIdx(0);
      setScore(0);
      setStreak(0);
      setLives(3);
      setTimeLeft(15);
      setSelectedOption(null);
      setHasAnswered(false);
      setShakingOption(null);
      setIsGameOver(false);
      setIsVictory(false);
      setShowHint(false);
      setGameMode('emoji');
      showToast("Эможи таавар эхэллээ! 🧩");
    } catch (err) {
      console.error("Error reading data.json:", err);
      // Fallback in case of server/file reading issues
      const fallbackData: EmojiQuestion[] = [
        { id: 1, emojis: "🏴‍☠️👒🍖🌊", answer: "One Piece", options: ["One Piece", "Naruto", "Fairy Tail", "Bleach"] },
        { id: 2, emojis: "🦊🍥🌀⚡", answer: "Naruto", options: ["Naruto", "My Hero Academia", "Demon Slayer", "Jujutsu Kaisen"] },
        { id: 3, emojis: "⚔️👹🌊🌸", answer: "Demon Slayer", options: ["Demon Slayer", "Bleach", "Inuyasha", "Attack on Titan"] },
        { id: 4, emojis: "📓🍎📓💀", answer: "Death Note", options: ["Death Note", "Code Geass", "Monster", "Steins;Gate"] },
        { id: 5, emojis: "🧱🦖⚔️🧗", answer: "Attack on Titan", options: ["Attack on Titan", "Neon Genesis Evangelion", "Gundam", "Sword Art Online"] }
      ];
      const shuffledFallback = shuffleArray(fallbackData).map(q => ({
        ...q,
        options: shuffleArray(q.options)
      }));
      setEmojiQuestions(shuffledFallback);
      setCurrentQuestionIdx(0);
      setScore(0);
      setStreak(0);
      setLives(3);
      setTimeLeft(15);
      setSelectedOption(null);
      setHasAnswered(false);
      setShakingOption(null);
      setIsGameOver(false);
      setIsVictory(false);
      setShowHint(false);
      setGameMode('emoji');
      showToast("Сэрвэрээс уншиж чадсангүй, хамгаалалтын асуултууд ачааллаа! 🧩");
    } finally {
      setIsLoadingEmojis(false);
    }
  };

  // Core countdown Timer Logic
  useEffect(() => {
    if (gameMode && !hasAnswered && !isGameOver && !isVictory) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Time is up! Treat as incorrect
            handleTimeOut();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameMode, currentQuestionIdx, hasAnswered, isGameOver, isVictory]);

  // Handle timeout condition
  const handleTimeOut = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setHasAnswered(true);
    playSoundEffect('buzz', soundEnabled);
    
    // Streak resets
    setStreak(0);
    
    // Lose a life
    const nextLives = lives - 1;
    setLives(nextLives);
    showToast("Цаг дууслаа! ⏱️❌");

    if (nextLives <= 0) {
      setTimeout(() => {
        setIsGameOver(true);
        saveHighScore(score);
      }, 1800);
    } else {
      // Auto move to next after delay
      setTimeout(() => {
        advanceQuestion(nextLives, score);
      }, 1800);
    }
  };

  // Submit/Process Selected Option
  const handleOptionSelect = (option: string) => {
    if (hasAnswered) return; // Prevent double clicks
    
    if (timerRef.current) clearInterval(timerRef.current);
    setSelectedOption(option);
    setHasAnswered(true);

    const isCorrect = gameMode === 'trivia' 
      ? triviaQuestions[currentQuestionIdx].correctAnswer === option
      : emojiQuestions[currentQuestionIdx].answer === option;

    let newScore = score;
    let newStreak = streak;
    let newLives = lives;

    if (isCorrect) {
      playSoundEffect('ding', soundEnabled);
      newScore += 5;
      newStreak += 1;
      setStreak(newStreak);
      setScore(newScore);

      // Check for 3 consecutive correct answers bonus
      if (newStreak === 3) {
        newScore += 10;
        setScore(newScore);
        setStreak(0); // Reset streak for next bonus
        setShowBonusSpark(true);
        playSoundEffect('ding', soundEnabled);
        showToast("🔥 3 ДАРААЛАН ЗӨВ! +10 УРАМШУУЛАЛ ОНОО! 🔥");
        setTimeout(() => setShowBonusSpark(false), 2000);
      } else {
        showToast("Зөв хариуллаа! +5 оноо ✨");
      }
    } else {
      playSoundEffect('buzz', soundEnabled);
      setShakingOption(option);
      newStreak = 0;
      setStreak(0);
      newLives -= 1;
      setLives(newLives);
      showToast("Буруу байна! ❌");

      if (newLives <= 0) {
        setTimeout(() => {
          setIsGameOver(true);
          saveHighScore(newScore);
        }, 1800);
        return;
      }
    }

    // Advance to next question or declare victory
    setTimeout(() => {
      advanceQuestion(newLives, newScore);
    }, 1800);
  };

  // Advanced to Next Question
  const advanceQuestion = (currentLives: number, currentScore: number) => {
    const totalQuestions = gameMode === 'trivia' ? triviaQuestions.length : emojiQuestions.length;
    
    if (currentQuestionIdx + 1 >= totalQuestions) {
      setIsVictory(true);
      saveHighScore(currentScore);
    } else {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentQuestionIdx((prev) => prev + 1);
        setTimeLeft(15);
        setSelectedOption(null);
        setHasAnswered(false);
        setShakingOption(null);
        setShowHint(false);
        setIsTransitioning(false);
      }, 2000); // Wait for the transition out
    }
  };

  // Save high score to localStorage
  const saveHighScore = (finalScore: number) => {
    if (gameMode === 'trivia') {
      if (finalScore > triviaHighScore) {
        setTriviaHighScore(finalScore);
        localStorage.setItem('anime_trivia_high_score', String(finalScore));
      }
    } else if (gameMode === 'emoji') {
      if (finalScore > emojiHighScore) {
        setEmojiHighScore(finalScore);
        localStorage.setItem('anime_emoji_high_score', String(finalScore));
      }
    }
  };

  // Helper variables for current question
  const currentTriviaQ = triviaQuestions[currentQuestionIdx];
  const currentEmojiQ = emojiQuestions[currentQuestionIdx];

  const currentQuestionText = gameMode === 'trivia' 
    ? currentTriviaQ?.question 
    : "Дээрх эможиг хараад анимег таана уу:";

  const currentOptions = gameMode === 'trivia'
    ? currentTriviaQ?.options
    : currentEmojiQ?.options;

  const correctAnswer = gameMode === 'trivia'
    ? currentTriviaQ?.correctAnswer
    : currentEmojiQ?.answer;

  const hintText = gameMode === 'trivia'
    ? currentTriviaQ?.hint
    : `Энэ аниме нь ${currentEmojiQ?.answer.length} тэмдэгтээс бүрдэнэ.`;

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="w-full max-w-2xl h-[680px] max-h-[92vh] bg-gray-950/95 border border-white/20 rounded-3xl shadow-2xl flex flex-col relative overflow-hidden text-left">
        
        {/* TOP STATUS BAR */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-red-600 p-0.5 shadow-lg flex items-center justify-center">
              <span className="text-xl">🎮</span>
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
                {gameMode === 'trivia' ? 'Монгол Аниме Таавар' : gameMode === 'emoji' ? 'Эможи Таавар' : 'Аниме Тоглоомын Төв'}
              </h3>
              {gameMode && (
                <p className="text-[11px] text-gray-400 font-mono">
                  Асуулт: {currentQuestionIdx + 1} / {gameMode === 'trivia' ? triviaQuestions.length : emojiQuestions.length}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Audio Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              title={soundEnabled ? "Sound Effects Enabled" : "Muted"}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-red-600 border border-white/10 hover:border-red-500 flex items-center justify-center text-gray-400 hover:text-white transition-all cursor-pointer"
              title="Close Games Window"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* MAIN BODY AREA */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col justify-between">
          
          {/* SCREEN A: MODE SELECTION */}
          {!gameMode && (
            <div className="flex-1 flex flex-col justify-between py-2">
              <div className="text-center space-y-2 mb-4">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500/20 to-indigo-500/20 border border-red-500/30 px-3.5 py-1 rounded-full text-xs font-semibold text-red-300">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span>АНЕМИ СУУЦНЫ ЦУГЛУУЛГА</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase bg-gradient-to-r from-white via-gray-100 to-gray-400 bg-clip-text text-transparent">
                  Анимегийн Хорхойтон Шалгалт
                </h2>
                <p className="text-xs sm:text-sm text-gray-400 max-w-md mx-auto leading-relaxed">
                  Аниме сонирхогчдын сор ухаан, хурдыг сорих 2 өөр хэв маягийн тоглоом. Өөрийнхөө рекордыг тогтоож, оноогоо хуримтлуулаарай!
                </p>
              </div>

              {/* Grid of modes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-auto">
                
                {/* MODE 1: TRIVIA */}
                <button
                  onClick={startTriviaGame}
                  className="group relative flex flex-col justify-between p-5 rounded-2xl bg-gradient-to-b from-white/5 to-white/[0.01] hover:from-red-950/20 hover:to-indigo-950/10 border border-white/10 hover:border-red-500/40 text-left transition-all duration-300 hover:shadow-[0_0_25px_rgba(239,68,68,0.1)] hover:scale-[1.02] cursor-pointer"
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-red-600/10 border border-red-500/30 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
                      📝
                    </div>
                    <h3 className="text-lg font-bold text-white group-hover:text-red-400 transition-colors">Монгол Аниме Таавар</h3>
                    <p className="text-xs text-gray-400 leading-relaxed mt-2">
                      Луффигийн анхны найз, Танжирогийн амьсгалын техник зэрэг анимегийн түүх, баатруудын тухай 30 сонирхолтой асуултууд.
                    </p>
                  </div>

                  <div className="mt-6 pt-3 border-t border-white/5 flex items-center justify-between w-full">
                    <span className="text-[11px] font-mono text-gray-400">
                      Дээд оноо: <span className="text-red-400 font-bold">{triviaHighScore}</span>
                    </span>
                    <span className="text-xs font-semibold text-white group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      Тоглох <ArrowRight className="w-3.5 h-3.5 text-red-500" />
                    </span>
                  </div>
                </button>

                {/* MODE 2: EMOJI GUESSER */}
                <button
                  onClick={startEmojiGame}
                  disabled={isLoadingEmojis}
                  className="group relative flex flex-col justify-between p-5 rounded-2xl bg-gradient-to-b from-white/5 to-white/[0.01] hover:from-indigo-950/20 hover:to-red-950/10 border border-white/10 hover:border-indigo-500/40 text-left transition-all duration-300 hover:shadow-[0_0_25px_rgba(99,102,241,0.1)] hover:scale-[1.02] cursor-pointer disabled:opacity-50"
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-indigo-600/10 border border-indigo-500/30 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
                      🧩
                    </div>
                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">Эможи Таавар</h3>
                    <p className="text-xs text-gray-400 leading-relaxed mt-2">
                      Ухаалаг, сонирхолтой эможинуудын дарааллыг харж, ямар аниме болохыг таагаарай. 20 өвөрмөц асуултууд!
                    </p>
                  </div>

                  <div className="mt-6 pt-3 border-t border-white/5 flex items-center justify-between w-full">
                    <span className="text-[11px] font-mono text-gray-400">
                      Дээд оноо: <span className="text-indigo-400 font-bold">{emojiHighScore}</span>
                    </span>
                    <span className="text-xs font-semibold text-white group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      {isLoadingEmojis ? 'Ачаалж байна...' : 'Тоглох'} <ArrowRight className="w-3.5 h-3.5 text-indigo-500" />
                    </span>
                  </div>
                </button>

              </div>

              {/* Game Rules / Instructions list */}
              <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/5 text-xs text-gray-400 space-y-1.5 leading-relaxed">
                <p className="font-semibold text-gray-300 mb-1 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-amber-500" /> Тоглоомын дүрэм журам:
                </p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-gray-400 font-medium">
                  <div className="flex items-center gap-1.5">🎯 Зөв хариулбал: <span className="text-emerald-400 font-bold">+5 оноо</span></div>
                  <div className="flex items-center gap-1.5">⏳ Асуулт бүрийн цаг: <span className="text-white font-bold">15 секунд</span></div>
                  <div className="flex items-center gap-1.5">❤️ Тоглогчийн амь: <span className="text-red-400 font-bold">3 амь</span></div>
                  <div className="flex items-center gap-1.5">🔥 3 дараалан зөв: <span className="text-amber-400 font-bold">+10 Бонус</span></div>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN B: ACTIVE GAMEPLAY */}
          {gameMode && !isGameOver && !isVictory && (
            <div className={`flex-1 flex flex-col justify-between transition-all duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
              
              {/* Game Header: Score, Streak, Hearts, Timer */}
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  {/* Score & Streak */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                      <Trophy className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="text-sm font-bold text-white font-mono">{score} <span className="text-[10px] text-gray-400">оноо</span></span>
                    </div>

                    {/* Streak Progress */}
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-gray-400">🔥 Дараалсан:</span>
                      <div className="flex gap-1.5 ml-1">
                        {[0, 1, 2].map((idx) => (
                          <span
                            key={idx}
                            className={`w-3.5 h-3.5 rounded-full border transition-all duration-300 flex items-center justify-center font-bold text-[8px] ${
                              streak > idx
                                ? 'bg-amber-500 border-amber-400 text-black scale-110 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                                : 'bg-black/50 border-white/20 text-gray-500'
                            }`}
                          >
                            ✓
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Hearts (Lives) */}
                  <div className="flex items-center gap-1">
                    {[1, 2, 3].map((heartIdx) => (
                      <Heart
                        key={heartIdx}
                        className={`w-5 h-5 transition-all duration-300 ${
                          lives >= heartIdx
                            ? 'text-red-500 fill-red-500 scale-110 drop-shadow-[0_0_5px_rgba(239,68,68,0.5)] animate-pulse'
                            : 'text-gray-600 fill-transparent scale-95'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Timer Bar */}
                <div className="relative h-2 w-full bg-white/10 rounded-full overflow-hidden border border-white/5 shadow-inner">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ease-linear ${
                      timeLeft > 8
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                        : timeLeft > 4
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                        : 'bg-gradient-to-r from-red-600 to-rose-500 animate-timer-pulse'
                    }`}
                    style={{ width: `${(timeLeft / 15) * 100}%` }}
                  />
                  <div className="absolute right-2 -top-1 font-mono text-[10px] font-semibold text-gray-300 bg-black/60 px-1.5 rounded-sm">
                    {timeLeft}с
                  </div>
                </div>
              </div>

              {/* Core Question Visual Area */}
              <div className="my-auto py-5 flex flex-col items-center text-center">
                
                {/* Emoji Display (Mode B only) */}
                {gameMode === 'emoji' && currentEmojiQ && (
                  <div className="w-full py-4 mb-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-2xl relative">
                    <span className="text-4xl sm:text-5xl tracking-[0.2em] filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)] font-semibold">
                      {currentEmojiQ.emojis}
                    </span>
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      🧩 Emoji Clue
                    </div>
                  </div>
                )}

                {/* Question Text */}
                <h3 className="text-base sm:text-lg md:text-xl font-medium tracking-tight text-white leading-relaxed max-w-xl">
                  {currentQuestionText}
                </h3>

                {/* Hint Button & Hint Text */}
                <div className="mt-4 min-h-[36px]">
                  {!showHint ? (
                    <button
                      onClick={() => setShowHint(true)}
                      className="px-4 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-all cursor-pointer flex items-center gap-1 mx-auto"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      Таныл цууц (Тусламж харах)
                    </button>
                  ) : (
                    <p className="text-xs text-amber-300/90 italic bg-amber-500/5 border border-amber-500/10 rounded-xl px-4 py-2.5 max-w-lg mx-auto">
                      💡 Тусламж: {hintText}
                    </p>
                  )}
                </div>

              </div>

              {/* Options Section */}
              <div className="space-y-2.5">
                {currentOptions?.map((option, idx) => {
                  const isSelected = selectedOption === option;
                  const isCorrectAnswer = option === correctAnswer;
                  
                  let buttonClass = "liquid-glass hover:bg-white/5 border border-white/15 text-gray-200 hover:text-white";
                  
                  // Active animations & glows
                  if (hasAnswered) {
                    if (isCorrectAnswer) {
                      buttonClass = "bg-emerald-500/80 border-emerald-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] font-semibold";
                    } else if (isSelected) {
                      buttonClass = "bg-red-500/80 border-red-400 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)] font-semibold";
                    } else {
                      buttonClass = "opacity-40 border-white/5 text-gray-500";
                    }
                  } else {
                    buttonClass += " hover:scale-[1.03] hover:shadow-[0_0_15px_rgba(255,255,255,0.15)] focus:scale-[1.03] transition-all duration-200";
                  }

                  const isShaking = shakingOption === option;

                  return (
                    <button
                      key={idx}
                      onClick={() => handleOptionSelect(option)}
                      disabled={hasAnswered}
                      className={`w-full text-left py-3.5 px-5 rounded-2xl text-xs sm:text-sm font-medium transition-all duration-200 flex items-center justify-between cursor-pointer disabled:cursor-not-allowed ${buttonClass} ${isShaking ? 'animate-shake' : ''}`}
                    >
                      <span className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 text-[10px] font-mono flex items-center justify-center text-gray-400">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{option}</span>
                      </span>
                      {hasAnswered && isCorrectAnswer && (
                        <span className="text-[10px] bg-emerald-950 border border-emerald-500 text-emerald-300 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">Зөв</span>
                      )}
                      {hasAnswered && isSelected && !isCorrectAnswer && (
                        <span className="text-[10px] bg-red-950 border border-red-500 text-red-300 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">Буруу</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Bonus Toast Flash Indicator inside modal */}
              {showBonusSpark && (
                <div className="absolute inset-x-4 top-24 z-50 bg-gradient-to-r from-amber-500 to-yellow-400 text-black py-3 rounded-2xl shadow-2xl text-center font-bold text-sm flex items-center justify-center gap-2 animate-bounce">
                  <Sparkles className="w-5 h-5 fill-black text-black" />
                  <span>🔥 ДАРААЛАН 3 ЗӨВ! +10 ОНООНЫ БОНУС! 🔥</span>
                </div>
              )}

            </div>
          )}

          {/* SCREEN C: GAME OVER SCREEN */}
          {isGameOver && (
            <div className="flex-1 flex flex-col justify-center items-center text-center space-y-6 py-8">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-red-600/10 border-2 border-red-500/30 flex items-center justify-center text-5xl">
                  💀
                </div>
                <span className="absolute -bottom-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">End</span>
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wider">ТОГЛООМ ДУУСЛАА</h2>
                <p className="text-xs text-gray-400 max-w-sm">
                  Амь дууссан тул таны тоглоом өндөрлөлөө. Сэтгэлээр бүү унаарай, дахиад оролдоод үзнэ үү!
                </p>
              </div>

              {/* Final Score Stat Grid */}
              <div className="grid grid-cols-2 gap-4 w-full max-w-xs p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="text-center p-3">
                  <p className="text-gray-500 text-[10px] uppercase font-mono tracking-wider">Эцсийн оноо</p>
                  <p className="text-2xl font-black text-white font-mono mt-1">{score}</p>
                </div>
                <div className="text-center p-3 border-l border-white/10">
                  <p className="text-gray-500 text-[10px] uppercase font-mono tracking-wider">Дээд амжилт</p>
                  <p className="text-2xl font-black text-amber-400 font-mono mt-1">
                    {gameMode === 'trivia' ? triviaHighScore : emojiHighScore}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
                <button
                  onClick={gameMode === 'trivia' ? startTriviaGame : startEmojiGame}
                  className="flex-1 py-3 bg-white text-black hover:bg-gray-200 transition-colors rounded-xl font-bold text-sm cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-4 h-4" /> Дахин тоглох
                </button>
                <button
                  onClick={() => setGameMode(null)}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/15 text-white transition-all rounded-xl font-semibold text-sm cursor-pointer"
                >
                  Цэс рүү буцах
                </button>
              </div>
            </div>
          )}

          {/* SCREEN D: VICTORY SCREEN */}
          {isVictory && (
            <div className="flex-1 flex flex-col justify-center items-center text-center space-y-6 py-8">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center text-5xl">
                  🏆
                </div>
                <span className="absolute -bottom-1 -right-1 bg-amber-500 text-black text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">Win</span>
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-black text-emerald-400 uppercase tracking-wider">БАЯР ХҮРГЭЕ! 🎉</h2>
                <p className="text-xs text-gray-400 max-w-sm">
                  Та бүх асуултуудад амжилттай хариулж анимегийн жинхэнэ хорхойтон гэдгээ баталлаа!
                </p>
              </div>

              {/* Final Score Stat Grid */}
              <div className="grid grid-cols-2 gap-4 w-full max-w-xs p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="text-center p-3">
                  <p className="text-gray-500 text-[10px] uppercase font-mono tracking-wider">Таны оноо</p>
                  <p className="text-2xl font-black text-white font-mono mt-1">{score}</p>
                </div>
                <div className="text-center p-3 border-l border-white/10">
                  <p className="text-gray-500 text-[10px] uppercase font-mono tracking-wider">Дээд амжилт</p>
                  <p className="text-2xl font-black text-amber-400 font-mono mt-1">
                    {gameMode === 'trivia' ? triviaHighScore : emojiHighScore}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
                <button
                  onClick={gameMode === 'trivia' ? startTriviaGame : startEmojiGame}
                  className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-white transition-colors rounded-xl font-bold text-sm cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-4 h-4" /> Дахин тоглох
                </button>
                <button
                  onClick={() => setGameMode(null)}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/15 text-white transition-all rounded-xl font-semibold text-sm cursor-pointer"
                >
                  Цэс рүү буцах
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
