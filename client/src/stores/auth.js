import { reactive } from 'vue';

function decodeJwt(token) {
    if (!token) return null;
    try {
        const base64Url = token.split('.')[1];
        if (!base64Url) return null;
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch {
        return null;
    }
}

function getStoredUser() {
    const token = localStorage.getItem('token');
    const stored = localStorage.getItem('user');
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch {
            // fallback to token decoding
        }
    }
    return decodeJwt(token);
}

export const authState = reactive({
    token: localStorage.getItem('token') || null,
    user: getStoredUser(),

    get isAuthenticated() {
        return !!this.token;
    },

    get isAdmin() {
        return !!this.user?.isAdmin;
    },

    login(token, userData = null) {
        this.token = token;
        const user = userData || decodeJwt(token) || {};
        this.user = user;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
    },

    logout() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
});
