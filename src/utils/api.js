// API utility for authenticated requests with JWT

const serverURL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

// Get auth token from localStorage
export const getAuthToken = () => {
  return localStorage.getItem("authToken");
};

// Authenticated fetch wrapper
export const authFetch = async (url, options = {}) => {
  const token = getAuthToken();

  const headers = {
    ...options.headers,
  };

  // Add Authorization header if token exists
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Add Content-Type if not FormData
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${serverURL}${url}`, {
    ...options,
    headers,
  });

  // Handle unauthorized responses
  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem("authToken");
    window.location.href = "/signin";
  }

  return response;
};

// Authenticated GET request
export const authGet = async (url) => {
  return authFetch(url, { method: "GET" });
};

// Authenticated POST request
export const authPost = async (url, data) => {
  const body = data instanceof FormData ? data : JSON.stringify(data);

  return authFetch(url, {
    method: "POST",
    body,
  });
};

// Authenticated PUT request
export const authPut = async (url, data) => {
  const body = data instanceof FormData ? data : JSON.stringify(data);

  return authFetch(url, {
    method: "PUT",
    body,
  });
};

// Authenticated DELETE request
export const authDelete = async (url) => {
  return authFetch(url, { method: "DELETE" });
};

export default {
  authFetch,
  authGet,
  authPost,
  authPut,
  authDelete,
  getAuthToken,
};
