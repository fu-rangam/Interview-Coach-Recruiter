import { API_HEADERS } from './constants';

import { ZodSchema } from 'zod';

type RequestConfig = {
    headers?: Record<string, string>;
    token?: string;
    schema?: ZodSchema;
};

class ApiClient {
    private static buildHeaders(config: RequestConfig = {}, hasBody: boolean = true): HeadersInit {
        const headers: Record<string, string> = {
            ...config.headers,
        };

        if (hasBody) {
            headers['Content-Type'] = 'application/json';
        }

        if (config.token) {
            headers[API_HEADERS.CANDIDATE_TOKEN] = config.token;
        }

        return headers;
    }

    private static async handleResponse<T>(response: Response, schema?: ZodSchema): Promise<T> {
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(error.message || `API Error: ${response.status}`);
        }
        // Some endpoints might return empty body
        if (response.status === 204) {
            return {} as T;
        }
        const data = await response.json();
        if (schema) {
            return schema.parse(data) as T;
        }
        return data;
    }

    static async get<T>(url: string, config?: RequestConfig): Promise<T> {
        const response = await fetch(url, {
            method: 'GET',
            headers: this.buildHeaders(config, false),
        });
        return this.handleResponse<T>(response, config?.schema);
    }

    static async post<T>(url: string, body: unknown, config?: RequestConfig): Promise<T> {
        const response = await fetch(url, {
            method: 'POST',
            headers: this.buildHeaders(config, true),
            body: JSON.stringify(body),
        });
        return this.handleResponse<T>(response, config?.schema);
    }

    static async postWithHeaders<T>(url: string, body: unknown, config?: RequestConfig): Promise<{ data: T; headers: Headers }> {
        const response = await fetch(url, {
            method: 'POST',
            headers: this.buildHeaders(config, true),
            body: JSON.stringify(body),
        });
        const data = await this.handleResponse<T>(response, config?.schema);
        return { data, headers: response.headers };
    }

    static async patch<T>(url: string, body: unknown, config?: RequestConfig): Promise<T> {
        const response = await fetch(url, {
            method: 'PATCH',
            headers: this.buildHeaders(config, true),
            body: JSON.stringify(body),
        });
        return this.handleResponse<T>(response, config?.schema);
    }

    static async put<T>(url: string, body: unknown, config?: RequestConfig): Promise<T> {
        const response = await fetch(url, {
            method: 'PUT',
            headers: this.buildHeaders(config, true),
            body: JSON.stringify(body),
        });
        return this.handleResponse<T>(response, config?.schema);
    }
}

export { ApiClient };
