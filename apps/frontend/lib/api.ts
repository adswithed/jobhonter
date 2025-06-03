import axios from 'axios';

const ERROR_MESSAGES = {
  NETWORK: "🌐 Oops! Looks like we're having trouble connecting. Please check your internet connection.",
  DUPLICATE_EMAIL: "📧 This email is already in use. Try logging in instead!",
  INVALID_CREDENTIALS: "🔑 Oops! Those credentials don't match our records. Double-check and try again!",
  VALIDATION: "📝 Please fill in all required fields correctly.",
  SERVER: "😅 Our servers are having a moment. Please try again in a few minutes!",
  UNAUTHORIZED: "🔒 Please log in to continue.",
  DEFAULT: "🤔 Something went wrong. Please try again!"
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
  name: string;
  email: string;
}

export const authApi = {
  register: async (data: { email: string; password: string; name: string }) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  login: async (data: { email: string; password: string }) => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      // Clear local storage and cookies regardless of API response
      localStorage.removeItem('token');
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
};

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

export const applicationsApi = {
  getAll: async () => {
    const response = await api.get('/applications');
    return response.data;
  },

  getApplications: async () => {
    const response = await api.get('/applications');
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/applications', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.patch(`/applications/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/applications/${id}`);
    return response.data;
  },
};

export default api; 