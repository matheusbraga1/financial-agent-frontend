import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  FileText,
  Database,
  AlertCircle,
  CheckCircle,
  Loader2,
  X,
  FileUp,
  FileCode,
} from 'lucide-react';
import toast from 'react-hot-toast';
import documentsService from '../services/api/documentsService';

/**
 * Página de gerenciamento de documentos (Admin)
 * Permite upload e ingestão de documentos para a base de conhecimento
 */
const Documents = () => {
  const { isAdmin, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadMode, setUploadMode] = useState('file'); // 'file' ou 'manual'

  // Upload de arquivo
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileCategory, setFileCategory] = useState('Documento');
  const [fileDepartment, setFileDepartment] = useState('');
  const [fileTags, setFileTags] = useState('');
  const [uploading, setUploading] = useState(false);

  // Ingestão manual
  const [manualTitle, setManualTitle] = useState('');
  const [manualContent, setManualContent] = useState('');
  const [manualCategory, setManualCategory] = useState('Documento');
  const [manualDepartment, setManualDepartment] = useState('');
  const [manualTags, setManualTags] = useState('');
  const [ingesting, setIngesting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!isAdmin) {
      toast.error('Acesso negado. Esta página é apenas para administradores.');
      navigate('/dashboard');
      return;
    }

    loadStats();
  }, [isAuthenticated, isAdmin, navigate]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await documentsService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      toast.error('Não foi possível carregar as estatísticas');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Valida tipo de arquivo
      const validTypes = ['.txt', '.md', '.pdf', '.docx'];
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase();

      if (!validTypes.includes(fileExtension)) {
        toast.error('Tipo de arquivo não suportado. Use: .txt, .md, .pdf ou .docx');
        e.target.value = '';
        return;
      }

      // Valida tamanho (50MB)
      const maxSize = 50 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error('Arquivo muito grande. Tamanho máximo: 50MB');
        e.target.value = '';
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      toast.error('Selecione um arquivo');
      return;
    }

    try {
      setUploading(true);
      const result = await documentsService.uploadDocument(
        selectedFile,
        fileCategory,
        fileDepartment,
        fileTags
      );

      toast.success(
        `Upload concluído! ${result.chunks_processed} chunks processados.`
      );

      // Limpa o formulário
      setSelectedFile(null);
      setFileCategory('Documento');
      setFileDepartment('');
      setFileTags('');
      document.getElementById('file-input').value = '';

      // Recarrega estatísticas
      await loadStats();
    } catch (error) {
      toast.error(error.message || 'Erro ao fazer upload');
    } finally {
      setUploading(false);
    }
  };

  const handleManualIngest = async (e) => {
    e.preventDefault();

    if (!manualTitle.trim() || !manualContent.trim()) {
      toast.error('Preencha título e conteúdo');
      return;
    }

    if (manualContent.length < 50) {
      toast.error('Conteúdo muito curto (mínimo 50 caracteres)');
      return;
    }

    try {
      setIngesting(true);
      const result = await documentsService.ingestDocument(
        manualTitle.trim(),
        manualContent.trim(),
        manualCategory,
        manualDepartment,
        manualTags
      );

      toast.success(
        `Documento ingerido! ${result.chunks_processed} chunks processados.`
      );

      // Limpa o formulário
      setManualTitle('');
      setManualContent('');
      setManualCategory('Documento');
      setManualDepartment('');
      setManualTags('');

      // Recarrega estatísticas
      await loadStats();
    } catch (error) {
      toast.error(error.message || 'Erro ao ingerir documento');
    } finally {
      setIngesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Gerenciamento de Documentos
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gerencie a base de conhecimento do assistente
        </p>
      </div>

      {/* Estatísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <Database className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total de Documentos
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.total_documents || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Documentos Indexados
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.indexed_documents || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <AlertCircle
                className={`w-8 h-8 ${
                  stats.status === 'healthy'
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
                  {stats.status}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Seletor de modo */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setUploadMode('file')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            uploadMode === 'file'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          <FileUp className="w-4 h-4" />
          Upload de Arquivo
        </button>
        <button
          onClick={() => setUploadMode('manual')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            uploadMode === 'manual'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          <FileCode className="w-4 h-4" />
          Ingestão Manual
        </button>
      </div>

      {/* Formulários */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
        {uploadMode === 'file' ? (
          // Upload de arquivo
          <form onSubmit={handleUpload} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Arquivo
              </label>
              <div className="flex items-center gap-4">
                <input
                  id="file-input"
                  type="file"
                  onChange={handleFileChange}
                  accept=".txt,.md,.pdf,.docx"
                  className="block w-full text-sm text-gray-900 dark:text-gray-100
                           file:mr-4 file:py-2 file:px-4
                           file:rounded-lg file:border-0
                           file:text-sm file:font-semibold
                           file:bg-blue-50 file:text-blue-700
                           hover:file:bg-blue-100
                           dark:file:bg-blue-900/20 dark:file:text-blue-400"
                />
                {selectedFile && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      document.getElementById('file-input').value = '';
                    }}
                    className="p-2 text-gray-500 hover:text-red-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
              {selectedFile && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Selecionado: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Formatos: .txt, .md, .pdf, .docx (máx. 50MB)
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Categoria
                </label>
                <input
                  type="text"
                  value={fileCategory}
                  onChange={(e) => setFileCategory(e.target.value)}
                  placeholder="Documento"
                  maxLength={100}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Departamento
                </label>
                <input
                  type="text"
                  value={fileDepartment}
                  onChange={(e) => setFileDepartment(e.target.value)}
                  placeholder="Financeiro"
                  maxLength={50}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  value={fileTags}
                  onChange={(e) => setFileTags(e.target.value)}
                  placeholder="financeiro, relatório"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Separe por vírgula
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={!selectedFile || uploading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700
                       text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Fazendo upload...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Fazer Upload
                </>
              )}
            </button>
          </form>
        ) : (
          // Ingestão manual
          <form onSubmit={handleManualIngest} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Título *
              </label>
              <input
                type="text"
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                placeholder="Título do documento"
                minLength={3}
                maxLength={500}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Conteúdo *
              </label>
              <textarea
                value={manualContent}
                onChange={(e) => setManualContent(e.target.value)}
                placeholder="Cole ou digite o conteúdo do documento aqui..."
                minLength={50}
                required
                rows={10}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-y"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Mínimo 50 caracteres ({manualContent.length} caracteres)
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Categoria
                </label>
                <input
                  type="text"
                  value={manualCategory}
                  onChange={(e) => setManualCategory(e.target.value)}
                  placeholder="Documento"
                  maxLength={100}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Departamento
                </label>
                <input
                  type="text"
                  value={manualDepartment}
                  onChange={(e) => setManualDepartment(e.target.value)}
                  placeholder="Financeiro"
                  maxLength={50}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  value={manualTags}
                  onChange={(e) => setManualTags(e.target.value)}
                  placeholder="financeiro, relatório"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Separe por vírgula
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={!manualTitle.trim() || !manualContent.trim() || ingesting}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700
                       text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {ingesting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" />
                  Ingerir Documento
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Documents;
