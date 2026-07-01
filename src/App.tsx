/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import AnimeGames from './components/AnimeGames';
import {
  Search,
  User,
  Menu,
  X,
  Star,
  Clock,
  Calendar,
  Play,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  Info,
  Film,
  Award,
  ThumbsUp,
  Sparkles,
  Tv,
  MessageSquare,
  Shield,
  BookmarkCheck,
  ExternalLink,
  Bot,
  Send,
  Key
} from 'lucide-react';

interface Movie {
  title: string;
  description: string;
  rating: string;
  duration: string;
  year: string;
  genre: string;
  director: string;
  cast: string;
  reviewsCount: string;
  quote: string;
  videoUrl: string;
}

const MOVIES: Movie[] = [
  {
    title: "One Piece Film: Red",
    description: "Uta — the most beloved singer in the world. Now, for the first time ever, she will reveal herself to the world at a live cinematic concert.",
    rating: "9.5/10 IMDB",
    duration: "115 min",
    year: "Special Edition",
    genre: "Anime · Adventure · Fantasy",
    director: "Goro Taniguchi",
    cast: "Luffy, Zoro, Shanks, Uta",
    reviewsCount: "92,410 User Reviews",
    quote: "The ultimate cinematic masterpiece for anime fans and gamers.",
    videoUrl: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260406_094145_4a271a6c-3869-4f1c-8aa7-aeb0cb227994.mp4",
  },
  {
    title: "Step Through. Work Smarter.",
    description: "A voyage through forgotten realms, where past and future intertwine.",
    rating: "8.7/10 IMDB",
    duration: "132 min",
    year: "April, 2025",
    genre: "Sci-Fi · Thriller · Mystery",
    director: "Elena Rostova",
    cast: "Marcus Vance, Sari Lin, David K. Thorne",
    reviewsCount: "14,280 User Reviews",
    quote: "A staggering achievement in world-building and narrative pacing.",
    videoUrl: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260406_094145_4a271a6c-3869-4f1c-8aa7-aeb0cb227994.mp4",
  },
  {
    title: "Echoes of the Horizon",
    description: "In the silence of deep space, a rogue frequency unlocks a forgotten century-old conspiracy.",
    rating: "9.1/10 IMDB",
    duration: "148 min",
    year: "November, 2025",
    genre: "Sci-Fi · Adventure · Drama",
    director: "Christopher Nolan",
    cast: "Cillian Murphy, Florence Pugh, Kenneth Branagh",
    reviewsCount: "28,910 User Reviews",
    quote: "Visually hypnotic. The soundtrack alone deserves every accolade.",
    videoUrl: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260406_094145_4a271a6c-3869-4f1c-8aa7-aeb0cb227994.mp4",
  },
  {
    title: "Chronicles of Neon",
    description: "When the megacity grid collapses, an undercover synthetic operative must protect the last human archive.",
    rating: "8.4/10 IMDB",
    duration: "116 min",
    year: "January, 2026",
    genre: "Cyberpunk · Action · Neo-Noir",
    director: "Denis Villeneuve",
    cast: "Ana de Armas, Ryan Gosling, Hiroyuki Sanada",
    reviewsCount: "9,450 User Reviews",
    quote: "Gritty, relentless, and gorgeously shot. Cyberpunk cinema at its absolute finest.",
    videoUrl: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260406_094145_4a271a6c-3869-4f1c-8aa7-aeb0cb227994.mp4",
  }
];

const NAV_LINKS = [
  { name: "Movies", id: "movies", delay: "100ms" },
  { name: "TV Series", id: "tv", delay: "150ms" },
  { name: "Editor's Pick", id: "pick", delay: "200ms" },
  { name: "Interviews", id: "interviews", delay: "250ms" },
  { name: "User Reviews", id: "reviews", delay: "300ms" },
  { name: "🤖 My Idol", id: "idol", delay: "350ms" },
  { name: "🎮 Anime Games", id: "games", delay: "380ms" },
];

