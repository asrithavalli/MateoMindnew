<script setup>
import { ref, onMounted, computed } from 'vue'
// Firebase imports temporarily disabled
// import { signInWithPopup } from 'firebase/auth'
// import { auth, googleProvider } from './firebase.js'

// Types and interfaces
const AGE_GROUPS = ['16-18', '19-24', '25-29', '30-36', '37-39+']

const MOOD_QUESTIONS = {
  happy: [
    { id: 1, question: "I feel energetic and motivated in my daily activities", category: "energy" },
    { id: 2, question: "I enjoy social interactions and connecting with others", category: "social" },
    { id: 3, question: "I feel confident about my future and goals", category: "confidence" },
    { id: 4, question: "I sleep well and wake up refreshed", category: "sleep" },
    { id: 5, question: "I feel grateful for the positive things in my life", category: "gratitude" },
    { id: 6, question: "I handle stress and challenges effectively", category: "coping" },
    { id: 7, question: "I feel connected to my friends and family", category: "relationships" },
    { id: 8, question: "I enjoy my daily activities and hobbies", category: "engagement" },
    { id: 9, question: "I feel optimistic when facing new challenges", category: "optimism" },
    { id: 10, question: "I maintain healthy relationships with others", category: "social-health" }
  ],
  sad: [
    { id: 1, question: "I feel sad or hopeless frequently throughout the day", category: "depression" },
    { id: 2, question: "I lose interest in activities I usually enjoy", category: "anhedonia" },
    { id: 3, question: "I feel tired or have little energy most days", category: "energy" },
    { id: 4, question: "I feel worthless or guilty about things", category: "self-worth" },
    { id: 5, question: "I have trouble falling or staying asleep", category: "sleep" },
    { id: 6, question: "I feel socially isolated from others", category: "isolation" },
    { id: 7, question: "I have difficulty concentrating on tasks", category: "concentration" },
    { id: 8, question: "I cry often or feel like crying", category: "emotional" },
    { id: 9, question: "I feel overwhelmed by daily tasks", category: "overwhelm" },
    { id: 10, question: "I have thoughts of self-harm or suicide", category: "suicidal" }
  ],
  anxious: [
    { id: 1, question: "I feel nervous, anxious, or on edge", category: "anxiety" },
    { id: 2, question: "I have trouble relaxing or calming down", category: "relaxation" },
    { id: 3, question: "I worry too much about different things", category: "worry" },
    { id: 4, question: "I experience panic attacks or intense fear", category: "panic" },
    { id: 5, question: "I feel restless or keyed up", category: "restlessness" },
    { id: 6, question: "I have trouble controlling my worry", category: "control" },
    { id: 7, question: "I feel like something awful might happen", category: "catastrophic" },
    { id: 8, question: "I avoid situations that make me anxious", category: "avoidance" },
    { id: 9, question: "I have physical symptoms of anxiety (racing heart, sweating)", category: "physical" },
    { id: 10, question: "I overthink or dwell on negative thoughts", category: "rumination" }
  ],
  stressed: [
    { id: 1, question: "I feel pressure to achieve academically", category: "academic-stress" },
    { id: 2, question: "I feel angry or irritable often", category: "irritability" },
    { id: 3, question: "I have difficulty concentrating on my work", category: "concentration" },
    { id: 4, question: "I feel overwhelmed by my responsibilities", category: "overwhelm" },
    { id: 5, question: "I have trouble managing my time effectively", category: "time-management" },
    { id: 6, question: "I feel burned out from work or studies", category: "burnout" },
    { id: 7, question: "I have headaches or muscle tension", category: "physical" },
    { id: 8, question: "I feel like I can't keep up with demands", category: "pressure" },
    { id: 9, question: "I snap at people easily or lose my temper", category: "anger" },
    { id: 10, question: "I use substances to cope with stress", category: "substance" }
  ]
}

const RESPONSE_OPTIONS = [
  { label: "Not at all", value: 0 },
  { label: "Several days", value: 1 },
  { label: "More than half the days", value: 2 },
  { label: "Nearly every day", value: 3 },
  { label: "Other (please describe)", value: "other" }
]

const MOCK_DOCTORS = [
  {
    id: 1,
    name: "Dr. Priya Sharma",
    specialization: "Clinical Psychologist",
    experience: "8 years",
    rating: 4.8,
    availability: generateTimeSlots()
  },
  {
    id: 2,
    name: "Dr. Rajesh Kumar",
    specialization: "Psychiatrist",
    experience: "12 years",
    rating: 4.9,
    availability: generateTimeSlots()
  },
  {
    id: 3,
    name: "Dr. Anjali Mehta",
    specialization: "Counseling Psychologist",
    experience: "6 years",
    rating: 4.7,
    availability: generateTimeSlots()
  }
]

function generateTimeSlots() {
  const slots = []
  const today = new Date()
  
  for (let day = 1; day <= 7; day++) {
    const date = new Date(today)
    date.setDate(today.getDate() + day)
    
    const times = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"]
    times.forEach(time => {
      slots.push({
        id: `${date.toDateString()}-${time}`,
        date: date.toDateString(),
        time,
        available: Math.random() > 0.3
      })
    })
  }
  return slots
}

const CRISIS_THRESHOLDS = {
  MILD_STRESS: 5,
  MODERATE_STRESS: 10,
  SEVERE_STRESS: 20,
  CRITICAL_STRESS: 30,
  HIGH_RISK_SCORE: 15
}

const EMERGENCY_CONTACTS = {
  suicide: { number: '988', name: 'Suicide & Crisis Lifeline' },
  emergency: { number: '911', name: 'Emergency Services' },
  campus: { number: '1-800-CAMPUS', name: 'Campus Crisis Line' }
}

function checkCrisisIndicators(responses) {
  const crisisKeywords = ['suicide', 'kill myself', 'end it all', 'self harm', 'hurt myself']
  const suicidalResponse = Object.values(responses).find(r => 
    r.note && crisisKeywords.some(keyword => r.note.toLowerCase().includes(keyword))
  )
  
  const selfHarmQuestion = currentQuestions.value.find(q => q.category === 'suicidal')
  const selfHarmResponse = selfHarmQuestion ? responses[selfHarmQuestion.id] : null
  
  return {
    hasCrisisIndicators: !!(suicidalResponse || (selfHarmResponse && selfHarmResponse.value > 0)),
    crisisType: suicidalResponse ? 'textual' : 'response'
  }
}

function analyzeAssessment(responses) {
  let totalScore = 0
  let categoryScores = {}
  let moodTags = []
  
  currentQuestions.value.forEach(q => {
    const response = responses[q.id]
    if (response && typeof response.value === 'number') {
      totalScore += response.value
      categoryScores[q.category] = (categoryScores[q.category] || 0) + response.value
    }
  })

  const maxScore = currentQuestions.value.length * 3
  const percentage = Math.round((totalScore / maxScore) * 100)

  let severity = "Minimal"
  let stressLevel = "Low"
  let riskLevel = "Low"

  if (totalScore >= CRISIS_THRESHOLDS.MILD_STRESS && totalScore < CRISIS_THRESHOLDS.MODERATE_STRESS) severity = "Mild"
  else if (totalScore >= CRISIS_THRESHOLDS.MODERATE_STRESS && totalScore < CRISIS_THRESHOLDS.SEVERE_STRESS) severity = "Moderate"
  else if (totalScore >= CRISIS_THRESHOLDS.SEVERE_STRESS && totalScore < CRISIS_THRESHOLDS.CRITICAL_STRESS) severity = "Moderately Severe"
  else if (totalScore >= CRISIS_THRESHOLDS.CRITICAL_STRESS) severity = "Severe"

  if (percentage >= 30 && percentage < 60) stressLevel = "Moderate"
  else if (percentage >= 60) stressLevel = "High"

  const crisisCheck = checkCrisisIndicators(responses)
  const needsUrgentCare = crisisCheck.hasCrisisIndicators || totalScore >= 25
  
  if (needsUrgentCare) riskLevel = "High"
  else if (totalScore >= CRISIS_THRESHOLDS.HIGH_RISK_SCORE) riskLevel = "Moderate"

  Object.entries(categoryScores).forEach(([category, score]) => {
    if (score >= 4) {
      switch (category) {
        case 'depression': moodTags.push('Depressed'); break
        case 'anxiety': moodTags.push('Anxious'); break
        case 'academic-stress': moodTags.push('Academically Stressed'); break
        case 'social': moodTags.push('Socially Withdrawn'); break
        case 'sleep': moodTags.push('Sleep Disturbed'); break
      }
    }
  })

  const recommendations = generateRecommendations(categoryScores, severity, needsUrgentCare)

  return {
    totalScore,
    percentage,
    severity,
    stressLevel,
    moodTags,
    riskLevel,
    recommendations,
    needsUrgentCare,
    crisisIndicators: crisisCheck
  }
}

function generateRecommendations(categoryScores, severity, urgent) {
  const recommendations = []

  if (urgent) {
    recommendations.push("🚨 Immediate professional consultation recommended")
    recommendations.push("📞 Contact campus counseling center or emergency helpline")
  }

  if (categoryScores.anxiety >= 3) {
    recommendations.push("🧘 Practice deep breathing exercises (4-7-8 technique)")
    recommendations.push("🎵 Try progressive muscle relaxation audio guides")
  }

  if (categoryScores.depression >= 3) {
    recommendations.push("☀️ Maintain regular sleep schedule and sunlight exposure")
    recommendations.push("🏃 Engage in light physical activity daily")
    recommendations.push("👥 Connect with trusted friends or family members")
  }

  if (categoryScores['academic-stress'] >= 3) {
    recommendations.push("📚 Break study sessions into 25-minute focused blocks")
    recommendations.push("🎯 Set realistic daily and weekly academic goals")
    recommendations.push("🤝 Form study groups with classmates")
  }

  if (categoryScores.sleep >= 2) {
    recommendations.push("📱 Avoid screens 1 hour before bedtime")
    recommendations.push("☕ Limit caffeine intake after 2 PM")
    recommendations.push("🛏️ Create a consistent bedtime routine")
  }

  if (severity === "Moderate" || severity === "Moderately Severe") {
    recommendations.push("💊 Consider professional therapy (CBT/DBT)")
    recommendations.push("📝 Keep a daily mood and activity journal")
  }

  return recommendations
}

function triggerCrisisIntervention(crisisType = 'general') {
  showCrisisModal.value = true
  crisisModalType.value = crisisType
  
  // Log crisis event for professional review
  const crisisLog = {
    timestamp: new Date().toISOString(),
    userId: user.value?.id,
    type: crisisType,
    context: 'ai_chat'
  }
  
  const existingLogs = JSON.parse(localStorage.getItem('mh_crisis_logs') || '[]')
  existingLogs.push(crisisLog)
  localStorage.setItem('mh_crisis_logs', JSON.stringify(existingLogs))
}

function generateAIResponse(input, analysis) {
  const text = input.toLowerCase()
  
  if (text.includes('suicide') || text.includes('kill myself') || text.includes('end it all')) {
    triggerCrisisIntervention('suicide')
    return `🚨 CRISIS ALERT: I'm very concerned about you. Please contact emergency services immediately:\n\n• ${EMERGENCY_CONTACTS.suicide.name}: ${EMERGENCY_CONTACTS.suicide.number}\n• ${EMERGENCY_CONTACTS.emergency.name}: ${EMERGENCY_CONTACTS.emergency.number}\n\nYou matter and help is available right now.`
  }

  if (text.includes('self harm') || text.includes('hurt myself')) {
    triggerCrisisIntervention('self_harm')
    return `⚠️ I'm worried about you. Self-harm indicates you're struggling with difficult emotions. Please reach out for immediate support:\n\n• ${EMERGENCY_CONTACTS.campus.name}: ${EMERGENCY_CONTACTS.campus.number}\n• Text HOME to 741741 for Crisis Text Line`
  }

  if (analysis?.needsUrgentCare) {
    return `Based on your assessment, I recommend immediate professional support. Try this grounding technique now: name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste. Contact: ${EMERGENCY_CONTACTS.campus.number}`
  }

  if (text.includes('anxious') || text.includes('anxiety') || text.includes('panic')) {
    return "Try this breathing exercise: Inhale for 4 counts, hold for 7, exhale for 8. Repeat 3 times. Anxiety is temporary and manageable. If symptoms persist, consider professional support."
  }

  if (text.includes('depressed') || text.includes('sad') || text.includes('hopeless')) {
    return "Depression can make everything feel harder, but you're not alone. Small steps help: get sunlight, talk to someone you trust, maintain routine. Professional support is available if needed."
  }

  if (text.includes('sleep') || text.includes('insomnia') || text.includes('tired')) {
    return "Sleep impacts mental health significantly. Create a wind-down routine: dim lights 1 hour before bed, avoid screens, try reading or gentle stretching."
  }

  if (text.includes('study') || text.includes('exam') || text.includes('academic')) {
    return "Academic stress is common. Break work into 25-minute focused blocks (Pomodoro Technique). Set realistic goals and remember: your worth isn't defined by grades."
  }

  const supportiveResponses = [
    "I'm here to support you. What's been on your mind lately?",
    "Thank you for sharing. How are you feeling right now?",
    "It sounds challenging. What would be most helpful right now?",
    "Reaching out shows strength. How can I best support you today?"
  ]

  return supportiveResponses[Math.floor(Math.random() * supportiveResponses.length)]
}

// Reactive state
const currentPage = ref('welcome')
const user = ref(null)
const userMood = ref('')
const currentQuestions = ref([])
const responses = ref({})
const analysis = ref(null)
const assessmentHistory = ref([])
const doctors = ref(MOCK_DOCTORS)
const currentQuestion = ref(0)
const showDescription = ref(null)
const selectedDoctor = ref(null)
const selectedSlot = ref(null)
const selectedDate = ref('')
const selectedTime = ref('')
const bookingConfirmed = ref(false)
const isAvatarOpen = ref(false)
const showMoodSelection = ref(false)
const showSubscription = ref(false)
const selectedPlan = ref('')
const showPayment = ref(false)
const selectedPaymentMethod = ref('')
const showCardForm = ref(false)
const cardDetails = ref({ number: '', expiry: '', cvv: '', name: '' })
const showProfile = ref(false)
const profileForm = ref({ name: '', age: '', phone: '', gender: 'male', dob: '', photo: null })
const showResources = ref(false)
const selectedResourceType = ref('')
const showCrisisModal = ref(false)
const crisisModalType = ref('general')
const showErrorMessage = ref(false)
const errorMessage = ref('')

// Format card number with spaces
const formatCardNumber = (value) => {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
  const matches = v.match(/\d{4,16}/g)
  const match = matches && matches[0] || ''
  const parts = []
  for (let i = 0, len = match.length; i < len; i += 4) {
    parts.push(match.substring(i, i + 4))
  }
  if (parts.length) {
    return parts.join(' ')
  } else {
    return v
  }
}

// Format expiry date
const formatExpiry = (value) => {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
  if (v.length >= 2) {
    return v.substring(0, 2) + '/' + v.substring(2, 4)
  }
  return v
}
const messages = ref([
  {
    from: 'bot',
    text: "Hi! I'm your AI mental health assistant. I'm here to provide support, coping strategies, and help you navigate your mental health journey. How are you feeling today?",
    timestamp: new Date()
  }
])
const inputText = ref('')

// Form data
const loginForm = ref({ email: '', password: '' })
const registerForm = ref({ name: '', email: '', password: '', ageGroup: '19-24', gender: 'male' })

// Profile image generator
const generateProfileImage = (gender, name) => {
  const maleAvatars = ['👨', '🧑', '👦', '🙋‍♂️', '🧔']
  const femaleAvatars = ['👩', '👧', '🙋‍♀️', '👩‍🦱', '👩‍🦳']
  
  const avatars = gender === 'female' ? femaleAvatars : maleAvatars
  const nameHash = name.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
  return avatars[nameHash % avatars.length]
}

// Computed properties
const progress = computed(() => ((currentQuestion.value + 1) / (currentQuestions.value.length || 1)) * 100)
const currentQuestionData = computed(() => currentQuestions.value[currentQuestion.value])
const userBookings = computed(() => {
  try {
    const bookings = JSON.parse(localStorage.getItem('mh_bookings') || '[]')
    return bookings.filter(b => b.userId === user.value?.id).slice(-3)
  } catch {
    return []
  }
})

// Methods
const handleLogin = (userData) => {
  user.value = userData
  localStorage.setItem('mh_user', JSON.stringify(userData))
  currentPage.value = 'dashboard'
}

const handleLogout = () => {
  user.value = null
  localStorage.removeItem('mh_user')
  currentPage.value = 'welcome'
}

const login = () => {
  if (loginForm.value.email && loginForm.value.password) {
    const userData = {
      id: Date.now().toString(),
      name: loginForm.value.email.split('@')[0],
      email: loginForm.value.email,
      ageGroup: '19-24'
    }
    handleLogin(userData)
  }
}

const register = () => {
  if (registerForm.value.name && registerForm.value.email && registerForm.value.password) {
    const userData = {
      id: Date.now().toString(),
      ...registerForm.value,
      avatar: generateProfileImage(registerForm.value.gender, registerForm.value.name),
      phone: '',
      dob: '',
      photo: null
    }
    handleLogin(userData)
  }
}

const updateProfile = () => {
  if (user.value) {
    user.value = { ...user.value, ...profileForm.value }
    localStorage.setItem('mh_user', JSON.stringify(user.value))
    showProfile.value = false
  }
}

const handlePhotoUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      profileForm.value.photo = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const loginWithGoogle = async () => {
  // Simulate Google login for now
  const userData = {
    id: 'google_' + Date.now(),
    name: 'Google User',
    email: 'user@gmail.com',
    ageGroup: '19-24',
    avatar: '👤',
    provider: 'google',
    phone: '',
    dob: '',
    photo: null
  }
  handleLogin(userData)
}

const processPayment = () => {
  try {
    if (selectedPaymentMethod.value === 'phonepe') {
      window.location.href = 'phonepe://pay'
      setTimeout(() => {
        showPayment.value = false
        showSubscription.value = false
        showError('Payment successful! You can now book appointments.')
      }, 2000)
    } else if (selectedPaymentMethod.value === 'paytm') {
      window.location.href = 'paytmmp://pay'
      setTimeout(() => {
        showPayment.value = false
        showSubscription.value = false
        showError('Payment successful! You can now book appointments.')
      }, 2000)
    } else if (selectedPaymentMethod.value === 'card') {
      showCardForm.value = true
    }
  } catch (error) {
    showError('Payment processing failed. Please try again.')
  }
}

const showError = (message) => {
  errorMessage.value = message
  showErrorMessage.value = true
  setTimeout(() => showErrorMessage.value = false, 5000)
}

const processCardPayment = () => {
  // Validate all required fields
  if (!cardDetails.value.name.trim()) {
    showError('Please enter cardholder name')
    return
  }
  if (!cardDetails.value.number.replace(/\s/g, '') || cardDetails.value.number.replace(/\s/g, '').length !== 16) {
    showError('Please enter a valid 16-digit card number')
    return
  }
  if (!cardDetails.value.expiry || !/^\d{2}\/\d{2}$/.test(cardDetails.value.expiry)) {
    showError('Please enter expiry date in MM/YY format')
    return
  }
  if (!cardDetails.value.cvv || cardDetails.value.cvv.length !== 3) {
    showError('Please enter a valid 3-digit CVV')
    return
  }
  
  // Process payment
  showCardForm.value = false
  showPayment.value = false
  showSubscription.value = false
  cardDetails.value = { number: '', expiry: '', cvv: '', name: '' }
  showError('Payment successful! You can now book appointments.')
}

const handleResponse = (questionId, value, note = '') => {
  responses.value[questionId] = { value, note }
}

const selectMood = (mood) => {
  userMood.value = mood
  currentQuestions.value = MOOD_QUESTIONS[mood]
  responses.value = {}
  currentQuestion.value = 0
  showMoodSelection.value = false
}

const nextQuestion = () => {
  if (currentQuestion.value < currentQuestions.value.length - 1) {
    currentQuestion.value++
    showDescription.value = null
  } else {
    completeAssessment()
  }
}

const prevQuestion = () => {
  if (currentQuestion.value > 0) {
    currentQuestion.value--
    showDescription.value = null
  }
}

const completeAssessment = () => {
  const result = analyzeAssessment(responses.value)
  analysis.value = result
  
  // Add to assessment history
  const historyEntry = {
    id: Date.now().toString(),
    date: new Date().toISOString().split('T')[0],
    mood: userMood.value,
    score: result.totalScore,
    severity: result.severity,
    timestamp: new Date().toISOString()
  }
  
  assessmentHistory.value.push(historyEntry)
  localStorage.setItem('mh_history', JSON.stringify(assessmentHistory.value))
  
  const anonymousData = {
    id: Date.now().toString(),
    ageGroup: user.value?.ageGroup,
    score: result.totalScore,
    severity: result.severity,
    timestamp: new Date().toISOString()
  }
  
  const existingData = JSON.parse(localStorage.getItem('mh_analytics') || '[]')
  existingData.push(anonymousData)
  localStorage.setItem('mh_analytics', JSON.stringify(existingData))
  
  // Clear responses after completion
  responses.value = {}
  currentQuestions.value = []
  userMood.value = ''
  currentQuestion.value = 0
  showMoodSelection.value = false
  
  currentPage.value = 'analysis'
}

const bookAppointment = () => {
  if (selectedDoctor.value && selectedDate.value && selectedTime.value && user.value) {
    const booking = {
      id: Date.now().toString(),
      userId: user.value.id,
      doctorId: selectedDoctor.value.id,
      doctorName: selectedDoctor.value.name,
      date: selectedDate.value,
      time: selectedTime.value,
      status: 'confirmed',
      createdAt: new Date().toISOString()
    }

    const existingBookings = JSON.parse(localStorage.getItem('mh_bookings') || '[]')
    existingBookings.push(booking)
    localStorage.setItem('mh_bookings', JSON.stringify(existingBookings))

    bookingConfirmed.value = true
    selectedDoctor.value = null
    selectedDate.value = ''
    selectedTime.value = ''
  }
}

const sendMessage = () => {
  if (!inputText.value.trim()) return

  const userMessage = {
    from: 'user',
    text: inputText.value,
    timestamp: new Date()
  }

  messages.value.push(userMessage)
  const currentInput = inputText.value
  inputText.value = ''

  setTimeout(() => {
    const botResponse = {
      from: 'bot',
      text: generateAIResponse(currentInput, analysis.value),
      timestamp: new Date()
    }
    messages.value.push(botResponse)
  }, 1000)
}

