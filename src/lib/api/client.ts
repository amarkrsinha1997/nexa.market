import { API_CONFIG } from "../config/api";
import { STORAGE_KEYS } from "../config/storage-keys";
import { authApi } from "./auth";

// Debug: Log environment variable at module load
if (typeof window !== "undefined") {
    console.log(
        "[API Client] Using Base URL:",
        API_CONFIG.BASE_URL
    );
}

const API_BASE_URL = API_CONFIG.BASE_URL;

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    // Backend format: { error: "ERROR_CODE" } or old format: { error: { code, message } }
    error?:
    | string
    | {
        code: string;
        message: string;
        details?: any;
    };
    details?: any;
}

export class ApiError extends Error {
    code: string;
    details?: any;

    constructor(message: string, code: string, details?: any) {
        super(message);
        this.name = "ApiError";
        this.code = code;
        this.details = details;
    }
}

class ApiClient {
    private baseURL: string;

    constructor(baseURL: string = API_BASE_URL) {
        this.baseURL = baseURL;
    }

    /**
     * Get authentication token from localStorage
     */
    private getToken(): string | null {
        if (typeof globalThis.window === "undefined") return null;
        return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    }

    /**
     * Build headers with authentication
     */
    private buildHeaders(
        customHeaders?: Record<string, string>
    ): Record<string, string> {
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
            ...customHeaders,
        };

        const token = this.getToken();
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        return headers;
    }


    /**
     * Check if token is expired
     * Adds a small buffer (10s) to prevent edge cases where token expires during flight
     * (This logic is now in authApi but we keep the method signature for compatibility if needed, 
     * but actually the reference implementation delegated it.)
     */

    /**
     * Ensure token is valid.
     * Delegates to Auth API to check expiration/refresh.
     */
    public async ensureTokenValid(): Promise<boolean> {
        const token = this.getToken();
        if (!token) return false;

        // Use authApi to check/refresh
        return authApi.refreshSession();
    }


    /**
     * Handle session expiration
     */
    private handleSessionExpired() {
        console.warn("[API] Session expired, redirecting to login");
        localStorage.clear();
        sessionStorage.clear();
        // Clear cookies
        document.cookie.split(";").forEach((c) => {
            document.cookie = c
                .replace(/^ +/, "")
                .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });

        window.location.href = "/login";
        throw new ApiError("Session expired", "AUTH_EXPIRED");
    }

    /**
     * Make HTTP request
     */
    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        const token = this.getToken();

        // 1. Ensure token is valid before request (checks expiry and refreshes if needed)
        // This moves the logic "inside" a dedicated check method as requested
        await this.ensureTokenValid();

        const url = `${this.baseURL}${endpoint}`;

        // Debug: Log the actual URL being called
        // console.log("[API] Calling:", url);

        try {
            const headers = this.buildHeaders(
                options.headers as Record<string, string>
            );

            const response = await fetch(url, {
                ...options,
                headers,
            });

            // 2. Handle 401 Unauthorized (Token might be invalid/revoked despite not being expired in time)
            if (response.status === 401) {
                console.log("[API] Received 401, attempting refresh...");
                // Force refresh via authApi
                const refreshed = await authApi.refreshSession(true);

                if (refreshed) {
                    // Retry original request with new token
                    const newHeaders = this.buildHeaders(
                        options.headers as Record<string, string>
                    );
                    const retryResponse = await fetch(url, {
                        ...options,
                        headers: newHeaders,
                    });

                    if (retryResponse.status === 401) {
                        this.handleSessionExpired();
                    }

                    const retryData: ApiResponse<T> = await retryResponse.json();
                    if (!retryResponse.ok) {
                        this.throwApiError(retryData);
                    }
                    return retryData;
                } else {
                    this.handleSessionExpired();
                }
            }

            const data: ApiResponse<T> = await response.json();

            if (!response.ok) {
                this.throwApiError(data);
            }

            return data;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }

            if (error instanceof Error) {
                throw new ApiError(error.message, "NETWORK_ERROR");
            }

            throw new ApiError("Unknown error occurred", "UNKNOWN_ERROR");
        }
    }

    private throwApiError(data: any) {
        // Backend returns: { success: false, message: "...", error: "ERROR_CODE", details?: ... }
        // Parse both old and new format
        const errorMessage =
            data.message ||
            (typeof data.error === "object" ? data.error.message : undefined) ||
            "Request failed";
        const errorCode =
            (typeof data.error === "string"
                ? data.error
                : typeof data.error === "object"
                    ? data.error.code
                    : undefined) || "UNKNOWN_ERROR";
        const errorDetails =
            typeof data.error === "object" ? data.error.details : undefined;

        throw new ApiError(errorMessage, errorCode, errorDetails);
    }

    /**
     * GET request
     */
    async get<T>(endpoint: string): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { method: "GET" });
    }

    /**
     * POST request
     */
    async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: "POST",
            body: JSON.stringify(body),
        });
    }

    /**
     * PATCH request
     */
    async patch<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: "PATCH",
            body: JSON.stringify(body),
        });
    }

    /**
     * PUT request
     */
    async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: "PUT",
            body: JSON.stringify(body),
        });
    }

    /**
     * DELETE request
     */
    async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { method: "DELETE" });
    }

    /**
     * Get Blob (File) request
     */
    async getBlob(endpoint: string): Promise<Blob> {
        const token = this.getToken();
        const isValid = await this.ensureTokenValid();

        if (token && !isValid) {
            this.handleSessionExpired();
        }

        const url = `${this.baseURL}${endpoint}`;
        const headers = this.buildHeaders();
        // Remove Content-Type for blob requests usually, or keep it.
        // fetch default is fine.

        try {
            const response = await fetch(url, {
                method: "GET",
                headers,
            });

            if (!response.ok) {
                // Try to parse error as JSON if possible
                try {
                    const data = await response.json();
                    const errorMessage =
                        data.message ||
                        (typeof data.error === "object" ? data.error.message : undefined) ||
                        "Request failed";
                    const errorCode =
                        (typeof data.error === "string"
                            ? data.error
                            : typeof data.error === "object"
                                ? data.error.code
                                : undefined) || "UNKNOWN_ERROR";
                    throw new ApiError(errorMessage, errorCode);
                } catch (e) {
                    if (e instanceof ApiError) throw e;
                    throw new ApiError(`Request failed with status ${response.status}`, "NETWORK_ERROR");
                }
            }

            return await response.blob();
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError("Download failed", "NETWORK_ERROR");
        }
    }
}

export const apiClient = new ApiClient();
