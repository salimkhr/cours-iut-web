import axios, {InternalAxiosRequestConfig} from 'axios';

let csrfToken: string | null = null;

export async function initCsrf(): Promise<void> {
    const res = await axios.get<{ csrfToken: string }>('/api/csrf-token', {
        withCredentials: true,
    });
    csrfToken = res.data.csrfToken;
}

export const api = axios.create({
    baseURL: '/api',
    withCredentials: true,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    if (
        csrfToken &&
        config.method &&
        config.method.toUpperCase() !== 'GET'
    ) {
        config.headers['csrf-token'] = csrfToken;
    }
    return config;
});
