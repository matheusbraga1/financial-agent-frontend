export const generateId = () => {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
};