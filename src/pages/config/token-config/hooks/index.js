import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useConfigStore } from '../stores/configStore';
import { validateGithubToken, fetchGists, createGist, deleteGist } from '@/shared/services';

export function useTokenConfig() {
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoadingGists, setIsLoadingGists] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreatingGist, setIsCreatingGist] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, gistId: null });
  const [isDeletingGist, setIsDeletingGist] = useState(false);
  const githubToken = useConfigStore((state) => state.githubToken);
  const isValidated = useConfigStore((state) => state.isValidated);
  const gists = useConfigStore((state) => state.gists);
  const setGithubToken = useConfigStore((state) => state.setGithubToken);
  const setIsValidated = useConfigStore((state) => state.setIsValidated);
  const setGists = useConfigStore((state) => state.setGists);
  const reset = useConfigStore((state) => state.reset);

  useEffect(() => {
    if (githubToken && githubToken.trim() && isValidated) {
      setIsConnected(true);
      if (!gists || gists.length === 0) {
        loadGists(false);
      }
    } else {
      setIsConnected(false);
      if (!isValidated) {
        setGists([]);
      }
    }
  }, []);

  const validateConnection = async () => {
    if (!githubToken || !githubToken.trim()) {
      setIsConnected(false);
      setIsValidated(false);
      return;
    }

    setIsLoadingGists(true);
    try {
      await validateGithubToken(githubToken);
      setIsConnected(true);
      setIsValidated(true);
      await loadGists(false);
    } catch (error) {
      setIsConnected(false);
      setIsValidated(false);
      setGists([]);
      toast.error(error.message || 'Xác thực token thất bại', { position: 'top-right', autoClose: 3000 });
    } finally {
      setIsLoadingGists(false);
    }
  };

  const loadGists = async (useCache = true) => {
    if (!githubToken || !githubToken.trim()) {
      return;
    }

    if (useCache && gists && gists.length > 0) {
      return;
    }

    setIsLoadingGists(true);
    try {
      const gistsData = await fetchGists(githubToken);
      const gistsArray = Array.isArray(gistsData) ? gistsData : [];
      setGists(gistsArray);
    } catch (error) {
      toast.error(error.message || 'Lỗi khi tải danh sách gist', { position: 'top-right', autoClose: 3000 });
      if (!gists || gists.length === 0) {
        setGists([]);
      }
    } finally {
      setIsLoadingGists(false);
    }
  };

  const handleGithubTokenChange = (event) => {
    setGithubToken(event.target.value);
    setIsConnected(false);
    setIsValidated(false);
    setGists([]);
  };

  const handleSave = async () => {
    if (!githubToken.trim()) {
      toast.warning('GitHub token không được để trống', { position: 'top-right', autoClose: 2000 });
      return;
    }

    setIsLoading(true);
    try {
      const result = await validateGithubToken(githubToken);
      if (result.valid) {
        setIsConnected(true);
        setIsValidated(true);
        toast.success('Token hợp lệ và đã được lưu thành công', { position: 'top-right', autoClose: 2000 });
        await loadGists(false);
      }
    } catch (error) {
      setIsConnected(false);
      setIsValidated(false);
      setGists([]);
      toast.error(error.message || 'Xác thực token thất bại', { position: 'top-right', autoClose: 3000 });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    reset();
    setIsConnected(false);
    setGists([]);
    toast.info('GitHub token đã được reset', { position: 'top-right', autoClose: 2000 });
  };

  const handleReloadConnection = async () => {
    await validateConnection();
  };

  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleCreateGist = async (description) => {
    if (!githubToken || !githubToken.trim()) {
      toast.error('Chưa có GitHub token', { position: 'top-right', autoClose: 2000 });
      return;
    }

    setIsCreatingGist(true);
    try {
      await createGist(githubToken, description);
      toast.success('Đã tạo gist thành công', { position: 'top-right', autoClose: 2000 });
      setIsCreateModalOpen(false);
      await loadGists(false);
    } catch (error) {
      toast.error(error.message || 'Lỗi khi tạo gist', { position: 'top-right', autoClose: 3000 });
    } finally {
      setIsCreatingGist(false);
    }
  };

  const handleOpenDeleteModal = (gistId) => {
    setDeleteModal({ isOpen: true, gistId });
  };

  const handleCloseDeleteModal = () => {
    setDeleteModal({ isOpen: false, gistId: null });
  };

  const handleConfirmDelete = async () => {
    if (!githubToken || !githubToken.trim()) {
      toast.error('Chưa có GitHub token', { position: 'top-right', autoClose: 2000 });
      handleCloseDeleteModal();
      return;
    }

    if (!deleteModal.gistId) {
      return;
    }

    setIsDeletingGist(true);
    try {
      await deleteGist(githubToken, deleteModal.gistId);
      toast.success('Đã xóa gist thành công', { position: 'top-right', autoClose: 2000 });
      const updatedGists = gists.filter((gist) => gist.id !== deleteModal.gistId);
      setGists(updatedGists);
      handleCloseDeleteModal();
    } catch (error) {
      toast.error(error.message || 'Lỗi khi xóa gist', { position: 'top-right', autoClose: 3000 });
    } finally {
      setIsDeletingGist(false);
    }
  };

  return {
    githubToken,
    isLoading,
    isConnected,
    gists,
    isLoadingGists,
    isCreateModalOpen,
    isCreatingGist,
    handleGithubTokenChange,
    handleSave,
    handleReset,
    loadGists,
    handleOpenCreateModal,
    handleCloseCreateModal,
    handleCreateGist,
    handleReloadConnection,
    handleOpenDeleteModal,
    handleCloseDeleteModal,
    handleConfirmDelete,
    deleteModal,
    isDeletingGist,
  };
}

