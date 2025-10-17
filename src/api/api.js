// src/api/api.js
const API_URL = import.meta.env.VITE_BACKEND_URL || 'https://tshare-backend.vercel.app';

export const baseUrl = API_URL;

export const endpoints = {
    save: `${API_URL}/save`,
    get: (id) => `${API_URL}/get/${id}`,
    adminLogin: `${API_URL}/admin/login`,
    adminTexts: `${API_URL}/admin/texts`,
    adminDeleteText: (id) => `${API_URL}/admin/texts/${id}`,
    adminDeleteAllTexts: `${API_URL}/admin/texts`,
    adminUpdateText: (id) => `${API_URL}/admin/texts/${id}`,
    adminChangePassword: `${API_URL}/admin/password`,
    adminUpdateCode: (id) => `${API_URL}/admin/texts/${id}/code`,
    adminRegenerateCode: (id) => `${API_URL}/admin/texts/${id}/regenerate-code`,
    adminCheckCode: (code) => `${API_URL}/admin/check-code/${code}`,
};

export default {
    API_URL,
    baseUrl,
    endpoints,
};
