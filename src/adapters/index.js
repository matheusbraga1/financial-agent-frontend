/**
 * Barrel export para adaptadores
 * Centraliza exportações para facilitar imports
 */

export {
  extractData,
  isApiResponse,
  extractMessage,
  extractDataWithMessage,
  createSuccessResponse,
  createErrorResponse,
  safeExtractData,
} from './apiResponseAdapter';