export default function App() {
  const [currentMovieIndex, setCurrentMovieIndex] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<'search' | 'trailer' | 'info' | 'reviews' | 'profile' | 'idol' | 'games' | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMuted, setIsMuted] = useState(true);
  const [activeTab, setActiveTab] = useState("movies");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    text: string;
  }

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'model',
      text: 'Сайн уу! Намайг Тулгат гэдэг. Би VideoGame тоглох, сагс хөлбөмбөг тоглох дуртай (гэхдээ сайн туршлагагүй ээ 😅), тэгээд ирээдүйд гоё хоол хийдэг тогооч болохыг хүсдэг! Чи надаас юу асуумаар байна эсвэл зөвлөгөө авмаар байна дээ? 😎👨‍🍳'
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [customApiKey, setCustomApiKey] = useState("7ItHmjKaCOcprd3g9Seg");
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeModal === 'idol') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeModal, isLoadingAi]);

  const currentMovie = MOVIES[currentMovieIndex];

  const handleNext = () => {
    setCurrentMovieIndex((prev) => (prev + 1) % MOVIES.length);
  };

  const handlePrev = () => {
    setCurrentMovieIndex((prev) => (prev - 1 + MOVIES.length) % MOVIES.length);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3000);
  };

  const handleNavLinkClick = (linkName: string) => {
    setActiveTab(linkName.toLowerCase());
    setIsMobileMenuOpen(false);
    if (linkName === "User Reviews") {
      setActiveModal("reviews");
    } else if (linkName === "🤖 My Idol") {
      setActiveModal("idol");
    } else if (linkName === "🎮 Anime Games") {
      setActiveModal("games");
    } else if (linkName === "Editor's Pick") {
      showToast("Filtered by Editor's Choice 🏆");
    } else {
      showToast(`Browsing ${linkName}`);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || isLoadingAi) return;

    const userText = inputMessage.trim();
    setInputMessage("");
    const newUserMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: userText,
    };

    const updatedHistory = [...chatMessages, newUserMsg];
    setChatMessages(updatedHistory);
    setIsLoadingAi(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          history: chatMessages.map(m => ({ role: m.role, text: m.text })),
          customApiKey: customApiKey.trim() || "7ItHmjKaCOcprd3g9Seg"
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Алдаа гарлаа.");
      }

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: data.text || "Хариулт олдсонгүй.",
      };
      setChatMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      showToast(err.message || "AI холбогдоход алдаа гарлаа.");
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "Ёоо, жижигхэн асуудал гарчихлаа (сүлжээ эсвэл API алдаа). Дахиад бичээд үз дээ! 🙏",
      };
      setChatMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoadingAi(false);
    }
  };

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
        setActiveModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black text-white flex flex-col font-sans select-none">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] bg-gray-900/90 border border-white/20 backdrop-blur-md px-5 py-2.5 rounded-full text-sm font-medium shadow-2xl animate-blur-fade-up flex items-center gap-2 text-white">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* BACKGROUND VIDEO (z-index 0) */}
      <video
        key={currentMovie.videoUrl}
        src={currentMovie.videoUrl}
        autoPlay
        loop
        muted={isMuted}
        playsInline
        className="fixed inset-0 w-full h-full object-cover z-[0] pointer-events-none"
      />

      {/* BOTTOM BLUR OVERLAY (z-index 1, pointer-events-none) */}
      <div className="fixed inset-0 backdrop-blur-xl bottom-blur-mask pointer-events-none z-[1]" />

      {/* NAVBAR (z-index 50, relative positioned) */}
      <nav className="relative z-[50] flex items-center justify-between px-4 sm:px-6 md:px-12 py-4 md:py-6">
        
        {/* Left: Text logo */}
        <div 
          className="h-8 md:h-10 flex items-center animate-blur-fade-up cursor-pointer group"
          style={{ animationDelay: '0ms' }}
          onClick={() => {
            setCurrentMovieIndex(0);
            showToast("Welcome to CINEMATIC Original Streaming");
          }}
        >
          <span className="text-lg md:text-2xl font-black tracking-[0.25em] bg-gradient-to-r from-white via-gray-200 to-gray-500 bg-clip-text text-transparent group-hover:to-white transition-all">
            CINEMATIC
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-red-600 ml-1.5 animate-pulse" />
        </div>

        {/* Center (desktop only): Navigation links */}
        <div className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.name}
              onClick={() => handleNavLinkClick(link.name)}
              className={`text-sm font-medium transition-colors cursor-pointer animate-blur-fade-up relative py-1 ${
                activeTab === link.name.toLowerCase() ? 'text-white' : 'text-gray-400 hover:text-gray-200'
              }`}
              style={{ animationDelay: link.delay }}
            >
              {link.name}
              {activeTab === link.name.toLowerCase() && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full animate-pulse" />
              )}
            </a>
          ))}
        </div>

        {/* Right: Search, User, Hamburger buttons */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* Audio toggle button (subtle bonus utility) */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="hidden md:flex w-10 h-10 rounded-full liquid-glass items-center justify-center text-gray-300 hover:text-white transition-colors cursor-pointer animate-blur-fade-up"
            style={{ animationDelay: '300ms' }}
            title={isMuted ? "Unmute Ambient Sound" : "Mute Sound"}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-red-400" />}
          </button>

          {/* Search button (visible sm and up) */}
          <button
            onClick={() => setActiveModal('search')}
            className="hidden sm:flex rounded-full liquid-glass px-4 md:px-6 py-2 items-center gap-2.5 text-sm font-medium text-gray-200 hover:text-white transition-all active:scale-95 cursor-pointer animate-blur-fade-up group"
            style={{ animationDelay: '350ms' }}
          >
            <Search className="w-[18px] h-[18px] text-gray-400 group-hover:text-white transition-colors" />
            <span>Search</span>
          </button>

          {/* Profile button (visible sm and up) */}
          <button
            onClick={() => setActiveModal('profile')}
            className="hidden sm:flex w-10 h-10 rounded-full liquid-glass items-center justify-center text-gray-300 hover:text-white transition-all active:scale-95 cursor-pointer animate-blur-fade-up"
            style={{ animationDelay: '400ms' }}
            aria-label="User Profile"
          >
            <User className="w-[18px] h-[18px]" />
          </button>

          {/* Hamburger menu button (visible below lg) */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden w-10 h-10 rounded-full liquid-glass flex items-center justify-center cursor-pointer animate-blur-fade-up relative focus:outline-none"
            style={{ animationDelay: '350ms' }}
            aria-label="Toggle Navigation Menu"
          >
            <div className={`absolute transition-all duration-500 ease-out flex items-center justify-center ${isMobileMenuOpen ? 'rotate-180 opacity-0 scale-50' : 'rotate-0 opacity-100 scale-100'}`}>
              <Menu className="w-[18px] h-[18px]" />
            </div>
            <div className={`absolute transition-all duration-500 ease-out flex items-center justify-center ${isMobileMenuOpen ? 'rotate-0 opacity-100 scale-100' : '-rotate-180 opacity-0 scale-50'}`}>
              <X className="w-[18px] h-[18px]" />
            </div>
          </button>

        </div>
      </nav>

      {/* MOBILE MENU (below lg breakpoint, z-index 40) */}
      <div
        className={`lg:hidden absolute left-4 right-4 sm:left-6 sm:right-6 top-[72px] z-[40] bg-gray-900/95 backdrop-blur-lg border border-gray-800 rounded-2xl shadow-2xl p-3 transition-all duration-500 ease-out origin-top ${
          isMobileMenuOpen
            ? 'translate-y-0 opacity-100 scale-100 pointer-events-auto'
            : '-translate-y-4 opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <div className="flex flex-col gap-1">
          {NAV_LINKS.map((link, idx) => (
            <a
              key={link.name}
              onClick={() => handleNavLinkClick(link.name)}
              className={`py-3 px-4 rounded-lg hover:bg-gray-800/60 transition-all duration-300 flex items-center justify-between text-sm font-medium cursor-pointer ${
                isMobileMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
              }`}
              style={{ transitionDelay: isMobileMenuOpen ? `${idx * 50}ms` : '0ms' }}
            >
              <span className={activeTab === link.name.toLowerCase() ? 'text-white font-semibold' : 'text-gray-300'}>
                {link.name}
              </span>
              <ChevronRight className="w-4 h-4 text-gray-500" />
            </a>
          ))}
        </div>

        {/* Search & Profile inside mobile dropdown for small screens (< sm) */}
        <div className="sm:hidden border-t border-gray-800/80 pt-3 mt-2 flex items-center gap-3 px-1">
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              setActiveModal('search');
            }}
            className="flex-1 rounded-xl liquid-glass py-2.5 px-4 flex items-center justify-center gap-2 text-sm font-medium text-gray-200"
          >
            <Search className="w-4 h-4 text-gray-400" />
            <span>Search Catalog</span>
          </button>
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              setActiveModal('profile');
            }}
            className="w-10 h-10 rounded-xl liquid-glass flex items-center justify-center text-gray-200"
          >
            <User className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* HERO CONTENT (bottom of viewport, z-index 10) */}
      <main className="flex-1 flex flex-col justify-end px-4 sm:px-6 md:px-12 pb-8 md:pb-16 z-[10]">
        
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8 w-full">
          
          {/* Left side: Metadata, Title, Description, CTAs */}
          <div key={currentMovieIndex} className="flex-1 max-w-4xl">
            
            {/* Metadata row */}
            <div
              className="flex flex-wrap items-center gap-3 sm:gap-6 mb-6 md:mb-8 text-xs sm:text-sm text-gray-300 animate-blur-fade-up"
              style={{ animationDelay: '300ms' }}
            >
              <div className="flex items-center gap-1.5 sm:gap-2 bg-white/10 px-3 py-1 rounded-full border border-white/10 backdrop-blur-sm">
                <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-white text-white text-amber-400" />
                <span className="font-semibold text-white tracking-wide">{currentMovie.rating}</span>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 text-gray-300">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <span>{currentMovie.duration}</span>
              </div>

              <span className="w-1 h-1 rounded-full bg-gray-600 hidden sm:inline-block" />

              <div className="flex items-center gap-1.5 sm:gap-2 text-gray-300">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <span>{currentMovie.year}</span>
              </div>

              <span className="w-1 h-1 rounded-full bg-gray-600 hidden sm:inline-block" />

              <span className="text-gray-400 text-xs tracking-wider uppercase font-mono hidden sm:inline-block">
                {currentMovie.genre}
              </span>
            </div>

            {/* Title */}
            <h1
              className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-normal tracking-[-0.04em] mb-4 md:mb-6 text-white leading-[1.08] animate-blur-fade-up"
              style={{ animationDelay: '400ms' }}
            >
              {currentMovie.title}
            </h1>

            {/* Description */}
            <p
              className="text-base sm:text-lg md:text-xl text-gray-400 mb-6 md:mb-12 max-w-2xl leading-relaxed animate-blur-fade-up font-light"
              style={{ animationDelay: '500ms' }}
            >
              {currentMovie.description}
            </p>

            {/* CTA buttons */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              
              {/* Watch Now */}
              <button
                onClick={() => {
                  setActiveModal('trailer');
                  setIsMuted(false);
                }}
                className="bg-white text-black rounded-full font-medium px-6 sm:px-8 py-2.5 sm:py-3 flex items-center gap-2.5 hover:bg-gray-200 transition-all active:scale-95 shadow-xl shadow-white/10 cursor-pointer animate-blur-fade-up group"
                style={{ animationDelay: '600ms' }}
              >
                <Play className="w-[18px] h-[18px] fill-black text-black group-hover:scale-110 transition-transform" />
                <span>Watch Now</span>
              </button>

              {/* Learn More */}
              <button
                onClick={() => setActiveModal('info')}
                className="rounded-full font-medium liquid-glass px-6 sm:px-8 py-2.5 sm:py-3 flex items-center gap-2 hover:bg-white/10 transition-all active:scale-95 cursor-pointer animate-blur-fade-up text-white group"
                style={{ animationDelay: '700ms' }}
              >
                <Info className="w-[18px] h-[18px] text-gray-400 group-hover:text-white transition-colors" />
                <span>Learn More</span>
              </button>

            </div>

          </div>

          {/* Right side: Navigation arrows */}
          <div className="flex items-center gap-3 md:w-auto self-start md:self-end pt-4 md:pt-0">
            
            {/* Previous button */}
            <button
              onClick={handlePrev}
              className="rounded-full liquid-glass px-4 sm:px-6 py-2.5 sm:py-3 flex items-center gap-1.5 sm:gap-2 text-sm font-medium text-gray-200 hover:text-white transition-all active:scale-95 cursor-pointer animate-blur-fade-up group"
              style={{ animationDelay: '800ms' }}
              title="Previous Title"
            >
              <ChevronLeft className="w-[18px] h-[18px] text-gray-400 group-hover:-translate-x-0.5 transition-transform" />
              <span>Previous</span>
            </button>

            {/* Next button */}
            <button
              onClick={handleNext}
              className="rounded-full liquid-glass px-4 sm:px-6 py-2.5 sm:py-3 flex items-center gap-1.5 sm:gap-2 text-sm font-medium text-gray-200 hover:text-white transition-all active:scale-95 cursor-pointer animate-blur-fade-up group"
              style={{ animationDelay: '900ms' }}
              title="Next Title"
            >
              <span>Next</span>
              <ChevronRight className="w-[18px] h-[18px] text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

          </div>

        </div>

      </main>

      {/* --- MODALS & DIALOGS (kept strictly within single-hero screen) --- */}

      {/* 1. SEARCH MODAL */}
      {activeModal === 'search' && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-2xl flex items-start justify-center pt-24 px-4 animate-fadeIn">
          <div className="w-full max-w-2xl bg-gray-900/90 border border-white/10 rounded-3xl p-6 shadow-2xl relative">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search movies, directors, actors..."
                autoFocus
                className="bg-transparent text-white placeholder-gray-500 text-lg focus:outline-none flex-1"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="text-gray-500 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="pt-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Suggested Titles</p>
              <div className="flex flex-col gap-2">
                {MOVIES.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase()) || m.genre.toLowerCase().includes(searchQuery.toLowerCase())).map((item) => (
                  <div
                    key={item.title}
                    onClick={() => {
                      const idx = MOVIES.findIndex(x => x.title === item.title);
                      if (idx !== -1) setCurrentMovieIndex(idx);
                      setActiveModal(null);
                      showToast(`Playing ${item.title}`);
                    }}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <Film className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition-colors" />
                      <div>
                        <p className="text-sm font-medium text-white">{item.title}</p>
                        <p className="text-xs text-gray-400">{item.genre} · {item.year}</p>
                      </div>
                    </div>
                    <span className="text-xs text-amber-400 font-semibold">{item.rating}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 2. TRAILER MODAL */}
      {activeModal === 'trailer' && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-8 animate-fadeIn">
          <div className="w-full max-w-5xl aspect-video bg-black rounded-3xl overflow-hidden border border-white/20 shadow-2xl relative flex flex-col justify-between group">
            <video
              src={currentMovie.videoUrl}
              autoPlay
              controls
              className="w-full h-full object-cover"
            />
            
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 z-10 rounded-full liquid-glass px-4 py-2 flex items-center gap-2 text-sm text-white hover:bg-white/20 shadow-lg"
            >
              <span>Close Player</span>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 3. LEARN MORE (INFO) MODAL */}
      {activeModal === 'info' && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-2xl flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-xl bg-gray-950 border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-left">
            <div className="flex items-center gap-2 text-red-500 text-xs font-bold uppercase tracking-widest mb-2">
              <Tv className="w-4 h-4" />
              <span>Original Feature</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-normal tracking-tight text-white mb-3">
              {currentMovie.title}
            </h2>
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed mb-6">
              {currentMovie.description}
            </p>

            <div className="grid grid-cols-2 gap-4 border-t border-b border-white/10 py-5 mb-6 text-sm">
              <div>
                <p className="text-gray-500 text-xs mb-1">Directed by</p>
                <p className="text-white font-medium">{currentMovie.director}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Release Date</p>
                <p className="text-white font-medium">{currentMovie.year}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-500 text-xs mb-1">Starring Cast</p>
                <p className="text-white font-medium">{currentMovie.cast}</p>
              </div>
            </div>

            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <span className="text-xs text-gray-300 font-medium">Official Cannes & Venice Selection</span>
              </div>
              <span className="text-xs text-white font-mono bg-white/10 px-2.5 py-1 rounded-md">HDR10+</span>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-6 right-6 w-9 h-9 rounded-full liquid-glass flex items-center justify-center text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 4. USER REVIEWS MODAL */}
      {activeModal === 'reviews' && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-2xl flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-lg bg-gray-900/90 border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
            <div className="flex items-center gap-2.5 mb-4">
              <MessageSquare className="w-5 h-5 text-amber-400" />
              <h3 className="text-xl font-medium text-white">{currentMovie.reviewsCount}</h3>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-4 relative">
              <div className="flex items-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-gray-200 italic text-sm md:text-base mb-3">
                "{currentMovie.quote}"
              </p>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Verified Subscriber Review</span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <ThumbsUp className="w-3.5 h-3.5" /> 98% Helpful
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                showToast("Review submitted for moderation ✨");
                setActiveModal(null);
              }}
              className="w-full rounded-full bg-white text-black font-semibold py-3 hover:bg-gray-200 transition-colors"
            >
              Write Your Review
            </button>

            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-6 right-6 w-8 h-8 rounded-full liquid-glass flex items-center justify-center text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 5. PROFILE MODAL */}
      {activeModal === 'profile' && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-2xl flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-gray-950 border border-white/15 rounded-3xl p-6 text-center relative">
            <div className="w-20 h-20 rounded-full liquid-glass mx-auto mb-4 flex items-center justify-center border border-white/20">
              <User className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-1">Тулгат (Tulgat)</h3>
            <p className="text-xs text-amber-400 mb-6">13 настай · 154-р сургуулийн 8-р анги</p>

            <div className="flex flex-col gap-2.5 text-sm text-left mb-6">
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                <span className="text-gray-300 flex items-center gap-2.5"><BookmarkCheck className="w-4 h-4 text-emerald-400" /> Дуртай Аниме</span>
                <span className="font-mono text-white">One Piece 🏴‍☠️</span>
              </div>
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                <span className="text-gray-300 flex items-center gap-2.5"><Shield className="w-4 h-4 text-amber-400" /> Хобби</span>
                <span className="font-mono text-white">Video Games 🎮</span>
              </div>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="w-full rounded-full liquid-glass py-2.5 text-sm font-medium text-gray-300 hover:text-white"
            >
              Return to Screen
            </button>

            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full liquid-glass flex items-center justify-center text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 6. IDOL AI CHAT MODAL */}
      {activeModal === 'idol' && (
        <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
          <div className="w-full max-w-xl h-[640px] max-h-[90vh] bg-gray-950/95 border border-white/20 rounded-3xl shadow-2xl flex flex-col relative overflow-hidden text-left">
            
            {/* Top Chat Header */}
            <div className="p-4 sm:p-5 border-b border-white/10 bg-gradient-to-r from-gray-900 via-gray-900/80 to-red-950/40 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 via-amber-600 to-gray-800 p-0.5 shadow-lg flex items-center justify-center">
                    <div className="w-full h-full bg-gray-950 rounded-[14px] flex items-center justify-center text-2xl">
                      🤖
                    </div>
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-gray-950 rounded-full animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">My Idol — Тулгат</h3>
                    <span className="text-[10px] font-mono uppercase bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.5 rounded-full">AI Companion</span>
                  </div>
                  <p className="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
                    <span>🎮 Gamer</span>
                    <span>·</span>
                    <span>🏀 ⚽ Спортоор хичээллэдэг</span>
                    <span>·</span>
                    <span>👨‍🍳 Ирээдүйн тогооч</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                  className={`p-2 rounded-xl border transition-all cursor-pointer ${showApiKeyInput ? 'bg-amber-500/20 border-amber-500 text-amber-300' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'}`}
                  title="Gemini API Key Тохиргоо"
                >
                  <Key className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveModal(null)}
                  className="w-8 h-8 rounded-full liquid-glass flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Collapsible API Key Config Bar */}
            {showApiKeyInput && (
              <div className="px-5 py-3 bg-gray-900/95 border-b border-amber-500/30 animate-fadeIn text-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-amber-400 flex-shrink-0 font-medium">
                  <Key className="w-3.5 h-3.5" />
                  <span>Gemini API Key:</span>
                </div>
                <input
                  type="password"
                  value={customApiKey}
                  onChange={(e) => setCustomApiKey(e.target.value)}
                  placeholder="Өөрийн Gemini API Key тавих..."
                  className="bg-black/60 border border-white/10 rounded-lg px-3 py-1.5 text-white font-mono flex-1 focus:outline-none focus:border-amber-400"
                />
                <button
                  onClick={() => {
                    setCustomApiKey("7ItHmjKaCOcprd3g9Seg");
                    showToast("Үндсэн Key сэргээгдлээ");
                  }}
                  className="text-gray-400 hover:text-white underline cursor-pointer"
                >
                  Default
                </button>
              </div>
            )}

            {/* Chat Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-blur-fade-up`}
                >
                  <div
                    className={`max-w-[84%] rounded-2xl p-4 text-sm sm:text-base leading-relaxed relative ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-900/20 rounded-br-xs'
                        : 'bg-white/10 border border-white/10 text-gray-100 backdrop-blur-md rounded-bl-xs'
                    }`}
                  >
                    {msg.role === 'model' && (
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-400 mb-1.5 uppercase tracking-wider">
                        <span>🤖 Тулгат</span>
                      </div>
                    )}
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
              ))}

              {isLoadingAi && (
                <div className="flex justify-start animate-pulse">
                  <div className="bg-white/10 border border-white/10 rounded-2xl rounded-bl-xs px-4 py-3 text-sm text-gray-400 flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span>Тулгат бодож байна...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input Footer */}
            <form onSubmit={handleSendMessage} className="p-3 sm:p-4 border-t border-white/10 bg-gray-900/80 backdrop-blur-md flex items-center gap-2 sm:gap-3">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Тулгатад зөвлөгөө эсвэл юм ярих..."
                disabled={isLoadingAi}
                className="flex-1 bg-black/60 border border-white/15 rounded-full px-5 py-3 text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-all disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoadingAi}
                className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:hover:bg-red-600 text-white flex items-center justify-center transition-all active:scale-95 shadow-lg shadow-red-600/30 cursor-pointer flex-shrink-0"
              >
                <Send className="w-5 h-5 -ml-0.5" />
              </button>
            </form>

            {/* Safety Reminder Banner at very bottom */}
            <div className="px-4 py-2 bg-black/90 border-t border-white/5 text-[11px] text-gray-400 flex items-center justify-center gap-1.5 text-center">
              <Shield className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span>🛡 Чухал эсвэл хүнд асуудлаар итгэдэг том хүн (эцэг эх, багш)-тайгаа зөвлөөрэй.</span>
            </div>

          </div>
        </div>
      )}

      {/* 7. ANIME GAMES MODAL */}
      {activeModal === 'games' && (
        <AnimeGames
          onClose={() => setActiveModal(null)}
          showToast={showToast}
        />
      )}

    </div>
  );
}

