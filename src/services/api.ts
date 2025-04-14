import axios from 'axios';
import { LoginCredentials, LoginResponse, UpdateUserData, User, UsersResponse } from '../types';

const BASE_URL = 'https://reqres.in/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check for token expiry (status 401)
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    // Handle general errors
    if (error.response?.status === 500) {
      console.error('Internal server error, please try again later.');
    }

    return Promise.reject(error);
  }
);

// Login API call
export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  try {
    const response = await api.post<LoginResponse>('/login', credentials);
    return response.data;
  } catch (error) {
    console.error('Error during login:', error);
    throw error; // Propagate error so calling code can handle it
  }
};

// Get users with pagination
export const getUsers = async (page: number = 1): Promise<UsersResponse> => {
  try {
    const response = await api.get<UsersResponse>(`/users?page=${page}&per_page=6`);
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

// Update user data
export const updateUser = async (id: number, data: UpdateUserData): Promise<User> => {
  try {
    const response = await api.put<{ data: User }>(`/users/${id}`, data);
    // Simulate successful update (replace with actual server-side logic later)
    return {
      id,
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
      avatar: `https://reqres.in/img/faces/${id}-image.jpg`, // Mock avatar
    };
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

// Delete a user
export const deleteUser = async (id: number): Promise<void> => {
  try {
    await api.delete(`/users/${id}`);
    // The mock API returns 204 No Content for successful deletion
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};
