import axios, { AxiosInstance } from 'axios';

const BASE_URL = 'http://192.168.0.220:8000/api/v1';

class ApiService {
    private api: AxiosInstance;

    constructor() {
        this.api = axios.create({
            baseURL: BASE_URL,
            timeout: 30000, // 30 segundos para reconocimiento
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Interceptor para requests
        this.api.interceptors.request.use(
            (config) => {
                console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
                return config;
            },
            (error) => {
                console.error('❌ API Request Error:', error);
                return Promise.reject(error);
            }
        );

        // Interceptor para responses
        this.api.interceptors.response.use(
            (response) => {
                console.log(`✅ API Response: ${response.status} ${response.config.url}`);
                return response;
            },
            (error) => {
                console.error('❌ API Response Error:', error.response?.data || error.message);
                return Promise.reject(error);
            }
        );
    }

    // Método para crear FormData con imagen
    createFormData(data: Record<string, any>, imageUri?: string, imageName: string = 'imagen'): FormData {
        const formData = new FormData();

        // Añadir imagen si se proporciona
        if (imageUri) {
            formData.append(imageName, {
                uri: imageUri,
                type: 'image/jpeg',
                name: 'image.jpg',
            } as any);
        }

        // Añadir otros campos
        Object.keys(data).forEach(key => {
            if (data[key] !== undefined && data[key] !== null) {
                formData.append(key, data[key]);
            }
        });

        return formData;
    }

    get axiosInstance() {
        return this.api;
    }
}

export const apiService = new ApiService();