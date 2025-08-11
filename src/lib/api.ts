import axios from 'axios';

let csrfToken: string | null = null;

async function fetchCsrfToken(): Promise<string> {
    if (csrfToken) return csrfToken;

    const res = await fetch('/api/csrf-token', {credentials: 'include'});
    if (!res.ok) throw new Error('Failed to fetch CSRF token');

    const data = await res.json();
    csrfToken = data.csrfToken;
    return csrfToken ?? '';
}

export async function initCsrf() {
    axios.interceptors.request.use(async (config) => {
        if (config.method && config.method.toUpperCase() !== 'GET') {
            config.headers['x-csrf-token'] = await fetchCsrfToken();
            config.withCredentials = true;
        }
        return config;
    });
}

