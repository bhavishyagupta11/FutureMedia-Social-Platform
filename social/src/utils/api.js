const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

export const apiFetch = (path, options) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return fetch(`${API_BASE_URL}${normalizedPath}`, options);
};

