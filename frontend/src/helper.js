// Ensure the API base URL does not end with a trailing slash so concatenation
// with paths like "/login" always produces a valid single-slash URL.
const _raw_api_base = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
export const api_base_url = String(_raw_api_base).replace(/\/+$/, '');