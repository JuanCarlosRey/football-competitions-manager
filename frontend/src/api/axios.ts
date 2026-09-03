import axios from 'axios';

/**
 * Axios instance configured for making API requests to the backend server. It sets the base URL for the API, specifies that the content type is JSON, and enables sending credentials (like cookies) with requests. This instance can be used throughout the frontend application to interact with the backend API.
 */
export const apiClient = axios.create({
    baseURL: 'http://localhost:3000/api',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});