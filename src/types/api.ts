export interface ResponseWithData<T = any> {
    success: boolean;
    message: string;
    data: T;
}

export interface ResponsePaginado<T = any> {
    success: boolean;
    message: string;
    data: T[];
    total: number;
    pagina: number;
    items_por_pagina: number;
    total_paginas: number;
}