import { useState, useEffect, useCallback } from 'react';
import { BASE_API_URL } from '../services/api';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface FetchOptions {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: Record<string, unknown>;
  authorized?: boolean;
}

interface FetchState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Custom hook for handling API requests
 * @param url - The endpoint URL (without the base URL)
 * @param options - Request options
 * @returns Object containing data, loading state, error, and fetch functions
 */
export const useFetch = <T = unknown>(initialUrl?: string, initialOptions?: FetchOptions) => {
  const [url, setUrl] = useState<string | null>(initialUrl || null);
  const [options, setOptions] = useState<FetchOptions>(initialOptions || {});
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const fetchData = useCallback(async (fetchUrl?: string, fetchOptions?: FetchOptions) => {
    const currentUrl = fetchUrl || url;
    if (!currentUrl) return;
    
    const currentOptions = { ...options, ...fetchOptions };
    const { method = 'GET', headers = {}, body, authorized = true } = currentOptions;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Prepare headers
      const requestHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        ...headers,
      };

      // Add authorization if required
      if (authorized) {
        const token = localStorage.getItem('token');
        if (token) {
          requestHeaders.Authorization = `Bearer ${token}`;
        }
      }

      // Prepare request options
      const requestOptions: RequestInit = {
        method,
        headers: requestHeaders,
      };

      // Add body for non-GET requests
      if (method !== 'GET' && body) {
        requestOptions.body = JSON.stringify(body);
      }

      // Make the request
      const fullUrl = `${BASE_API_URL}${currentUrl.startsWith('/') ? currentUrl : `/${currentUrl}`}`;
      const response = await fetch(fullUrl, requestOptions);

      // Handle non-2xx responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Request failed with status ${response.status}`
        );
      }

      // Parse response
      const responseData = await response.json();
      setState({
        data: responseData,
        isLoading: false,
        error: null,
      });

      return responseData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setState({
        data: null,
        isLoading: false,
        error: new Error(errorMessage),
      });
      throw error;
    }
  }, [url, options]);

  // Execute fetch when URL changes
  useEffect(() => {
    if (url) {
      fetchData();
    }
  }, [url, fetchData]);

  // Convenience methods for different HTTP methods
  const get = useCallback((fetchUrl?: string, fetchOptions?: Omit<FetchOptions, 'method' | 'body'>) => {
    return fetchData(fetchUrl, { ...fetchOptions, method: 'GET' });
  }, [fetchData]);

  const post = useCallback((fetchUrl?: string, body?: Record<string, unknown>, fetchOptions?: Omit<FetchOptions, 'method'>) => {
    return fetchData(fetchUrl, { ...fetchOptions, method: 'POST', body });
  }, [fetchData]);

  const put = useCallback((fetchUrl?: string, body?: Record<string, unknown>, fetchOptions?: Omit<FetchOptions, 'method'>) => {
    return fetchData(fetchUrl, { ...fetchOptions, method: 'PUT', body });
  }, [fetchData]);

  const patch = useCallback((fetchUrl?: string, body?: Record<string, unknown>, fetchOptions?: Omit<FetchOptions, 'method'>) => {
    return fetchData(fetchUrl, { ...fetchOptions, method: 'PATCH', body });
  }, [fetchData]);

  const del = useCallback((fetchUrl?: string, fetchOptions?: Omit<FetchOptions, 'method'>) => {
    return fetchData(fetchUrl, { ...fetchOptions, method: 'DELETE' });
  }, [fetchData]);

  return {
    ...state,
    setUrl,
    setOptions,
    fetchData,
    get,
    post,
    put,
    patch,
    delete: del,
  };
};

export default useFetch;