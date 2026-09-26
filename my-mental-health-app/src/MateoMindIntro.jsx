import React, { useEffect } from "react";

export default function MateoMindIntro({ onFinish }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onFinish) onFinish();
    }, 7000); // 7 seconds animation
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen w-full bg-gradient-to-br from-blue-100 to-purple-200 animate-fade-in overflow-hidden">
      {/* Full-page neuron animation background */}
      <svg width="100vw" height="100vh" viewBox="0 0 1440 900" className="absolute top-0 left-0 w-full h-full z-0" style={{ pointerEvents: 'none' }}>
        {/* Large neuron paths across the page */}
        <path id="neuron1" d="M100,400 Q400,100 720,400 Q1040,700 1340,400" stroke="#9333ea" strokeWidth="8" fill="none" />
        <path id="neuron2" d="M200,700 Q600,300 720,700 Q840,1100 1240,700" stroke="#4f46e5" strokeWidth="6" fill="none" />
        <path id="neuron3" d="M50,200 Q600,600 720,200 Q900,-100 1390,300" stroke="#a78bfa" strokeWidth="5" fill="none" />
        <path id="neuron4" d="M20,800 Q700,900 720,500 Q900,300 1420,800" stroke="#818cf8" strokeWidth="5" fill="none" />
        {/* Neuron path passing through logo center */}
        <path id="logoNeuron" d="M0,450 Q720,450 720,400 Q720,350 1440,350" stroke="#06b6d4" strokeWidth="10" fill="none" />
        {/* Animated bubbles moving continuously along neuron lines */}
        <circle r="24" fill="#fbbf24">
          <animateMotion dur="4s" repeatCount="indefinite">
            <mpath xlinkHref="#neuron1" />
          </animateMotion>
        </circle>
        <circle r="28" fill="#f472b6">
          <animateMotion dur="5s" repeatCount="indefinite">
            <mpath xlinkHref="#neuron2" />
          </animateMotion>
        </circle>
        <circle r="20" fill="#34d399">
          <animateMotion dur="6s" repeatCount="indefinite">
            <mpath xlinkHref="#neuron3" />
          </animateMotion>
        </circle>
        <circle r="18" fill="#60a5fa">
          <animateMotion dur="7s" repeatCount="indefinite">
            <mpath xlinkHref="#neuron4" />
          </animateMotion>
        </circle>
        <circle r="22" fill="#f87171">
          <animateMotion dur="5.5s" repeatCount="indefinite">
            <mpath xlinkHref="#neuron1" />
          </animateMotion>
        </circle>
        {/* Bubble passing through logo center */}
        <circle r="26" fill="#06b6d4">
          <animateMotion dur="6s" repeatCount="indefinite">
            <mpath xlinkHref="#logoNeuron" />
          </animateMotion>
        </circle>
      </svg>
      {/* Centered logo */}
      <div className="relative flex items-center justify-center mb-8 z-10" style={{ width: 220, height: 220 }}>
        <svg width="120" height="120" viewBox="0 0 120 120" className="animate-bounce-slow">
          <circle cx="60" cy="60" r="55" fill="url(#grad)" />
          <text x="50%" y="54%" textAnchor="middle" fontSize="48" fontWeight="bold" fill="#fff" dy=".3em">M</text>
          <defs>
            <linearGradient id="grad" x1="0" y1="0" x2="120" y2="120">
              <stop offset="0%" stopColor="#4f46e5" />
              <stop offset="100%" stopColor="#9333ea" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="text-3xl font-extrabold mb-2 animate-fade-in z-20"
        style={{
          color: '#9333ea',
          textShadow: '0 2px 8px #fff, 0 0px 32px #a78bfa',
          background: 'rgba(255,255,255,0.7)',
          borderRadius: '1rem',
          padding: '0.5rem 2rem',
          boxShadow: '0 4px 24px rgba(59,130,246,0.12)'
        }}
      >MateoMind</div>
    </div>
  );
}

// Add these CSS animations to your global CSS or style.css:
// .animate-fade-in { animation: fadeIn 1s ease-in; }
// @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
// .animate-bounce-slow { animation: bounce 2s infinite alternate; }
// @keyframes bounce { 0% { transform: translateY(0); } 100% { transform: translateY(-20px); } }
// .animate-pulse-emotion { animation: pulse 1.5s infinite alternate; }
// .animate-pulse-emotion2 { animation: pulse2 2s infinite alternate; }
// .animate-pulse-emotion3 { animation: pulse3 2.5s infinite alternate; }
// @keyframes pulse { 0% { opacity: 0.5; } 100% { opacity: 1; transform: scale(1.2); } }
// @keyframes pulse2 { 0% { opacity: 0.5; } 100% { opacity: 1; transform: scale(1.1); } }
// @keyframes pulse3 { 0% { opacity: 0.5; } 100% { opacity: 1; transform: scale(1.3); } }
// .animate-float { animation: float 2s infinite alternate; }
// .animate-float2 { animation: float2 2.2s infinite alternate; }
// .animate-float3 { animation: float3 2.4s infinite alternate; }
// @keyframes float { 0% { transform: translateY(0); } 100% { transform: translateY(-10px); } }
// @keyframes float2 { 0% { transform: translateY(0); } 100% { transform: translateY(-8px); } }
// @keyframes float3 { 0% { transform: translateY(0); } 100% { transform: translateY(-12px); } }
