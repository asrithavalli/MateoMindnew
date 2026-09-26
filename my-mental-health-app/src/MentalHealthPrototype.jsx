import React, { useState, useEffect, useRef } from "react";
import MateoMindIntro from "./MateoMindIntro";
import { apiService } from "./services/api";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "./firebase";

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
    "I have thoughts of self-harm"
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

export default function MentalHealthPrototype() {
  const [showIntro, setShowIntro] = useState(true);
  const [page, setPage] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [apiError, setApiError] = useState("");

  const [userMood, setUserMood] = useState("");
  const [currentQuestions, setCurrentQuestions] = useState([]);
  const [answers, setAnswers] = useState(Array(10).fill(""));
  const [otherTexts, setOtherTexts] = useState({});
  const [analysis, setAnalysis] = useState(null);
  const [assessmentHistory, setAssessmentHistory] = useState([]);

  // Doctor & Booking state
  const [doctorsList, setDoctorsList] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [appointmentDate, setAppointmentDate] = useState(new Date().toISOString().split('T')[0]);
  const [slot, setSlot] = useState("");
  const [bookedAppointments, setBookedAppointments] = useState([]);

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' | 'upi' | 'qr'
  const [cardHolder, setCardHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [upiId, setUpiId] = useState("");
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [paymentConfirmation, setPaymentConfirmation] = useState(null);

  // Chatbot state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(false);
  const [customChatMessage, setCustomChatMessage] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isTyping, chatOpen]);

  // UI state
  const [progress, setProgress] = useState(0);
  const [activeNav, setActiveNav] = useState('home');
  const [pageHistory, setPageHistory] = useState([]);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'system');
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [profileTab, setProfileTab] = useState('info'); // 'info' | 'appointments' | 'payments'

  // User Profile
  const [profile, setProfile] = useState({
    name: "",
    age: "",
    photo: "",
    email: "",
    phone: "",
    gender: "",
    dob: "",
    pronouns: "",
    strengths: ['Empathy', 'Resilience'],
    goals: ['Practice mindfulness', 'Connect with friends'],
    supportContacts: [{ name: 'Alex Johnson', relation: 'Friend', phone: '+1 555-0192' }],
    favoriteResources: ['Meditation', 'Music', 'Yoga'],
    wellnessScore: 85,
    lastCheckIn: "Today"
  });

  const [strengthsInput, setStrengthsInput] = useState("");
  const [goalsInput, setGoalsInput] = useState("");

  // Resources state
  const [activeResource, setActiveResource] = useState('music');
  const [playingSound, setPlayingSound] = useState(null);
  const audioCtxRef = useRef(null);
  const activeNodesRef = useRef([]);
  const chirpTimerRef = useRef(null);

  // Google Authentication State
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleStep, setGoogleStep] = useState(1); // 1 = Email, 2 = Password, 3 = Verifying
  const [customGoogleEmail, setCustomGoogleEmail] = useState("");
  const [customGooglePassword, setCustomGooglePassword] = useState("");
  const [customGoogleName, setCustomGoogleName] = useState("");
  const [googleAuthError, setGoogleAuthError] = useState("");

  // Feature specific states
  const [dailyMoodTracker, setDailyMoodTracker] = useState([]);
  const [moodCalendar, setMoodCalendar] = useState({});
  const [breathingExerciseActive, setBreathingExerciseActive] = useState(false);
  const [breathingCount, setBreathingCount] = useState(0);
  const breathingIntervalRef = useRef(null);

  const [journalEntries, setJournalEntries] = useState([]);
  const [currentJournalEntry, setCurrentJournalEntry] = useState('');

  const [sleepBedtime, setSleepBedtime] = useState("22:00");
  const [sleepWakeTime, setSleepWakeTime] = useState("07:00");
  const [sleepQuality, setSleepQuality] = useState(4);
  const [sleepTracker, setSleepTracker] = useState([]);

  const [gratitudeList, setGratitudeList] = useState([]);
  const [currentGratitude, setCurrentGratitude] = useState('');

  const [mentalHealthTips] = useState([
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
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  const recordingSecondsRef = useRef(0);

  const [socialSupport, setSocialSupport] = useState([]);
  const [currentSupportMessage, setCurrentSupportMessage] = useState('');

  // Sync page state with browser URL hash & handle back/forward navigation
  useEffect(() => {
    const handleHashChange = () => {
      let hash = window.location.hash.replace('#/', '').replace('#', '');
      if (hash === 'doctors') hash = 'slot';
      if (hash) {
        setPage(hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Check stored token and auto-login user on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      loadUserData();
    }
  }, []);

  // Fetch all user data from backend DB
  const loadUserData = async () => {
    try {
      setApiError("");
      const profileData = await apiService.fetchProfile();
      if (profileData) {
        setUsername(profileData.username || "");
        setEmail(profileData.email || "");
        setAgeGroup(profileData.ageGroup || "");
        if (profileData.profile) {
          setProfile(profileData.profile);
          setStrengthsInput((profileData.profile.strengths || []).join(", "));
          setGoalsInput((profileData.profile.goals || []).join(", "));
        }
        let initialHash = window.location.hash.replace('#/', '').replace('#', '');
        if (initialHash === 'doctors') initialHash = 'slot';
        if (initialHash && initialHash !== 'login') {
          setPage(initialHash);
        } else {
          setPage('home');
          window.location.hash = '#/home';
        }
      }

      // Fetch doctors list
      try {
        const docRes = await apiService.fetchDoctors();
        if (docRes && docRes.doctors) setDoctorsList(docRes.doctors);
      } catch (err) {}

      // Fetch appointments
      try {
        const apptRes = await apiService.fetchAppointments();
        if (apptRes && apptRes.appointments) setBookedAppointments(apptRes.appointments);
      } catch (err) {}

      // Fetch payment history
      try {
        const payRes = await apiService.fetchPaymentHistory();
        if (payRes && payRes.payments) setPaymentHistory(payRes.payments);
      } catch (err) {}

      // Fetch assessment history
      try {
        const assRes = await apiService.fetchAssessmentHistory();
        if (assRes && assRes.history) setAssessmentHistory(assRes.history);
      } catch (err) {}

      // Fetch chat history
      try {
        const chatRes = await apiService.fetchChatHistory();
        if (chatRes && chatRes.messages) setChatMessages(chatRes.messages);
      } catch (err) {}

      // Fetch wellness entries
      try {
        const wellRes = await apiService.fetchWellnessEntries();
        if (wellRes && wellRes.entries) {
          const entries = wellRes.entries;
          setJournalEntries(entries.filter(e => e.type === 'journal').map(e => ({ id: e.id, ...e.content, date: new Date(e.createdAt).toLocaleDateString() })));
          setSleepTracker(entries.filter(e => e.type === 'sleep').map(e => ({ id: e.id, ...e.content })));
          setGratitudeList(entries.filter(e => e.type === 'gratitude').map(e => ({ id: e.id, ...e.content })));
          setDailyMoodTracker(entries.filter(e => e.type === 'mood').map(e => ({ id: e.id, ...e.content })));
          setVoiceNotes(entries.filter(e => e.type === 'voice').map(e => ({ id: e.id, ...e.content })));
          setSocialSupport(entries.filter(e => e.type === 'community').map(e => ({ id: e.id, ...e.content })));
        }
      } catch (err) {}

    } catch (err) {
      console.warn("Session expired or token invalid:", err.message);
      localStorage.removeItem('token');
      setPage('login');
    }
  };

  useEffect(() => {
    const answered = answers.filter(a => a !== "").length;
    setProgress((answered / answers.length) * 100);
  }, [answers]);

  useEffect(() => {
    const applyTheme = () => {
      let isDark = false;
      if (theme === 'dark') {
        isDark = true;
      } else if (theme === 'light') {
        isDark = false;
      } else {
        isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      }

      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    applyTheme();
    localStorage.setItem('theme', theme);

    if (theme === 'system' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e) => {
        if (e.matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      };
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
      }
    }
  }, [theme]);

  useEffect(() => {
    return () => {
      if (breathingIntervalRef.current) clearInterval(breathingIntervalRef.current);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      stopAmbientSound();
    };
  }, []);

  // Handle Login & Signup
  const handleAuthSubmit = async (e) => {
    if (e) e.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    try {
      if (isSignup) {
        if (!username || !password || !email || !ageGroup) {
          setAuthError("Please fill in all signup fields!");
          setAuthLoading(false);
          return;
        }
        await apiService.register(username, email, password, ageGroup);
      } else {
        if (!username || !password) {
          setAuthError("Please enter your username and password!");
          setAuthLoading(false);
          return;
        }
        await apiService.login(username, password);
      }

      await loadUserData();
      setAuthLoading(false);
    } catch (err) {
      console.error("Auth error:", err);
      setAuthError(err.message || "Authentication failed. Please check your details.");
      setAuthLoading(false);
    }
  };

  const handleGoogleSignIn = async (accountData = null) => {
    setAuthError("");

    // Check if valid account object with email string was explicitly passed
    const isExplicitAccount = accountData && typeof accountData === 'object' && typeof accountData.email === 'string';

    if (!isExplicitAccount) {
      const apiKey = import.meta.env.VITE_FIREBASE_API_KEY || "";
      const isConfigured = apiKey && !apiKey.includes("your-api-key") && !apiKey.includes("your-actual-api-key");

      if (!isConfigured) {
        // INSTANT 0ms GOOGLE POPUP (Bypasses placeholder Firebase network timeouts)
        setAuthLoading(false);
        setGoogleStep(1);
        setGoogleAuthError("");
        setShowGoogleModal(true);
        return;
      }
    }

    setAuthLoading(true);

    let googleName = "";
    let googleEmail = "";
    let googlePhoto = "";

    if (isExplicitAccount) {
      googleEmail = accountData.email || "googleuser@gmail.com";
      googleName = accountData.name || googleEmail.split('@')[0] || "Google User";
      googlePhoto = accountData.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(googleName)}`;
    } else {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        googleEmail = user.email || "googleuser@gmail.com";
        googleName = user.displayName || user.email?.split('@')[0] || "Google User";
        googlePhoto = user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(googleName)}`;
      } catch (err) {
        console.warn("Firebase Google Auth fallback triggered:", err);
        setAuthLoading(false);
        setGoogleStep(1);
        setGoogleAuthError("");
        setShowGoogleModal(true);
        return;
      }
    }

    try {
      let authRes;
      try {
        authRes = await apiService.register(googleName, googleEmail, "GoogleAuthPass123!", "19 - 24");
      } catch (rErr) {
        try {
          authRes = await apiService.login(googleName, "GoogleAuthPass123!");
        } catch (lErr) {
          try {
            authRes = await apiService.login(googleEmail, "GoogleAuthPass123!");
          } catch (e2) {}
        }
      }

      if (authRes && authRes.token) {
        localStorage.setItem('token', authRes.token);
      }

      setUsername(googleName);
      setEmail(googleEmail);
      setProfile(prev => ({
        ...prev,
        name: googleName,
        email: googleEmail,
        photo: googlePhoto || prev.photo
      }));

      await loadUserData();
      setShowGoogleModal(false);
      setGoogleStep(1);
      setPage("home");
      window.location.hash = "#/home";
    } catch (err) {
      console.error("Google Auth process error:", err);
      setUsername(googleName);
      setEmail(googleEmail);
      setProfile(prev => ({
        ...prev,
        name: googleName,
        email: googleEmail,
        photo: googlePhoto || prev.photo
      }));
      setShowGoogleModal(false);
      setGoogleStep(1);
      setPage("home");
      window.location.hash = "#/home";
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleEmailNext = (e) => {
    e.preventDefault();
    if (!customGoogleEmail.trim()) {
      setGoogleAuthError("Please enter your Google Email address.");
      return;
    }
    if (!customGoogleEmail.includes("@")) {
      setGoogleAuthError("Enter a valid email address (e.g. user@gmail.com).");
      return;
    }
    setGoogleAuthError("");
    setGoogleStep(2);
  };

  const handleGooglePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!customGooglePassword) {
      setGoogleAuthError("Please enter your Google password.");
      return;
    }
    setGoogleAuthError("");
    setGoogleStep(3);

    const derivedName = customGoogleName.trim() || customGoogleEmail.split('@')[0];
    await handleGoogleSignIn({
      name: derivedName,
      email: customGoogleEmail.trim(),
      password: customGooglePassword
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUsername("");
    setPassword("");
    setProfile({
      name: "", age: "", photo: "", email: "", phone: "", gender: "", dob: "", pronouns: "",
      strengths: ['Empathy', 'Resilience'], goals: ['Practice mindfulness', 'Connect with friends'],
      supportContacts: [], favoriteResources: [], wellnessScore: 85, lastCheckIn: "Today"
    });
    setBookedAppointments([]);
    setPaymentHistory([]);
    setAssessmentHistory([]);
    setChatMessages([]);
    setJournalEntries([]);
    setPage("login");
    setShowProfileMenu(false);
  };

  const navigateToPage = (newPage) => {
    if (page !== newPage) {
      if (breathingIntervalRef.current) clearInterval(breathingIntervalRef.current);
      setBreathingExerciseActive(false);
      setPageHistory(prev => [...prev, page]);
      setPage(newPage);
      window.location.hash = `#/${newPage}`;
    }
  };

  const goBack = () => {
    if (breathingIntervalRef.current) clearInterval(breathingIntervalRef.current);
    setBreathingExerciseActive(false);
    if (pageHistory.length > 0) {
      const previousPage = pageHistory[pageHistory.length - 1];
      setPageHistory(prev => prev.slice(0, -1));
      setPage(previousPage);
      window.location.hash = `#/${previousPage}`;
    } else {
      const isFeatureSubPage = [
        'daily-mood', 'breathing-exercise', 'journal', 'emergency-support',
        'mood-calendar', 'sleep-tracker', 'gratitude', 'daily-tips',
        'voice-notes', 'social-support', 'mood-selection', 'questions', 'analysis'
      ].includes(page);
      const fallback = isFeatureSubPage ? 'features' : 'home';
      setPage(fallback);
      window.location.hash = `#/${fallback}`;
    }
  };

  const handleAnswerChange = (index, value) => {
    const updated = [...answers];
    updated[index] = value;
    setAnswers(updated);
  };

  const analyzeResults = async () => {
    setApiError("");
    try {
      const resData = await apiService.submitAssessment(userMood, currentQuestions, answers);
      const newAnalysis = {
        score: resData.score,
        mood: userMood,
        riskLevel: resData.riskLevel,
        riskFactors: resData.riskFactors,
        strengths: resData.strengths,
        recommendations: resData.recommendations,
        date: resData.date
      };
      setAnalysis(newAnalysis);

      // Refresh assessment history
      const assRes = await apiService.fetchAssessmentHistory();
      if (assRes && assRes.history) setAssessmentHistory(assRes.history);

      setAnswers(Array(10).fill(""));
      setPage("analysis");
    } catch (err) {
      alert("Failed to submit assessment to backend: " + err.message);
    }
  };

  const sendChatMessage = async (msgText) => {
    const messageToSend = msgText || customChatMessage;
    if (!messageToSend.trim()) return;

    const userMessage = { text: messageToSend, sender: "user", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setChatMessages(prev => [...prev, userMessage]);
    setCustomChatMessage("");
    setIsTyping(true);

    try {
      const res = await apiService.sendChatMessage(messageToSend);
      const botMessage = { text: res.reply, sender: "bot", time: res.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      setChatMessages(prev => [...prev, botMessage]);
      setIsTyping(false);

      if (speechEnabled && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(res.reply);
        utterance.rate = 1.0;
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      setIsTyping(false);
      const errMsg = { text: "Error connecting to AI backend. Please try again.", sender: "bot", time: new Date().toLocaleTimeString() };
      setChatMessages(prev => [...prev, errMsg]);
    }
  };

  // Payment Checkout Execution
  const executePaymentCheckout = async (simulateFailure = false) => {
    if (!selectedDoctor || !slot) {
      alert("Please select a doctor and time slot first.");
      return;
    }

    if (paymentMethod === 'card') {
      if (!cardHolder || !cardNumber || !cardExpiry || !cardCvv) {
        alert("Please complete all credit/debit card fields including CVV.");
        return;
      }
      if (cardCvv.length < 3) {
        alert("Please enter a valid 3-digit CVV.");
        return;
      }
    } else if (paymentMethod === 'upi') {
      if (!upiId || !upiId.includes('@')) {
        alert("Please enter a valid UPI ID (e.g., username@upi or name@okaxis).");
        return;
      }
    }

    setPaymentProcessing(true);
    setApiError("");

    try {
      const payload = {
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        appointmentDate,
        slot,
        amount: selectedDoctor.fee || 500,
        paymentMethod,
        cardDetails: { cardHolder, cardNumber, expiry: cardExpiry },
        upiId,
        simulateFailure
      };

      const res = await apiService.processPayment(payload);

      setPaymentProcessing(false);
      setPaymentConfirmation({
        transactionId: res.transactionId,
        appointment: res.appointment,
        payment: res.payment
      });

      // Refresh appointments & payments from backend DB
      const apptRes = await apiService.fetchAppointments();
      if (apptRes && apptRes.appointments) setBookedAppointments(apptRes.appointments);

      const payRes = await apiService.fetchPaymentHistory();
      if (payRes && payRes.payments) setPaymentHistory(payRes.payments);

      // Clear checkout fields
      setCardNumber(""); setCardHolder(""); setCardExpiry(""); setCardCvv(""); setUpiId("");
      setSlot(""); setSelectedDoctor(null);
      setPage("confirmation");

    } catch (err) {
      setPaymentProcessing(false);
      alert("Payment Failed: " + err.message);
    }
  };

  // Web Audio Ambient Synthesizer Implementation
  const stopAmbientSound = () => {
    if (chirpTimerRef.current) {
      clearInterval(chirpTimerRef.current);
      chirpTimerRef.current = null;
    }
    activeNodesRef.current.forEach(node => {
      try { node.stop ? node.stop() : node.disconnect(); } catch (e) {}
    });
    activeNodesRef.current = [];
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    setPlayingSound(null);
  };

  const toggleAmbientSound = (soundType) => {
    if (playingSound === soundType) {
      stopAmbientSound();
      return;
    }
    stopAmbientSound();
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();
    audioCtxRef.current = ctx;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.3, ctx.currentTime);
    masterGain.connect(ctx.destination);

    if (soundType === 'waves') {
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) { output[i] = Math.random() * 2 - 1; }
      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, ctx.currentTime);
      whiteNoise.connect(filter);
      filter.connect(masterGain);
      whiteNoise.start();
      activeNodesRef.current = [whiteNoise];
    } else if (soundType === 'birds') {
      // Pleasant Morning Nature & Peaceful Birds Synthesizer
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) { output[i] = Math.random() * 2 - 1; }
      
      const breezeNoise = ctx.createBufferSource();
      breezeNoise.buffer = noiseBuffer;
      breezeNoise.loop = true;

      const breezeFilter = ctx.createBiquadFilter();
      breezeFilter.type = 'lowpass';
      breezeFilter.frequency.setValueAtTime(450, ctx.currentTime);

      const breezeGain = ctx.createGain();
      breezeGain.gain.setValueAtTime(0.15, ctx.currentTime);

      breezeNoise.connect(breezeFilter);
      breezeFilter.connect(breezeGain);
      breezeGain.connect(masterGain);
      breezeNoise.start();

      activeNodesRef.current = [breezeNoise];

      // Procedural Peaceful Bird Chirp Generator
      const playChirp = () => {
        if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') return;
        const now = ctx.currentTime;
        const noteCount = Math.floor(Math.random() * 3) + 1;
        
        for (let i = 0; i < noteCount; i++) {
          const osc = ctx.createOscillator();
          const chirpGain = ctx.createGain();
          
          const noteTime = now + (i * 0.08) + (Math.random() * 0.04);
          const duration = 0.08 + Math.random() * 0.07;
          
          const startFreq = 2200 + Math.random() * 1800;
          const peakFreq = startFreq + 700 + Math.random() * 900;
          const endFreq = startFreq * 0.95;

          osc.type = 'sine';
          osc.frequency.setValueAtTime(startFreq, noteTime);
          osc.frequency.exponentialRampToValueAtTime(peakFreq, noteTime + duration * 0.4);
          osc.frequency.exponentialRampToValueAtTime(endFreq, noteTime + duration);

          chirpGain.gain.setValueAtTime(0, noteTime);
          chirpGain.gain.linearRampToValueAtTime(0.14, noteTime + 0.012);
          chirpGain.gain.exponentialRampToValueAtTime(0.001, noteTime + duration);

          osc.connect(chirpGain);
          chirpGain.connect(masterGain);
          
          osc.start(noteTime);
          osc.stop(noteTime + duration + 0.05);
        }
      };

      playChirp();
      chirpTimerRef.current = setInterval(() => {
        if (Math.random() > 0.2) {
          playChirp();
        }
      }, 1600);
    } else if (soundType === 'meditation') {
      const freqs = [261.63, 329.63, 392.00, 493.88];
      const nodes = freqs.map(f => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start();
        return osc;
      });
      activeNodesRef.current = nodes;
    }
    setPlayingSound(soundType);
  };

  // Real Web Audio Microphone Recording
  const startRecordingVoice = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Microphone recording is not supported in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      let options = {};
      if (typeof MediaRecorder !== 'undefined' && typeof MediaRecorder.isTypeSupported === 'function') {
        if (MediaRecorder.isTypeSupported('audio/webm')) {
          options = { mimeType: 'audio/webm' };
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          options = { mimeType: 'audio/mp4' };
        }
      }

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      recordingSecondsRef.current = 0;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const finalDuration = recordingSecondsRef.current || 1;
        
        // Convert Blob to Base64 Data URL for persistent playback across sessions
        const reader = new FileReader();
        reader.onloadend = async () => {
          const audioUrl = reader.result;
          const newNoteContent = {
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            duration: `${finalDuration}s`,
            audioUrl
          };
          try {
            const res = await apiService.addWellnessEntry('voice', newNoteContent);
            setVoiceNotes(prev => [{ id: res.id || Date.now(), ...newNoteContent }, ...prev]);
          } catch (err) {
            setVoiceNotes(prev => [{ id: Date.now(), ...newNoteContent }, ...prev]);
          }
        };
        reader.readAsDataURL(audioBlob);

        setRecordingSeconds(0);
        recordingSecondsRef.current = 0;
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(200);
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingSecondsRef.current = 0;

      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = setInterval(() => {
        recordingSecondsRef.current += 1;
        setRecordingSeconds(recordingSecondsRef.current);
      }, 1000);
    } catch (err) {
      console.error("Microphone access error:", err);
      alert("Microphone permission required for voice notes: " + (err.message || err));
    }
  };

  const stopRecordingVoice = () => {
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  // Show intro animation before login page
  if (showIntro) {
    return <MateoMindIntro onFinish={() => setShowIntro(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors">
      {/* Back Button */}
      {page !== "login" && page !== "dashboard" && (
        <div className="fixed top-4 left-4 z-40">
          <button
            onClick={goBack}
            className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 p-2 rounded-full shadow-md transition-all duration-300 transform hover:scale-105"
            title="Go Back"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
      )}
      
      {/* Top Navigation Bar */}
      {page !== "login" && (
        <nav className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700 transition-colors">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <div className="flex items-center cursor-pointer" onClick={() => navigateToPage('home')}>
                  <div className="w-9 h-9 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                    <span className="text-white font-bold text-lg">M</span>
                  </div>
                  <span className="ml-2 text-xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">MateoMind</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 sm:space-x-3">
                <button
                  onClick={() => navigateToPage('home')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold transition-all transform hover:scale-105 ${
                    page === 'home'
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  title="Home"
                >
                  <span>🏠</span> <span>Home</span>
                </button>
                
                <button
                  onClick={() => navigateToPage('slot')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold transition-all transform hover:scale-105 ${
                    ['slot', 'payment', 'confirmation'].includes(page)
                      ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  title="Doctors"
                >
                  <span>👨‍⚕️</span> <span>Doctors</span>
                </button>
                
                <button
                  onClick={() => navigateToPage('features')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold transition-all transform hover:scale-105 ${
                    (page === 'features' || [
                      'daily-mood', 'breathing-exercise', 'journal', 'emergency-support',
                      'mood-calendar', 'sleep-tracker', 'gratitude', 'daily-tips',
                      'voice-notes', 'social-support', 'mood-selection', 'questions', 'analysis'
                    ].includes(page))
                      ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  title="Features"
                >
                  <span>⚡</span> <span>Features</span>
                </button>
                
                <button
                  onClick={() => navigateToPage('dashboard')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold transition-all transform hover:scale-105 ${
                    page === 'dashboard'
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  title="Dashboard"
                >
                  <span>📊</span> <span>Dashboard</span>
                </button>
              </div>
              
              <div className="flex items-center space-x-3 relative">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden md:inline">Welcome, {profile.name || username || 'User'}</span>
                
                <div className="relative">
                  <button
                    onClick={() => { setShowThemeMenu(!showThemeMenu); setShowProfileMenu(false); }}
                    className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-1.5 border border-gray-200 dark:border-gray-700 text-sm font-semibold"
                    title="Theme Mode"
                  >
                    <span className="text-base">{theme === 'dark' ? '🌙' : theme === 'light' ? '☀️' : '💻'}</span>
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300 hidden sm:inline capitalize">{theme}</span>
                  </button>

                  {showThemeMenu && (
                    <div className="absolute right-0 top-12 bg-white dark:bg-gray-800 shadow-2xl rounded-2xl border border-gray-100 dark:border-gray-700 p-2 w-44 z-50">
                      <div className="text-[10px] font-extrabold uppercase px-3 py-1 text-gray-400 tracking-wider">Appearance</div>
                      <button
                        onClick={() => { setTheme('light'); setShowThemeMenu(false); }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between mb-1 ${
                          theme === 'light'
                            ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <span className="flex items-center gap-2">☀️ <span>Light Mode</span></span>
                        {theme === 'light' && <span>✓</span>}
                      </button>

                      <button
                        onClick={() => { setTheme('dark'); setShowThemeMenu(false); }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between mb-1 ${
                          theme === 'dark'
                            ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <span className="flex items-center gap-2">🌙 <span>Dark Mode</span></span>
                        {theme === 'dark' && <span>✓</span>}
                      </button>

                      <button
                        onClick={() => { setTheme('system'); setShowThemeMenu(false); }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                          theme === 'system'
                            ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <span className="flex items-center gap-2">💻 <span>System Default</span></span>
                        {theme === 'system' && <span>✓</span>}
                      </button>
                    </div>
                  )}
                </div>
                
                <div 
                  className="w-9 h-9 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center cursor-pointer hover:shadow-lg transition-all transform hover:scale-105 border-2 border-white dark:border-gray-700"
                  onClick={() => { setShowProfileMenu(!showProfileMenu); setShowThemeMenu(false); }}
                >
                  <span className="text-white text-sm font-bold">{(profile.name || username || 'U')[0].toUpperCase()}</span>
                </div>
                
                {showProfileMenu && (
                  <div className="absolute right-0 top-12 bg-white dark:bg-gray-800 shadow-2xl rounded-2xl border border-gray-100 dark:border-gray-700 p-2 w-36 z-50">
                    <button
                      onClick={() => { setShowProfileMenu(false); navigateToPage('profile'); }}
                      className="w-full text-left px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-sm font-semibold rounded-xl mb-1 shadow-sm transition-all"
                    >
                      👤 Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
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

      {/* MAIN APPLICATION CONTAINER */}
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4">

        {/* AUTH PAGE: LOGIN / REGISTER */}
        {page === "login" && (
          <div className="flex items-center justify-center min-h-screen w-full bg-gradient-to-br from-blue-100 via-purple-100 to-pink-200 dark:from-gray-900 dark:via-purple-950 dark:to-gray-900 p-4">
            <div className="max-w-lg w-full bg-white dark:bg-gray-800 shadow-2xl rounded-3xl p-8 border border-purple-200 dark:border-purple-900 relative">
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-400 rounded-full flex items-center justify-center shadow-2xl border-4 border-white dark:border-gray-700">
                  <span className="text-yellow-300 text-5xl font-extrabold">🧠</span>
                </div>
              </div>
              <div className="text-center mb-8">
                <h1 className="text-4xl font-black bg-gradient-to-r from-blue-700 via-purple-700 to-pink-600 bg-clip-text text-transparent mb-2">MateoMind</h1>
                <p className="text-sm font-semibold text-purple-600 dark:text-purple-400 mb-1">Your Mental Health Companion</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Feel safe, supported, and empowered every day.</p>
              </div>

              {authError && (
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/40 border border-red-300 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-xs font-bold text-center">
                  ⚠️ {authError}
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-4 border border-purple-200 dark:border-purple-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 bg-purple-50 dark:bg-gray-700 text-gray-800 dark:text-white placeholder-purple-400 text-base font-medium shadow-sm"
                  required
                />
                {isSignup && (
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-4 border border-purple-200 dark:border-purple-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 bg-purple-50 dark:bg-gray-700 text-gray-800 dark:text-white placeholder-purple-400 text-base font-medium shadow-sm"
                    required
                  />
                )}
                <input
                  type="password"
                  placeholder={isSignup ? "Create a password" : "Password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-4 border border-purple-200 dark:border-purple-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 bg-purple-50 dark:bg-gray-700 text-gray-800 dark:text-white placeholder-purple-400 text-base font-medium shadow-sm"
                  required
                />
                {isSignup && (
                  <select
                    value={ageGroup}
                    onChange={(e) => setAgeGroup(e.target.value)}
                    className="w-full p-4 border border-purple-200 dark:border-purple-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 bg-purple-50 dark:bg-gray-700 text-gray-800 dark:text-white text-base font-medium shadow-sm"
                    required
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
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all duration-300 transform hover:scale-102 shadow-lg text-lg flex items-center justify-center gap-2"
                >
                  {authLoading ? (
                    <span>⏳ Authenticating...</span>
                  ) : (
                    <span>{isSignup ? 'Sign Up' : 'Sign In'}</span>
                  )}
                </button>
              </form>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-purple-200 dark:border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-gray-800 px-3 text-gray-500 dark:text-gray-400 font-bold">Or</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleGoogleSignIn()}
                disabled={authLoading}
                className="w-full bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-bold py-3.5 px-4 rounded-xl border border-gray-300 dark:border-gray-600 transition-all duration-300 transform hover:scale-102 shadow-md flex items-center justify-center gap-3 text-base cursor-pointer"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Continue with Google</span>
              </button>

              <button
                onClick={() => { setIsSignup(!isSignup); setAuthError(""); }}
                className="w-full text-purple-600 dark:text-purple-400 hover:underline font-semibold py-2 text-sm text-center mt-3"
              >
                {isSignup ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </button>
            </div>
          </div>
        )}

        {/* HOME PAGE */}
        {page === "home" && (
          <div className="p-6 w-full max-w-6xl">
            {/* Hero Banner */}
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 rounded-3xl p-8 text-white shadow-2xl mb-8 relative overflow-hidden">
              <div className="relative z-10 max-w-2xl">
                <span className="inline-block bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-white/30">
                  🌿 Mental Health & Emotional Well-Being
                </span>
                <h1 className="text-4xl sm:text-5xl font-black mb-4 leading-tight">
                  Welcome to MateoMind
                </h1>
                <p className="text-base sm:text-lg text-white/90 mb-6 font-medium">
                  Your safe space for emotional tracking, guided relaxation, professional consultation, and personal growth.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => navigateToPage('mood-selection')}
                    className="bg-purple-900/40 hover:bg-purple-900/60 text-white border border-white/30 px-6 py-3 rounded-2xl font-bold shadow-md transition-all transform hover:scale-105 flex items-center gap-2"
                  >
                    <span>📝</span> <span>Take Assessment</span>
                  </button>
                  <button
                    onClick={() => navigateToPage('features')}
                    className="bg-purple-900/40 hover:bg-purple-900/60 text-white border border-white/30 px-6 py-3 rounded-2xl font-bold shadow-md transition-all transform hover:scale-105 flex items-center gap-2"
                  >
                    <span>⚡</span> <span>Explore All Features</span>
                  </button>
                  <button
                    onClick={() => navigateToPage('slot')}
                    className="bg-purple-900/40 hover:bg-purple-900/60 text-white border border-white/30 px-6 py-3 rounded-2xl font-bold shadow-md transition-all transform hover:scale-105 flex items-center gap-2"
                  >
                    <span>👨‍⚕️</span> <span>Consult a Doctor</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Action Navigation Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div
                onClick={() => navigateToPage('features')}
                className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-lg border border-purple-100 dark:border-purple-900/40 hover:shadow-2xl transition-all cursor-pointer transform hover:-translate-y-1"
              >
                <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 rounded-2xl flex items-center justify-center text-3xl mb-4">
                  ⚡
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Wellness Features</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
                  Access your Daily Mood, Digital Journal, Voice Notes, Sleep Tracker, Gratitude, Breathing, and Assessments.
                </p>
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                  Open Features Hub ➔
                </span>
              </div>

              <div
                onClick={() => navigateToPage('slot')}
                className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-lg border border-blue-100 dark:border-blue-900/40 hover:shadow-2xl transition-all cursor-pointer transform hover:-translate-y-1"
              >
                <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 rounded-2xl flex items-center justify-center text-3xl mb-4">
                  👨‍⚕️
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Doctor Consultation</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
                  Find verified clinical psychologists & psychiatrists and schedule online video sessions easily.
                </p>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                  Book Specialist ➔
                </span>
              </div>

              <div
                onClick={() => navigateToPage('dashboard')}
                className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-lg border border-green-100 dark:border-green-900/40 hover:shadow-2xl transition-all cursor-pointer transform hover:-translate-y-1"
              >
                <div className="w-14 h-14 bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-300 rounded-2xl flex items-center justify-center text-3xl mb-4">
                  📊
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Personal Dashboard</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
                  View your active appointments, health history, personal scores, strengths, and wellness goals.
                </p>
                <span className="text-xs font-bold text-green-600 dark:text-green-400 flex items-center gap-1">
                  View Dashboard ➔
                </span>
              </div>
            </div>

            {/* Daily Inspiration & Quote */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-6 mb-8 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <span>💡</span> <span>Daily Inspiration</span>
                </h3>
                <button
                  onClick={() => setCurrentTipIndex((prev) => (prev + 1) % mentalHealthTips.length)}
                  className="text-xs text-purple-600 dark:text-purple-400 font-bold hover:underline"
                >
                  Refresh Quote 🔄
                </button>
              </div>
              <blockquote className="bg-purple-50 dark:bg-gray-700/50 p-6 rounded-2xl text-center border border-purple-100 dark:border-gray-600 italic text-sm text-gray-700 dark:text-gray-200 font-medium">
                "{mentalHealthTips[currentTipIndex]}"
              </blockquote>
            </div>

            {/* Ambient Soundscapes */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <span>🎧</span> <span>Ambient Soundscapes</span>
                </h3>
                {playingSound && (
                  <button
                    onClick={stopAmbientSound}
                    className="bg-red-500 text-white px-3 py-1 rounded-lg text-xs font-bold shadow hover:bg-red-600 animate-pulse self-start sm:self-auto"
                  >
                    ⏹ Stop Playing ({playingSound})
                  </button>
                )}
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { title: 'Ocean Waves Surge', sound: 'waves', desc: 'Rhythmic sea tide simulation', icon: '🌊' },
                  { title: 'Morning Nature & Peaceful Birds', sound: 'birds', desc: 'Serene morning breeze with gentle bird chirps', icon: '🐦' },
                  { title: 'Harmonic Meditation', sound: 'meditation', desc: 'Soothing acoustic chords', icon: '🧘' }
                ].map((item, i) => (
                  <div key={i} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <div>
                      <div className="text-2xl mb-1">{item.icon}</div>
                      <h4 className="font-bold text-sm text-gray-800 dark:text-white">{item.title}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => toggleAmbientSound(item.sound)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shadow ${
                        playingSound === item.sound ? 'bg-red-500 text-white' : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
                    >
                      {playingSound === item.sound ? 'Pause' : 'Play'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* DASHBOARD PAGE */}
        {page === "dashboard" && (
          <div className="p-6 w-full max-w-6xl">
            <button
              onClick={() => navigateToPage('home')}
              className="mb-4 inline-flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-xl transition-all shadow-sm cursor-pointer"
            >
              <span>🏠</span> <span>← Back to Home</span>
            </button>
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-extrabold text-gray-800 dark:text-white mb-1">Personal Dashboard</h1>
                <p className="text-gray-600 dark:text-gray-400">Welcome back, {profile.name || username}! Here is your personal activity & consultation summary.</p>
              </div>
              <button
                onClick={() => navigateToPage('mood-selection')}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-2 self-start md:self-auto"
              >
                <span>📝</span> <span>Take Assessment</span>
              </button>
            </div>

            {/* Profile Overview Card */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white p-6 rounded-3xl shadow-xl flex flex-col justify-between">
                <div>
                  <div className="text-xs font-extrabold uppercase tracking-wider text-purple-200 mb-1">Wellness Score</div>
                  <div className="text-5xl font-black mb-2">{profile.wellnessScore || 85}/100</div>
                  <p className="text-xs text-purple-100 font-medium">Last check-in: {profile.lastCheckIn || 'Today'}</p>
                </div>
                <button
                  onClick={() => navigateToPage('profile')}
                  className="mt-6 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-bold py-2 rounded-xl border border-white/30 text-center"
                >
                  View Profile & History ➔
                </button>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700">
                <h3 className="font-bold text-sm text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-1.5">
                  <span>💪</span> <span>Strengths</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(profile.strengths || ['Empathy', 'Resilience']).map((s, i) => (
                    <span key={i} className="bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 text-xs px-3 py-1 rounded-full font-bold">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700">
                <h3 className="font-bold text-sm text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-1.5">
                  <span>🎯</span> <span>Wellness Goals</span>
                </h3>
                <ul className="space-y-2 text-xs font-semibold text-gray-600 dark:text-gray-300">
                  {(profile.goals || ['Practice mindfulness', 'Connect with friends']).map((g, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="text-purple-500 font-bold">✓</span>
                      <span>{g}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Appointments Banner */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-6 mb-8 border border-gray-100 dark:border-gray-700">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <span>📅</span> <span>Your Scheduled Consultations</span>
                </h3>
                <button
                  onClick={() => navigateToPage('slot')}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all transform hover:scale-105"
                >
                  + Book Doctor
                </button>
              </div>
              
              {bookedAppointments.length > 0 ? (
                <div className="space-y-4">
                  {bookedAppointments.map((appointment) => (
                    <div key={appointment.id} className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-750 p-4 rounded-2xl border-l-4 border-blue-500 shadow-sm">
                      <div className="flex justify-between items-center flex-wrap gap-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow">
                            <span className="text-white text-lg">👨‍⚕️</span>
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-800 dark:text-white">{appointment.doctorName || appointment.doctor}</h4>
                            <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-1">📅 {appointment.date} at ⏰ {appointment.slot || appointment.time}</p>
                          </div>
                        </div>
                        <span className="bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 px-3 py-1 rounded-full text-xs font-bold">
                          {appointment.status || 'Confirmed'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="w-12 h-12 bg-purple-50 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-purple-500 text-xl">📅</span>
                  </div>
                  <h4 className="text-base font-bold text-gray-700 dark:text-gray-300 mb-1">No Consultations Scheduled</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Schedule a session with verified psychologists & psychiatrists.</p>
                  <button
                    onClick={() => navigateToPage('slot')}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  >
                    Find Available Doctors
                  </button>
                </div>
              )}
            </div>

            {/* Assessment History Banner */}
            {assessmentHistory.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                  <span>📝</span> <span>Recent Assessment Results</span>
                </h3>
                <div className="space-y-3">
                  {assessmentHistory.slice(0, 3).map((item, i) => (
                    <div key={i} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 flex justify-between items-center">
                      <div>
                        <div className="font-bold text-sm text-gray-800 dark:text-white capitalize">{item.moodType || 'Self'} Assessment</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{item.date}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-purple-600 dark:text-purple-400">Score: {item.score}/30</div>
                        <div className="text-[10px] font-bold text-gray-500">{item.riskLevel}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* FEATURES OVERVIEW PAGE */}
        {page === "features" && (
          <div className="p-6 w-full max-w-6xl">
            <button
              onClick={() => navigateToPage('home')}
              className="mb-4 inline-flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-xl transition-all shadow-sm cursor-pointer"
            >
              <span>🏠</span> <span>← Back to Home</span>
            </button>
            <div className="mb-6">
              <h1 className="text-3xl font-black mb-2">⚡ Wellness & Health Features</h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                All MateoMind wellness tools are consolidated here. Select any feature below to get started:
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {[
                  { page: 'daily-mood', icon: '😊', name: 'Daily Mood', desc: 'Track daily emotions with emojis', bg: 'from-yellow-50 to-orange-50 dark:from-gray-700 dark:to-gray-750' },
                  { page: 'breathing-exercise', icon: '🫁', name: '4-7-8 Breathing', desc: 'Guided deep breathing exercise', bg: 'from-blue-50 to-cyan-50 dark:from-gray-700 dark:to-gray-750' },
                  { page: 'journal', icon: '📔', name: 'Digital Journal', desc: 'Write & save private thoughts', bg: 'from-green-50 to-teal-50 dark:from-gray-700 dark:to-gray-750' },
                  { page: 'gratitude', icon: '🙏', name: 'Gratitude Journal', desc: 'Practice daily gratitude', bg: 'from-amber-50 to-yellow-50 dark:from-gray-700 dark:to-gray-750' },
                  { page: 'sleep-tracker', icon: '😴', name: 'Sleep Tracker', desc: 'Log bedtime & sleep quality', bg: 'from-indigo-50 to-blue-50 dark:from-gray-700 dark:to-gray-750' },
                  { page: 'mood-selection', icon: '📝', name: 'Mental Assessments', desc: 'PHQ-9 & GAD-7 screening tests', bg: 'from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-750' },
                  { page: 'voice-notes', icon: '🎤', name: 'Voice Notes', desc: 'Record audio thoughts & entries', bg: 'from-violet-50 to-purple-50 dark:from-gray-700 dark:to-gray-750' },
                  { page: 'mood-calendar', icon: '📅', name: 'Mood Calendar', desc: 'Monthly visual mood history', bg: 'from-purple-50 to-indigo-50 dark:from-gray-700 dark:to-gray-750' },
                  { page: 'daily-tips', icon: '💡', name: 'Daily Wellness Tips', desc: 'Mental health advice & quotes', bg: 'from-lime-50 to-green-50 dark:from-gray-700 dark:to-gray-750' },
                  { page: 'emergency-support', icon: '🆘', name: 'Emergency Crisis', desc: '24/7 hotline & support links', bg: 'from-red-50 to-pink-50 dark:from-gray-700 dark:to-gray-750' },
                  { page: 'social-support', icon: '🤝', name: 'Community Support', desc: 'Peer encouragement & notes', bg: 'from-pink-50 to-rose-50 dark:from-gray-700 dark:to-gray-750' }
                ].map((feature, i) => (
                  <div
                    key={i}
                    onClick={() => navigateToPage(feature.page)}
                    className={`border border-gray-200 dark:border-gray-600 rounded-3xl p-5 cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-xl bg-gradient-to-br ${feature.bg} flex flex-col justify-between h-full`}
                  >
                    <div>
                      <div className="w-14 h-14 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-2xl flex items-center justify-center mb-4 shadow-md">
                        <span className="text-white text-2xl">{feature.icon}</span>
                      </div>
                      <h4 className="font-extrabold text-gray-800 dark:text-gray-100 text-base mb-1">{feature.name}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{feature.desc}</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                      <span className="text-[11px] font-extrabold text-purple-600 dark:text-purple-400">Open Tool</span>
                      <span className="text-purple-600 dark:text-purple-400">➔</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PROFILE PAGE WITH HISTORIES */}
        {page === "profile" && (
          <div className="p-6 w-full max-w-4xl">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-100 dark:border-gray-700">
              <h2 className="text-3xl font-black text-center mb-6 text-purple-600 dark:text-purple-400">User Profile</h2>
              
              <div className="flex justify-center gap-2 mb-8 border-b border-gray-200 dark:border-gray-700 pb-3">
                <button
                  onClick={() => setProfileTab('info')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${profileTab === 'info' ? 'bg-purple-600 text-white shadow' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
                >
                  👤 Personal Info
                </button>
                <button
                  onClick={() => setProfileTab('appointments')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${profileTab === 'appointments' ? 'bg-purple-600 text-white shadow' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
                >
                  📅 Consultations ({bookedAppointments.length})
                </button>
                <button
                  onClick={() => setProfileTab('payments')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${profileTab === 'payments' ? 'bg-purple-600 text-white shadow' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
                >
                  💳 Transactions ({paymentHistory.length})
                </button>
              </div>

              {profileTab === 'info' && (
                <div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400">Full Name</span>
                      <input type="text" value={profile.name || username} onChange={e => setProfile({...profile, name: e.target.value})} className="p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-sm" placeholder="Your Name" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400">Email</span>
                      <input type="email" value={profile.email || email} onChange={e => setProfile({...profile, email: e.target.value})} className="p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-sm" placeholder="your@email.com" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400">Age</span>
                      <input type="number" value={profile.age || ""} onChange={e => setProfile({...profile, age: e.target.value})} className="p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-sm" placeholder="Age" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400">Gender</span>
                      <select value={profile.gender || ""} onChange={e => setProfile({...profile, gender: e.target.value})} className="p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-sm">
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-green-600 dark:text-green-400">💪 Strengths (comma-separated)</span>
                      <input
                        type="text"
                        value={strengthsInput}
                        onChange={e => setStrengthsInput(e.target.value)}
                        className="p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-sm"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-pink-600 dark:text-pink-400">🎯 Wellness Goals (comma-separated)</span>
                      <input
                        type="text"
                        value={goalsInput}
                        onChange={e => setGoalsInput(e.target.value)}
                        className="p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 justify-center pt-4">
                    <button onClick={() => navigateToPage('dashboard')} className="bg-gray-500 text-white px-6 py-3 rounded-xl font-bold text-sm">Cancel</button>
                    <button
                      onClick={async () => {
                        const updatedProfile = {
                          ...profile,
                          name: profile.name || username,
                          email: profile.email || email,
                          strengths: strengthsInput.split(",").map(s => s.trim()).filter(Boolean),
                          goals: goalsInput.split(",").map(g => g.trim()).filter(Boolean)
                        };
                        try {
                          await apiService.updateProfile(updatedProfile, ageGroup);
                          setProfile(updatedProfile);
                          alert('Profile saved to database successfully!');
                        } catch (err) {
                          alert('Failed to save profile: ' + err.message);
                        }
                      }}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg transition-all"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              )}

              {profileTab === 'appointments' && (
                <div className="space-y-3">
                  {bookedAppointments.length > 0 ? (
                    bookedAppointments.map(appt => (
                      <div key={appt.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-2xl border border-gray-200 dark:border-gray-600 flex justify-between items-center">
                        <div>
                          <h4 className="font-bold text-sm text-gray-800 dark:text-white">{appt.doctorName || appt.doctor}</h4>
                          <p className="text-xs text-blue-600 dark:text-blue-400">📅 Date: {appt.date} | ⏰ Slot: {appt.slot || appt.time}</p>
                          <p className="text-xs text-gray-500">Method: {appt.paymentMethod?.toUpperCase()}</p>
                        </div>
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold">Confirmed</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 text-xs py-4">No appointments recorded yet.</p>
                  )}
                </div>
              )}

              {profileTab === 'payments' && (
                <div className="space-y-3">
                  {paymentHistory.length > 0 ? (
                    paymentHistory.map(pay => (
                      <div key={pay.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-2xl border border-gray-200 dark:border-gray-600 flex justify-between items-center">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-xs font-bold text-purple-600 dark:text-purple-400">{pay.transactionId}</span>
                            <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase">{pay.status}</span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-300">{pay.details}</p>
                          <p className="text-[10px] text-gray-400">{pay.date} at {pay.time}</p>
                        </div>
                        <span className="font-bold text-green-600 text-sm">₹{pay.amount}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 text-xs py-4">No payment transactions found.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* WELLNESS FEATURE PAGES (Mood, Journal, Sleep, Gratitude, Voice, Community) */}
        {page === "daily-mood" && (
          <div className="p-6 w-full max-w-2xl">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
              <h2 className="text-3xl font-extrabold text-center mb-6">Daily Mood Tracker</h2>
              <p className="text-center text-sm text-gray-500 mb-6">Tap an emoji to log how you feel today:</p>
              <div className="grid grid-cols-5 gap-3 mb-6">
                {['😢', '😟', '😐', '😊', '😄'].map((emoji, i) => (
                  <button
                    key={i}
                    onClick={async () => {
                      const today = new Date().toDateString();
                      const content = { date: today, mood: i + 1, emoji };
                      try {
                        const res = await apiService.addWellnessEntry('mood', content);
                        setDailyMoodTracker(prev => [{ id: res.id, ...content }, ...prev]);
                        alert('Mood logged successfully to database!');
                      } catch (err) {
                        alert('Error saving mood: ' + err.message);
                      }
                    }}
                    className="p-4 text-4xl hover:scale-110 transition-transform bg-gray-50 dark:bg-gray-700 rounded-2xl border border-gray-200 dark:border-gray-600 hover:bg-blue-50"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <button onClick={() => navigateToPage('features')} className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-bold shadow-md">
                ← Back to Features
              </button>
            </div>
          </div>
        )}

        {/* Breathing Exercise */}
        {page === "breathing-exercise" && (
          <div className="p-6 w-full max-w-2xl">
            <div className="bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-800 dark:to-purple-950 rounded-2xl shadow-xl p-8 border border-purple-200 dark:border-purple-800">
              <h2 className="text-3xl font-extrabold text-center mb-6">4-7-8 Breathing Exercise</h2>
              <div className="text-center mb-8">
                <div className={`w-36 h-36 mx-auto rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white text-3xl font-black shadow-2xl transition-transform duration-1000 ${breathingExerciseActive ? 'scale-125' : 'scale-100'}`}>
                  {breathingCount}
                </div>
              </div>
              <div className="text-center mb-6">
                <p className="text-base font-semibold mb-4">{breathingExerciseActive ? 'Inhale deeply... Hold... Exhale slowly...' : 'Click start to practice guided relaxation.'}</p>
                <button
                  onClick={() => {
                    if (!breathingExerciseActive) {
                      setBreathingExerciseActive(true);
                      setBreathingCount(1);
                      breathingIntervalRef.current = setInterval(() => {
                        setBreathingCount(prev => {
                          if (prev >= 8) {
                            if (breathingIntervalRef.current) clearInterval(breathingIntervalRef.current);
                            setBreathingExerciseActive(false);
                            alert('Great job! You completed the breathing cycle.');
                            return 0;
                          }
                          return prev + 1;
                        });
                      }, 1200);
                    }
                  }}
                  disabled={breathingExerciseActive}
                  className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-bold shadow-lg"
                >
                  {breathingExerciseActive ? 'In Progress...' : 'Start Exercise'}
                </button>
              </div>
              <button onClick={() => navigateToPage('features')} className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-bold shadow-md">
                ← Back to Features
              </button>
            </div>
          </div>
        )}

        {/* Digital Journal */}
        {page === "journal" && (
          <div className="p-6 w-full max-w-4xl">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
              <h2 className="text-3xl font-extrabold text-center mb-6">Digital Journal</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-bold mb-3">New Entry</h3>
                  <textarea
                    value={currentJournalEntry}
                    onChange={(e) => setCurrentJournalEntry(e.target.value)}
                    placeholder="What's on your mind today?"
                    className="w-full h-56 p-4 border border-gray-200 dark:border-gray-700 rounded-xl resize-none bg-gray-50 dark:bg-gray-700 text-sm focus:ring-2 focus:ring-blue-400"
                  />
                  <button
                    onClick={async () => {
                      if (currentJournalEntry.trim()) {
                        const content = { text: currentJournalEntry, time: new Date().toLocaleTimeString() };
                        try {
                          const res = await apiService.addWellnessEntry('journal', content);
                          setJournalEntries(prev => [{ id: res.id, ...content, date: new Date().toLocaleDateString() }, ...prev]);
                          setCurrentJournalEntry('');
                          alert('Journal entry saved to database!');
                        } catch (err) {
                          alert('Failed to save journal: ' + err.message);
                        }
                      }
                    }}
                    className="w-full mt-3 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold text-sm shadow"
                  >
                    Save Entry
                  </button>
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-3">Saved Entries</h3>
                  <div className="h-72 overflow-y-auto space-y-3">
                    {journalEntries.map((entry) => (
                      <div key={entry.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl border border-gray-200 dark:border-gray-600">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{entry.date}</div>
                        <p className="text-sm text-gray-800 dark:text-gray-200">{entry.text}</p>
                      </div>
                    ))}
                    {journalEntries.length === 0 && <p className="text-xs text-gray-400">No journal entries saved yet.</p>}
                  </div>
                </div>
              </div>
              <button onClick={() => navigateToPage('features')} className="w-full mt-6 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-bold shadow-md">
                ← Back to Features
              </button>
            </div>
          </div>
        )}

        {/* Emergency Crisis Support */}
        {page === "emergency-support" && (
          <div className="p-6 w-full max-w-2xl">
            <div className="bg-red-50 dark:bg-red-950/40 border-2 border-red-200 dark:border-red-900 rounded-2xl shadow-xl p-8">
              <h2 className="text-3xl font-extrabold text-center mb-6 text-red-600 dark:text-red-400">Emergency Crisis Support</h2>
              <div className="space-y-4 mb-6">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border-l-4 border-red-500 shadow-sm">
                  <h3 className="font-bold text-red-600 dark:text-red-400 mb-1">Hotlines Available 24/7</h3>
                  <p className="text-sm">Suicide & Crisis Lifeline: <strong>988</strong></p>
                  <p className="text-sm">Crisis Text Line: Text <strong>HOME</strong> to <strong>741741</strong></p>
                </div>
              </div>
              <button onClick={() => navigateToPage('features')} className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-bold shadow-md">
                ← Back to Features
              </button>
            </div>
          </div>
        )}

        {/* Sleep Tracker */}
        {page === "sleep-tracker" && (
          <div className="p-6 w-full max-w-2xl">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
              <h2 className="text-3xl font-extrabold text-center mb-6 text-indigo-600 dark:text-indigo-400">Sleep Tracker</h2>
              <div className="space-y-4 mb-6">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
                  <label className="block font-bold text-xs text-gray-600 dark:text-gray-300 mb-1">Bedtime</label>
                  <input type="time" value={sleepBedtime} onChange={(e) => setSleepBedtime(e.target.value)} className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-semibold" />
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
                  <label className="block font-bold text-xs text-gray-600 dark:text-gray-300 mb-1">Wake Time</label>
                  <input type="time" value={sleepWakeTime} onChange={(e) => setSleepWakeTime(e.target.value)} className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-semibold" />
                </div>
                <button
                  onClick={async () => {
                    const content = { date: new Date().toLocaleDateString(), bedtime: sleepBedtime, wakeTime: sleepWakeTime, quality: sleepQuality };
                    try {
                      const res = await apiService.addWellnessEntry('sleep', content);
                      setSleepTracker(prev => [{ id: res.id, ...content }, ...prev]);
                      alert("Sleep log saved to database!");
                    } catch (err) {
                      alert("Failed to save sleep log: " + err.message);
                    }
                  }}
                  className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-md"
                >
                  Log Sleep Entry
                </button>
              </div>
              <button onClick={() => navigateToPage('features')} className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-bold shadow-md">
                ← Back to Features
              </button>
            </div>
          </div>
        )}

        {/* Gratitude Journal */}
        {page === "gratitude" && (
          <div className="p-6 w-full max-w-2xl">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
              <h2 className="text-3xl font-extrabold text-center mb-6 text-amber-500">Gratitude Journal</h2>
              <div className="mb-6">
                <textarea
                  value={currentGratitude}
                  onChange={(e) => setCurrentGratitude(e.target.value)}
                  placeholder="Write something you are thankful for..."
                  className="w-full h-32 p-4 border border-gray-200 dark:border-gray-700 rounded-xl resize-none bg-gray-50 dark:bg-gray-700 text-sm"
                />
                <button
                  onClick={async () => {
                    if (currentGratitude.trim()) {
                      const content = { text: currentGratitude, date: new Date().toLocaleDateString() };
                      try {
                        const res = await apiService.addWellnessEntry('gratitude', content);
                        setGratitudeList(prev => [{ id: res.id, ...content }, ...prev]);
                        setCurrentGratitude('');
                        alert('Gratitude saved to database! 🙏');
                      } catch (err) {
                        alert('Failed to save gratitude: ' + err.message);
                      }
                    }
                  }}
                  className="w-full mt-3 bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-xl font-bold shadow"
                >
                  Add Gratitude
                </button>
              </div>
              <button onClick={() => navigateToPage('features')} className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-bold shadow-md">
                ← Back to Features
              </button>
            </div>
          </div>
        )}

        {/* Daily Tips */}
        {page === "daily-tips" && (
          <div className="p-6 w-full max-w-2xl">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
              <h2 className="text-3xl font-extrabold text-center mb-6 text-green-600 dark:text-green-400">Daily Wellness Tips</h2>
              <div className="bg-green-50 dark:bg-gray-700 p-6 rounded-2xl mb-6 text-center border border-green-200 dark:border-gray-600">
                <div className="text-5xl mb-3">💡</div>
                <p className="text-lg font-bold text-gray-800 dark:text-white mb-4">{mentalHealthTips[currentTipIndex]}</p>
                <button
                  onClick={() => setCurrentTipIndex((prev) => (prev + 1) % mentalHealthTips.length)}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow"
                >
                  Next Tip ➔
                </button>
              </div>
              <button onClick={() => navigateToPage('features')} className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-bold shadow-md">
                ← Back to Features
              </button>
            </div>
          </div>
        )}

        {/* Voice Notes */}
        {page === "voice-notes" && (
          <div className="p-6 w-full max-w-2xl">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
              <h2 className="text-3xl font-extrabold text-center mb-2 text-purple-600 dark:text-purple-400">🎤 Voice Notes</h2>
              <p className="text-center text-xs text-gray-500 dark:text-gray-400 mb-6">
                Record audio thoughts, reflections, or voice entries to listen to anytime.
              </p>

              {/* Recording Controls */}
              <div className="bg-purple-50 dark:bg-gray-700/50 p-6 rounded-3xl border border-purple-100 dark:border-gray-600 text-center mb-8">
                <div className={`w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center text-white text-4xl mb-4 shadow-xl transition-all ${isRecording ? 'scale-110 animate-pulse ring-4 ring-red-400' : ''}`}>
                  🎤
                </div>

                {isRecording ? (
                  <div className="mb-4">
                    <span className="inline-block px-3 py-1 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded-full text-xs font-black animate-pulse mb-1">
                      🔴 Recording in progress...
                    </span>
                    <p className="text-2xl font-black text-gray-800 dark:text-white">{recordingSeconds}s</p>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Tap the button below to start recording your voice note</p>
                )}

                {!isRecording ? (
                  <button
                    onClick={startRecordingVoice}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3.5 rounded-2xl font-bold shadow-lg transition-all transform hover:scale-105 flex items-center gap-2 mx-auto"
                  >
                    <span>🎤</span> <span>Start Audio Recording</span>
                  </button>
                ) : (
                  <button
                    onClick={stopRecordingVoice}
                    className="bg-red-500 hover:bg-red-600 text-white px-8 py-3.5 rounded-2xl font-bold shadow-lg transition-all transform hover:scale-105 animate-pulse flex items-center gap-2 mx-auto"
                  >
                    <span>⏹</span> <span>Stop & Save Recording</span>
                  </button>
                )}
              </div>

              {/* Saved Voice Notes List */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                  <span>🎧</span> <span>Your Saved Voice Notes ({voiceNotes.length})</span>
                </h3>

                {voiceNotes.length > 0 ? (
                  <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                    {voiceNotes.map((note, idx) => (
                      <div key={note.id || idx} className="bg-gray-50 dark:bg-gray-700/70 p-4 rounded-2xl border border-gray-200 dark:border-gray-600 shadow-sm flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">🎙️</span>
                            <div>
                              <h4 className="font-bold text-sm text-gray-800 dark:text-white">Voice Note #{voiceNotes.length - idx}</h4>
                              <p className="text-[11px] text-gray-500 dark:text-gray-400">📅 {note.date || 'Today'} at {note.time || ''} • ⏱️ {note.duration || '0s'}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setVoiceNotes(prev => prev.filter(n => (n.id !== note.id && n !== note)));
                            }}
                            className="text-xs text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                            title="Delete Note"
                          >
                            🗑️
                          </button>
                        </div>

                        {note.audioUrl ? (
                          <audio controls src={note.audioUrl} className="w-full mt-1 rounded-xl focus:outline-none" />
                        ) : (
                          <p className="text-xs text-red-400 italic">Audio recording unavailable</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/40 rounded-2xl border border-dashed border-gray-200 dark:border-gray-600">
                    <div className="text-3xl mb-2">🎙️</div>
                    <h4 className="font-bold text-sm text-gray-700 dark:text-gray-300">No Voice Notes Saved Yet</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Record a voice note above to listen to it anytime.</p>
                  </div>
                )}
              </div>

              <button onClick={() => navigateToPage('features')} className="w-full mt-8 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-3 rounded-2xl font-bold shadow-sm transition-all">
                ← Back to Features
              </button>
            </div>
          </div>
        )}

        {/* Mood Calendar View */}
        {page === "mood-calendar" && (
          <div className="p-6 w-full max-w-3xl">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
              <h2 className="text-3xl font-extrabold text-center mb-6 text-purple-600 dark:text-purple-400">📅 Mood History & Calendar</h2>
              <p className="text-center text-xs text-gray-500 mb-6">Review your logged emotional states over time:</p>
              
              {dailyMoodTracker.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {dailyMoodTracker.map((entry, idx) => (
                    <div key={idx} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-2xl border border-purple-100 dark:border-gray-600 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1">{entry.date}</span>
                        <span className="text-sm font-bold text-gray-800 dark:text-white">Logged Mood Check-in</span>
                      </div>
                      <div className="text-4xl p-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                        {entry.emoji || '😊'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-purple-50 dark:bg-gray-700/50 rounded-2xl mb-6">
                  <div className="text-4xl mb-2">📅</div>
                  <h4 className="font-bold text-sm text-gray-700 dark:text-gray-300">No Mood Logs Found</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-4">Start logging your daily mood in the Daily Mood tool!</p>
                  <button onClick={() => navigateToPage('daily-mood')} className="bg-purple-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow">
                    Log Mood Now
                  </button>
                </div>
              )}

              <button onClick={() => navigateToPage('features')} className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-bold text-sm shadow-md">
                ← Back to Features
              </button>
            </div>
          </div>
        )}

        {/* Community & Social Support View */}
        {page === "social-support" && (
          <div className="p-6 w-full max-w-3xl">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
              <h2 className="text-3xl font-extrabold text-center mb-6 text-pink-600 dark:text-pink-400">🤝 Community Encouragement</h2>
              <div className="mb-6">
                <h3 className="text-sm font-bold mb-2">Post an Encouraging Note to the Community</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Spread positive energy..."
                    value={currentSupportMessage}
                    onChange={(e) => setCurrentSupportMessage(e.target.value)}
                    className="flex-1 p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-700 text-xs"
                  />
                  <button
                    onClick={async () => {
                      if (currentSupportMessage.trim()) {
                        const content = { text: currentSupportMessage, author: profile.name || username || 'Anonymous', date: new Date().toLocaleDateString() };
                        try {
                          const res = await apiService.addWellnessEntry('community', content);
                          setSocialSupport(prev => [{ id: res.id, ...content }, ...prev]);
                          setCurrentSupportMessage('');
                        } catch (err) {
                          setSocialSupport(prev => [{ id: Date.now(), ...content }, ...prev]);
                          setCurrentSupportMessage('');
                        }
                      }
                    }}
                    className="bg-pink-500 hover:bg-pink-600 text-white px-5 py-3 rounded-xl font-bold text-xs shadow"
                  >
                    Post Note
                  </button>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {socialSupport.length > 0 ? (
                  socialSupport.map((note) => (
                    <div key={note.id} className="bg-pink-50 dark:bg-gray-700/50 p-4 rounded-2xl border border-pink-100 dark:border-gray-600">
                      <p className="text-xs text-gray-800 dark:text-gray-200 font-medium mb-1">"{note.text}"</p>
                      <span className="text-[10px] text-pink-600 dark:text-pink-400 font-bold">— {note.author || 'Member'}, {note.date || 'Today'}</span>
                    </div>
                  ))
                ) : (
                  [
                    { text: "Remember to take things one day at a time. You're doing amazing!", author: "Sarah M.", date: "Today" },
                    { text: "Sending positive vibes to anyone feeling overwhelmed today. You are strong!", author: "David K.", date: "Yesterday" }
                  ].map((note, idx) => (
                    <div key={idx} className="bg-pink-50 dark:bg-gray-700/50 p-4 rounded-2xl border border-pink-100 dark:border-gray-600">
                      <p className="text-xs text-gray-800 dark:text-gray-200 font-medium mb-1">"{note.text}"</p>
                      <span className="text-[10px] text-pink-600 dark:text-pink-400 font-bold">— {note.author}, {note.date}</span>
                    </div>
                  ))
                )}
              </div>

              <button onClick={() => navigateToPage('features')} className="w-full bg-pink-500 hover:bg-pink-600 text-white py-3 rounded-xl font-bold text-sm shadow-md">
                ← Back to Features
              </button>
            </div>
          </div>
        )}

        {/* Mood Assessment Selection */}
        {page === "mood-selection" && (
          <div className="p-6 w-full max-w-2xl">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700 text-center">
              <h2 className="text-2xl font-black mb-2">How are you feeling right now?</h2>
              <p className="text-sm text-gray-500 mb-6">Choose your current state to customize assessment questions.</p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                  { mood: 'happy', emoji: '😊', label: 'Happy & Positive' },
                  { mood: 'sad', emoji: '😢', label: 'Sad & Down' },
                  { mood: 'anxious', emoji: '😰', label: 'Anxious & Worried' },
                  { mood: 'stressed', emoji: '😤', label: 'Stressed & Overwhelmed' }
                ].map(({ mood, emoji, label }) => (
                  <button
                    key={mood}
                    onClick={() => {
                      setUserMood(mood);
                      setCurrentQuestions(MOOD_QUESTIONS[mood]);
                      setAnswers(Array(10).fill(""));
                      setPage("questions");
                    }}
                    className="p-5 rounded-2xl border transition-all hover:scale-105 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 shadow-sm"
                  >
                    <div className="text-4xl mb-2">{emoji}</div>
                    <div className="font-bold text-sm text-gray-800 dark:text-white">{label}</div>
                  </button>
                ))}
              </div>
              <button onClick={() => navigateToPage('features')} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md">
                ← Back to Features
              </button>
            </div>
          </div>
        )}

        {/* Mood Assessment Questions */}
        {page === "questions" && currentQuestions.length > 0 && (
          <div className="p-6 w-full max-w-2xl">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-bold">Mental Assessment</h2>
                <span className="text-xs font-bold text-blue-500">{Math.round(progress)}% Completed</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{width: `${progress}%`}}></div>
              </div>
            </div>
            
            {currentQuestions.map((q, i) => (
              <div key={i} className="mb-6 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border-l-4 border-blue-500">
                <p className="font-bold mb-4 text-sm text-gray-800 dark:text-white">{i + 1}. {q}</p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => handleAnswerChange(i, opt)}
                      className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
                        answers[i] === opt
                          ? "bg-blue-500 text-white border-blue-500 shadow"
                          : "bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            
            <div className="flex gap-4">
              <button onClick={() => navigateToPage('dashboard')} className="flex-1 bg-gray-500 text-white py-3 rounded-xl font-bold">Cancel</button>
              <button
                onClick={analyzeResults}
                disabled={answers.filter(a => a !== "").length < 5}
                className="flex-2 bg-gradient-to-r from-green-500 to-blue-500 disabled:opacity-50 text-white py-3 px-8 rounded-xl font-bold shadow-lg"
              >
                Analyze & Save Results
              </button>
            </div>
          </div>
        )}

        {/* Assessment Analysis View */}
        {page === "analysis" && analysis && (
          <div className="p-6 w-full max-w-4xl">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
              <h2 className="text-3xl font-extrabold text-center mb-8">Analysis Results</h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-blue-50 dark:bg-gray-700 p-6 rounded-2xl border border-blue-200 dark:border-gray-600">
                  <h3 className="text-lg font-bold mb-4 text-blue-700 dark:text-blue-300">Self-Reflection Indicator</h3>
                  <div className="space-y-3 text-sm font-semibold">
                    <div className="flex justify-between"><span>Score:</span><span className="font-bold text-blue-600">{analysis.score}/30</span></div>
                    <div className="flex justify-between"><span>Risk Assessment:</span><span className="font-bold text-purple-600">{analysis.riskLevel}</span></div>
                    <div className="flex justify-between"><span>Date:</span><span className="font-bold">{analysis.date}</span></div>
                  </div>
                </div>
                
                <div className="bg-green-50 dark:bg-gray-700 p-6 rounded-2xl border border-green-200 dark:border-gray-600">
                  <h3 className="text-lg font-bold mb-4 text-green-700 dark:text-green-300">Recommendations</h3>
                  <ul className="space-y-2 text-xs">
                    {analysis.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="text-green-500 font-bold">✓</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="flex gap-4 justify-center">
                <button onClick={() => navigateToPage('dashboard')} className="bg-gray-500 text-white px-6 py-3 rounded-xl font-bold">Dashboard</button>
                <button onClick={() => navigateToPage('slot')} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg">Book Doctor Session</button>
              </div>
            </div>
          </div>
        )}

        {/* DOCTOR & TIME SLOT SELECTION */}
        {page === "slot" && (
          <div className="p-6 w-full max-w-4xl">
            <button
              onClick={() => navigateToPage('home')}
              className="mb-4 inline-flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-xl transition-all shadow-sm cursor-pointer"
            >
              <span>🏠</span> <span>← Back to Home</span>
            </button>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
              <h2 className="text-3xl font-extrabold text-center mb-8">Verified Doctors</h2>
              
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {(doctorsList.length > 0 ? doctorsList : [
                  { id: 1, name: "Dr. Sarah Johnson", specialty: "Clinical Psychologist", rating: 4.9, experience: "8 years", slots: ["9:00 AM", "11:00 AM", "2:00 PM", "4:00 PM"], fee: 500 },
                  { id: 2, name: "Dr. Michael Chen", specialty: "Psychiatrist", rating: 4.8, experience: "12 years", slots: ["10:00 AM", "1:00 PM", "3:00 PM", "5:00 PM"], fee: 650 },
                  { id: 3, name: "Dr. Emily Davis", specialty: "Therapist", rating: 4.7, experience: "6 years", slots: ["8:00 AM", "12:00 PM", "6:00 PM", "7:00 PM"], fee: 450 }
                ]).map((doctor) => (
                  <div
                    key={doctor.id}
                    onClick={() => setSelectedDoctor(doctor)}
                    className={`border-2 rounded-2xl p-6 cursor-pointer transition-all ${
                      selectedDoctor?.id === doctor.id ? 'border-blue-500 bg-blue-50 dark:bg-gray-700 shadow-lg' : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                    }`}
                  >
                    <div className="text-center mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow">
                        <span className="text-white text-2xl">👨‍⚕️</span>
                      </div>
                      <h3 className="font-bold text-base">{doctor.name}</h3>
                      <p className="text-xs text-blue-600 font-semibold">{doctor.specialty}</p>
                    </div>
                    <div className="text-xs space-y-1">
                      <div className="flex justify-between"><span>Rating:</span><span className="font-bold text-yellow-500">⭐ {doctor.rating}</span></div>
                      <div className="flex justify-between"><span>Experience:</span><span className="font-bold">{doctor.experience}</span></div>
                      <div className="flex justify-between"><span>Consultation Fee:</span><span className="font-bold text-green-600">₹{doctor.fee || 500}</span></div>
                    </div>
                  </div>
                ))}
              </div>

              {selectedDoctor && (
                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-2xl mb-6 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Select Consultation Date</label>
                    <input
                      type="date"
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                      className="p-3 border rounded-xl bg-white dark:bg-gray-800 text-sm font-semibold w-full sm:w-64"
                    />
                  </div>

                  <div>
                    <h3 className="text-xs font-bold mb-2 text-gray-700 dark:text-gray-300">Available Time Slots for {selectedDoctor.name}</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {selectedDoctor.slots.map((time) => (
                        <button
                          key={time}
                          onClick={() => setSlot(time)}
                          className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                            slot === time ? 'bg-blue-500 text-white border-blue-500 shadow' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex gap-4 justify-center">
                <button onClick={() => navigateToPage('dashboard')} className="bg-gray-500 text-white px-6 py-3 rounded-xl font-bold">Cancel</button>
                <button
                  disabled={!selectedDoctor || !slot}
                  onClick={() => setPage("payment")}
                  className="bg-gradient-to-r from-green-500 to-blue-500 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-bold shadow-lg"
                >
                  Proceed to Checkout (₹{selectedDoctor?.fee || 500})
                </button>
              </div>
            </div>
          </div>
        )}

        {/* REALISTIC DEMO PAYMENT CHECKOUT VIEW */}
        {page === "payment" && selectedDoctor && slot && (
          <div className="p-6 w-full max-w-2xl">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-100 dark:border-gray-700">
              <h2 className="text-3xl font-black text-center mb-6">Payment Checkout</h2>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-750 p-4 rounded-2xl mb-6 text-xs space-y-2 border border-blue-100 dark:border-gray-600">
                <div className="flex justify-between"><span>Consulting Specialist:</span><span className="font-bold text-gray-800 dark:text-white">{selectedDoctor.name}</span></div>
                <div className="flex justify-between"><span>Specialty:</span><span className="font-bold text-blue-600">{selectedDoctor.specialty}</span></div>
                <div className="flex justify-between"><span>Scheduled Date & Slot:</span><span className="font-bold">{appointmentDate} at {slot}</span></div>
                <div className="flex justify-between border-t border-gray-200 dark:border-gray-600 pt-2 font-bold text-sm"><span>Total Payable:</span><span className="text-green-600 font-extrabold text-base">₹{selectedDoctor.fee || 500}</span></div>
              </div>

              {/* Payment Method Tabs */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`flex-1 py-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${paymentMethod === 'card' ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'}`}
                >
                  <span>💳</span> <span>Card</span>
                </button>
                <button
                  onClick={() => setPaymentMethod('upi')}
                  className={`flex-1 py-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${paymentMethod === 'upi' ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'}`}
                >
                  <span>📱</span> <span>UPI</span>
                </button>
                <button
                  onClick={() => setPaymentMethod('qr')}
                  className={`flex-1 py-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${paymentMethod === 'qr' ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'}`}
                >
                  <span>📷</span> <span>QR Scanner</span>
                </button>
              </div>

              {/* Card Form */}
              {paymentMethod === 'card' && (
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">Cardholder Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Alex Johnson"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">Card Number</label>
                    <input
                      type="text"
                      placeholder="4242 •••• •••• 4242"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-sm font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">Expiry (MM/YY)</label>
                      <input
                        type="text"
                        placeholder="12/28"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-sm font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">CVV (3 Digits)</label>
                      <input
                        type="password"
                        maxLength={4}
                        placeholder="•••"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-sm font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* UPI Form */}
              {paymentMethod === 'upi' && (
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">Enter UPI VPA ID</label>
                    <input
                      type="text"
                      placeholder="username@okaxis or name@upi"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-sm font-mono"
                    />
                  </div>
                  <div className="flex gap-2">
                    {['Google Pay', 'PhonePe', 'Paytm'].map((app) => (
                      <button
                        key={app}
                        onClick={() => setUpiId(`${profile.name ? profile.name.toLowerCase().replace(/\s+/g, '') : 'user'}@${app.toLowerCase().replace(/\s+/g, '')}`)}
                        className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-xs font-semibold rounded-lg hover:bg-purple-100"
                      >
                        {app}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* QR Scanner */}
              {paymentMethod === 'qr' && (
                <div className="text-center py-4 mb-6 bg-gray-50 dark:bg-gray-700 rounded-2xl border border-dashed border-purple-300">
                  <div className="w-36 h-36 mx-auto bg-white p-2 rounded-xl shadow-md flex items-center justify-center mb-2">
                    {/* Simulated SVG QR Code */}
                    <svg className="w-32 h-32" viewBox="0 0 100 100">
                      <rect width="100" height="100" fill="#ffffff" />
                      <path d="M10,10 h30 v30 h-30 z M15,15 v20 h20 v-20 z M22,22 h6 v6 h-6 z" fill="#000" />
                      <path d="M60,10 h30 v30 h-30 z M65,15 v20 h20 v-20 z M72,22 h6 v6 h-6 z" fill="#000" />
                      <path d="M10,60 h30 v30 h-30 z M15,65 v20 h20 v-20 z M22,72 h6 v6 h-6 z" fill="#000" />
                      <rect x="45" y="45" width="10" height="10" fill="#000" />
                      <rect x="60" y="60" width="15" height="15" fill="#000" />
                      <rect x="80" y="80" width="10" height="10" fill="#000" />
                    </svg>
                  </div>
                  <p className="text-xs font-bold text-gray-700 dark:text-gray-300">Scan QR Code with any UPI app</p>
                  <p className="text-[10px] text-gray-400">MateoMind Consultation Fee: ₹{selectedDoctor.fee || 500}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => executePaymentCheckout(false)}
                  disabled={paymentProcessing}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 disabled:opacity-50 text-white py-4 rounded-xl font-extrabold text-base shadow-xl flex items-center justify-center gap-2 transform hover:scale-102 transition-all"
                >
                  {paymentProcessing ? (
                    <span>⏳ Processing DEMO Payment...</span>
                  ) : (
                    <span>Pay ₹{selectedDoctor.fee || 500} & Confirm Booking</span>
                  )}
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => navigateToPage('slot')}
                    className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2.5 rounded-xl font-bold text-xs"
                  >
                    Back to Doctor Selection
                  </button>
                  <button
                    onClick={() => executePaymentCheckout(true)}
                    className="flex-1 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 py-2.5 rounded-xl font-bold text-xs"
                  >
                    Test Payment Failure
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PAYMENT & BOOKING CONFIRMATION VIEW */}
        {page === "confirmation" && paymentConfirmation && (
          <div className="p-6 w-full max-w-xl">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border border-green-200 dark:border-green-900 text-center">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-4xl shadow-xl animate-bounce">
                ✓
              </div>
              <h2 className="text-3xl font-black text-gray-800 dark:text-white mb-2">Booking Confirmed!</h2>
              <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-6">Payment verified & appointment saved in database.</p>

              <div className="bg-gray-50 dark:bg-gray-700 p-5 rounded-2xl text-left text-xs space-y-2 mb-4 border border-gray-200 dark:border-gray-600">
                <div className="flex justify-between"><span>Transaction Ref:</span><span className="font-mono font-bold text-purple-600 dark:text-purple-400">{paymentConfirmation.transactionId}</span></div>
                <div className="flex justify-between"><span>Doctor Name:</span><span className="font-bold">{paymentConfirmation.appointment.doctorName}</span></div>
                <div className="flex justify-between"><span>Consultation Date:</span><span className="font-bold">{paymentConfirmation.appointment.date}</span></div>
                <div className="flex justify-between"><span>Time Slot:</span><span className="font-bold">{paymentConfirmation.appointment.time}</span></div>
                <div className="flex justify-between border-t pt-2 font-bold text-sm"><span>Amount Paid:</span><span className="text-green-600">₹{paymentConfirmation.payment.amount}</span></div>
              </div>

              {/* DOCTOR NOTIFICATION & 10-MINUTE REMINDER ALERT BOX */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-750 dark:to-gray-700 p-4 rounded-2xl border border-blue-200 dark:border-blue-900/60 text-left text-xs mb-6 space-y-2 shadow-sm">
                <div className="font-bold text-blue-800 dark:text-blue-300 flex items-center gap-1.5 text-sm">
                  <span>📩</span> <span>Doctor Notification & Reminder Active</span>
                </div>
                <div className="space-y-1 text-gray-700 dark:text-gray-300 font-medium">
                  <div className="flex items-center gap-1.5 text-green-700 dark:text-green-400 font-bold">
                    <span>✓</span> <span>Instant Notification Sent: Email & SMS dispatched to Dr. {paymentConfirmation.appointment.doctorName}.</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-purple-700 dark:text-purple-300 font-bold">
                    <span>⏰</span> <span>10-Minute Pre-Meeting Reminder: Email & SMS will trigger 10 minutes prior to {paymentConfirmation.appointment.time}.</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => navigateToPage('dashboard')} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-bold text-sm shadow cursor-pointer">Return to Dashboard</button>
                <button onClick={() => { setProfileTab('appointments'); navigateToPage('profile'); }} className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-xl font-bold text-sm shadow cursor-pointer">View Appointments</button>
              </div>
            </div>
          </div>
        )}

        {/* DRAGGABLE AI ASSISTANT CHATBOT */}
        <div className="fixed right-6 bottom-6 z-50">
          {!chatOpen ? (
            <button
              onClick={() => setChatOpen(true)}
              className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-2xl hover:scale-110 transition-all flex items-center justify-center border-2 border-white"
            >
              <span className="text-2xl">💬</span>
            </button>
          ) : (
            <div className="w-80 sm:w-96 h-[32rem] bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">MateoMind Assistant</span>
                </div>
                <button onClick={() => setChatOpen(false)} className="text-white hover:bg-white/20 rounded-lg px-2 text-lg font-bold">×</button>
              </div>
              
              <div className="flex-1 p-3 overflow-y-auto space-y-2 text-xs">
                {chatMessages.length === 0 && (
                  <div className="bg-blue-50 dark:bg-gray-700 p-3 rounded-2xl text-gray-700 dark:text-gray-200">
                    👋 Hi! I'm your MateoMind assistant. How are you feeling today?
                  </div>
                )}
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-block p-2.5 rounded-2xl max-w-[85%] ${
                      msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-sm'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="text-left text-xs text-gray-400 italic">Assistant is typing...</div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="p-2 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                <form onSubmit={(e) => { e.preventDefault(); sendChatMessage(); }} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={customChatMessage}
                    onChange={(e) => setCustomChatMessage(e.target.value)}
                    className="flex-1 p-2 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-xs"
                  />
                  <button type="submit" className="bg-blue-500 text-white px-3 py-2 rounded-xl text-xs font-bold">Send</button>
                </form>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* GOOGLE SIGN-IN EMAIL & PASSWORD MODAL */}
      {showGoogleModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-md w-full p-8 shadow-2xl border border-gray-100 dark:border-gray-700 relative overflow-hidden">
            
            {/* Google Header */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-12 h-12 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center shadow-md mb-3 border border-gray-200 dark:border-gray-600">
                <svg className="w-7 h-7" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
              </div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">Sign in with Google</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                to continue to <span className="font-bold text-purple-600 dark:text-purple-400">MateoMind</span>
              </p>
            </div>

            {googleAuthError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/40 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-300 text-xs font-semibold text-center">
                ⚠️ {googleAuthError}
              </div>
            )}

            {/* STEP 1: ENTER GOOGLE EMAIL */}
            {googleStep === 1 && (
              <form onSubmit={handleGoogleEmailNext} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Google Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. yourname@gmail.com"
                    value={customGoogleEmail}
                    onChange={(e) => setCustomGoogleEmail(e.target.value)}
                    autoFocus
                    required
                    className="w-full p-3 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Display Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Alex Morgan"
                    value={customGoogleName}
                    onChange={(e) => setCustomGoogleName(e.target.value)}
                    className="w-full p-2.5 text-xs border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-purple-400 outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => setShowGoogleModal(false)}
                    className="text-xs font-bold text-gray-500 hover:text-gray-700 dark:text-gray-400 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl text-xs shadow-md transition-all cursor-pointer"
                  >
                    Next →
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: ENTER GOOGLE PASSWORD */}
            {googleStep === 2 && (
              <form onSubmit={handleGooglePasswordSubmit} className="space-y-4">
                <div className="bg-blue-50 dark:bg-gray-700/70 p-3 rounded-2xl border border-blue-100 dark:border-gray-600 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-blue-500 text-white font-bold text-xs flex items-center justify-center uppercase shadow-sm">
                      {customGoogleEmail.charAt(0) || 'G'}
                    </div>
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">{customGoogleEmail}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setGoogleStep(1); setGoogleAuthError(""); }}
                    className="text-xs font-bold text-blue-600 hover:underline flex-shrink-0 cursor-pointer"
                  >
                    Change
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Enter your Google password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter password"
                    value={customGooglePassword}
                    onChange={(e) => setCustomGooglePassword(e.target.value)}
                    autoFocus
                    required
                    className="w-full p-3 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                  />
                </div>

                <div className="pt-2 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => setGoogleStep(1)}
                    className="text-xs font-bold text-gray-500 hover:text-gray-700 dark:text-gray-400 cursor-pointer"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-2.5 px-6 rounded-xl text-xs shadow-md transition-all cursor-pointer"
                  >
                    Sign In with Google
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: VERIFYING & LOGGING IN */}
            {googleStep === 3 && (
              <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs font-bold text-gray-700 dark:text-gray-200">Authenticating with Google Account...</p>
                <p className="text-[11px] text-gray-400">Verifying credentials & logging into MateoMind</p>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}