import { buildButtonMarkup } from '../utils';
import styles from './LoadModal.module.css';

function LoadModal({ isOpen, onClose, savedConfigs, onLoad, onDelete }) {
  if (!isOpen) {
    return null;
  }

  const getVariantConfig = (config) => {
    const variant = config.formValues.variant;
    if (config.variantSettings && config.variantSettings[variant]) {
      return config.variantSettings[variant];
    }
    return {};
  };

  const getButtonPreview = (config) => {
    const variantConfig = getVariantConfig(config);
    return buildButtonMarkup(config.formValues, variantConfig);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>Load cấu hình</h3>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Đóng"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 5L5 15M5 5L15 15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <div className={styles.content}>
          {savedConfigs.length === 0 ? (
            <div className={styles.empty}>
              <p>Chưa có cấu hình nào được lưu</p>
            </div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Cấu hình</th>
                    <th>Preview</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {savedConfigs.map((config) => {
                    const variantConfig = getVariantConfig(config);
                    const previewMarkup = getButtonPreview(config);
                    return (
                      <tr key={config.id}>
                        <td className={styles.configCell}>
                          <div className={styles.configInfo}>
                            <div className={styles.configName}>{config.name}</div>
                            <div className={styles.configDetails}>
                              <span className={styles.configLabel}>Text:</span>
                              <span className={styles.configValue}>{config.formValues.text || '-'}</span>
                            </div>
                            <div className={styles.configDetails}>
                              <span className={styles.configLabel}>URL:</span>
                              <span className={styles.configValue}>{config.formValues.url || '-'}</span>
                            </div>
                            <div className={styles.configDetails}>
                              <span className={styles.configLabel}>Variant:</span>
                              <span className={styles.configValue}>{config.formValues.variant.toUpperCase()}</span>
                            </div>
                            <div className={styles.configDate}>
                              {new Date(config.createdAt).toLocaleDateString('vi-VN', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </div>
                        </td>
                        <td className={styles.previewCell}>
                          <div
                            className={styles.preview}
                            dangerouslySetInnerHTML={{ __html: previewMarkup }}
                          />
                        </td>
                        <td className={styles.actionCell}>
                          <div className={styles.actions}>
                            <button
                              type="button"
                              className={styles.loadBtn}
                              onClick={() => {
                                onLoad(config.id);
                                onClose();
                              }}
                            >
                              Load
                            </button>
                            <button
                              type="button"
                              className={styles.deleteBtn}
                              onClick={() => onDelete(config.id)}
                              aria-label="Xóa"
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M12 4L4 12M4 4L12 12"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoadModal;

