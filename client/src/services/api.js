const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

export async function request(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  const body = await response.json().catch(() => null);
  if (!response.ok || !body?.success) throw new Error(body?.error?.message || 'Something went wrong. Please try again.');
  return body.data;
}

export const api = {
  create: (payload) => request('/mysteries', { method: 'POST', body: JSON.stringify(payload) }),
  case: (id) => request(`/mysteries/${id}`),
  suspects: (id) => request(`/mysteries/${id}/suspects`),
  evidence: (id, type = '') => request(`/mysteries/${id}/evidence${type ? `?type=${encodeURIComponent(type)}` : ''}`),
  evidenceDetail: (id, evidenceId) => request(`/mysteries/${id}/evidence/${evidenceId}`),
  createSession: (id) => request(`/mysteries/${id}/sessions`, { method: 'POST', body: JSON.stringify({}) }),
  examine: (id, sessionId, evidenceId) => request(`/mysteries/${id}/sessions/${sessionId}/examined`, { method: 'POST', body: JSON.stringify({ evidenceId }) }),
  progress: (id, sessionId) => request(`/mysteries/${id}/sessions/${sessionId}`),
  verdict: (id, sessionId, suspectId, explanation) => request(`/mysteries/${id}/verdict`, { method: 'POST', body: JSON.stringify({ sessionId, suspectId, explanation }) }),
  reveal: (id, sessionId) => request(`/mysteries/${id}/reveal`, { method: 'POST', body: JSON.stringify({ sessionId }) }),
};
