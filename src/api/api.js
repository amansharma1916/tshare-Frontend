const API_URL = import.meta.env.VITE_BACKEND_URL;
if (!API_URL) {
    throw new Error('Missing VITE_BACKEND_URL. Set it in your frontend .env file.');
}

export const baseUrl = API_URL;

export const endpoints = {
    save: `${API_URL}/save`,
    get: (id) => `${API_URL}/get/${id}`,
    uploadImage: `${API_URL}/image/upload`,
    getImage: (id) => `${API_URL}/image/${id}`,
    downloadImage: (id) => `${API_URL}/image/download/${id}`,
    adminLogin: `${API_URL}/admin/login`,
    adminTexts: `${API_URL}/admin/texts`,
    adminImages: `${API_URL}/admin/images`,
    adminDeleteText: (id) => `${API_URL}/admin/texts/${id}`,
    adminDeleteImage: (id) => `${API_URL}/admin/images/${id}`,
    adminDeleteAllTexts: `${API_URL}/admin/texts`,
    adminDeleteAllImages: `${API_URL}/admin/images`,
    adminUpdateText: (id) => `${API_URL}/admin/texts/${id}`,
    adminChangePassword: `${API_URL}/admin/password`,
    adminUpdateCode: (id) => `${API_URL}/admin/texts/${id}/code`,
    adminRegenerateCode: (id) => `${API_URL}/admin/texts/${id}/regenerate-code`,
    adminCheckCode: (code) => `${API_URL}/admin/check-code/${code}`,
    adminUpdateImageCode: (id) => `${API_URL}/admin/images/${id}/code`,
    adminRegenerateImageCode: (id) => `${API_URL}/admin/images/${id}/regenerate-code`,
    adminCheckImageCode: (code) => `${API_URL}/admin/check-image-code/${code}`,

    adminPublicRooms: `${API_URL}/admin/public-rooms`,
    adminDeletePublicRoom: (code) => `${API_URL}/admin/public-rooms/${code}`,
    adminTogglePublicRoomStatus: (code) => `${API_URL}/admin/public-rooms/${code}/toggle-status`,
    validatePublicRoom: (code) => `${API_URL}/public-room/validate/${code}`,
    getPublicRoomMessages: (code) => `${API_URL}/public-room/${code}/messages`,
};

export default {
    API_URL,
    baseUrl,
    endpoints,
};

