import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTokenConfig } from './hooks';
import TokenForm from './components/TokenForm';
import GistList from './components/GistList';
import CreateGistModal from './components/CreateGistModal';
import ConfirmModal from './components/ConfirmModal';
import styles from './index.module.css';

function TokenConfigPage() {
  const {
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
  } = useTokenConfig();

  return (
    <div className={styles.page}>
      <section className={styles.header}>
        <p className={styles.eyebrow}>Cấu hình</p>
        <h1>Cấu hình GitHub</h1>
        <p>Cấu hình token API và thông tin xác thực cho GitHub.</p>
      </section>

      <article className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardHeaderLeft}>
            <img
              src="https://cdn-icons-png.flaticon.com/128/2111/2111432.png"
              alt="GitHub"
              className={styles.githubIcon}
            />
            <h2>GitHub Token</h2>
          </div>
        </div>
        <TokenForm
          githubToken={githubToken}
          isLoading={isLoading}
          onGithubTokenChange={handleGithubTokenChange}
          onSave={handleSave}
          onReset={handleReset}
        />
      </article>

      {isConnected && (
        <article className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardHeaderLeft}>
              <img
                src="https://cdn-icons-png.flaticon.com/128/2111/2111432.png"
                alt="GitHub"
                className={styles.githubIcon}
              />
              <h2>Danh sách Gist</h2>
            </div>
            <div className={styles.cardHeaderRight}>
              <button type="button" className={styles.reloadButton} onClick={handleReloadConnection}>
                Reload
              </button>
              <button type="button" className={styles.createButton} onClick={handleOpenCreateModal}>
                Tạo gist mới
              </button>
            </div>
          </div>
          <GistList gists={gists} isLoading={isLoadingGists} onDelete={handleOpenDeleteModal} />
        </article>
      )}

      <CreateGistModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onCreate={handleCreateGist}
        isLoading={isCreatingGist}
      />

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Xóa Gist"
        message="Bạn có chắc chắn muốn xóa gist này? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        cancelText="Hủy"
        isLoading={isDeletingGist}
      />

      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar
        closeOnClick
        pauseOnFocusLoss={false}
        draggable={false}
        pauseOnHover={false}
        newestOnTop={false}
        theme="light"
      />
    </div>
  );
}

export default TokenConfigPage;
