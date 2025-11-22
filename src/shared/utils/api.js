function getDefaultHeaders(customHeaders = {}) {
  return {
    'Content-Type': 'application/json',
    ...customHeaders,
  };
}

async function handleResponse(response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(errorData.message || `HTTP error! status: ${response.status}`);
    error.status = response.status;
    error.data = errorData;
    throw error;
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  }
  return await response.text();
}

export async function apiGet(url, options = {}) {
  const { headers: customHeaders = {}, ...fetchOptions } = options;
  const headers = getDefaultHeaders(customHeaders);

  const response = await fetch(url, {
    method: 'GET',
    headers,
    cache: 'no-store',
    ...fetchOptions,
  });

  return handleResponse(response);
}

export async function apiPost(url, data = null, options = {}) {
  const { headers: customHeaders = {}, ...fetchOptions } = options;
  const headers = getDefaultHeaders(customHeaders);

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: data ? JSON.stringify(data) : undefined,
    cache: 'no-store',
    ...fetchOptions,
  });

  return handleResponse(response);
}

export async function apiPut(url, data = null, options = {}) {
  const { headers: customHeaders = {}, ...fetchOptions } = options;
  const headers = getDefaultHeaders(customHeaders);

  const response = await fetch(url, {
    method: 'PUT',
    headers,
    body: data ? JSON.stringify(data) : undefined,
    cache: 'no-store',
    ...fetchOptions,
  });

  return handleResponse(response);
}

export async function apiDelete(url, options = {}) {
  const { headers: customHeaders = {}, ...fetchOptions } = options;
  const headers = getDefaultHeaders(customHeaders);

  const response = await fetch(url, {
    method: 'DELETE',
    headers,
    cache: 'no-store',
    ...fetchOptions,
  });

  return handleResponse(response);
}

export async function apiPatch(url, data = null, options = {}) {
  const { headers: customHeaders = {}, ...fetchOptions } = options;
  const headers = getDefaultHeaders(customHeaders);

  const response = await fetch(url, {
    method: 'PATCH',
    headers,
    body: data ? JSON.stringify(data) : undefined,
    cache: 'no-store',
    ...fetchOptions,
  });

  return handleResponse(response);
}

