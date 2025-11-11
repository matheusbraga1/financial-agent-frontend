const getUserScope = (userId) => (userId ? `user_${userId}` : 'guest');

const getCurrentSessionKey = (userId) =>
  `fa_chat_current_session_${getUserScope(userId)}`;

const getSessionListKey = (userId) =>
  `fa_chat_sessions_${getUserScope(userId)}`;

const safeParse = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

export const loadStoredSessionId = (userId) =>
  localStorage.getItem(getCurrentSessionKey(userId));

export const persistSessionId = (userId, sessionId) => {
  if (!sessionId) return;
  localStorage.setItem(getCurrentSessionKey(userId), sessionId);
};

export const clearSessionId = (userId) => {
  localStorage.removeItem(getCurrentSessionKey(userId));
};

export const loadSessionList = (userId) =>
  safeParse(localStorage.getItem(getSessionListKey(userId)), []);

export const saveSessionList = (userId, sessions) => {
  localStorage.setItem(
    getSessionListKey(userId),
    JSON.stringify(sessions || []),
  );
  return sessions;
};

export const upsertSessionRecord = (userId, sessionId, payload) => {
  if (!sessionId) return loadSessionList(userId);

  const current = loadSessionList(userId);
  const existingIndex = current.findIndex((item) => item.id === sessionId);
  const record = {
    id: sessionId,
    title: payload?.title || 'Conversa sem título',
    updatedAt: payload?.updatedAt || new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    current[existingIndex] = { ...current[existingIndex], ...record };
  } else {
    current.unshift(record);
  }

  return saveSessionList(userId, current);
};

export const removeSessionRecord = (userId, sessionId) => {
  const current = loadSessionList(userId);
  const filtered = current.filter((item) => item.id !== sessionId);
  return saveSessionList(userId, filtered);
};
