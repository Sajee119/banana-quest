import axios from 'axios';

const api = axios.create({
    baseURL: '/',
    withCredentials: true,
    timeout: 15000, // Set a timeout of 15 seconds
});

api.interceptors.response.use(
    (r) => r,
    (err) => {
        const msg = err.response?.data?.message || err.message;
        err.friendlyMessage = msg;
        return Promise.reject(err);
    }
);

export const authApi = {
    status: () => api.get('/auth/status').then((r) => r.data),
    login: (credentials) => api.post('/auth/login', credentials).then((r) => r.data),
    register: (payload) => api.post('/auth/register', payload).then((r) => r.data),
    logout: () => api.post('/auth/logout').then((r) => r.data),
    googleLoginUrl: '/auth/google',
    facebookLoginUrl: '/auth/facebook',
};

export const userApi = {
    me: () => api.get('/api/users/me').then((r) => r.data),
    updateMe: (payload) => api.patch('/api/users/me', payload).then((r) => r.data),
    changePassword: (payload) => api.patch('/api/users/me/password', payload).then((r) => r.data),
    logins: () => api.get('/api/users/me/logins').then((r) => r.data),
    achievements: () => api.get('/api/users/me/achievements').then((r) => r.data),
    leaderboard: (limit = 25) =>
        api.get(`/api/users/leaderboard?limit=${limit}`).then((r) => r.data),
};

export const gameApi = {
    start: (mode = 'classic') => api.post('/api/game/start', { mode }).then((r) => r.data),
    answer: (sessionId, answer) =>
        api.post('/api/game/answer', { sessionId, answer }).then((r) => r.data),
    expire: (sessionId) => api.post('/api/game/expire', { sessionId }).then((r) => r.data),
    stats: () => api.get('/api/game/stats').then((r) => r.data),
    modes: () => api.get('/api/game/modes').then((r) => r.data),
};

export default api;