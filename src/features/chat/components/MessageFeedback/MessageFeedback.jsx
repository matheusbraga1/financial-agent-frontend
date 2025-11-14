import { useState } from 'react';
import { ThumbsUp, ThumbsDown, MessageSquare, X } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Componente de Feedback para mensagens do assistente
 * Permite ao usuário avaliar a qualidade da resposta
 */
const MessageFeedback = ({ messageId, onFeedbackSent }) => {
  const [rating, setRating] = useState(null);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRating = async (newRating) => {
    // Se já foi avaliada, não permite mudar
    if (rating !== null) return;

    setRating(newRating);
    
    // Se for avaliação negativa, mostra campo de comentário
    if (newRating <= 2) {
      setShowCommentBox(true);
      return;
    }

    // Para avaliações positivas, envia direto
    await submitFeedback(newRating, null);
  };

  const submitFeedback = async (feedbackRating, feedbackComment) => {
    setIsSubmitting(true);
    
    try {
      const result = await onFeedbackSent(
        messageId,
        feedbackRating,
        feedbackComment
      );

      if (result?.success) {
        toast.success('Obrigado pelo feedback!');
        setShowCommentBox(false);
      } else {
        throw new Error(result?.error || 'Erro ao enviar feedback');
      }
    } catch (error) {
      toast.error('Não foi possível enviar o feedback');
      console.error(error);
      
      // Reseta o rating para permitir tentar novamente
      setRating(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCommentSubmit = async () => {
    if (!comment.trim()) {
      toast.error('Por favor, adicione um comentário');
      return;
    }

    await submitFeedback(rating, comment.trim());
  };

  const handleCancelComment = () => {
    setShowCommentBox(false);
    setComment('');
    setRating(null);
  };

  return (
    <div className="mt-3 space-y-2">
      {/* Botões de avaliação */}
      {!showCommentBox && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Esta resposta foi útil?
          </span>
          
          <button
            onClick={() => handleRating(5)}
            disabled={rating !== null || isSubmitting}
            className={`p-1.5 rounded-md transition-all ${
              rating === 5
                ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-hover hover:text-green-600 dark:hover:text-green-400'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title="Resposta útil"
            aria-label="Avaliar como útil"
          >
            <ThumbsUp className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleRating(1)}
            disabled={rating !== null || isSubmitting}
            className={`p-1.5 rounded-md transition-all ${
              rating === 1
                ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-hover hover:text-red-600 dark:hover:text-red-400'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title="Resposta não útil"
            aria-label="Avaliar como não útil"
          >
            <ThumbsDown className="w-4 h-4" />
          </button>

          {rating !== null && (
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
              Obrigado!
            </span>
          )}
        </div>
      )}

      {/* Campo de comentário para feedback negativo */}
      {showCommentBox && (
        <div className="p-3 bg-gray-50 dark:bg-dark-hover rounded-lg border border-gray-200 dark:border-dark-border animate-fade-in">
          <div className="flex items-start gap-2 mb-2">
            <MessageSquare className="w-4 h-4 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <label
                htmlFor={`comment-${messageId}`}
                className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1"
              >
                O que poderia ser melhorado?
              </label>
              <textarea
                id={`comment-${messageId}`}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Conte-nos o que estava errado ou como podemos melhorar..."
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-dark-border rounded-md bg-white dark:bg-dark-card text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 resize-none"
                rows={3}
                maxLength={500}
                disabled={isSubmitting}
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {comment.length}/500
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={handleCancelComment}
                    disabled={isSubmitting}
                    className="px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCommentSubmit}
                    disabled={isSubmitting || !comment.trim()}
                    className="px-3 py-1 text-xs font-medium bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Enviando...' : 'Enviar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageFeedback;