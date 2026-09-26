const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (res) => {
  const data = await res.json().catch(() => ({ error: 'Server returned an invalid response' }));
  if (!res.ok) {
    throw new Error(data.error || `HTTP error! Status: ${res.status}`);
  }
  return data;
};

export const apiService = {
  // Auth & Profile
  async login(username, password) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ username, password })
    });
    const data = await handleResponse(res);
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    return data;
  },

  async register(username, email, password, ageGroup) {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ username, email, password, ageGroup })
    });
    const data = await handleResponse(res);
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    return data;
  },

  async fetchProfile() {
    const res = await fetch(`${API_BASE_URL}/auth/profile`, {
      headers: getHeaders()
    });
    return await handleResponse(res);
  },

  async updateProfile(profile, ageGroup) {
    const res = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ profile, ageGroup })
    });
    return await handleResponse(res);
  },

  // Assessments
  async submitAssessment(moodType, questions, answers) {
    const res = await fetch(`${API_BASE_URL}/assessments/submit`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ moodType, questions, answers })
    });
    return await handleResponse(res);
  },

  async fetchAssessmentHistory() {
    const res = await fetch(`${API_BASE_URL}/assessments/history`, {
      headers: getHeaders()
    });
    return await handleResponse(res);
  },

  // Doctors & Appointments
  async fetchDoctors() {
    const res = await fetch(`${API_BASE_URL}/doctors`);
    return await handleResponse(res);
  },

  async bookAppointment(doctorId, doctorName, appointmentDate, slot, paymentMethod) {
    const res = await fetch(`${API_BASE_URL}/doctors/book`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ doctorId, doctorName, appointmentDate, slot, paymentMethod })
    });
    return await handleResponse(res);
  },

  async fetchAppointments() {
    const res = await fetch(`${API_BASE_URL}/doctors/appointments`, {
      headers: getHeaders()
    });
    return await handleResponse(res);
  },

  // Payments
  async processPayment(paymentData) {
    const res = await fetch(`${API_BASE_URL}/payments/checkout`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(paymentData)
    });
    return await handleResponse(res);
  },

  async fetchPaymentHistory() {
    const res = await fetch(`${API_BASE_URL}/payments/history`, {
      headers: getHeaders()
    });
    return await handleResponse(res);
  },

  // AI Chat
  async sendChatMessage(message) {
    const res = await fetch(`${API_BASE_URL}/chat/message`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ message })
    });
    return await handleResponse(res);
  },

  async fetchChatHistory() {
    const res = await fetch(`${API_BASE_URL}/chat/history`, {
      headers: getHeaders()
    });
    return await handleResponse(res);
  },

  // Wellness Entries
  async addWellnessEntry(type, content) {
    const res = await fetch(`${API_BASE_URL}/wellness/entry`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ type, content })
    });
    return await handleResponse(res);
  },

  async fetchWellnessEntries(type = '') {
    const url = type ? `${API_BASE_URL}/wellness/entries?type=${type}` : `${API_BASE_URL}/wellness/entries`;
    const res = await fetch(url, {
      headers: getHeaders()
    });
    return await handleResponse(res);
  }
};
