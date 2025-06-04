import axios from 'axios';

const ERROR_MESSAGES = {
  NETWORK: "🌐 Looks like our job hunters got lost in cyberspace! Check your internet and let's get back to the hunt.",
  DUPLICATE_EMAIL: "📧 That email is already on our recruitment list! Time to dust off your login credentials instead.",
  INVALID_CREDENTIALS: "🔍 Hmm, those credentials didn't match our database. Even our AI agents couldn't find a match! Double-check and try again.",
  VALIDATION: "📋 Whoops! Some fields are playing hard to get. Fill them all out and let's make this application complete!",
  SERVER: "⚙️ Our job-hunting servers are taking a coffee break! Give us a moment to get them back on the grind.",
  UNAUTHORIZED: "🚫 You'll need to punch in your credentials first. No freeloading in the job hunt!",
  FORBIDDEN: "🔒 This area is for the hiring managers only! Stick to your designated hunting grounds.",
  DEFAULT: "🤔 Something unexpected happened in the job hunt. But hey, persistence pays off - try again!"
};

const SUCCESS_MESSAGES = {
  LOGIN: "🎯 Welcome back, job hunter! Time to resume the mission!",
  REGISTER: "🎉 Account created! Welcome to the most efficient job hunting crew in town!",
  LOGOUT: "👋 Logged out successfully. May your next login bring even better opportunities!",
  PROFILE_UPDATED: "✅ Profile updated! You're looking more hireable already!",
  APPLICATION_SENT: "🚀 Application fired off! Another shot at your dream job!",
  JOB_SAVED: "📌 Job saved to your hunting list! Time to prepare for the attack!",
  EMAIL_SENT: "📬 Email deployed! Your personal job-hunting missile is en route!"
};

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ERR_NETWORK') {
      throw new Error(ERROR_MESSAGES.NETWORK);
    }

    const status = error.response?.status;
    const message = error.response?.data?.message;

    switch (status) {
      case 409:
        throw new Error(ERROR_MESSAGES.DUPLICATE_EMAIL);
      case 401:
        // Clear token on unauthorized
        localStorage.removeItem('token');
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
      case 403:
        throw new Error(ERROR_MESSAGES.FORBIDDEN);
      case 400:
        throw new Error(message || ERROR_MESSAGES.VALIDATION);
      case 500:
        throw new Error(ERROR_MESSAGES.SERVER);
      default:
        throw new Error(message || ERROR_MESSAGES.DEFAULT);
    }
  }
);

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  message?: string;
}

export const authApi = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    return {
      ...response.data.data,
      message: SUCCESS_MESSAGES.REGISTER
    };
  },

  login: async (data: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    return {
      ...response.data.data,
      message: SUCCESS_MESSAGES.LOGIN
    };
  },

  logout: async (): Promise<{ message: string }> => {
    try {
      await api.post('/auth/logout');
    } finally {
      // Clear local storage and cookies regardless of API response
      localStorage.removeItem('token');
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }
    return { message: SUCCESS_MESSAGES.LOGOUT };
  },

  getProfile: async (): Promise<{ user: User }> => {
    const response = await api.get('/auth/profile');
    return response.data.data;
  },

  // Admin-specific auth methods
  adminLogin: async (data: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/admin/login', data);
    return {
      ...response.data.data,
      message: "🛡️ Admin access granted! Welcome to the command center, chief!"
    };
  },

  checkAdminAccess: async (): Promise<{ user: User }> => {
    const response = await api.get('/auth/admin/profile');
    return response.data.data;
  },
};

// Jobs API
export const jobsApi = {
  getJobs: async () => {
    const response = await api.get('/jobs');
    return response.data;
  },

  getJob: async (id: string) => {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  },

  createJob: async (data: any) => {
    const response = await api.post('/jobs', data);
    return response.data;
  },

  updateJob: async (id: string, data: any) => {
    const response = await api.put(`/jobs/${id}`, data);
    return response.data;
  },

  deleteJob: async (id: string) => {
    const response = await api.delete(`/jobs/${id}`);
    return response.data;
  },
};

// Applications API
export const applicationsApi = {
  getAll: async () => {
    const response = await api.get('/applications');
    return response.data;
  },

  getApplications: async () => {
    const response = await api.get('/applications');
    return response.data;
  },

  createApplication: async (data: any) => {
    const response = await api.post('/applications', data);
    return {
      ...response.data,
      message: SUCCESS_MESSAGES.APPLICATION_SENT
    };
  },

  updateApplication: async (id: string, data: any) => {
    const response = await api.put(`/applications/${id}`, data);
    return response.data;
  },

  deleteApplication: async (id: string) => {
    const response = await api.delete(`/applications/${id}`);
    return response.data;
  },
};

// Admin APIs
export const adminApi = {
  // User management
  getUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  updateUser: async (id: string, data: any) => {
    const response = await api.put(`/admin/users/${id}`, data);
    return response.data;
  },

  deleteUser: async (id: string) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },

  // System settings
  getSettings: async () => {
    const response = await api.get('/admin/settings');
    return response.data;
  },

  updateSettings: async (data: any) => {
    const response = await api.put('/admin/settings', data);
    return response.data;
  },

  // Analytics
  getAnalytics: async () => {
    const response = await api.get('/admin/analytics');
    return response.data;
  },

  // Scraper management
  getScraperJobs: async () => {
    const response = await api.get('/admin/scraper/jobs');
    return response.data;
  },

  createScraperJob: async (data: any) => {
    const response = await api.post('/admin/scraper/jobs', data);
    return response.data;
  },

  updateScraperJob: async (id: string, data: any) => {
    const response = await api.put(`/admin/scraper/jobs/${id}`, data);
    return response.data;
  },

  deleteScraperJob: async (id: string) => {
    const response = await api.delete(`/admin/scraper/jobs/${id}`);
    return response.data;
  },
};

export { SUCCESS_MESSAGES, ERROR_MESSAGES };

export default api; 