// Lifecycle
onMounted(() => {
  const savedUser = localStorage.getItem('mh_user')
  if (savedUser) {
    user.value = JSON.parse(savedUser)
    profileForm.value = {
      name: user.value.name || '',
      age: user.value.age || '',
      phone: user.value.phone || '',
      gender: user.value.gender || 'male',
      dob: user.value.dob || '',
      photo: user.value.photo || null
    }
    currentPage.value = 'dashboard'
  }
  
  const savedHistory = localStorage.getItem('mh_history')
  if (savedHistory) {
    assessmentHistory.value = JSON.parse(savedHistory)
  }
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <!-- Header -->
    <header v-if="user" class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <div class="flex items-center space-x-4">
            <div class="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-lg">M</span>
            </div>
            <div>
              <h1 class="text-xl font-bold text-gray-900">MateoMind</h1>
              <p class="text-sm text-gray-600">Digital Mental Health Support System</p>
            </div>
          </div>
          
          <nav v-if="user" class="flex items-center space-x-6">
            <div class="flex items-center space-x-3 mr-4">
              <div class="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-lg">
                {{ user.avatar || '👤' }}
              </div>
              <span class="text-sm text-gray-700">Welcome, {{ user.name }}</span>
            </div>
            <button @click="currentPage = 'dashboard'" class="w-12 h-12 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 hover:text-blue-800 transition-all transform hover:scale-110 flex items-center justify-center" title="Dashboard">
              🏠
            </button>
            <button @click="currentPage = 'assessment'" class="w-12 h-12 rounded-full bg-green-100 hover:bg-green-200 text-green-600 hover:text-green-800 transition-all transform hover:scale-110 flex items-center justify-center" title="Assessment">
              📋
            </button>
            <button @click="currentPage = 'analysis'" v-if="analysis" class="w-12 h-12 rounded-full bg-purple-100 hover:bg-purple-200 text-purple-600 hover:text-purple-800 transition-all transform hover:scale-110 flex items-center justify-center" title="Results">
              📊
            </button>
            <button @click="currentPage = 'booking'" class="w-12 h-12 rounded-full bg-yellow-100 hover:bg-yellow-200 text-yellow-600 hover:text-yellow-800 transition-all transform hover:scale-110 flex items-center justify-center" title="Book Doctor">
              👨‍⚕️
            </button>
            <button @click="currentPage = 'about'" class="w-12 h-12 rounded-full bg-indigo-100 hover:bg-indigo-200 text-indigo-600 hover:text-indigo-800 transition-all transform hover:scale-110 flex items-center justify-center" title="About Us">
              ℹ️
            </button>
            <button @click="handleLogout" class="w-12 h-12 rounded-full bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-800 transition-all transform hover:scale-110 flex items-center justify-center ml-2" title="Logout">
              🚪
            </button>
          </nav>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Welcome Page -->
      <div v-if="currentPage === 'welcome'" class="text-center">
        <div class="max-w-3xl mx-auto">
          <div class="mb-8">
            <div class="w-24 h-24 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <span class="text-white text-4xl font-bold">🧠</span>
            </div>
            <h1 class="text-4xl font-bold text-gray-900 mb-4">Welcome to MateoMind</h1>
            <p class="text-xl text-gray-600 mb-4">Your comprehensive digital mental health and psychological support system designed specifically for students in higher education.</p>
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
              <div class="flex items-start">
                <div class="text-yellow-600 mr-3 mt-1">⚠️</div>
                <div class="text-sm text-yellow-800">
                  <p class="font-semibold mb-1">Important Safety Notice:</p>
                  <p>This platform provides support tools but is not a substitute for professional medical care. In crisis situations, contact emergency services immediately (911) or the Suicide & Crisis Lifeline (988).</p>
                </div>
              </div>
            </div>
          </div>

          <div class="grid md:grid-cols-2 gap-8 mb-12 max-w-4xl mx-auto">
            <div class="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div class="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-6 mx-auto">
                <span class="text-3xl">🤖</span>
              </div>
              <h3 class="text-xl font-semibold mb-3 text-center">AI-Powered Support</h3>
              <p class="text-gray-600 text-center leading-relaxed">24/7 intelligent chatbot providing immediate coping strategies and professional referrals when needed.</p>
            </div>
            
            <div class="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div class="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mb-6 mx-auto">
                <span class="text-3xl">📊</span>
              </div>
              <h3 class="text-xl font-semibold mb-3 text-center">Professional Assessment</h3>
              <p class="text-gray-600 text-center leading-relaxed">Scientifically validated mental health screening tools with personalized analysis and recommendations.</p>
            </div>
            
            <div class="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div class="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mb-6 mx-auto">
                <span class="text-3xl">👨⚕️</span>
              </div>
              <h3 class="text-xl font-semibold mb-3 text-center">Expert Consultation</h3>
              <p class="text-gray-600 text-center leading-relaxed">Easy booking system to connect with qualified mental health professionals and counselors.</p>
            </div>
            
            <div class="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div class="w-16 h-16 bg-yellow-100 rounded-xl flex items-center justify-center mb-6 mx-auto">
                <span class="text-3xl">🔒</span>
              </div>
              <h3 class="text-xl font-semibold mb-3 text-center">Complete Privacy</h3>
              <p class="text-gray-600 text-center leading-relaxed">Your data is completely confidential and secure. Anonymous analytics help improve campus mental health services.</p>
            </div>
          </div>

          <div class="space-y-4">
            <button @click="currentPage = 'register'" class="w-full max-w-md mx-auto block bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-4 px-8 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105">
              Get Started - Create Account
            </button>
            <button @click="currentPage = 'login'" class="w-full max-w-md mx-auto block bg-white text-gray-700 font-semibold py-4 px-8 rounded-xl border-2 border-gray-300 hover:border-blue-500 hover:text-blue-600 transition-all">
              Already have an account? Sign In
            </button>
          </div>
        </div>
      </div>

      <!-- Login Page -->
      <div v-if="currentPage === 'login'" class="max-w-md mx-auto">
        <div class="bg-white rounded-xl shadow-lg p-8">
          <div class="text-center mb-8">
            <h2 class="text-2xl font-bold text-gray-900">Sign In</h2>
            <p class="text-gray-600 mt-2">Access your mental health dashboard</p>
          </div>

          <form @submit.prevent="login" class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input v-model="loginForm.email" type="email" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="your.email@college.edu" required>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input v-model="loginForm.password" type="password" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter your password" required>
            </div>

            <button type="submit" class="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all">
              Sign In
            </button>
          </form>

          <div class="mt-6">
            <div class="relative">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-gray-300"></div>
              </div>
              <div class="relative flex justify-center text-sm">
                <span class="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <button @click="loginWithGoogle" class="mt-4 w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors">
              <svg class="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span class="text-gray-700 font-medium">Sign in with Google</span>
            </button>
          </div>

          <div class="mt-6 text-center">
            <button @click="currentPage = 'register'" class="text-blue-600 hover:text-blue-700 font-medium">
              Don't have an account? Create one
            </button>
          </div>
        </div>
      </div>

      <!-- Register Page -->
      <div v-if="currentPage === 'register'" class="max-w-md mx-auto">
        <div class="bg-white rounded-xl shadow-lg p-8">
          <div class="text-center mb-8">
            <h2 class="text-2xl font-bold text-gray-900">Create Account</h2>
            <p class="text-gray-600 mt-2">Join our mental health support community</p>
          </div>

          <form @submit.prevent="register" class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input v-model="registerForm.name" type="text" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter your full name" required>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input v-model="registerForm.email" type="email" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="your.email@college.edu" required>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input v-model="registerForm.password" type="password" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Create a secure password" required>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Gender</label>
              <select v-model="registerForm.gender" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Age Group</label>
              <select v-model="registerForm.ageGroup" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option v-for="group in AGE_GROUPS" :key="group" :value="group">{{ group }}</option>
              </select>
            </div>

            <button type="submit" class="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all">
              Create Account
            </button>
          </form>

          <div class="mt-6 text-center">
            <button @click="currentPage = 'login'" class="text-blue-600 hover:text-blue-700 font-medium">
              Already have an account? Sign In
            </button>
          </div>
        </div>
      </div>

      <!-- Dashboard -->
      <div v-if="currentPage === 'dashboard' && user" class="space-y-8">
        <div class="bg-white rounded-xl shadow-lg p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Welcome back, {{ user.name }}!</h2>
          <p class="text-gray-600 mb-6">How are you feeling today? Your mental health journey matters.</p>
          
          <div class="grid md:grid-cols-3 gap-6 mb-8">
            <button @click="showMoodSelection = true; currentPage = 'assessment'" class="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105">
              <div class="text-3xl mb-2">📋</div>
              <h3 class="font-semibold mb-2">Take Assessment</h3>
              <p class="text-sm opacity-90">Complete your mental health evaluation</p>
            </button>
            
            <button @click="showSubscription = true; currentPage = 'booking'" class="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105">
              <div class="text-3xl mb-2">👨⚕️</div>
              <h3 class="font-semibold mb-2">Book Doctor</h3>
              <p class="text-sm opacity-90">Schedule consultation with experts</p>
            </button>
            
            <button @click="currentPage = 'progress'" class="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all transform hover:scale-105">
              <div class="text-3xl mb-2">📊</div>
              <h3 class="font-semibold mb-2">Your Progress</h3>
              <p class="text-sm opacity-90">Track your mental health journey</p>
            </button>
          </div>
          
          <!-- Resources Section -->
          <div class="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl">
            <h3 class="text-xl font-bold text-gray-900 mb-4">🌟 Wellness Resources</h3>
            <div class="grid md:grid-cols-4 gap-4">
              <button @click="selectedResourceType = 'music'; currentPage = 'resources'" class="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
                <div class="text-2xl mb-2">🎵</div>
                <h4 class="font-semibold text-sm">Music Therapy</h4>
              </button>
              <button @click="selectedResourceType = 'yoga'; currentPage = 'resources'" class="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
                <div class="text-2xl mb-2">🧘</div>
                <h4 class="font-semibold text-sm">Yoga & Meditation</h4>
              </button>
              <button @click="selectedResourceType = 'relaxation'; currentPage = 'resources'" class="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
                <div class="text-2xl mb-2">😌</div>
                <h4 class="font-semibold text-sm">Relaxation Videos</h4>
              </button>
              <button @click="selectedResourceType = 'diet'; currentPage = 'resources'" class="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
                <div class="text-2xl mb-2">🥗</div>
                <h4 class="font-semibold text-sm">Diet & Nutrition</h4>
              </button>
            </div>
          </div>
        </div>

        <!-- Recent Bookings -->
        <div v-if="userBookings.length > 0" class="bg-white rounded-xl shadow-lg p-8">
          <h3 class="text-xl font-bold text-gray-900 mb-4">📅 Your Appointments</h3>
          <div class="space-y-3">
            <div v-for="booking in userBookings" :key="booking.id" class="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
              <div class="flex justify-between items-center">
                <div>
                  <h4 class="font-semibold text-gray-900">👨⚕️ {{ booking.doctorName }}</h4>
                  <p class="text-sm text-gray-600">📅 {{ booking.date }} at {{ booking.time }}</p>
                  <span class="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mt-1">{{ booking.status }}</span>
                </div>
                <div class="text-green-600 text-2xl">✅</div>
              </div>
            </div>
          </div>
        </div>


      </div>

      <!-- Mood Selection Page -->
      <div v-if="currentPage === 'assessment' && showMoodSelection" class="max-w-4xl mx-auto">
        <div class="bg-white rounded-xl shadow-lg p-8">
          <div class="text-center mb-8">
            <!-- AI Avatars -->
            <div class="flex justify-center items-center space-x-12 mb-8">
              <div class="text-center flex flex-col items-center">
                <div class="relative flex items-center justify-center">
                  <div class="w-24 h-24 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-3 animate-bounce shadow-lg">
                    <span class="text-white text-3xl w-full h-full flex items-center justify-center">👩💼</span>
                  </div>
                  <div class="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full animate-ping"></div>
                </div>
                <p class="text-lg font-bold text-blue-600 text-center">Samantha</p>
                <p class="text-sm text-gray-500 text-center">AI Counselor</p>
              </div>
              <div class="text-center flex flex-col items-center">
                <div class="relative flex items-center justify-center">
                  <div class="w-24 h-24 bg-gradient-to-br from-pink-400 via-pink-500 to-pink-600 rounded-full flex items-center justify-center mb-3 animate-bounce shadow-lg" style="animation-delay: 0.5s">
                    <span class="text-white text-3xl w-full h-full flex items-center justify-center">👩⚕️</span>
                  </div>
                  <div class="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full animate-ping" style="animation-delay: 0.5s"></div>
                </div>
                <p class="text-lg font-bold text-pink-600 text-center">Priyanka</p>
                <p class="text-sm text-gray-500 text-center">Mental Health Expert</p>
              </div>
            </div>
            
            <div class="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl mb-8">
              <h2 class="text-3xl font-bold text-gray-900 mb-4">Hi {{ user?.name }}! 👋</h2>
              <p class="text-xl text-gray-700 mb-2">How are you feeling today?</p>
              <p class="text-gray-600">We're here to help you. Please select your current mood so we can provide personalized questions tailored just for you.</p>
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-6 max-w-2xl mx-auto">
            <button @click="selectMood('happy')" class="p-6 rounded-2xl border-3 border-gray-200 hover:border-green-400 bg-white hover:bg-green-50 transition-all">
              <div class="text-5xl mb-4">😊</div>
              <h3 class="text-xl font-bold text-gray-800 mb-2">Happy & Positive</h3>
              <p class="text-gray-600 text-sm">Feeling good and optimistic</p>
            </button>
            
            <button @click="selectMood('sad')" class="p-6 rounded-2xl border-3 border-gray-200 hover:border-blue-400 bg-white hover:bg-blue-50 transition-all">
              <div class="text-5xl mb-4">😢</div>
              <h3 class="text-xl font-bold text-gray-800 mb-2">Sad & Down</h3>
              <p class="text-gray-600 text-sm">Feeling low or depressed</p>
            </button>
            
            <button @click="selectMood('anxious')" class="p-6 rounded-2xl border-3 border-gray-200 hover:border-yellow-400 bg-white hover:bg-yellow-50 transition-all">
              <div class="text-5xl mb-4">😰</div>
              <h3 class="text-xl font-bold text-gray-800 mb-2">Anxious & Worried</h3>
              <p class="text-gray-600 text-sm">Feeling nervous or on edge</p>
            </button>
            
            <button @click="selectMood('stressed')" class="p-6 rounded-2xl border-3 border-gray-200 hover:border-red-400 bg-white hover:bg-red-50 transition-all">
              <div class="text-5xl mb-4">😤</div>
              <h3 class="text-xl font-bold text-gray-800 mb-2">Stressed & Overwhelmed</h3>
              <p class="text-gray-600 text-sm">Feeling pressured or burned out</p>
            </button>
          </div>
          
          <div class="text-center mt-8">
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p class="text-blue-800 text-sm font-medium mb-2">🔒 Privacy & Safety Notice</p>
              <p class="text-blue-700 text-xs">Your responses are confidential and help us provide better support. If you indicate thoughts of self-harm, we may connect you with crisis resources for your safety.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Assessment Questions Page -->
      <div v-if="currentPage === 'assessment' && !showMoodSelection && currentQuestions.length > 0" class="max-w-3xl mx-auto">
        <div class="bg-white rounded-xl shadow-lg p-8">
          <div class="mb-8">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-2xl font-bold text-gray-900">Mental Health Assessment</h2>
              <span class="text-sm text-gray-600">Question {{ currentQuestion + 1 }} of {{ currentQuestions.length }}</span>
            </div>
            
            <div class="w-full bg-gray-200 rounded-full h-3">
              <div class="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-500" :style="{ width: progress + '%' }"></div>
            </div>
            
            <div class="mt-4 flex items-center justify-between text-sm text-gray-600">
              <span>Mood: {{ userMood.charAt(0).toUpperCase() + userMood.slice(1) }}</span>
              <span>{{ Math.round(progress) }}% Complete</span>
            </div>
          </div>

          <div class="mb-8">
            <div class="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl mb-6">
              <h3 class="text-xl font-semibold text-gray-900 mb-2">{{ currentQuestionData?.question }}</h3>
              <p class="text-sm text-gray-600">Please select the option that best describes your experience</p>
            </div>

            <div class="space-y-4">
              <label v-for="option in RESPONSE_OPTIONS" :key="option.label" :class="[
                'flex items-center p-5 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md',
                responses[currentQuestionData?.id]?.value === option.value
                  ? 'border-blue-500 bg-blue-50 shadow-md transform scale-105'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
              ]">
                <input 
                  type="radio" 
                  :name="`question-${currentQuestionData?.id}`" 
                  :value="option.value" 
                  :checked="responses[currentQuestionData?.id]?.value === option.value"
                  @change="() => {
                    handleResponse(currentQuestionData.id, option.value)
                    if (option.value === 'other') {
                      showDescription = currentQuestionData.id
                    } else {
                      showDescription = null
                    }
                  }"
                  class="mr-4 w-5 h-5 text-blue-600"
                >
                <span class="text-gray-800 font-medium">{{ option.label }}</span>
              </label>
            </div>

            <div v-if="showDescription === currentQuestionData?.id" class="mt-6">
              <label class="block text-sm font-medium text-gray-700 mb-3">Please describe your experience in detail:</label>
              <textarea 
                :value="responses[currentQuestionData?.id]?.note || ''"
                @input="(e) => handleResponse(currentQuestionData.id, 'other', e.target.value)"
                class="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                rows="4"
                placeholder="Share more details about your experience. This helps us provide better support..."
              ></textarea>
            </div>
          </div>

          <div class="flex justify-between items-center">
            <button 
              @click="prevQuestion" 
              :disabled="currentQuestion === 0"
              class="px-8 py-3 text-gray-600 border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
            >
              ← Previous
            </button>
            
            <div class="text-center">
              <button @click="showMoodSelection = true" class="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors">
                Change Mood Selection
              </button>
            </div>
            
            <button 
              @click="nextQuestion" 
              :disabled="!responses[currentQuestionData?.id]"
              class="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-lg"
            >
              {{ currentQuestion === currentQuestions.length - 1 ? 'Complete Assessment ✓' : 'Next →' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Assessment Not Started -->
      <div v-if="currentPage === 'assessment' && !showMoodSelection && currentQuestions.length === 0" class="max-w-2xl mx-auto">
        <div class="bg-white rounded-xl shadow-lg p-8 text-center">
          <div class="text-6xl mb-4">📋</div>
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Ready to Start Your Assessment?</h2>
          <p class="text-gray-600 mb-6">Let's begin by understanding how you're feeling today. This will help us provide personalized questions.</p>
          <button @click="showMoodSelection = true" class="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105">
            Start Assessment
          </button>
        </div>
      </div>

      <!-- Analysis Page -->
      <div v-if="currentPage === 'analysis' && analysis" class="space-y-8">
        <div class="bg-white rounded-xl shadow-lg p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Your Mental Health Analysis</h2>
          
          <div v-if="analysis.needsUrgentCare" class="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div class="flex">
              <div class="text-red-500 text-xl mr-3">🚨</div>
              <div>
                <h3 class="text-red-800 font-semibold">CRISIS ALERT - Immediate Professional Support Needed</h3>
                <p class="text-red-700 mt-1 font-medium">Your responses indicate you may be in crisis. Please contact emergency services immediately:</p>
                <div class="mt-3 space-y-2 text-sm">
                  <div class="flex items-center space-x-2">
                    <span class="font-bold">Suicide & Crisis Lifeline:</span>
                    <a href="tel:988" class="bg-red-600 text-white px-3 py-1 rounded font-bold hover:bg-red-700">Call 988</a>
                  </div>
                  <div class="flex items-center space-x-2">
                    <span class="font-bold">Emergency Services:</span>
                    <a href="tel:911" class="bg-red-600 text-white px-3 py-1 rounded font-bold hover:bg-red-700">Call 911</a>
                  </div>
                </div>
                <button @click="showCrisisModal = true" class="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-semibold">
                  🆘 Get Crisis Resources
                </button>
              </div>
            </div>
          </div>

          <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div class="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl">
              <div class="text-3xl font-bold">{{ analysis.totalScore }}</div>
              <div class="text-blue-100">Total Score</div>
              <div class="text-sm text-blue-100 mt-1">Out of 45 points</div>
            </div>
            
            <div class="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl">
              <div class="text-2xl font-bold">{{ analysis.severity }}</div>
              <div class="text-green-100">Severity Level</div>
              <div class="text-sm text-green-100 mt-1">Current status</div>
            </div>
            
            <div class="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-6 rounded-xl">
              <div class="text-2xl font-bold">{{ analysis.stressLevel }}</div>
              <div class="text-yellow-100">Stress Level</div>
              <div class="text-sm text-yellow-100 mt-1">Current intensity</div>
            </div>
            
            <div class="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl">
              <div class="text-2xl font-bold">{{ analysis.riskLevel }}</div>
              <div class="text-purple-100">Risk Level</div>
              <div class="text-sm text-purple-100 mt-1">Assessment priority</div>
            </div>
          </div>

          <div v-if="analysis.moodTags.length > 0" class="mb-8">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Identified Concerns</h3>
            <div class="flex flex-wrap gap-2">
              <span v-for="(tag, index) in analysis.moodTags" :key="index" class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {{ tag }}
              </span>
            </div>
          </div>

          <div class="mb-8">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Personalized Recommendations</h3>
            <div class="space-y-3">
              <div v-for="(recommendation, index) in analysis.recommendations" :key="index" class="flex items-start p-4 bg-gray-50 rounded-lg">
                <div class="text-green-500 mr-3 mt-1">✓</div>
                <p class="text-gray-700">{{ recommendation }}</p>
              </div>
            </div>
          </div>

          <div class="bg-blue-50 p-6 rounded-xl">
            <h3 class="text-lg font-semibold text-blue-900 mb-3">Next Steps</h3>
            <div class="space-y-2">
              <p class="text-blue-800">• Consider booking a consultation with one of our mental health professionals</p>
              <p class="text-blue-800">• Use our AI assistant for daily coping strategies and support</p>
              <p class="text-blue-800">• Retake this assessment in 2-4 weeks to track your progress</p>
            </div>
            
            <div class="mt-4 space-x-4">
              <button @click="currentPage = 'booking'" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Book Consultation
              </button>
              <button @click="currentPage = 'dashboard'" class="bg-white text-blue-600 border border-blue-600 px-6 py-2 rounded-lg hover:bg-blue-50 transition-colors">
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Subscription Plans -->
      <div v-if="currentPage === 'booking' && showSubscription" class="max-w-2xl mx-auto">
        <div class="bg-white rounded-xl shadow-lg p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-6 text-center">Choose Your Subscription Plan</h2>
          <p class="text-gray-600 text-center mb-8">Select a plan to access our mental health consultation services</p>
          
          <div class="space-y-4">
            <div v-for="plan in [
              { duration: '1 year', price: '999', value: '1year', popular: true },
              { duration: '6 months', price: '599', value: '6month' },
              { duration: '3 months', price: '299', value: '3month' }
            ]" :key="plan.value" 
            :class="[
              'border-2 rounded-lg p-6 cursor-pointer transition-all relative',
              selectedPlan === plan.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300',
              plan.popular ? 'ring-2 ring-blue-200' : ''
            ]"
            @click="selectedPlan = plan.value">
              <div v-if="plan.popular" class="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </div>
              <div class="flex justify-between items-center">
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">{{ plan.duration }}</h3>
                  <p class="text-gray-600">Full access to consultations</p>
                  <p class="text-sm text-green-600 font-medium">₹{{ Math.round(plan.price / (plan.duration.includes('year') ? 12 : plan.duration.includes('6') ? 6 : 3)) }}/month</p>
                </div>
                <div class="text-right">
                  <div class="text-2xl font-bold text-gray-900">₹{{ plan.price }}/-</div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="mt-8">
            <button 
              @click="showPayment = true" 
              :disabled="!selectedPlan"
              class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Subscribe Now
            </button>
          </div>
        </div>
      </div>

      <!-- Payment Popup -->
      <div v-if="showPayment" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999;">
        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; border-radius: 12px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); width: 90%; max-width: 400px;" @click.stop>
          <div class="flex justify-between items-center p-6 border-b">
            <h3 class="text-xl font-bold text-gray-900">Choose Payment Method</h3>
            <button @click="showPayment = false; selectedPaymentMethod = ''" class="text-gray-400 hover:text-gray-600 text-2xl">
              ×
            </button>
          </div>
          <div class="p-6">
            <p class="text-gray-600 mb-6 text-center">Select your preferred payment option</p>
          
            <div class="space-y-3">
              <!-- PhonePe -->
              <button @click="selectedPaymentMethod = 'phonepe'" :class="[
                'w-full p-4 border-2 rounded-lg flex items-center space-x-3 transition-all',
                selectedPaymentMethod === 'phonepe' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
              ]">
                <div class="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                  <span class="text-white font-bold">Pe</span>
                </div>
                <div class="flex-1 text-left">
                  <span class="font-semibold text-gray-900">PhonePe</span>
                </div>
                <div v-if="selectedPaymentMethod === 'phonepe'" class="text-purple-500 text-xl">
                  ✓
                </div>
              </button>
              
              <!-- Paytm -->
              <button @click="selectedPaymentMethod = 'paytm'" :class="[
                'w-full p-4 border-2 rounded-lg flex items-center space-x-3 transition-all',
                selectedPaymentMethod === 'paytm' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              ]">
                <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span class="text-white font-bold">Pt</span>
                </div>
                <div class="flex-1 text-left">
                  <span class="font-semibold text-gray-900">Paytm</span>
                </div>
                <div v-if="selectedPaymentMethod === 'paytm'" class="text-blue-500 text-xl">
                  ✓
                </div>
              </button>
              
              <!-- Card -->
              <button @click="selectedPaymentMethod = 'card'" :class="[
                'w-full p-4 border-2 rounded-lg flex items-center space-x-3 transition-all',
                selectedPaymentMethod === 'card' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
              ]">
                <div class="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                  <span class="text-white">💳</span>
                </div>
                <div class="flex-1 text-left">
                  <span class="font-semibold text-gray-900">Credit/Debit Card</span>
                </div>
                <div v-if="selectedPaymentMethod === 'card'" class="text-green-500 text-xl">
                  ✓
                </div>
              </button>
            </div>
            
            <div class="mt-6">
              <button @click="processPayment" :disabled="!selectedPaymentMethod" class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors">
                Continue Payment
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Card Payment Form -->
      <div v-if="showCardForm" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999;">
        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; border-radius: 12px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); width: 90%; max-width: 400px;" @click.stop>
          <div class="flex justify-between items-center p-6 border-b">
            <h3 class="text-xl font-bold text-gray-900">Card Payment</h3>
            <button @click="showCardForm = false; cardDetails = { number: '', expiry: '', cvv: '', name: '' }" class="text-gray-400 hover:text-gray-600 text-2xl">
              ×
            </button>
          </div>
          <div class="p-6">
          
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Cardholder Name</label>
                <input v-model="cardDetails.name" type="text" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="John Doe" required>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                <input 
                  v-model="cardDetails.number" 
                  @input="cardDetails.number = formatCardNumber($event.target.value)"
                  type="text" 
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  placeholder="1234 5678 9012 3456" 
                  maxlength="19" 
                  required
                >
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                  <input 
                    v-model="cardDetails.expiry" 
                    @input="cardDetails.expiry = formatExpiry($event.target.value)"
                    type="text" 
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    placeholder="MM/YY" 
                    maxlength="5" 
                    required
                  >
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                  <input 
                    v-model="cardDetails.cvv" 
                    @input="cardDetails.cvv = $event.target.value.replace(/[^0-9]/g, '')"
                    type="password" 
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    placeholder="123" 
                    maxlength="3" 
                    required
                  >
                </div>
              </div>
            </div>
            
            <div class="mt-6">
              <button @click="processCardPayment" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
                Complete Payment
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Doctor Booking -->
      <div v-if="currentPage === 'booking' && !showSubscription" class="max-w-2xl mx-auto">
        <div v-if="bookingConfirmed" class="bg-white rounded-xl shadow-lg p-8 text-center">
          <div class="text-6xl mb-4">✅</div>
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Booking Confirmed!</h2>
          <p class="text-gray-600 mb-6">Your appointment has been successfully scheduled. You will receive a confirmation email shortly.</p>
          <button @click="bookingConfirmed = false" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            Book Another Appointment
          </button>
        </div>

        <div v-else class="bg-white rounded-xl shadow-lg p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-8">Book Counselor Appointment</h2>
          
          <div class="space-y-6">
            <!-- Select Counselor -->
            <div>
              <label class="block text-sm font-semibold text-gray-900 mb-3">Select Counselor:</label>
              <select v-model="selectedDoctor" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
                <option :value="null">Choose a counselor...</option>
                <option v-for="doctor in doctors" :key="doctor.id" :value="doctor">
                  {{ doctor.name }} - {{ doctor.specialization }}
                </option>
              </select>
            </div>

            <!-- Preferred Date -->
            <div>
              <label class="block text-sm font-semibold text-gray-900 mb-3">Preferred Date:</label>
              <input 
                type="date" 
                v-model="selectedDate"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                :min="new Date().toISOString().split('T')[0]"
              >
            </div>

            <!-- Preferred Time -->
            <div>
              <label class="block text-sm font-semibold text-gray-900 mb-3">Preferred Time:</label>
              <select v-model="selectedTime" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
                <option value="">Select time...</option>
                <option value="09:00">9:00 AM</option>
                <option value="10:00">10:00 AM</option>
                <option value="11:00">11:00 AM</option>
                <option value="14:00">2:00 PM</option>
                <option value="15:00">3:00 PM</option>
                <option value="16:00">4:00 PM</option>
                <option value="17:00">5:00 PM</option>
              </select>
            </div>

            <!-- Book Appointment Button -->
            <div class="pt-4">
              <button 
                @click="bookAppointment" 
                :disabled="!selectedDoctor || !selectedDate || !selectedTime"
                class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Book Appointment
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Profile Modal -->
      <div v-if="showProfile" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click="showProfile = false">
        <div class="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full" @click.stop>
          <div class="text-center mb-6">
            <h3 class="text-2xl font-bold text-gray-900 mb-2">Profile Information</h3>
            <p class="text-gray-600">Update your personal details</p>
          </div>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Profile Photo</label>
              <div class="flex items-center space-x-4">
                <div class="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                  <img v-if="profileForm.photo" :src="profileForm.photo" class="w-full h-full object-cover" />
                  <span v-else class="text-2xl">{{ user.avatar || '👤' }}</span>
                </div>
                <input type="file" @change="handlePhotoUpload" accept="image/*" class="text-sm text-gray-600">
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input v-model="profileForm.name" type="text" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Age</label>
              <input v-model="profileForm.age" type="number" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input v-model="profileForm.phone" type="tel" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Gender</label>
              <select v-model="profileForm.gender" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
              <input v-model="profileForm.dob" type="date" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            </div>
          </div>
          
          <div class="flex space-x-4 mt-8">
            <button @click="showProfile = false" class="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button @click="updateProfile" class="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
              Update Profile
            </button>
          </div>
        </div>
      </div>

      <!-- Progress Page -->
      <div v-if="currentPage === 'progress'" class="space-y-8">
        <div class="bg-white rounded-xl shadow-lg p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Your Mental Health Progress</h2>
          
          <div v-if="assessmentHistory.length > 0" class="space-y-6">
            <!-- Progress Graph -->
            <div class="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Assessment Score Trend</h3>
              <div class="relative h-64 bg-white rounded-lg p-4">
                <svg class="w-full h-full" viewBox="0 0 400 200">
                  <!-- Grid lines -->
                  <defs>
                    <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" stroke-width="1"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                  
                  <!-- Data line -->
                  <polyline 
                    :points="assessmentHistory.map((item, index) => `${(index * 350 / Math.max(assessmentHistory.length - 1, 1)) + 25},${180 - (item.score * 150 / 30)}`).join(' ')"
                    fill="none" 
                    stroke="#3b82f6" 
                    stroke-width="3"
                    stroke-linecap="round"
                  />
                  
                  <!-- Data points -->
                  <circle 
                    v-for="(item, index) in assessmentHistory" 
                    :key="item.id"
                    :cx="(index * 350 / Math.max(assessmentHistory.length - 1, 1)) + 25"
                    :cy="180 - (item.score * 150 / 30)"
                    r="4" 
                    fill="#3b82f6"
                  />
                  
                  <!-- Y-axis labels -->
                  <text x="10" y="25" font-size="12" fill="#6b7280">30</text>
                  <text x="10" y="105" font-size="12" fill="#6b7280">15</text>
                  <text x="15" y="185" font-size="12" fill="#6b7280">0</text>
                </svg>
              </div>
            </div>
            
            <!-- Assessment History -->
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Assessment History</h3>
              <div class="space-y-3">
                <div v-for="item in assessmentHistory.slice().reverse()" :key="item.id" class="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
                  <div>
                    <p class="font-medium text-gray-900">{{ new Date(item.date).toLocaleDateString() }}</p>
                    <p class="text-sm text-gray-600">Mood: {{ item.mood.charAt(0).toUpperCase() + item.mood.slice(1) }}</p>
                  </div>
                  <div class="text-right">
                    <p class="text-lg font-bold text-blue-600">{{ item.score }}</p>
                    <p class="text-sm text-gray-600">{{ item.severity }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div v-else class="text-center py-12">
            <div class="text-6xl mb-4">📊</div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">No Assessment Data Yet</h3>
            <p class="text-gray-600 mb-6">Take your first assessment to start tracking your progress</p>
            <button @click="showMoodSelection = true; currentPage = 'assessment'" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
              Take Assessment
            </button>
          </div>
        </div>
      </div>

      <!-- All Resources Overview -->
      <div v-if="currentPage === 'resources' && !selectedResourceType" class="space-y-8">
        <div class="bg-white rounded-xl shadow-lg p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Wellness Resources</h2>
          <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <button @click="selectedResourceType = 'music'" class="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl hover:shadow-lg transition-all transform hover:scale-105">
              <div class="text-4xl mb-4">🎵</div>
              <h3 class="text-lg font-bold text-gray-900 mb-2">Music Therapy</h3>
              <p class="text-sm text-gray-600">Calming sounds and therapeutic music</p>
            </button>
            <button @click="selectedResourceType = 'yoga'" class="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl hover:shadow-lg transition-all transform hover:scale-105">
              <div class="text-4xl mb-4">🧘</div>
              <h3 class="text-lg font-bold text-gray-900 mb-2">Yoga & Meditation</h3>
              <p class="text-sm text-gray-600">Guided practices for mindfulness</p>
            </button>
            <button @click="selectedResourceType = 'relaxation'" class="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl hover:shadow-lg transition-all transform hover:scale-105">
              <div class="text-4xl mb-4">😌</div>
              <h3 class="text-lg font-bold text-gray-900 mb-2">Relaxation Videos</h3>
              <p class="text-sm text-gray-600">Progressive relaxation techniques</p>
            </button>
            <button @click="selectedResourceType = 'diet'" class="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-xl hover:shadow-lg transition-all transform hover:scale-105">
              <div class="text-4xl mb-4">🥗</div>
              <h3 class="text-lg font-bold text-gray-900 mb-2">Diet & Nutrition</h3>
              <p class="text-sm text-gray-600">Mood-boosting foods and meal plans</p>
            </button>
          </div>
          <div class="text-center mt-8">
            <button @click="currentPage = 'dashboard'" class="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 shadow-md">
              🏠 Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      <!-- Individual Resources Page -->
      <div v-if="currentPage === 'resources' && selectedResourceType" class="space-y-8">
        <div class="bg-white rounded-xl shadow-lg p-8">
          <!-- Music Therapy -->
          <div v-if="selectedResourceType === 'music'">
            <h2 class="text-2xl font-bold text-gray-900 mb-6">🎵 Music Therapy</h2>
            <div class="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl">
              <div class="space-y-4">
                <div class="bg-white p-4 rounded-lg flex items-center space-x-4 shadow hover:shadow-md transition-shadow">
                  <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    ▶️
                  </div>
                  <div class="flex-1">
                    <p class="font-semibold text-lg">Calming Nature Sounds</p>
                    <p class="text-gray-600">15 minutes • Forest sounds, rain, ocean waves</p>
                  </div>
                  <button class="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all transform hover:scale-105 shadow-md">
                    ▶️ Play
                  </button>
                </div>
                <div class="bg-white p-4 rounded-lg flex items-center space-x-4 shadow hover:shadow-md transition-shadow">
                  <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    ▶️
                  </div>
                  <div class="flex-1">
                    <p class="font-semibold text-lg">Meditation Music</p>
                    <p class="text-gray-600">20 minutes • Ambient sounds for deep relaxation</p>
                  </div>
                  <button class="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all transform hover:scale-105 shadow-md">
                    ▶️ Play
                  </button>
                </div>
                <div class="bg-white p-4 rounded-lg flex items-center space-x-4 shadow hover:shadow-md transition-shadow">
                  <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    ▶️
                  </div>
                  <div class="flex-1">
                    <p class="font-semibold text-lg">Stress Relief Playlist</p>
                    <p class="text-gray-600">30 minutes • Curated music for anxiety relief</p>
                  </div>
                  <button class="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all transform hover:scale-105 shadow-md">
                    ▶️ Play
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Yoga & Meditation -->
          <div v-if="selectedResourceType === 'yoga'">
            <h2 class="text-2xl font-bold text-gray-900 mb-6">🧘 Yoga & Meditation</h2>
            <div class="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl">
              <div class="space-y-4">
                <div class="bg-white p-4 rounded-lg flex items-center space-x-4 shadow hover:shadow-md transition-shadow">
                  <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    📹
                  </div>
                  <div class="flex-1">
                    <p class="font-semibold text-lg">Morning Yoga Routine</p>
                    <p class="text-gray-600">10 minutes • Gentle stretches to start your day</p>
                  </div>
                  <button class="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-green-800 transition-all transform hover:scale-105 shadow-md">
                    📹 Watch
                  </button>
                </div>
                <div class="bg-white p-4 rounded-lg flex items-center space-x-4 shadow hover:shadow-md transition-shadow">
                  <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    📹
                  </div>
                  <div class="flex-1">
                    <p class="font-semibold text-lg">Breathing Exercises</p>
                    <p class="text-gray-600">5 minutes • 4-7-8 breathing technique for anxiety</p>
                  </div>
                  <button class="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-green-800 transition-all transform hover:scale-105 shadow-md">
                    📹 Watch
                  </button>
                </div>
                <div class="bg-white p-4 rounded-lg flex items-center space-x-4 shadow hover:shadow-md transition-shadow">
                  <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    📹
                  </div>
                  <div class="flex-1">
                    <p class="font-semibold text-lg">Mindfulness Meditation</p>
                    <p class="text-gray-600">15 minutes • Guided meditation for stress relief</p>
                  </div>
                  <button class="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-green-800 transition-all transform hover:scale-105 shadow-md">
                    📹 Watch
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Relaxation Videos -->
          <div v-if="selectedResourceType === 'relaxation'">
            <h2 class="text-2xl font-bold text-gray-900 mb-6">😌 Relaxation Videos</h2>
            <div class="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl">
              <div class="space-y-4">
                <div class="bg-white p-4 rounded-lg flex items-center space-x-4 shadow hover:shadow-md transition-shadow">
                  <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    📹
                  </div>
                  <div class="flex-1">
                    <p class="font-semibold text-lg">Progressive Muscle Relaxation</p>
                    <p class="text-gray-600">12 minutes • Systematic tension and release technique</p>
                  </div>
                  <button class="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 shadow-md">
                    📹 Watch
                  </button>
                </div>
                <div class="bg-white p-4 rounded-lg flex items-center space-x-4 shadow hover:shadow-md transition-shadow">
                  <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    📹
                  </div>
                  <div class="flex-1">
                    <p class="font-semibold text-lg">Guided Visualization</p>
                    <p class="text-gray-600">18 minutes • Mental imagery for deep relaxation</p>
                  </div>
                  <button class="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 shadow-md">
                    📹 Watch
                  </button>
                </div>
                <div class="bg-white p-4 rounded-lg flex items-center space-x-4 shadow hover:shadow-md transition-shadow">
                  <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    📹
                  </div>
                  <div class="flex-1">
                    <p class="font-semibold text-lg">Sleep Stories</p>
                    <p class="text-gray-600">25 minutes • Calming narratives for better sleep</p>
                  </div>
                  <button class="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 shadow-md">
                    📹 Watch
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Diet & Nutrition -->
          <div v-if="selectedResourceType === 'diet'">
            <h2 class="text-2xl font-bold text-gray-900 mb-6">🥗 Diet & Nutrition</h2>
            <div class="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-xl">
              <div class="space-y-4">
                <div class="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
                  <h3 class="font-semibold text-lg mb-2">🐟 Mood-Boosting Foods</h3>
                  <p class="text-gray-600 mb-3">Foods that naturally enhance mood and reduce stress</p>
                  <div class="grid grid-cols-2 gap-2 text-sm">
                    <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded">Salmon & Tuna</span>
                    <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded">Dark Chocolate</span>
                    <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded">Blueberries</span>
                    <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded">Avocados</span>
                  </div>
                </div>
                <div class="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
                  <h3 class="font-semibold text-lg mb-2">🍵 Stress-Reducing Meals</h3>
                  <p class="text-gray-600 mb-3">Nutritious meals that help manage stress levels</p>
                  <div class="grid grid-cols-2 gap-2 text-sm">
                    <span class="bg-green-100 text-green-800 px-2 py-1 rounded">Green Tea</span>
                    <span class="bg-green-100 text-green-800 px-2 py-1 rounded">Almonds & Walnuts</span>
                    <span class="bg-green-100 text-green-800 px-2 py-1 rounded">Whole Grains</span>
                    <span class="bg-green-100 text-green-800 px-2 py-1 rounded">Leafy Greens</span>
                  </div>
                </div>
                <div class="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
                  <h3 class="font-semibold text-lg mb-2">📅 Healthy Meal Plans</h3>
                  <p class="text-gray-600 mb-3">Weekly balanced nutrition guides for mental wellness</p>
                  <button class="bg-gradient-to-r from-orange-600 to-orange-700 text-white px-4 py-2 rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all transform hover:scale-105 shadow-md">
                    📥 Download Meal Plan
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div class="text-center mt-8 space-x-4">
            <button @click="currentPage = 'dashboard'" class="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all transform hover:scale-105 shadow-md">
              🏠 Back to Dashboard
            </button>
            <button @click="selectedResourceType = ''; currentPage = 'resources'" class="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 shadow-md">
              📋 View All Resources
            </button>
          </div>
        </div>
      </div>

      <!-- Crisis Intervention Modal -->
      <div v-if="showCrisisModal" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-xl shadow-2xl p-8 max-w-lg w-full border-4 border-red-500">
          <div class="text-center mb-6">
            <div class="text-6xl mb-4">🚨</div>
            <h3 class="text-2xl font-bold text-red-600 mb-2">Crisis Support Available</h3>
            <p class="text-gray-700">You've indicated you may be in crisis. Immediate help is available.</p>
          </div>
          
          <div class="space-y-4 mb-6">
            <div class="bg-red-50 p-4 rounded-lg border border-red-200">
              <h4 class="font-bold text-red-800 mb-2">Immediate Emergency Contacts:</h4>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span>Suicide & Crisis Lifeline:</span>
                  <a href="tel:988" class="font-bold text-red-600">988</a>
                </div>
                <div class="flex justify-between">
                  <span>Emergency Services:</span>
                  <a href="tel:911" class="font-bold text-red-600">911</a>
                </div>
                <div class="flex justify-between">
                  <span>Crisis Text Line:</span>
                  <span class="font-bold text-red-600">Text HOME to 741741</span>
                </div>
              </div>
            </div>
            
            <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 class="font-bold text-blue-800 mb-2">Campus Resources:</h4>
              <div class="text-sm space-y-1">
                <p>Campus Counseling Center: 1-800-CAMPUS</p>
                <p>Student Health Services: Available 24/7</p>
                <p>Campus Safety: Emergency assistance</p>
              </div>
            </div>
          </div>
          
          <div class="space-y-3">
            <button @click="currentPage = 'booking'; showCrisisModal = false" class="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors">
              👨⚕️ Book Emergency Consultation
            </button>
            <button @click="showCrisisModal = false" class="w-full bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors">
              I'm Safe - Continue
            </button>
          </div>
          
          <div class="mt-4 text-xs text-gray-500 text-center">
            <p>This interaction has been logged for your safety and may be reviewed by mental health professionals.</p>
          </div>
        </div>
      </div>

      <!-- Error Message Toast -->
      <div v-if="showErrorMessage" class="fixed top-4 right-4 z-50 bg-white border-l-4 border-blue-500 rounded-lg shadow-lg p-4 max-w-sm">
        <div class="flex items-center">
          <div class="text-blue-500 mr-3">ℹ️</div>
          <p class="text-gray-800 font-medium">{{ errorMessage }}</p>
        </div>
      </div>

      <!-- About Us Page -->
      <div v-if="currentPage === 'about'" class="space-y-8">
        <div class="bg-white rounded-xl shadow-lg p-8">
          <h2 class="text-3xl font-bold text-gray-900 mb-6 text-center">About MateoMind</h2>
          
          <div class="max-w-4xl mx-auto space-y-8">
            <section>
              <h3 class="text-xl font-semibold text-gray-900 mb-4">Our Mission</h3>
              <p class="text-gray-700 leading-relaxed">MateoMind is dedicated to providing accessible, confidential, and professional mental health support for students in higher education. We combine cutting-edge AI technology with evidence-based psychological practices to create a comprehensive digital mental health platform.</p>
            </section>

            <section>
              <h3 class="text-xl font-semibold text-gray-900 mb-4">Terms and Conditions</h3>
              <div class="space-y-4 text-gray-700">
                <div>
                  <h4 class="font-semibold mb-2">1. Acceptance of Terms</h4>
                  <p>By using MateoMind, you agree to these terms and conditions. If you do not agree, please discontinue use of our services.</p>
                </div>
                
                <div>
                  <h4 class="font-semibold mb-2">2. Medical Disclaimer</h4>
                  <p>MateoMind is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of qualified health providers with questions about medical conditions. In case of emergency, contact local emergency services immediately.</p>
                </div>
                
                <div>
                  <h4 class="font-semibold mb-2">3. Privacy and Confidentiality</h4>
                  <p>We are committed to protecting your privacy. All personal information is encrypted and stored securely. We collect only necessary data for providing our services and never share personal information with third parties without consent.</p>
                </div>
                
                <div>
                  <h4 class="font-semibold mb-2">4. User Responsibilities</h4>
                  <p>Users must provide accurate information, use the platform responsibly, and not share login credentials. Any misuse of the platform may result in account suspension.</p>
                </div>
                
                <div>
                  <h4 class="font-semibold mb-2">5. Crisis Situations</h4>
                  <p>If you are experiencing thoughts of self-harm or suicide, please contact emergency services immediately. MateoMind provides support but is not equipped for crisis intervention.</p>
                </div>
                
                <div>
                  <h4 class="font-semibold mb-2">6. Data Usage</h4>
                  <p>Anonymous, aggregated data may be used for research and improving mental health services. Individual data remains confidential and is never shared without explicit consent.</p>
                </div>
                
                <div>
                  <h4 class="font-semibold mb-2">7. Service Availability</h4>
                  <p>While we strive for 24/7 availability, services may be temporarily unavailable due to maintenance or technical issues. We are not liable for any inconvenience caused by service interruptions.</p>
                </div>
              </div>
            </section>

            <section>
              <h3 class="text-xl font-semibold text-gray-900 mb-4">Contact Information</h3>
              <div class="bg-gray-50 p-6 rounded-lg">
                <p class="text-gray-700 mb-2"><strong>Emergency:</strong> If you are in crisis, call 988 (Suicide & Crisis Lifeline) or your local emergency services</p>
                <p class="text-gray-700 mb-2"><strong>Support:</strong> support@mateomind.edu</p>
                <p class="text-gray-700 mb-2"><strong>Technical Issues:</strong> tech@mateomind.edu</p>
                <p class="text-gray-700"><strong>Privacy Concerns:</strong> privacy@mateomind.edu</p>
              </div>
            </section>

            <section>
              <h3 class="text-xl font-semibold text-gray-900 mb-4">Professional Standards</h3>
              <p class="text-gray-700 leading-relaxed">MateoMind adheres to professional mental health standards and guidelines. Our platform is designed in consultation with licensed mental health professionals and follows evidence-based practices for digital mental health interventions.</p>
            </section>

            <div class="text-center pt-6">
              <button @click="currentPage = 'dashboard'" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- AI Avatar -->
    <div v-if="user && currentPage !== 'welcome' && currentPage !== 'login' && currentPage !== 'register'" class="fixed bottom-6 right-6 z-50">
      <div v-if="isAvatarOpen" class="bg-white rounded-2xl shadow-2xl w-96 h-96 flex flex-col">
        <!-- Header -->
        <div class="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <span class="text-xl">🤖</span>
            </div>
            <div>
              <h3 class="font-semibold">AI Assistant</h3>
              <p class="text-xs opacity-90">Always here to help</p>
            </div>
          </div>
          <button @click="isAvatarOpen = false" class="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors">
            ✕
          </button>
        </div>

        <!-- Messages -->
        <div class="flex-1 overflow-y-auto p-4 space-y-4 max-h-64" style="scrollbar-width: thin; scrollbar-color: #cbd5e0 #f7fafc;">
          <div v-for="(message, index) in messages" :key="index" :class="[
            'flex',
            message.from === 'user' ? 'justify-end' : 'justify-start'
          ]">
            <div :class="[
              'max-w-xs p-3 rounded-2xl',
              message.from === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-800'
            ]">
              <p class="text-sm">{{ message.text }}</p>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="p-2 border-t">
          <div class="flex flex-wrap gap-1 mb-2">
            <button @click="inputText = 'I\'m feeling anxious'" class="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-full transition-colors">
              I'm feeling anxious
            </button>
            <button @click="inputText = 'I\'m having trouble sleeping'" class="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-full transition-colors">
              Help with sleep
            </button>
            <button @click="inputText = 'I\'m stressed about my studies'" class="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-full transition-colors">
              Academic stress
            </button>
            <button @click="currentPage = 'booking'" class="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-full transition-colors">
              Book appointment
            </button>
          </div>
        </div>

        <!-- Input -->
        <div class="p-4 border-t">
          <div class="flex space-x-2">
            <input v-model="inputText" @keyup.enter="sendMessage" type="text" placeholder="Type your message..." class="flex-1 px-3 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm">
            <button @click="sendMessage" class="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors">
              <span class="text-sm">→</span>
            </button>
          </div>
        </div>
      </div>
      
      <button v-else @click="isAvatarOpen = true" class="bg-gradient-to-r from-blue-600 to-indigo-600 text-white w-16 h-16 rounded-full shadow-2xl hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-110 flex items-center justify-center">
        <span class="text-2xl">🤖</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Enhanced animations and transitions */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
  50% { box-shadow: 0 0 30px rgba(59, 130, 246, 0.6); }
}

