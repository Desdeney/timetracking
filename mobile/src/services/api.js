import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Update this with your server URL
const API_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add session management
let sessionCookie = null;

api.interceptors.request.use(
  async (config) => {
    if (sessionCookie) {
      config.headers.Cookie = sessionCookie;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    // Store session cookie from Set-Cookie header
    const setCookie = response.headers['set-cookie'];
    if (setCookie) {
      sessionCookie = setCookie[0];
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (username, password) => {
    const response = await api.post('/login', { username, password });
    return response.data;
  },
  
  register: async (username, password) => {
    const response = await api.post('/register', { username, password });
    return response.data;
  },
  
  logout: async () => {
    const response = await api.get('/logout');
    sessionCookie = null;
    return response.data;
  },
};

export const taskService = {
  addTask: async (taskName, customerName, description, hours, minutes) => {
    const response = await api.post('/add-task', {
      taskName,
      customerName,
      description,
      hours,
      minutes,
    });
    return response.data;
  },
  
  getAllEntries: async () => {
    const response = await api.get('/api/all-entries');
    return response.data;
  },
  
  updateTask: async (id, taskName, customerName, description, hours, minutes) => {
    const response = await api.put(`/api/tasks/${id}`, {
      taskName,
      customerName,
      description,
      hours,
      minutes,
    });
    return response.data;
  },
  
  getFeierabend: async () => {
    const response = await api.get('/feierabend');
    return response.data;
  },
};

export const todoService = {
  getTodos: async () => {
    const response = await api.get('/api/todos');
    return response.data;
  },
  
  createTodo: async (title, description) => {
    const response = await api.post('/api/todos', { title, description });
    return response.data;
  },
  
  updateTodo: async (id, done) => {
    const response = await api.put(`/api/todos/${id}`, { done });
    return response.data;
  },
  
  deleteTodo: async (id) => {
    const response = await api.delete(`/api/todos/${id}`);
    return response.data;
  },
};

export default api;
