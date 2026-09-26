import React, { useState, useEffect } from "react";
import MateoMindIntro from "./MateoMindIntro";

const MOOD_QUESTIONS = {
  happy: [
    "I feel energetic and motivated",
    "I enjoy social activities",
    "I feel confident about my future",
    "I sleep well at night",
    "I feel grateful for what I have",
    "I handle stress effectively",
    "I feel connected to others",
    "I enjoy my daily activities",
    "I feel optimistic about challenges",
    "I maintain good relationships"
  ],
  sad: [
    "I feel sad or hopeless frequently",
    "I lose interest in activities I usually enjoy",
    "I feel tired or have little energy most days",
    "I feel worthless or guilty",
    "I have trouble falling or staying asleep",
    "I feel socially isolated",
    "I have difficulty concentrating",
    "I cry often or feel like crying",
    "I feel overwhelmed by daily tasks",
    "I have thoughts of self-harm",
  ],
  anxious: [
    "I feel nervous, anxious, or on edge",
    "I have trouble relaxing",
    "I worry too much about different things",
    "I experience panic attacks or intense fear",
    "I feel restless or keyed up",
    "I have trouble controlling worry",
    "I feel something awful might happen",
    "I avoid situations that make me anxious",
    "I have physical symptoms of anxiety",
    "I overthink or dwell on negative thoughts"
  ],
  stressed: [
    "I feel pressure to achieve academically",
    "I feel angry or irritable often",
    "I have difficulty concentrating",
    "I feel overwhelmed by responsibilities",
    "I have trouble managing my time",
    "I feel burned out from work/studies",
    "I have headaches or muscle tension",
    "I feel like I can't keep up",
    "I snap at people easily",
    "I use substances to cope with stress"
  ]
};

const OPTIONS = ["Never", "Sometimes", "Often", "Always", "Other"];

const DOCTORS = [
  { id: 1, name: "Dr. Sarah Johnson", specialty: "Clinical Psychologist", rating: 4.9, experience: "8 years", slots: ["9:00 AM", "11:00 AM", "2:00 PM", "4:00 PM"] },
  { id: 2, name: "Dr. Michael Chen", specialty: "Psychiatrist", rating: 4.8, experience: "12 years", slots: ["10:00 AM", "1:00 PM", "3:00 PM", "5:00 PM"] },
  { id: 3, name: "Dr. Emily Davis", specialty: "Therapist", rating: 4.7, experience: "6 years", slots: ["8:00 AM", "12:00 PM", "6:00 PM", "7:00 PM"] }
];

const CHATBOT_RESPONSES = {
  greeting: ["Hello! I'm here to support you. How are you feeling today?", "Hi there! What's on your mind?"],
  sad: ["I understand you're feeling down. Remember, it's okay to feel this way. Would you like to talk about it?", "I'm here to listen. What's making you feel sad?"],
  anxious: ["Anxiety can be overwhelming. Try taking deep breaths. What's causing your anxiety?", "Let's work through this together. Can you tell me more about your worries?"],
  stressed: ["Stress is tough. Let's find ways to manage it. What's your biggest stressor right now?", "I hear you. Stress affects us all. What would help you feel calmer?"],
  happy: ["That's wonderful! I'm glad you're feeling positive. What's bringing you joy today?", "Great to hear! Happiness is precious. What's going well for you?"],
  help: ["I can help with mood tracking, coping strategies, or finding professional support. What do you need?", "I'm here for emotional support, resources, and guidance. How can I assist you?"]
};

