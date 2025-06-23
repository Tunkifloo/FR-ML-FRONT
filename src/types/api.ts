export interface ResponseWithData<T = any> {
    success: boolean;
    message: string;
    data: T;
    timestamp?: string;
}

export interface ResponsePaginado<T = any> {
    success: boolean;
    message: string;
    data: T[];
    total: number;
    pagina: number;
    items_por_pagina: number;
    total_paginas: number;
    timestamp?: string;
}

export interface ErrorResponse {
    success: false;
    message: string;
    error?: string;
    detail?: string;
    timestamp?: string;
    status_code?: number;
}

export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
    timestamp?: string;
    status_code?: number;
}

export interface PaginationInfo {
    total: number;
    pagina: number;
    items_por_pagina: number;
    total_paginas: number;
    has_next: boolean;
    has_previous: boolean;
}

export interface ApiError {
    message: string;
    code?: string;
    status?: number;
    details?: any;
    timestamp?: string;
}

export interface RequestConfig {
    baseURL?: string;
    timeout?: number;
    headers?: Record<string, string>;
    params?: Record<string, any>;
    retryAttempts?: number;
}

export interface ApiServiceConfig {
    baseUrl: string;
    timeout: number;
    maxRetries: number;
    retryDelay: number;
    headers: Record<string, string>;
}