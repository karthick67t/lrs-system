const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, config);

  if (response.status === 401) {
    // Clear auth state and redirect to login
    localStorage.removeItem('token');
    localStorage.removeItem('member');
    localStorage.removeItem('memberId');
    localStorage.removeItem('role');
    window.location.href = '/login';
    throw new Error('Session expired or invalid authentication. Please log in again.');
  }

  if (response.status === 403) {
    const errorText = await response.text().catch(() => '');
    let msg = 'Access Denied: You do not have permission to perform this action.';
    try {
      const parsed = JSON.parse(errorText);
      if (parsed.message) msg = parsed.message;
    } catch (e) {
      if (errorText) msg = errorText;
    }
    throw new Error(msg);
  }

  if (response.status === 204) {
    return null;
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    let msg = `API Error: ${response.status} ${response.statusText}`;
    try {
      const parsed = JSON.parse(errorText);
      if (parsed.message) msg = parsed.message;
    } catch (e) {
      if (errorText) msg = errorText;
    }
    throw new Error(msg);
  }

  return response.json();
};

export const apiDownloadBlob = async (endpoint, defaultFileName = 'export_file') => {
  const token = localStorage.getItem('token');

  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const fetchUrl = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  const response = await fetch(fetchUrl, { headers });

  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('member');
    localStorage.removeItem('memberId');
    localStorage.removeItem('role');
    window.location.href = '/login';
    throw new Error('Session expired or invalid authentication. Please log in again.');
  }

  if (response.status === 403) {
    const errorText = await response.text().catch(() => '');
    let msg = 'Access Denied: Only SUPER_ADMIN users are authorized to export transaction history.';
    try {
      const parsed = JSON.parse(errorText);
      if (parsed.message) msg = parsed.message;
    } catch (e) {
      if (errorText) msg = errorText;
    }
    throw new Error(msg);
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    let msg = `Export failed with HTTP ${response.status} ${response.statusText}`;
    try {
      const parsed = JSON.parse(errorText);
      if (parsed.message) msg = parsed.message;
    } catch (e) {
      if (errorText) msg = errorText;
    }
    throw new Error(msg);
  }

  // Extract filename from Content-Disposition header if present
  let fileName = defaultFileName;
  const disposition = response.headers.get('Content-Disposition');
  if (disposition && disposition.includes('filename=')) {
    const filenameMatch = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
    if (filenameMatch && filenameMatch[1]) {
      fileName = filenameMatch[1].replace(/['"]/g, '');
    }
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
  return { fileName, sizeBytes: blob.size };
};
