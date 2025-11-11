import { generateId } from '../../../utils';
import { MESSAGE_TYPES } from '../constants/chatConstants';

export const createUserMessage = (content) => ({
  id: generateId(),
  type: MESSAGE_TYPES.USER,
  content,
  timestamp: new Date(),
  messageId: null,
});

export const createAssistantMessage = () => ({
  id: generateId(),
  type: MESSAGE_TYPES.ASSISTANT,
  content: '',
  sources: [],
  timestamp: new Date(),
  modelUsed: '',
  messageId: null,
  confidence: null,
});