@keyframes gradient-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* Custom styles for better UX */
.transition-all {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.transform:hover {
  transform: scale(1.05) translateY(-2px);
}

.shadow-2xl {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

/* Enhanced gradient backgrounds */
.bg-gradient-to-r {
  background-image: linear-gradient(to right, var(--tw-gradient-stops));
  background-size: 200% 200%;
  animation: gradient-shift 3s ease infinite;
}

.bg-gradient-to-br {
  background-image: linear-gradient(to bottom right, var(--tw-gradient-stops));
  background-size: 200% 200%;
  animation: gradient-shift 4s ease infinite;
}

/* Enhanced focus states */
input:focus, textarea:focus, select:focus {
  outline: none;
  ring: 2px;
  ring-color: #3b82f6;
  border-color: transparent;
  animation: pulse-glow 2s ease-in-out infinite;
}

/* Enhanced disabled states */
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  filter: grayscale(50%);
}

/* Enhanced hover effects */
button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

/* Mood button animations */
.group:hover .group-hover\:animate-bounce {
  animation: bounce 1s infinite;
}

/* AI Avatar animations */
.animate-bounce {
  animation: bounce 2s infinite;
}

.animate-ping {
  animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
}

/* Progress bar animation */
.progress-bar {
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Enhanced card hover effects */
.hover\:shadow-xl:hover {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Floating animation for avatars */
.animate-float {
  animation: float 3s ease-in-out infinite;
}

/* Custom scrollbar for chat */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #3b82f6, #1d4ed8);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, #1d4ed8, #1e40af);
}

/* Enhanced border styles */
.border-3 {
  border-width: 3px;
}

/* Responsive text sizing */
@media (max-width: 640px) {
  .text-5xl {
    font-size: 3rem;
  }
  
  .text-3xl {
    font-size: 1.875rem;
  }
}

/* Loading animation */
@keyframes spin {
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Smooth transitions for all interactive elements */
* {
  transition: color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
}

/* Enhanced button styles */
button {
  position: relative;
  overflow: hidden;
}

button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

button:hover::before {
  left: 100%;
}
</style>