export default function MentalHealthPrototype() {
  const [showIntro, setShowIntro] = useState(true);
  const [page, setPage] = useState("login");
  const [username, setUsername] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [userMood, setUserMood] = useState("");
  const [currentQuestions, setCurrentQuestions] = useState([]);
  const [answers, setAnswers] = useState(Array(10).fill(""));
  const [otherTexts, setOtherTexts] = useState({});
  const [analysis, setAnalysis] = useState(null);
  const [slot, setSlot] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [moodHistory, setMoodHistory] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [progress, setProgress] = useState(0);
  const [activeNav, setActiveNav] = useState('home');
  // New attractive profile structure for mental health users
  const [profile, setProfile] = useState({
    name: "",
    age: "",
    photo: "",
    email: "",
    phone: "",
    gender: "",
    dob: "",
    pronouns: "",
    strengths: [], // e.g. ['Empathy', 'Resilience']
    goals: [], // e.g. ['Practice mindfulness', 'Connect with friends']
    moodHistory: [], // e.g. [{date, mood, note}]
    supportContacts: [], // e.g. [{name, relation, phone}]
    favoriteResources: [], // e.g. ['Meditation', 'Music', 'Yoga']
    wellnessScore: 0, // e.g. 0-100
    lastCheckIn: ""
  });
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [activeResource, setActiveResource] = useState('music');
  const [chatPosition, setChatPosition] = useState({ x: 'right-6', y: 'bottom-6' });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [bookedAppointments, setBookedAppointments] = useState([]);
  const [pageHistory, setPageHistory] = useState([]);
  const [showFeaturesMenu, setShowFeaturesMenu] = useState(false);
  const [theme, setTheme] = useState('light');
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  // NEW FEATURES STATE VARIABLES
  const [dailyMoodTracker, setDailyMoodTracker] = useState([]);
  const [breathingExerciseActive, setBreathingExerciseActive] = useState(false);
  const [breathingCount, setBreathingCount] = useState(0);
  const [journalEntries, setJournalEntries] = useState([]);
  const [currentJournalEntry, setCurrentJournalEntry] = useState('');
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [moodCalendar, setMoodCalendar] = useState({});
  const [sleepTracker, setSleepTracker] = useState([]);
  const [gratitudeList, setGratitudeList] = useState([]);
  const [currentGratitude, setCurrentGratitude] = useState('');
  const [mentalHealthTips, setMentalHealthTips] = useState([
    "Take 5 deep breaths when feeling overwhelmed",
    "Practice gratitude by listing 3 things you're thankful for",
    "Take a 10-minute walk in nature",
    "Listen to calming music for 15 minutes",
    "Call a friend or family member",
    "Practice progressive muscle relaxation",
    "Write in your journal for 10 minutes",
    "Do a quick meditation session"
  ]);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [voiceNotes, setVoiceNotes] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [socialSupport, setSocialSupport] = useState([]);
  const [currentSupportMessage, setCurrentSupportMessage] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('mentalHealthData');
    if (saved) {
      const data = JSON.parse(saved);
      setUsername(data.username || "");
      setAgeGroup(data.ageGroup || "");
      setMoodHistory(data.moodHistory || []);
      setProfile(data.profile || { name: "", age: "", phone: "", email: "", gender: "", dob: "", photo: "" });
      setBookedAppointments(data.bookedAppointments || []);
      if (data.currentPage && data.username) {
        setPage(data.currentPage);
      }
    }
  }, []);

  useEffect(() => {
    const data = { username, ageGroup, moodHistory, profile, currentPage: page, bookedAppointments };
    localStorage.setItem('mentalHealthData', JSON.stringify(data));
  }, [username, ageGroup, moodHistory, profile, page, bookedAppointments]);

  useEffect(() => {
    const answered = answers.filter(a => a !== "").length;
    setProgress((answered / answers.length) * 100);
  }, [answers]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleAnswerChange = (index, value) => {
    const updated = [...answers];
    updated[index] = value;
    setAnswers(updated);
  };

  const handleOtherTextChange = (index, text) => {
    setOtherTexts({ ...otherTexts, [index]: text });
  };

  const analyzeResults = () => {
    let score = 0;
    let riskFactors = [];
    let strengths = [];
    
    answers.forEach((a, i) => {
      if (a === "Sometimes") score += 1;
      if (a === "Often") { score += 2; riskFactors.push(currentQuestions[i]); }
      if (a === "Always") { score += 3; riskFactors.push(currentQuestions[i]); }
      if (a === "Never") strengths.push(currentQuestions[i]);
    });
    
    let mood = "Stable";
    let severity = "low";
    let recommendations = [];
    
    if (score > 20) {
      mood = "Highly Stressed";
      severity = "high";
      recommendations = ["Consider professional counseling", "Practice daily meditation", "Maintain regular sleep schedule", "Engage in physical exercise"];
    } else if (score > 10) {
      mood = "Moderately Stressed";
      severity = "medium";
      recommendations = ["Try stress management techniques", "Connect with supportive friends", "Practice deep breathing", "Consider therapy if symptoms persist"];
    } else if (score > 5) {
      mood = "Mildly Stressed";
      severity = "low";
      recommendations = ["Maintain healthy habits", "Practice mindfulness", "Stay socially connected", "Monitor your mood regularly"];
    } else {
      recommendations = ["Keep up the good work!", "Continue healthy practices", "Stay aware of your mental health", "Help others who might be struggling"];
    }
    
    const newEntry = { date: new Date().toLocaleDateString(), mood: userMood, score, severity };
    const updatedHistory = [...moodHistory, newEntry];
    setMoodHistory(updatedHistory);
    
    setAnalysis({ score, mood, severity, riskFactors, strengths, recommendations, trend: calculateTrend(updatedHistory) });
    setRecommendations(recommendations);
    setAnswers(Array(10).fill(""));
    setOtherTexts({});
    setPage("analysis");
  };

  const calculateTrend = (history) => {
    if (history.length < 2) return "stable";
    const recent = history.slice(-3);
    const avgRecent = recent.reduce((sum, entry) => sum + entry.score, 0) / recent.length;
    const older = history.slice(-6, -3);
    if (older.length === 0) return "stable";
    const avgOlder = older.reduce((sum, entry) => sum + entry.score, 0) / older.length;
    
    if (avgRecent > avgOlder + 2) return "worsening";
    if (avgRecent < avgOlder - 2) return "improving";
    return "stable";
  };

  const sendChatMessage = (message) => {
    const userMessage = { text: message, sender: "user", time: new Date().toLocaleTimeString() };
    setChatMessages(prev => [...prev, userMessage]);
    
    setIsTyping(true);
    setTimeout(() => {
      const botResponse = generateBotResponse(message.toLowerCase());
      const botMessage = { text: botResponse, sender: "bot", time: new Date().toLocaleTimeString() };
      setChatMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const navigateToPage = (newPage) => {
    if (page !== newPage) {
      setPageHistory(prev => [...prev, page]);
      setPage(newPage);
    }
  };

  const goBack = () => {
    if (pageHistory.length > 0) {
      const previousPage = pageHistory[pageHistory.length - 1];
      setPageHistory(prev => prev.slice(0, -1));
      setPage(previousPage);
    } else {
      setPage('dashboard');
    }
  };

  const generateBotResponse = (input) => {
    if (input.includes("book appointment")) {
      return "I can help you book an appointment with a mental health professional. Click on 'Take Assessment' from the dashboard to start, or would you like me to guide you through our available doctors?";
    }
    if (input.includes("coping tips") || input.includes("coping strategies")) {
      return "Here are some effective coping strategies: \n1) Deep breathing (4-7-8 technique) \n2) Grounding exercise (5-4-3-2-1 method) \n3) Progressive muscle relaxation \n4) Mindful meditation \n5) Physical exercise. Would you like detailed instructions for any of these?";
    }
    if (input.includes("emergency")) {
      return "If you're in crisis, please contact: \n• National Suicide Prevention Lifeline: 988 \n• Crisis Text Line: Text HOME to 741741 \n• Emergency Services: 911 \nYour safety is our priority. Please reach out for immediate help if needed.";
    }
    if (input.includes("call support")) {
      return "Mental Health Support Lines: \n• SAMHSA Helpline: 1-800-662-4357 \n• Crisis Text Line: 741741 \n• NAMI Helpline: 1-800-950-6264 \nThese services are free, confidential, and available 24/7.";
    }
    if (input.includes("chat more")) {
      return "I'm here to listen and support you. Feel free to share what's on your mind, ask about mental health resources, or let me know how you're feeling today. What would you like to talk about?";
    }
    if (input.includes("progress track")) {
      return "Tracking your mental health progress is important! You can view your assessment history, mood trends, and improvements over time in the Progress section of your dashboard.";
    }
    if (input.includes("set goals")) {
      return "Setting mental health goals can help your recovery journey. Consider goals like: daily meditation, regular exercise, improved sleep schedule, or weekly therapy sessions. What goals would you like to work on?";
    }
    if (input.includes("resources")) {
      return "Here are helpful mental health resources: \n• Educational articles and guides \n• Self-help tools and worksheets \n• Support group information \n• Crisis intervention resources \nCheck the Resources section in your dashboard for more details.";
    }
    if (input.includes("meditation")) {
      return "Meditation can reduce stress and improve mental well-being. Try these techniques: \n• Mindfulness meditation (5-10 minutes daily) \n• Body scan relaxation \n• Breathing exercises \n• Guided meditation apps. Would you like specific instructions?";
    }
    if (input.includes("music")) {
      return "Music therapy can be very healing! Try: \n• Calming nature sounds \n• Classical or ambient music \n• Binaural beats for relaxation \n• Your favorite uplifting songs. Check our music resources in the dashboard!";
    }
    if (input.includes("sad") || input.includes("depressed") || input.includes("down")) {
      return CHATBOT_RESPONSES.sad[Math.floor(Math.random() * CHATBOT_RESPONSES.sad.length)];
    }
    if (input.includes("anxious") || input.includes("worried") || input.includes("nervous")) {
      return CHATBOT_RESPONSES.anxious[Math.floor(Math.random() * CHATBOT_RESPONSES.anxious.length)];
    }
    if (input.includes("stressed") || input.includes("overwhelmed") || input.includes("pressure")) {
      return CHATBOT_RESPONSES.stressed[Math.floor(Math.random() * CHATBOT_RESPONSES.stressed.length)];
    }
    if (input.includes("happy") || input.includes("good") || input.includes("great")) {
      return CHATBOT_RESPONSES.happy[Math.floor(Math.random() * CHATBOT_RESPONSES.happy.length)];
    }
    if (input.includes("help") || input.includes("support") || input.includes("what")) {
      return CHATBOT_RESPONSES.help[Math.floor(Math.random() * CHATBOT_RESPONSES.help.length)];
    }
    return CHATBOT_RESPONSES.greeting[Math.floor(Math.random() * CHATBOT_RESPONSES.greeting.length)];
  };

  // Show intro animation before login page
  if (showIntro) {
    return <MateoMindIntro onFinish={() => setShowIntro(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
      {/* Back Button */}
      {page !== "login" && page !== "dashboard" && (
        <div className="fixed top-4 left-4 z-40">
          <button
            onClick={goBack}
            className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 p-2 rounded-full shadow-md transition-all duration-300 transform hover:scale-105"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
      )}
      
      {/* Navigation Bar */}
      {page !== "login" && (
      <nav className="bg-white dark:bg-gray-800 shadow-lg border-b dark:border-gray-700 transition-colors">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">M</span>
                </div>
                <span className="ml-2 text-xl font-bold text-gray-800 dark:text-white">MateoMind</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-1">
              <button
                onClick={() => { setActiveNav('home'); setShowFeaturesMenu(false); navigateToPage('dashboard'); }}
                className={`p-2 rounded-lg transition-all transform hover:scale-105 ${
                  activeNav === 'home' ? 'bg-gradient-to-r from-green-400 to-green-600 text-white shadow-lg' : 'text-gray-600 hover:bg-gradient-to-r hover:from-green-100 hover:to-green-200 hover:text-green-700'
                }`}
                title="Dashboard"
              >
                <span className="text-lg">🏠</span>
              </button>
              
              <button
                onClick={() => { setActiveNav('assignment'); setShowFeaturesMenu(false); navigateToPage('assignment'); }}
                className={`p-2 rounded-lg transition-all transform hover:scale-105 ${
                  activeNav === 'assignment' ? 'hidden' : 'hidden'
                }`}
                title="Take Assignment"
              style={{display:'none'}}
              >
                <span className="text-lg">📝</span>
              </button>
              
              <button
                onClick={() => { setActiveNav('appointments'); setShowFeaturesMenu(false); navigateToPage('slot'); }}
                className={`p-2 rounded-lg transition-all transform hover:scale-105 ${
                  activeNav === 'appointments' ? 'bg-gradient-to-r from-red-400 to-red-600 text-white shadow-lg' : 'text-gray-600 hover:bg-gradient-to-r hover:from-red-100 hover:to-red-200 hover:text-red-700'
                }`}
                title="Appointments"
              >
                <span className="text-lg">👨‍⚕️</span>
              </button>
              
              <button
                onClick={() => { setActiveNav('analytics'); setShowFeaturesMenu(false); navigateToPage('analysis'); }}
                className={`p-2 rounded-lg transition-all transform hover:scale-105 ${
                  activeNav === 'analytics' ? 'hidden' : 'hidden'
                }`}
                title="Analytics"
              style={{display:'none'}}
              >
                <span className="text-lg">📊</span>
              </button>
              
              <button
                  onClick={() => { setActiveNav('features'); setShowFeaturesMenu(false); navigateToPage('features'); }}
                  className={`p-2 rounded-lg transition-all transform hover:scale-105 ${
                    activeNav === 'features' ? 'bg-gradient-to-r from-purple-400 to-purple-600 text-white shadow-lg' : 'text-gray-600 hover:bg-gradient-to-r hover:from-purple-100 hover:to-purple-200 hover:text-purple-700'
                  }`}
                  title="Features"
                >
                  <span className="text-lg">⚡</span>
                </button>
              
              <button
                onClick={() => { setActiveNav('profile'); setShowFeaturesMenu(false); navigateToPage('profile'); }}
                className={`p-2 rounded-lg transition-all transform hover:scale-105 ${
                  activeNav === 'profile' ? 'bg-gradient-to-r from-indigo-400 to-indigo-600 text-white shadow-lg' : 'text-gray-600 hover:bg-gradient-to-r hover:from-indigo-100 hover:to-indigo-200 hover:text-indigo-700'
                }`}
                title="Profile"
              >
                <span className="text-lg">👤</span>
              </button>
            </div>
            
            <div className="flex items-center space-x-3 relative">
              <span className="text-sm text-gray-600 dark:text-gray-300">Welcome, {profile.name || username || 'User'}</span>
              
              <div className="relative">
                <button
                  onClick={() => setShowThemeMenu(!showThemeMenu)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="Theme"
                >
                  <span className="text-lg">{theme === 'dark' ? '🌙' : theme === 'light' ? '☀️' : '💻'}</span>
                </button>
                {showThemeMenu && (
                  <div className="absolute right-0 top-10 bg-white dark:bg-gray-800 shadow-xl rounded-xl border dark:border-gray-700 py-2 w-32 z-50">
                    <button
                      onClick={() => {
                        setTheme('light');
                        setShowThemeMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium transition-all flex items-center gap-2"
                    >
                      <span>☀️</span>
                      <span>Light</span>
                    </button>
                    <button
                      onClick={() => {
                        setTheme('dark');
                        setShowThemeMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium transition-all flex items-center gap-2"
                    >
                      <span>🌙</span>
                      <span>Dark</span>
                    </button>
                    <button
                      onClick={() => {
                        setTheme('system');
                        setShowThemeMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium transition-all flex items-center gap-2"
                    >
                      <span>💻</span>
                      <span>System</span>
                    </button>
                  </div>
                )}
              </div>
              
              <div 
                className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <span className="text-white text-sm font-semibold">{(profile.name || username || 'U')[0].toUpperCase()}</span>
              </div>
              
              {showProfileMenu && (
                <div className="absolute right-0 top-10 bg-white shadow-xl rounded-xl border py-2 w-32 z-50">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      setPage('profile');
                    }}
                    className="w-full text-left px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-sm font-medium rounded-lg mx-1 mb-1 transition-all transform hover:scale-105 shadow-md"
                  >
                    👤 Profile
                  </button>
                  <button
                    onClick={() => {
                      setUsername("");
                      setPage('login');
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white text-sm font-medium rounded-lg mx-1 transition-all transform hover:scale-105 shadow-md"
                  >
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
      )}

      {/* Horizontal Features Bar */}
      {page !== "login" && showFeaturesMenu && (
        <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 shadow-md px-4 py-2">
          <div className="max-w-7xl mx-auto">
            <div className="flex gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-purple-300 pb-1">
              {[
                { page: 'daily-mood', icon: '😊', name: 'Daily Mood' },
                { page: 'breathing-exercise', icon: '🫁', name: 'Breathing' },
                { page: 'journal', icon: '📔', name: 'Journal' },
                { page: 'emergency-support', icon: '🆘', name: 'Emergency' },
                { page: 'mood-calendar', icon: '📅', name: 'Calendar' },
                { page: 'sleep-tracker', icon: '😴', name: 'Sleep' },
                { page: 'gratitude', icon: '🙏', name: 'Gratitude' },
                { page: 'daily-tips', icon: '💡', name: 'Tips' },
                { page: 'voice-notes', icon: '🎤', name: 'Voice' },
                { page: 'social-support', icon: '🤝', name: 'Community' }
              ].map((feature, i) => (
                <button
                  key={i}
                  onClick={() => { setShowFeaturesMenu(false); navigateToPage(feature.page); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all transform hover:scale-105 flex-shrink-0 ${
                    page === feature.page
                      ? 'bg-gradient-to-r from-purple-500 to-purple-700 text-white shadow-md'
                      : 'bg-purple-50 dark:bg-gray-700 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-gray-600 border border-purple-200 dark:border-gray-600'
                  }`}
                >
                  <span>{feature.icon}</span>
                  <span>{feature.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
      {page === "login" && (
        <div className="flex items-center justify-center min-h-screen w-full bg-gradient-to-br from-blue-100 via-purple-100 to-pink-200">
          <div className="max-w-lg mx-auto bg-white shadow-2xl rounded-3xl p-10 border border-purple-200 relative">
            <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
              <div className="w-32 h-32 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-400 rounded-full flex items-center justify-center shadow-2xl border-4 border-white">
                <span className="text-yellow-300 text-7xl font-extrabold drop-shadow-2xl">🧠</span>
              </div>
            </div>
            <div className="text-center mb-8 mt-16">
              <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-700 via-purple-700 to-pink-600 bg-clip-text text-transparent mb-2 drop-shadow-lg" style={{letterSpacing: '2px'}}>MateoMind</h1>
              <p className="text-lg text-purple-600 font-semibold mb-2">Your Mental Health Companion</p>
              <p className="text-sm text-gray-500">Feel safe, supported, and empowered every time you log in.</p>
            </div>
            <div className="space-y-6">
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-4 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-300 bg-gradient-to-r from-blue-50 to-purple-50 placeholder-purple-400 text-lg font-medium shadow-sm"
              />
              {isSignup && (
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-4 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-300 bg-gradient-to-r from-blue-50 to-purple-50 placeholder-purple-400 text-lg font-medium shadow-sm"
                />
              )}
              <input
                type="password"
                placeholder={isSignup ? "Create a password" : "Password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-300 bg-gradient-to-r from-blue-50 to-purple-50 placeholder-purple-400 text-lg font-medium shadow-sm"
              />
              {isSignup && (
                <select
                  value={ageGroup}
                  onChange={(e) => setAgeGroup(e.target.value)}
                  className="w-full p-4 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-300 bg-gradient-to-r from-blue-50 to-purple-50 text-lg font-medium shadow-sm"
                >
                  <option value="">Select Age Group</option>
                  <option>16 - 18</option>
                  <option>19 - 24</option>
                  <option>25 - 29</option>
                  <option>30 - 36</option>
                  <option>37 - 39+</option>
                </select>
              )}
              <button
                onClick={() => {
                  if (!username || !password) {
                    alert("Please enter username and password!");
                    return;
                  }
                  if (isSignup && (!email || !ageGroup)) {
                    alert("Please fill in all signup fields!");
                    return;
                  }
                  setPage("dashboard");
                }}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl text-lg shadow-md"
              >
                {isSignup ? 'Sign Up' : 'Sign In'}
              </button>
              <button
                onClick={() => setIsSignup(!isSignup)}
                className="w-full text-purple-500 hover:text-pink-600 font-semibold py-2 mb-2 transition-all duration-300 hover:bg-purple-50 rounded-lg transform hover:scale-102 text-base"
              >
                {isSignup ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </button>
              <div className="flex items-center justify-center mt-2">
                <span className="text-gray-400 text-sm">Or continue with</span>
              </div>
              <button
                onClick={() => {
                  setUsername("Google User");
                  setAgeGroup("19-24");
                  setPage("dashboard");
                }}
                className="mt-2 w-full flex items-center justify-center px-4 py-3 border-2 border-purple-200 rounded-xl bg-gradient-to-r from-blue-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-all duration-300 transform hover:scale-105 hover:shadow-md hover:border-purple-400"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-purple-700 font-semibold">Continue with Google</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {page === "dashboard" && (
        <div className="p-6 w-full max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome back, {profile.name || username}!</h1>
            <p className="text-gray-600">How are you feeling today? Let's take care of your mental health.</p>
          </div>
          
          <div className="grid md:grid-cols-1 gap-6 mb-8 max-w-sm">
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:bg-gradient-to-br hover:from-blue-50 hover:to-blue-100 cursor-pointer" onClick={() => navigateToPage('mood-selection')}>
              <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center mb-4 transition-transform duration-300 hover:rotate-12">
                <span className="text-white text-2xl">📝</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Take Assessment</h3>
              <p className="text-gray-600">Evaluate your current mental health status</p>
            </div>
          </div>
          
          
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">📅 Your Appointments</h3>
              <button
                onClick={() => setPage('slot')}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all transform hover:scale-105"
              >
                + Book New
              </button>
            </div>
            
            {bookedAppointments.length > 0 ? (
              <div className="space-y-4">
                {bookedAppointments.map((appointment) => (
                  <div key={appointment.id} className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-xl border-l-4 border-green-500 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-lg">👨⚕️</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">{appointment.doctor}</h4>
                          <p className="text-sm text-gray-600">{appointment.specialty}</p>
                          <p className="text-sm text-blue-600 font-medium">📅 {appointment.date} at ⏰ {appointment.time}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mb-2 block">
                          {appointment.status}
                        </span>
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            Reschedule
                          </button>
                          <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-gray-400 text-2xl">📅</span>
                </div>
                <h4 className="text-lg font-semibold text-gray-600 mb-2">No Appointments Yet</h4>
                <p className="text-gray-500 mb-4">Book your first appointment with a mental health professional</p>
                <button
                  onClick={() => setPage('slot')}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105"
                >
                  Book Appointment
                </button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h3 className="text-xl font-bold mb-4">Resources</h3>
            <div className="flex space-x-4 mb-6">
              {['music', 'yoga', 'relaxation', 'diet'].map((resource) => (
                <button
                  key={resource}
                  onClick={() => setActiveResource(resource)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                    activeResource === resource ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {resource}
                </button>
              ))}
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeResource === 'music' && [
                { title: 'Calming Nature Sounds', duration: '30 min', type: '🎵' },
                { title: 'Meditation Music', duration: '45 min', type: '🎵' },
                { title: 'Sleep Sounds', duration: '60 min', type: '🎵' }
              ].map((item, i) => (
                <div key={i} className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-2xl mb-2">{item.type}</div>
                  <h4 className="font-semibold">{item.title}</h4>
                  <p className="text-sm text-gray-600">{item.duration}</p>
                </div>
              ))}
              {activeResource === 'yoga' && [
                { title: 'Morning Yoga Flow', duration: '20 min', type: '🧘‍♀️' },
                { title: 'Stress Relief Yoga', duration: '15 min', type: '🧘‍♀️' },
                { title: 'Evening Relaxation', duration: '25 min', type: '🧘‍♀️' }
              ].map((item, i) => (
                <div key={i} className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-2xl mb-2">{item.type}</div>
                  <h4 className="font-semibold">{item.title}</h4>
                  <p className="text-sm text-gray-600">{item.duration}</p>
                </div>
              ))}
              {activeResource === 'relaxation' && [
                { title: 'Deep Breathing Exercise', duration: '10 min', type: '🌬️' },
                { title: 'Progressive Muscle Relaxation', duration: '20 min', type: '🌬️' },
                { title: 'Mindfulness Meditation', duration: '15 min', type: '🌬️' }
              ].map((item, i) => (
                <div key={i} className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-2xl mb-2">{item.type}</div>
                  <h4 className="font-semibold">{item.title}</h4>
                  <p className="text-sm text-gray-600">{item.duration}</p>
                </div>
              ))}
              {activeResource === 'diet' && [
                { title: 'Mood-Boosting Foods', duration: 'Guide', type: '🥗' },
                { title: 'Stress-Reducing Diet Plan', duration: 'Weekly', type: '🥗' },
                { title: 'Healthy Snack Ideas', duration: 'Tips', type: '🥗' }
              ].map((item, i) => (
                <div key={i} className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-2xl mb-2">{item.type}</div>
                  <h4 className="font-semibold">{item.title}</h4>
                  <p className="text-sm text-gray-600">{item.duration}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {page === "features" && (
        <div className="p-6 w-full max-w-6xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">⚡ Features</h1>
            <p className="text-gray-600">Explore all tools to support your mental wellness journey.</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { page: 'daily-mood', icon: '😊', name: 'Daily Mood', color: 'from-yellow-400 to-orange-400', bg: 'from-yellow-50 to-orange-50', border: 'border-yellow-200' },
                { page: 'breathing-exercise', icon: '🫁', name: 'Breathing', color: 'from-blue-400 to-cyan-400', bg: 'from-blue-50 to-cyan-50', border: 'border-blue-200' },
                { page: 'journal', icon: '📔', name: 'Journal', color: 'from-green-400 to-teal-400', bg: 'from-green-50 to-teal-50', border: 'border-green-200' },
                { page: 'emergency-support', icon: '🆘', name: 'Emergency', color: 'from-red-400 to-pink-400', bg: 'from-red-50 to-pink-50', border: 'border-red-200' },
                { page: 'mood-calendar', icon: '📅', name: 'Mood Calendar', color: 'from-purple-400 to-indigo-400', bg: 'from-purple-50 to-indigo-50', border: 'border-purple-200' },
                { page: 'sleep-tracker', icon: '😴', name: 'Sleep Tracker', color: 'from-indigo-400 to-blue-500', bg: 'from-indigo-50 to-blue-50', border: 'border-indigo-200' },
                { page: 'gratitude', icon: '🙏', name: 'Gratitude', color: 'from-amber-400 to-yellow-400', bg: 'from-amber-50 to-yellow-50', border: 'border-amber-200' },
                { page: 'daily-tips', icon: '💡', name: 'Daily Tips', color: 'from-lime-400 to-green-400', bg: 'from-lime-50 to-green-50', border: 'border-lime-200' },
                { page: 'voice-notes', icon: '🎤', name: 'Voice Notes', color: 'from-violet-400 to-purple-500', bg: 'from-violet-50 to-purple-50', border: 'border-violet-200' },
                { page: 'social-support', icon: '🤝', name: 'Community', color: 'from-pink-400 to-rose-400', bg: 'from-pink-50 to-rose-50', border: 'border-pink-200' },
              ].map((feature, i) => (
                <div
                  key={i}
                  onClick={() => navigateToPage(feature.page)}
                  className={`border-2 ${feature.border} rounded-xl p-4 cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-lg bg-gradient-to-br ${feature.bg} text-center`}
                >
                  <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-full flex items-center justify-center mx-auto mb-3 shadow-md`}>
                    <span className="text-white text-xl">{feature.icon}</span>
                  </div>
                  <h4 className="font-semibold text-gray-800 text-sm">{feature.name}</h4>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {page === "profile" && (
        <div className="p-6 w-full max-w-2xl">
          <div className="bg-gradient-to-br from-blue-50 to-purple-100 rounded-3xl shadow-2xl p-8">
            <h2 className="text-4xl font-extrabold text-center mb-8 text-purple-700"> Your Profile</h2>
            <div className="flex flex-col items-center mb-8">
              <div className="w-28 h-28 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg mb-2">
                <span className="text-white text-4xl">{profile.name ? profile.name[0].toUpperCase() : '😊'}</span>
              </div>
              <button className="text-blue-500 hover:text-blue-600 font-medium mb-2">Change Photo</button>
              <div className="text-lg font-semibold text-gray-700">{profile.name || 'Your Name'}</div>
              <div className="text-sm text-gray-500">{profile.email || 'your@email.com'}</div>
            </div>
            {/* Personal Info Section */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-white rounded-xl p-4 shadow flex flex-col gap-2">
                <span className="font-bold text-blue-600">Name</span>
                <input type="text" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} className="w-full p-2 rounded-lg border border-blue-200" placeholder="Your Name" />
              </div>
              <div className="bg-white rounded-xl p-4 shadow flex flex-col gap-2">
                <span className="font-bold text-blue-600">Email</span>
                <input type="email" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} className="w-full p-2 rounded-lg border border-blue-200" placeholder="your@email.com" />
              </div>
              <div className="bg-white rounded-xl p-4 shadow flex flex-col gap-2">
                <span className="font-bold text-blue-600">Age</span>
                <input type="number" value={profile.age} onChange={e => setProfile({...profile, age: e.target.value})} className="w-full p-2 rounded-lg border border-blue-200" placeholder="Age" />
              </div>
              <div className="bg-white rounded-xl p-4 shadow flex flex-col gap-2">
                <span className="font-bold text-blue-600">Gender</span>
                <select value={profile.gender} onChange={e => setProfile({...profile, gender: e.target.value})} className="w-full p-2 rounded-lg border border-blue-200">
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="bg-white rounded-xl p-4 shadow flex flex-col gap-2">
                <span className="font-bold text-blue-600">Phone</span>
                <input type="tel" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} className="w-full p-2 rounded-lg border border-blue-200" placeholder="Phone" />
              </div>
              <div className="bg-white rounded-xl p-4 shadow flex flex-col gap-2">
                <span className="font-bold text-blue-600">Date of Birth</span>
                <input type="text" value={profile.dob} onChange={e => setProfile({...profile, dob: e.target.value})} className="w-full p-2 rounded-lg border border-blue-200" placeholder="DD/MM/YYYY" />
              </div>
            </div>
            {/* Strengths & Goals Section */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-xl p-4 shadow flex flex-col gap-2">
                <span className="font-bold text-green-700 mb-2">💪 Strengths</span>
                <input type="text" value={profile.strengths.join(', ')} onChange={e => setProfile({...profile, strengths: e.target.value.split(',').map(s => s.trim())})} className="w-full p-2 rounded-lg border border-green-200" placeholder="Empathy, Resilience..." />
                <span className="text-xs text-gray-500">What are your personal strengths?</span>
              </div>
              <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-xl p-4 shadow flex flex-col gap-2">
                <span className="font-bold text-pink-700 mb-2">🎯 Goals</span>
                <input type="text" value={profile.goals.join(', ')} onChange={e => setProfile({...profile, goals: e.target.value.split(',').map(g => g.trim())})} className="w-full p-2 rounded-lg border border-pink-200" placeholder="Practice mindfulness, Connect with friends..." />
                <span className="text-xs text-gray-500">What are your wellness goals?</span>
              </div>
            </div>
            {/* Support Contacts Section */}
            <div className="bg-gradient-to-r from-blue-100 to-green-100 rounded-xl p-4 shadow mb-8">
              <span className="font-bold text-blue-700 mb-2 block">🫂 Support Contacts</span>
              <div className="flex gap-2 flex-wrap">
                {(profile.supportContacts.length > 0 ? profile.supportContacts : [{name: '', relation: '', phone: ''}]).map((c, i) => (
                  <div key={i} className="bg-white rounded-lg px-3 py-2 text-sm text-gray-700 shadow">
                    <span className="font-bold text-green-600">{c.name || 'Name'}</span> <span className="text-xs text-gray-500">{c.relation}</span>
                    <div className="text-xs text-gray-500">{c.phone}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Favorite Resources Section */}
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-4 shadow mb-8">
              <span className="font-bold text-purple-700 mb-2 block">🌱 Favorite Resources</span>
              <div className="flex gap-2 flex-wrap">
                {(profile.favoriteResources.length > 0 ? profile.favoriteResources : ['Meditation', 'Music', 'Yoga']).map((r, i) => (
                  <div key={i} className="bg-white rounded-lg px-3 py-2 text-sm text-gray-700 shadow">
                    <span className="font-bold text-purple-600">{r}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Actions */}
            <div className="flex gap-4 justify-center pt-6">
              <button onClick={() => setPage('dashboard')} className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors">Cancel</button>
              <button onClick={() => { if (profile.name) { setUsername(profile.name); } alert('Profile updated successfully!'); setPage('dashboard'); }} className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold transition-colors">Save Changes</button>
            </div>
          </div>
        </div>
      )}
      
      {page === "progress" && (
        <div className="p-6 w-full max-w-4xl">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-center mb-8">Your Progress</h2>
            
            {moodHistory.length > 0 ? (
              <div className="space-y-8">
                <div className="bg-gray-50 p-6 rounded-xl">
                  <h3 className="text-xl font-semibold mb-4">Assessment History Graph</h3>
                  <div className="h-64 flex items-end justify-center space-x-4">
                    {moodHistory.slice(-10).map((entry, i) => (
                      <div key={i} className="flex flex-col items-center">
                        <div 
                          className={`w-8 rounded-t-lg ${
                            entry.severity === 'high' ? 'bg-red-500' : 
                            entry.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ height: `${(entry.score / 30) * 200}px` }}
                        ></div>
                        <div className="text-xs mt-2 text-center">
                          <div className="font-medium">{entry.score}</div>
                          <div className="text-gray-600">{entry.date.split('/')[1]}/{entry.date.split('/')[2]}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 p-6 rounded-xl text-center">
                    <h4 className="font-semibold text-blue-800 mb-2">Total Assessments</h4>
                    <div className="text-3xl font-bold text-blue-600">{moodHistory.length}</div>
                  </div>
                  <div className="bg-green-50 p-6 rounded-xl text-center">
                    <h4 className="font-semibold text-green-800 mb-2">Average Score</h4>
                    <div className="text-3xl font-bold text-green-600">
                      {Math.round(moodHistory.reduce((sum, entry) => sum + entry.score, 0) / moodHistory.length)}
                    </div>
                  </div>
                  <div className="bg-purple-50 p-6 rounded-xl text-center">
                    <h4 className="font-semibold text-purple-800 mb-2">Current Trend</h4>
                    <div className="text-2xl font-bold text-purple-600 capitalize">
                      {analysis?.trend || 'stable'}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-semibold mb-2">No Progress Data Yet</h3>
                <p className="text-gray-600 mb-6">Take your first assessment to start tracking your progress</p>
                <button
                  onClick={() => setPage('mood-selection')}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                >
                  Take Assessment
                </button>
              </div>
            )}
            
            <div className="text-center mt-8">
              <button
                onClick={() => setPage('dashboard')}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {page === "subscription" && (
        <div className="p-6 w-full max-w-4xl">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-center mb-8">Choose Your Subscription Plan</h2>
            <p className="text-center text-gray-600 mb-8">Select a plan to access professional mental health support</p>
            
            <div className="space-y-4 mb-8">
              {[
                { duration: '1 year', price: '₹999/-', monthly: '₹83/month', savings: 'Most Popular', popular: true },
                { duration: '6 months', price: '₹599/-', monthly: '₹100/month', savings: 'Save 25%', popular: false },
                { duration: '3 months', price: '₹299/-', monthly: '₹100/month', savings: 'Save 10%', popular: false }
              ].map((plan, i) => (
                <div 
                  key={i} 
                  onClick={() => setSelectedPlan(i)}
                  className={`border-2 rounded-xl p-6 cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-xl ${
                    selectedPlan === i ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100 shadow-lg scale-105' : 'border-gray-200 hover:border-blue-400 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50'
                  } ${plan.popular ? 'ring-2 ring-blue-400' : ''}`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-bold transition-colors duration-300 hover:text-blue-600">{plan.duration}</h3>
                      <p className="text-gray-600 transition-colors duration-300 hover:text-gray-800">Full access to consultations</p>
                      <p className="text-green-600 font-medium transition-colors duration-300 hover:text-green-700">{plan.monthly}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold transition-colors duration-300 hover:text-blue-600">{plan.price}</div>
                      {plan.popular && (
                        <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold mt-2 transition-all duration-300 hover:bg-blue-600 hover:shadow-md transform hover:scale-105">
                          {plan.savings}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="space-y-4">
              <button
                disabled={selectedPlan === null}
                onClick={() => {
                  if (selectedPlan !== null) {
                    setPage('subscription-payment');
                  }
                }}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold transition-colors"
              >
                Subscribe Now
              </button>
              
              <button
                onClick={() => setPage('dashboard')}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-xl font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {page === "subscription-payment" && selectedPlan !== null && (
        <div className="p-6 w-full max-w-2xl">
          <div className="bg-gradient-to-br from-teal-200 via-blue-100 to-pink-200 rounded-2xl shadow-2xl p-8 border border-white/30 relative">
            <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{background: 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 100%)', mixBlendMode: 'screen'}}></div>
            <h2 className="text-3xl font-bold text-center mb-8 text-white drop-shadow-lg">Subscription Payment</h2>
            
            <div className="bg-white/60 backdrop-blur-lg p-6 rounded-xl mb-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-4 text-blue-700">Subscription Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-blue-600 font-semibold">Plan:</span>
                  <span className="font-bold text-purple-700">
                    {[
                      { duration: '1 year', price: '₹999/-' },
                      { duration: '6 months', price: '₹599/-' },
                      { duration: '3 months', price: '₹299/-' }
                    ][selectedPlan].duration}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-600 font-semibold">Access:</span>
                  <span className="font-medium text-pink-600">Full doctor consultations</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span className="text-blue-600">Total Amount:</span>
                  <span className="text-green-500 drop-shadow">
                    {[
                      { duration: '1 year', price: '₹999/-' },
                      { duration: '6 months', price: '₹599/-' },
                      { duration: '3 months', price: '₹299/-' }
                    ][selectedPlan].price}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Select Payment Method</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {[
                  { id: 'card', name: 'Credit/Debit Card', icon: '💳' },
                  { id: 'upi', name: 'UPI', icon: '📱' },
                  { id: 'netbanking', name: 'Net Banking', icon: '🏦' },
                  { id: 'wallet', name: 'Wallet', icon: '👛' },
                  {id: 'paypal', name: 'PayPal', icon: '🅿️' }
                ].map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`p-4 border-2 rounded-lg text-center transition-all duration-300 ease-in-out transform
                      ${paymentMethod === method.id ? 'border-blue-500 bg-blue-50 shadow-xl scale-105' : 'border-gray-200 hover:border-blue-400 hover:shadow-xl hover:scale-105'}
                    `}
                  >
                    <div className="text-2xl mb-2">{method.icon}</div>
                    <div className="text-sm font-medium">{method.name}</div>
                  </button>
                ))}
              </div>
              
              {paymentMethod === 'card' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                      <input
                        type="text"
                        placeholder="123"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name</label>
                    <input
                      type="text"
                      placeholder="Enter cardholder name"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                </div>
              )}
              
              {paymentMethod === 'upi' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">UPI ID</label>
                    <input
                      type="text"
                      placeholder="yourname@upi"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Or scan QR code</p>
                    <div className="w-32 h-32 bg-white border-2 border-dashed border-gray-300 rounded-lg mx-auto flex items-center justify-center">
                      <span className="text-4xl">📱</span>
                    </div>
                  </div>
                </div>
              )}
              
              {paymentMethod === 'netbanking' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Bank</label>
                    <select className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400">
                      <option value="">Choose your bank</option>
                      <option value="sbi">State Bank of India</option>
                      <option value="hdfc">HDFC Bank</option>
                      <option value="icici">ICICI Bank</option>
                      <option value="axis">Axis Bank</option>
                      <option value="pnb">Punjab National Bank</option>
                    </select>
                  </div>
                </div>
              )}
              
              {paymentMethod === 'wallet' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { name: 'Paytm', icon: '💙' },
                      { name: 'PhonePe', icon: '💜' },
                      { name: 'Google Pay', icon: '🟢' },
                      { name: 'Amazon Pay', icon: '🟠' }
                    ].map((wallet) => (
                      <button
                        key={wallet.name}
                        className="p-4 border border-gray-300 rounded-lg hover:border-blue-400 transition-colors text-center"
                      >
                        <div className="text-2xl mb-2">{wallet.icon}</div>
                        <div className="text-sm font-medium">{wallet.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setPage('subscription')}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => {
                  const planPrice = [
                    { duration: '1 year', price: '₹999/-' },
                    { duration: '6 months', price: '₹599/-' },
                    { duration: '3 months', price: '₹299/-' }
                  ][selectedPlan].price;
                  alert(`Payment successful! Subscription activated for ${[
                    { duration: '1 year', price: '₹999/-' },
                    { duration: '6 months', price: '₹599/-' },
                    { duration: '3 months', price: '₹299/-' }
                  ][selectedPlan].duration}.\n\nYou can now book doctor appointments.`);
                  setPage('slot');
                }}
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-8 py-3 rounded-xl font-semibold transition-all transform hover:scale-105"
              >
                💳 Pay {[
                  { duration: '1 year', price: '₹999/-' },
                  { duration: '6 months', price: '₹599/-' },
                  { duration: '3 months', price: '₹299/-' }
                ][selectedPlan].price}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {page === "mood-selection" && (
        <div className="flex items-center justify-center min-h-screen w-full bg-gradient-to-br from-purple-100 to-pink-200">
          <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-2xl p-8 border">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-4">Hi {username}! How are you feeling today?</h2>
              <p className="text-gray-600 mb-6">Please select your current mood so we can provide personalized questions.</p>
              <button
                onClick={() => setPage('dashboard')}
                className="mb-4 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              {[
                { mood: 'happy', emoji: '😊', label: 'Happy & Positive', color: 'from-green-400 to-green-600' },
                { mood: 'sad', emoji: '😢', label: 'Sad & Down', color: 'from-blue-400 to-blue-600' },
                { mood: 'anxious', emoji: '😰', label: 'Anxious & Worried', color: 'from-yellow-400 to-orange-500' },
                { mood: 'stressed', emoji: '😤', label: 'Stressed & Overwhelmed', color: 'from-red-400 to-red-600' }
              ].map(({ mood, emoji, label, color }) => (
                <button
                  key={mood}
                  onClick={() => {
                    setUserMood(mood);
                    setCurrentQuestions(MOOD_QUESTIONS[mood]);
                    setAnswers(Array(10).fill(""));
                    setPage("questions");
                  }}
                  className={`p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                    userMood === mood
                      ? `bg-gradient-to-br ${color} text-white border-transparent`
                      : 'bg-white hover:bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="text-3xl mb-2">{emoji}</div>
                  <div className="font-semibold">{label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {page === "questions" && currentQuestions.length > 0 && (
        <div className="p-6 w-full max-w-2xl">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold">Mood Evaluation</h2>
              <span className="text-sm text-gray-600">{Math.round(progress)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{width: `${progress}%`}}></div>
            </div>
          </div>
          
          {currentQuestions.map((q, i) => (
            <div key={i} className="mb-6 bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-400">
              <p className="font-semibold mb-4 text-gray-800">{i + 1}. {q}</p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleAnswerChange(i, opt)}
                    className={`px-4 py-2 rounded-lg border-2 transition-all font-medium ${
                      answers[i] === opt
                        ? "bg-blue-500 text-white border-blue-500 transform scale-105"
                        : "bg-white hover:bg-blue-50 border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              {answers[i] === "Other" && (
                <input
                  type="text"
                  placeholder="Please describe your experience..."
                  value={otherTexts[i] || ""}
                  onChange={(e) => handleOtherTextChange(i, e.target.value)}
                  className="mt-4 w-full border-2 border-gray-200 rounded-lg p-3 focus:border-blue-400 focus:outline-none"
                />
              )}
            </div>
          ))}
          
          <div className="flex gap-4">
            <button
              onClick={() => setPage('dashboard')}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-xl font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={analyzeResults}
              disabled={answers.filter(a => a !== "").length < 5}
              className="flex-2 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-8 rounded-xl font-semibold transition-all"
            >
              Analyze Results
            </button>
          </div>
        </div>
      )}

      {page === "analysis" && analysis && (
        <div className="p-6 w-full max-w-4xl">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Your Mental Health Analysis</h2>
            
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
                <h3 className="text-xl font-semibold mb-4 text-blue-800">Overall Assessment</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Score:</span>
                    <span className={`font-bold ${analysis.severity === 'high' ? 'text-red-600' : analysis.severity === 'medium' ? 'text-yellow-600' : 'text-green-600'}`}>
                      {analysis.score}/30
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Status:</span>
                    <span className="font-bold text-blue-700">{analysis.mood}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Trend:</span>
                    <span className={`font-bold capitalize ${
                      analysis.trend === 'improving' ? 'text-green-600' : 
                      analysis.trend === 'worsening' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {analysis.trend === 'improving' ? '📈 Improving' : 
                       analysis.trend === 'worsening' ? '📉 Needs Attention' : '➡️ Stable'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
                <h3 className="text-xl font-semibold mb-4 text-green-800">Recommendations</h3>
                <ul className="space-y-2">
                  {analysis.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start">
                      <span className="text-green-600 mr-2">✓</span>
                      <span className="text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {moodHistory.length > 1 && (
              <div className="bg-gray-50 p-6 rounded-xl mb-8">
                <h3 className="text-xl font-semibold mb-4">Mood History</h3>
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {moodHistory.slice(-5).map((entry, i) => (
                    <div key={i} className="min-w-32 bg-white p-3 rounded-lg text-center">
                      <div className="text-sm text-gray-600">{entry.date}</div>
                      <div className="font-semibold capitalize">{entry.mood}</div>
                      <div className={`text-sm ${
                        entry.severity === 'high' ? 'text-red-600' : 
                        entry.severity === 'medium' ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        Score: {entry.score}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setPage('dashboard')}
                className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setPage("questions")}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
              >
                Retake Assessment
              </button>
              <button
                onClick={() => setPage("slot")}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold transition-all transform hover:scale-105"
              >
                Book Professional Support
              </button>
            </div>
          </div>
        </div>
      )}

      {page === "slot" && (
        <div className="p-6 w-full max-w-4xl">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-center mb-8">Book Professional Support</h2>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {DOCTORS.map((doctor) => (
                <div key={doctor.id} className={`border-2 rounded-xl p-6 cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-xl ${
                  selectedDoctor?.id === doctor.id ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg scale-105' : 'border-gray-200 hover:border-blue-400 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50'
                }`} onClick={() => setSelectedDoctor(doctor)}>
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3 transition-all duration-300 hover:rotate-12 hover:scale-110 hover:shadow-lg">
                      <span className="text-white text-2xl transition-transform duration-300 hover:scale-110">👨⚕️</span>
                    </div>
                    <h3 className="font-bold text-lg transition-colors duration-300 hover:text-blue-600">{doctor.name}</h3>
                    <p className="text-blue-600 font-medium transition-colors duration-300 hover:text-purple-600">{doctor.specialty}</p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Rating:</span>
                      <span className="font-semibold text-yellow-600">⭐ {doctor.rating}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Experience:</span>
                      <span className="font-semibold">Best consultant</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {selectedDoctor && (
              <div className="bg-gray-50 p-6 rounded-xl mb-6">
                <h3 className="text-xl font-semibold mb-4">Available Slots for {selectedDoctor.name}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {selectedDoctor.slots.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSlot(time)}
                      className={`p-3 rounded-lg border-2 font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-md ${
                        slot === time
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-blue-500 shadow-lg scale-105'
                          : 'bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 border-gray-200 hover:border-blue-400 hover:text-blue-600'
                      }`}
                    >
                      <span className="transition-transform duration-300 hover:scale-110">{time}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setPage('dashboard')}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={!selectedDoctor || !slot}
                onClick={() => {
                  if (selectedDoctor && slot) {
                    setPage("payment");
                  }
                }}
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-semibold transition-all"
              >
                Proceed to Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {page === "assignment" && (
        <div className="p-6 w-full max-w-4xl">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-center mb-8">Take Assignment</h2>
            <p className="text-center text-gray-600 mb-8">Complete these mental health assignments to track your progress</p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border-2 border-blue-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:border-blue-400 cursor-pointer" onClick={() => navigateToPage('mood-selection')}>
                <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center mb-4 transition-transform duration-300 hover:rotate-12">
                  <span className="text-white text-2xl">📝</span>
                </div>
                <h3 className="text-xl font-bold mb-2 text-blue-800">Mood Assessment</h3>
                <p className="text-blue-600 text-sm mb-4">Evaluate your current emotional state</p>
                <div className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium text-center transition-all duration-300 hover:bg-blue-600 hover:shadow-md">
                  Start Assessment
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border-2 border-green-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:border-green-400 cursor-pointer">
                <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mb-4 transition-transform duration-300 hover:rotate-12">
                  <span className="text-white text-2xl">🧘</span>
                </div>
                <h3 className="text-xl font-bold mb-2 text-green-800">Mindfulness Exercise</h3>
                <p className="text-green-600 text-sm mb-4">Practice guided meditation and breathing</p>
                <div className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium text-center transition-all duration-300 hover:bg-green-600 hover:shadow-md">
                  Begin Exercise
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border-2 border-purple-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:border-purple-400 cursor-pointer">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full flex items-center justify-center mb-4 transition-transform duration-300 hover:rotate-12">
                  <span className="text-white text-2xl">📊</span>
                </div>
                <h3 className="text-xl font-bold mb-2 text-purple-800">Progress Review</h3>
                <p className="text-purple-600 text-sm mb-4">Review your mental health journey</p>
                <div className="bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium text-center transition-all duration-300 hover:bg-purple-600 hover:shadow-md">
                  View Progress
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border-2 border-orange-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:border-orange-400 cursor-pointer">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center mb-4 transition-transform duration-300 hover:rotate-12">
                  <span className="text-white text-2xl">📚</span>
                </div>
                <h3 className="text-xl font-bold mb-2 text-orange-800">Learning Module</h3>
                <p className="text-orange-600 text-sm mb-4">Educational content on mental health</p>
                <div className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium text-center transition-all duration-300 hover:bg-orange-600 hover:shadow-md">
                  Start Learning
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border-2 border-red-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:border-red-400 cursor-pointer">
                <div className="w-16 h-16 bg-gradient-to-r from-red-400 to-red-600 rounded-full flex items-center justify-center mb-4 transition-transform duration-300 hover:rotate-12">
                  <span className="text-white text-2xl">🎯</span>
                </div>
                <h3 className="text-xl font-bold mb-2 text-red-800">Goal Setting</h3>
                <p className="text-red-600 text-sm mb-4">Set and track your wellness goals</p>
                <div className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium text-center transition-all duration-300 hover:bg-red-600 hover:shadow-md">
                  Set Goals
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-6 rounded-xl border-2 border-teal-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:border-teal-400 cursor-pointer">
                <div className="w-16 h-16 bg-gradient-to-r from-teal-400 to-teal-600 rounded-full flex items-center justify-center mb-4 transition-transform duration-300 hover:rotate-12">
                  <span className="text-white text-2xl">✍️</span>
                </div>
                <h3 className="text-xl font-bold mb-2 text-teal-800">Journal Entry</h3>
                <p className="text-teal-600 text-sm mb-4">Write about your thoughts and feelings</p>
                <div className="bg-teal-500 text-white px-4 py-2 rounded-lg text-sm font-medium text-center transition-all duration-300 hover:bg-teal-600 hover:shadow-md">
                  Write Entry
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-4 text-center">Assignment Progress</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">3/6</div>
                  <div className="text-sm text-gray-600">Completed Today</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">85%</div>
                  <div className="text-sm text-gray-600">Weekly Progress</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">12</div>
                  <div className="text-sm text-gray-600">Total Assignments</div>
                </div>
              </div>
            </div>
            
            <div className="text-center mt-8">
              <button
                onClick={() => setPage('dashboard')}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
      
      {page === "payment" && selectedDoctor && slot && (
        <div className="p-6 w-full max-w-2xl">
          <div className="bg-gradient-to-br from-teal-200 via-blue-100 to-pink-200 rounded-2xl shadow-2xl p-8 border border-white/30 relative">
            <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{background: 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 100%)', mixBlendMode: 'screen'}}></div>
            <h2 className="text-3xl font-bold text-center mb-8 text-white drop-shadow-lg">Payment Details</h2>
            
            <div className="bg-white/60 backdrop-blur-lg p-6 rounded-xl mb-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-4 text-blue-700">Appointment Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-blue-600 font-semibold">Doctor:</span>
                  <span className="font-bold text-purple-700">{selectedDoctor.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-600 font-semibold">Specialty:</span>
                  <span className="font-medium text-pink-600">{selectedDoctor.specialty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-600 font-semibold">Time Slot:</span>
                  <span className="font-medium text-purple-700">{slot}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span className="text-blue-600">Total Amount:</span>
                  <span className="text-green-500 drop-shadow">₹500</span>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Select Payment Method</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {[
                  { id: 'card', name: 'Credit/Debit Card', icon: '💳' },
                  { id: 'upi', name: 'UPI', icon: '📱' },
                  { id: 'netbanking', name: 'Net Banking', icon: '🏦' },
                  { id: 'wallet', name: 'Wallet', icon: '👛' },
                  { id: 'paypal', name: 'PayPal', icon: '🅿️' }
                ].map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`p-4 border-2 rounded-lg text-center transition-all ${
                      paymentMethod === method.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">{method.icon}</div>
                    <div className="text-sm font-medium">{method.name}</div>
                  </button>
                ))}
              </div>
              
              {paymentMethod === 'card' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-105"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                      <input
                        type="text"
                        placeholder="123"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-105"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name</label>
                    <input
                      type="text"
                      placeholder="Enter cardholder name"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-105"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'paypal' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">PayPal Email</label>
                    <input
                      type="email"
                      placeholder="your@email.com"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-105"
                    />
                  </div>
                </div>
              )}
              
              {paymentMethod === 'upi' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">UPI ID</label>
                    <input
                      type="text"
                      placeholder="yourname@upi"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Or scan QR code</p>
                    <div className="w-32 h-32 bg-white border-2 border-dashed border-gray-300 rounded-lg mx-auto flex items-center justify-center">
                      <span className="text-4xl">📱</span>
                    </div>
                  </div>
                </div>
              )}
              
              {paymentMethod === 'netbanking' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Bank</label>
                    <select className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400">
                      <option value="">Choose your bank</option>
                      <option value="sbi">State Bank of India</option>
                      <option value="hdfc">HDFC Bank</option>
                      <option value="icici">ICICI Bank</option>
                      <option value="axis">Axis Bank</option>
                      <option value="pnb">Punjab National Bank</option>
                    </select>
                  </div>
                </div>
              )}
              
              {paymentMethod === 'wallet' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { name: 'Paytm', icon: '💙' },
                      { name: 'PhonePe', icon: '💜' },
                      { name: 'Google Pay', icon: '🟢' },
                      { name: 'Amazon Pay', icon: '🟠' }
                    ].map((wallet) => (
                      <button
                        key={wallet.name}
                        className="p-4 border border-gray-300 rounded-lg hover:border-blue-400 transition-colors text-center"
                      >
                        <div className="text-2xl mb-2">{wallet.icon}</div>
                        <div className="text-sm font-medium">{wallet.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setPage('slot')}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => {
                  const newBooking = {
                    id: Date.now(),
                    doctor: selectedDoctor.name,
                    specialty: selectedDoctor.specialty,
                    date: new Date().toLocaleDateString(),
                    time: slot,
                    status: 'Confirmed'
                  };
                  setBookedAppointments(prev => [...prev, newBooking]);
                  alert(`🎉 Booking Confirmed!\n\nDoctor: ${selectedDoctor.name}\nTime: ${slot}\nDate: ${new Date().toLocaleDateString()}\n\nYour appointment has been successfully booked!`);
                  setPage("dashboard");
                  setSlot("");
                  setSelectedDoctor(null);
                }}
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-8 py-3 rounded-xl font-semibold transition-all transform hover:scale-105"
              >
                💳 Pay ₹500
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FEATURE 1: Daily Mood Tracker */}
      {page === "daily-mood" && (
        <div className="p-6 w-full max-w-2xl">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-center mb-8">Daily Mood Tracker</h2>
            <div className="grid grid-cols-5 gap-4 mb-6">
              {['😢', '😟', '😐', '😊', '😄'].map((emoji, i) => (
                <button
                  key={i}
                  onClick={() => {
                    const today = new Date().toDateString();
                    const newEntry = { date: today, mood: i + 1, emoji, timestamp: new Date() };
                    setDailyMoodTracker(prev => [...prev.filter(entry => entry.date !== today), newEntry]);
                    setMoodCalendar(prev => ({ ...prev, [today]: { mood: i + 1, emoji } }));
                    alert('Mood logged for today!');
                  }}
                  className="p-6 text-6xl hover:scale-110 transition-transform bg-gray-50 rounded-xl hover:bg-blue-50"
                >
                  {emoji}
                </button>
              ))}
            </div>
            <div className="bg-gray-50 p-4 rounded-xl">
              <h3 className="font-semibold mb-2">Recent Mood History</h3>
              {dailyMoodTracker.slice(-7).map((entry, i) => (
                <div key={i} className="flex justify-between items-center py-2">
                  <span>{entry.date}</span>
                  <span className="text-2xl">{entry.emoji}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setPage('dashboard')} className="w-full mt-4 bg-blue-500 text-white py-3 rounded-xl">Back</button>
          </div>
        </div>
      )}

      {/* FEATURE 2: Breathing Exercise */}
      {page === "breathing-exercise" && (
        <div className="p-6 w-full max-w-2xl">
          <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-center mb-8">Breathing Exercise</h2>
            <div className="text-center mb-8">
              <div className={`w-32 h-32 mx-auto rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold transition-transform duration-1000 ${breathingExerciseActive ? 'scale-125' : 'scale-100'}`}>
                {breathingCount}
              </div>
            </div>
            <div className="text-center mb-6">
              <p className="text-lg mb-4">{breathingExerciseActive ? 'Breathe in... and out...' : 'Click start to begin 4-7-8 breathing'}</p>
              <button
                onClick={() => {
                  if (!breathingExerciseActive) {
                    setBreathingExerciseActive(true);
                    setBreathingCount(1);
                    const interval = setInterval(() => {
                      setBreathingCount(prev => {
                        if (prev >= 8) {
                          clearInterval(interval);
                          setBreathingExerciseActive(false);
                          alert('Great job! You completed the breathing exercise.');
                          return 0;
                        }
                        return prev + 1;
                      });
                    }, 1500);
                  }
                }}
                disabled={breathingExerciseActive}
                className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-semibold"
              >
                {breathingExerciseActive ? 'In Progress...' : 'Start Exercise'}
              </button>
            </div>
            <button onClick={() => setPage('dashboard')} className="w-full bg-gray-500 text-white py-3 rounded-xl">Back</button>
          </div>
        </div>
      )}

      {/* FEATURE 3: Digital Journal */}
      {page === "journal" && (
        <div className="p-6 w-full max-w-4xl">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-center mb-8">Digital Journal</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-semibold mb-4">Write New Entry</h3>
                <textarea
                  value={currentJournalEntry}
                  onChange={(e) => setCurrentJournalEntry(e.target.value)}
                  placeholder="How are you feeling today? What's on your mind?"
                  className="w-full h-64 p-4 border rounded-xl resize-none focus:ring-2 focus:ring-blue-400"
                />
                <button
                  onClick={() => {
                    if (currentJournalEntry.trim()) {
                      const newEntry = {
                        id: Date.now(),
                        content: currentJournalEntry,
                        date: new Date().toLocaleDateString(),
                        time: new Date().toLocaleTimeString()
                      };
                      setJournalEntries(prev => [newEntry, ...prev]);
                      setCurrentJournalEntry('');
                      alert('Journal entry saved!');
                    }
                  }}
                  className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold"
                >
                  Save Entry
                </button>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4">Previous Entries</h3>
                <div className="h-80 overflow-y-auto space-y-4">
                  {journalEntries.map((entry) => (
                    <div key={entry.id} className="bg-gray-50 p-4 rounded-xl">
                      <div className="text-sm text-gray-600 mb-2">{entry.date} at {entry.time}</div>
                      <p className="text-gray-800">{entry.content.substring(0, 100)}...</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <button onClick={() => setPage('dashboard')} className="w-full mt-6 bg-blue-500 text-white py-3 rounded-xl">Back</button>
          </div>
        </div>
      )}

      {/* FEATURE 4: Emergency Support */}
      {page === "emergency-support" && (
        <div className="p-6 w-full max-w-2xl">
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-center mb-8 text-red-700">Emergency Support</h2>
            <div className="space-y-4 mb-6">
              <div className="bg-white p-4 rounded-xl border-l-4 border-red-500">
                <h3 className="font-bold text-red-700">Crisis Hotlines</h3>
                <p className="text-sm">National Suicide Prevention Lifeline: <strong>988</strong></p>
                <p className="text-sm">Crisis Text Line: Text <strong>HOME</strong> to <strong>741741</strong></p>
                <p className="text-sm">Emergency Services: <strong>911</strong></p>
              </div>
              <div className="bg-white p-4 rounded-xl">
                <h3 className="font-bold mb-2">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => window.open('tel:988')} className="bg-red-500 text-white p-3 rounded-lg font-semibold">Call 988</button>
                  <button onClick={() => window.open('sms:741741?body=HOME')} className="bg-blue-500 text-white p-3 rounded-lg font-semibold">Text Crisis Line</button>
                  <button onClick={() => setPage('breathing-exercise')} className="bg-green-500 text-white p-3 rounded-lg font-semibold">Breathing Exercise</button>
                  <button onClick={() => setChatOpen(true)} className="bg-purple-500 text-white p-3 rounded-lg font-semibold">Chat Support</button>
                </div>
              </div>
            </div>
            <button onClick={() => setPage('dashboard')} className="w-full bg-gray-500 text-white py-3 rounded-xl">Back</button>
          </div>
        </div>
      )}

      {/* FEATURE 5: Mood Calendar */}
      {page === "mood-calendar" && (
        <div className="p-6 w-full max-w-4xl">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-center mb-8">Mood Calendar</h2>
            <div className="grid grid-cols-7 gap-2 mb-6">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center font-semibold p-2">{day}</div>
              ))}
              {Array.from({length: 30}, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - 29 + i);
                const dateStr = date.toDateString();
                const moodData = moodCalendar[dateStr];
                return (
                  <div key={i} className="aspect-square border rounded-lg p-2 text-center hover:bg-gray-50">
                    <div className="text-sm">{date.getDate()}</div>
                    {moodData && <div className="text-2xl">{moodData.emoji}</div>}
                  </div>
                );
              })}
            </div>
            <div className="bg-gray-50 p-4 rounded-xl">
              <h3 className="font-semibold mb-2">Mood Legend</h3>
              <div className="flex justify-around">
                {['😢 Very Sad', '😟 Sad', '😐 Neutral', '😊 Happy', '😄 Very Happy'].map((mood, i) => (
                  <span key={i} className="text-sm">{mood}</span>
                ))}
              </div>
            </div>
            <button onClick={() => setPage('dashboard')} className="w-full mt-4 bg-blue-500 text-white py-3 rounded-xl">Back</button>
          </div>
        </div>
      )}

      {/* FEATURE 6: Sleep Tracker */}
      {page === "sleep-tracker" && (
        <div className="p-6 w-full max-w-2xl">
          <div className="bg-indigo-50 rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-center mb-8 text-indigo-700">Sleep Tracker</h2>
            <div className="space-y-4 mb-6">
              <div className="bg-white p-4 rounded-xl">
                <label className="block font-semibold mb-2">Bedtime</label>
                <input type="time" className="w-full p-2 border rounded-lg" />
              </div>
              <div className="bg-white p-4 rounded-xl">
                <label className="block font-semibold mb-2">Wake Time</label>
                <input type="time" className="w-full p-2 border rounded-lg" />
              </div>
              <div className="bg-white p-4 rounded-xl">
                <label className="block font-semibold mb-2">Sleep Quality (1-5)</label>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(rating => (
                    <button key={rating} className="w-12 h-12 border rounded-lg hover:bg-indigo-100">{rating}</button>
                  ))}
                </div>
              </div>
              <button
                onClick={() => {
                  const newSleepEntry = {
                    date: new Date().toLocaleDateString(),
                    bedtime: '10:00 PM',
                    wakeTime: '7:00 AM',
                    quality: 4,
                    duration: '9 hours'
                  };
                  setSleepTracker(prev => [newSleepEntry, ...prev]);
                  alert('Sleep data logged!');
                }}
                className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-3 rounded-xl font-semibold"
              >
                Log Sleep
              </button>
            </div>
            <div className="bg-white p-4 rounded-xl">
              <h3 className="font-semibold mb-2">Recent Sleep Data</h3>
              {sleepTracker.slice(0, 5).map((entry, i) => (
                <div key={i} className="flex justify-between py-2 border-b">
                  <span>{entry.date}</span>
                  <span>{entry.duration}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setPage('dashboard')} className="w-full mt-4 bg-blue-500 text-white py-3 rounded-xl">Back</button>
          </div>
        </div>
      )}

      {/* FEATURE 7: Gratitude Practice */}
      {page === "gratitude" && (
        <div className="p-6 w-full max-w-2xl">
          <div className="bg-yellow-50 rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-center mb-8 text-yellow-700">Gratitude Practice</h2>
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-4">What are you grateful for today?</h3>
              <textarea
                value={currentGratitude}
                onChange={(e) => setCurrentGratitude(e.target.value)}
                placeholder="I'm grateful for..."
                className="w-full h-32 p-4 border rounded-xl resize-none focus:ring-2 focus:ring-yellow-400"
              />
              <button
                onClick={() => {
                  if (currentGratitude.trim()) {
                    const newGratitude = {
                      id: Date.now(),
                      content: currentGratitude,
                      date: new Date().toLocaleDateString()
                    };
                    setGratitudeList(prev => [newGratitude, ...prev]);
                    setCurrentGratitude('');
                    alert('Gratitude added! 🙏');
                  }
                }}
                className="w-full mt-4 bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded-xl font-semibold"
              >
                Add Gratitude
              </button>
            </div>
            <div className="bg-white p-4 rounded-xl">
              <h3 className="font-semibold mb-4">Your Gratitude List</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {gratitudeList.map((item) => (
                  <div key={item.id} className="bg-yellow-50 p-3 rounded-lg">
                    <p className="text-sm">{item.content}</p>
                    <span className="text-xs text-gray-500">{item.date}</span>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={() => setPage('dashboard')} className="w-full mt-4 bg-blue-500 text-white py-3 rounded-xl">Back</button>
          </div>
        </div>
      )}

      {/* FEATURE 8: Daily Mental Health Tips */}
      {page === "daily-tips" && (
        <div className="p-6 w-full max-w-2xl">
          <div className="bg-green-50 rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-center mb-8 text-green-700">Daily Mental Health Tips</h2>
            <div className="bg-white p-6 rounded-xl mb-6 text-center">
              <div className="text-6xl mb-4">💡</div>
              <h3 className="text-xl font-semibold mb-4">Today's Tip</h3>
              <p className="text-lg text-gray-700 mb-6">{mentalHealthTips[currentTipIndex]}</p>
              <button
                onClick={() => setCurrentTipIndex((prev) => (prev + 1) % mentalHealthTips.length)}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-semibold"
              >
                Next Tip
              </button>
            </div>
            <div className="bg-white p-4 rounded-xl">
              <h3 className="font-semibold mb-2">All Tips</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {mentalHealthTips.map((tip, i) => (
                  <div key={i} className={`p-2 rounded ${i === currentTipIndex ? 'bg-green-100' : 'bg-gray-50'}`}>
                    <span className="text-sm">{tip}</span>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={() => setPage('dashboard')} className="w-full mt-4 bg-blue-500 text-white py-3 rounded-xl">Back</button>
          </div>
        </div>
      )}

      {/* FEATURE 9: Voice Notes */}
      {page === "voice-notes" && (
        <div className="p-6 w-full max-w-2xl">
          <div className="bg-purple-50 rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-center mb-8 text-purple-700">Voice Notes</h2>
            <div className="text-center mb-6">
              <div className={`w-32 h-32 mx-auto rounded-full bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center text-white text-4xl mb-4 ${isRecording ? 'animate-pulse' : ''}`}>
                🎤
              </div>
              <button
                onClick={() => {
                  if (!isRecording) {
                    setIsRecording(true);
                    setTimeout(() => {
                      setIsRecording(false);
                      const newVoiceNote = {
                        id: Date.now(),
                        date: new Date().toLocaleDateString(),
                        time: new Date().toLocaleTimeString(),
                        duration: '0:30'
                      };
                      setVoiceNotes(prev => [newVoiceNote, ...prev]);
                      alert('Voice note saved!');
                    }, 3000);
                  }
                }}
                disabled={isRecording}
                className={`px-8 py-4 rounded-xl font-semibold text-white ${isRecording ? 'bg-red-500' : 'bg-purple-500 hover:bg-purple-600'}`}
              >
                {isRecording ? 'Recording...' : 'Start Recording'}
              </button>
            </div>
            <div className="bg-white p-4 rounded-xl">
              <h3 className="font-semibold mb-4">Your Voice Notes</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {voiceNotes.map((note) => (
                  <div key={note.id} className="bg-purple-50 p-3 rounded-lg flex justify-between items-center">
                    <div>
                      <p className="font-medium">{note.date} at {note.time}</p>
                      <p className="text-sm text-gray-600">Duration: {note.duration}</p>
                    </div>
                    <button className="bg-purple-500 text-white px-3 py-1 rounded text-sm">Play</button>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={() => setPage('dashboard')} className="w-full mt-4 bg-blue-500 text-white py-3 rounded-xl">Back</button>
          </div>
        </div>
      )}

      {/* FEATURE 10: Social Support Network */}
      {page === "social-support" && (
        <div className="p-6 w-full max-w-4xl">
          <div className="bg-pink-50 rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-center mb-8 text-pink-700">Social Support Network</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-semibold mb-4">Share Your Feelings</h3>
                <textarea
                  value={currentSupportMessage}
                  onChange={(e) => setCurrentSupportMessage(e.target.value)}
                  placeholder="Share what's on your mind with the community..."
                  className="w-full h-32 p-4 border rounded-xl resize-none focus:ring-2 focus:ring-pink-400"
                />
                <button
                  onClick={() => {
                    if (currentSupportMessage.trim()) {
                      const newMessage = {
                        id: Date.now(),
                        content: currentSupportMessage,
                        author: profile.name || username || 'Anonymous',
                        date: new Date().toLocaleDateString(),
                        time: new Date().toLocaleTimeString(),
                        likes: 0,
                        supportive: true
                      };
                      setSocialSupport(prev => [newMessage, ...prev]);
                      setCurrentSupportMessage('');
                      alert('Message shared with the community!');
                    }
                  }}
                  className="w-full mt-4 bg-pink-500 hover:bg-pink-600 text-white py-3 rounded-xl font-semibold"
                >
                  Share with Community
                </button>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4">Community Support</h3>
                <div className="h-80 overflow-y-auto space-y-4">
                  {socialSupport.map((message) => (
                    <div key={message.id} className="bg-white p-4 rounded-xl border-l-4 border-pink-400">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold text-pink-700">{message.author}</span>
                        <span className="text-xs text-gray-500">{message.date}</span>
                      </div>
                      <p className="text-gray-800 mb-2">{message.content}</p>
                      <div className="flex gap-2">
                        <button className="text-red-500 text-sm">❤️ {message.likes}</button>
                        <button className="text-blue-500 text-sm">💬 Reply</button>
                        <button className="text-green-500 text-sm">🤗 Support</button>
                      </div>
                    </div>
                  ))}
                  {socialSupport.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      <p>No messages yet. Be the first to share!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <button onClick={() => setPage('dashboard')} className="w-full mt-6 bg-blue-500 text-white py-3 rounded-xl">Back</button>
          </div>
        </div>
      )}

      {/* Enhanced Functional Chatbot */}
      <div 
        className={`fixed ${chatPosition.x} ${chatPosition.y} z-50 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={(e) => {
          if (!chatOpen) {
            setIsDragging(true);
            setDragStart({ x: e.clientX, y: e.clientY });
          }
        }}
        onMouseMove={(e) => {
          if (isDragging && !chatOpen) {
            const deltaX = e.clientX - dragStart.x;
            const deltaY = e.clientY - dragStart.y;
            
            // Snap to edges
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;
            const threshold = 100;
            
            let newX = 'right-6';
            let newY = 'bottom-6';
            
            if (e.clientX < threshold) newX = 'left-6';
            else if (e.clientX > windowWidth - threshold) newX = 'right-6';
            
            if (e.clientY < threshold) newY = 'top-6';
            else if (e.clientY > windowHeight - threshold) newY = 'bottom-6';
            
            setChatPosition({ x: newX, y: newY });
          }
        }}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
      >
        {!chatOpen ? (
          <button
            onClick={() => setChatOpen(true)}
            className={`w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-110 flex items-center justify-center ${isDragging ? 'scale-110' : ''}`}
          >
            <span className="text-2xl">💬</span>
          </button>
        ) : (
          <div style={{width: '380px', height: '60vh', maxHeight: '60vh', overflow: 'hidden'}} className="bg-white rounded-2xl shadow-2xl border">
            <div style={{height: '50px', flexShrink: 0}} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-2 rounded-t-2xl flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm">AI Assistant</h3>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="text-white hover:bg-red-500 rounded w-6 h-6 flex items-center justify-center text-sm font-bold"
              >
                ×
              </button>
            </div>
            
            <div style={{height: 'calc(60vh - 200px)', overflowY: 'auto'}} className="p-2 scrollbar-thin scrollbar-thumb-gray-300">
              {chatMessages.length === 0 && (
                <div className="bg-blue-50 p-2 rounded mb-2">
                  <p className="text-xs">👋 Hi! How are you feeling today?</p>
                </div>
              )}
              {chatMessages.map((msg, i) => (
                <div key={i} className={`mb-2 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                  <div className={`inline-block p-2 rounded-lg text-xs max-w-xs ${
                    msg.sender === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-800 shadow-sm'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="text-left mb-2">
                  <div className="inline-block p-2 rounded-lg text-xs bg-gray-100 text-gray-800">
                    <div className="flex space-x-1">
                      <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce"></div>
                      <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div style={{height: '150px', flexShrink: 0}} className="border-t bg-gray-50">
              <div style={{height: '150px', overflowY: 'auto'}} className="p-3 pb-6 scrollbar-thin scrollbar-thumb-gray-400">
                <div className="grid grid-cols-2 gap-1 mb-2">
                  {['😰 Anxious', '😢 Sad', '😤 Stressed', '😊 Happy'].map((option, i) => (
                    <button
                      key={i}
                      onClick={() => sendChatMessage(option)}
                      disabled={isTyping}
                      className="bg-white hover:bg-blue-50 border border-gray-200 text-xs p-2 rounded-lg transition-colors disabled:opacity-50 min-h-[28px] flex items-center justify-center"
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-1 mb-2">
                  {['🆘 Emergency', '📞 Call Support', '💬 Chat More'].map((option, i) => (
                    <button
                      key={i}
                      onClick={() => sendChatMessage(option)}
                      disabled={isTyping}
                      className="bg-red-500 hover:bg-red-600 text-white text-xs p-2 rounded-lg font-semibold transition-all disabled:opacity-50 min-h-[28px] flex items-center justify-center"
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  {['📅 Book Appointment', '💡 Coping Tips'].map((option, i) => (
                    <button
                      key={i}
                      onClick={() => sendChatMessage(option)}
                      disabled={isTyping}
                      className="bg-orange-500 hover:bg-orange-600 text-white text-sm p-3 rounded-xl font-bold shadow-lg border-2 border-orange-300 transition-all disabled:opacity-50 transform hover:scale-105"
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-1 mb-2">
                  {['📊 Progress Track', '🎯 Set Goals'].map((option, i) => (
                    <button
                      key={i}
                      onClick={() => sendChatMessage(option)}
                      disabled={isTyping}
                      className="bg-purple-500 hover:bg-purple-600 text-white text-xs p-2 rounded-lg font-semibold transition-all disabled:opacity-50 min-h-[28px] flex items-center justify-center"
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {['📚 Resources', '🧘 Meditation', '🎵 Music'].map((option, i) => (
                    <button
                      key={i}
                      onClick={() => sendChatMessage(option)}
                      disabled={isTyping}
                      className="bg-teal-500 hover:bg-teal-600 text-white text-xs p-2 rounded-lg font-semibold transition-all disabled:opacity-50 min-h-[28px] flex items-center justify-center"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}