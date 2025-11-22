import { useMemo, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from './index.module.css';

const ALIGNMENT_RULES = {
  justify: 'text-align: justify;',
  center: 'text-align: center;',
};
const DEFAULT_ALIGNMENT = 'justify';
const DEFAULT_AUTO_ALIGN_TAGS = ['p', 'span'];

function HtmlAlignmentPage() {
  const [htmlInput, setHtmlInput] = useState('');
  const [nodes, setNodes] = useState([]);
  const [selectedMap, setSelectedMap] = useState({});
  const [formattedHtml, setFormattedHtml] = useState('');
  const [textPreview, setTextPreview] = useState(null);
  const [uniqueTags, setUniqueTags] = useState([]);
  const [globalAlignment, setGlobalAlignment] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [isTableExpanded, setIsTableExpanded] = useState(false);

  const selectedNodes = useMemo(() => nodes.filter((node) => selectedMap[node.id]), [nodes, selectedMap]);

  const handleInputChange = (event) => {
    const nextValue = event.target.value;
    setHtmlInput(nextValue);
    analyzeHtmlContent(nextValue);
  };

  const handleSelectNode = (nodeId) => {
    setSelectedMap((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
  };

  const handleFormatSelection = () => {
    if (!selectedNodes.length) {
      showTooltip('Chọn ít nhất một thẻ HTML trước khi định dạng.');
      return;
    }

    const value = htmlInput.trim();
    if (!value) {
      showTooltip('Không có HTML để định dạng.');
      return;
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(value, 'text/html');
    if (!doc || doc.querySelector('parsererror')) {
      showTooltip('Nội dung không phải HTML hợp lệ, kiểm tra lại cú pháp.');
      return;
    }

    selectedNodes.forEach((node) => {
      applyAlignmentByPath(doc.body, node.path, DEFAULT_ALIGNMENT);
    });

    const serializedHtml = serializeBodyContent(doc.body);
    setFormattedHtml(serializedHtml);
    if (serializedHtml) {
      handleCopyHtml(serializedHtml);
    }
  };

  const analyzeHtmlContent = (content) => {
    const value = content.trim();

    if (!value) {
      setNodes([]);
      setSelectedMap({});
      setSelectedTags([]);
      setFormattedHtml('');
      return;
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(value, 'text/html');
    if (!doc || doc.querySelector('parsererror')) {
      setNodes([]);
      setSelectedMap({});
      setFormattedHtml('');
      showToast('error', 'Nội dung không phải HTML hợp lệ, kiểm tra lại cú pháp.');
      return;
    }

    const parsedNodes = parseDocumentNodes(doc.body?.childNodes ?? []);
    if (!parsedNodes.length) {
      setNodes([]);
      setSelectedMap({});
      setSelectedTags([]);
      setFormattedHtml('');
      showToast('error', 'Không tìm thấy thẻ HTML hợp lệ, kiểm tra lại nội dung.');
      return;
    }
    setNodes(parsedNodes);
    const tags = extractUniqueTags(parsedNodes);

    const defaultSelectedTags = DEFAULT_AUTO_ALIGN_TAGS.filter((tag) => tags.includes(tag));
    const autoSelectedMap = buildSelectedMap(parsedNodes, new Set(defaultSelectedTags));

    const nextGlobalAlignment = DEFAULT_ALIGNMENT;
    const tagTargetsForDefault = defaultSelectedTags.length ? defaultSelectedTags : tags;
    const defaultFormattedHtml = applyGlobalAlignment(value, tagTargetsForDefault, nextGlobalAlignment);

    setSelectedMap(autoSelectedMap);
    setFormattedHtml(defaultFormattedHtml);
    setUniqueTags(tags);
    setSelectedTags(defaultSelectedTags);
    setGlobalAlignment(nextGlobalAlignment);
    setIsTableExpanded(false);
    if (defaultFormattedHtml) {
      handleCopyHtml(defaultFormattedHtml);
    }
    showToast('info', 'Đã phân tích HTML hợp lệ.');
  };

  const showTooltip = (message) => {
    showToast('warning', message);
  };
  
  const handleApplyGlobalAlignment = (alignmentType) => {
    if (alignmentType === globalAlignment) {
      setGlobalAlignment('');
      setFormattedHtml('');
      return;
    }

    setGlobalAlignment(alignmentType);
    const tagTargets = selectedTags.length ? selectedTags : uniqueTags;
    const result = applyGlobalAlignment(htmlInput, tagTargets, alignmentType);
    if (!result) {
      showTooltip('Không thể áp dụng filter vì HTML không hợp lệ.');
      setGlobalAlignment('');
      return;
    }
    setFormattedHtml(result);
  };

  const handleToggleTag = (tag) => {
    setSelectedTags((prev) => {
      const existed = prev.includes(tag);
      const nextSelected = existed ? prev.filter((item) => item !== tag) : [...prev, tag];

      setSelectedMap((prevMap) => {
        const nextMap = { ...prevMap };
        nodes.forEach((node) => {
          if (node.tag.toLowerCase() !== tag.toLowerCase()) {
            return;
          }
          if (existed) {
            delete nextMap[node.id];
          } else {
            nextMap[node.id] = true;
          }
        });
        return nextMap;
      });

      if (globalAlignment) {
        const tagTargets = nextSelected.length ? nextSelected : uniqueTags;
        const result = applyGlobalAlignment(htmlInput, tagTargets, globalAlignment);
        if (!result) {
          showTooltip('Không thể áp dụng filter vì HTML không hợp lệ.');
          setGlobalAlignment('');
        } else {
          setFormattedHtml(result);
        }
      }

      return nextSelected;
    });
  };

  const handleClearSelections = () => {
    const defaultSelectedTags = DEFAULT_AUTO_ALIGN_TAGS.filter((tag) => uniqueTags.includes(tag));
    const autoSelectedMap = buildSelectedMap(nodes, new Set(defaultSelectedTags));

    setSelectedMap(autoSelectedMap);
    setSelectedTags(defaultSelectedTags);
    setGlobalAlignment('');
  };

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>HTML utilities</p>
          <h1 className={styles.title}>HTML Alignment</h1>
          <p className={styles.subtitle}>
            Dán đoạn HTML để xác thực, duyệt cấu trúc thẻ và định dạng lại nội dung đã chọn theo dạng cây. Công cụ tự
            phân tích ngay khi bạn nhập.
          </p>
        </div>
      </header>

      <section className={styles.card}>
        <div className={styles.inputHeader}>
          <p className={styles.cardTitle}>Input HTML</p>
          <span className={styles.helper}>Dán trực tiếp nội dung giống như ví dụ @sample.html</span>
        </div>

        <textarea
          className={styles.textarea}
          rows={8}
          placeholder="Dán HTML vào đây..."
          value={htmlInput}
          onChange={handleInputChange}
        />
      </section>

      {nodes.length > 0 && (
        <section className={styles.card}>
          <div className={styles.structureHeader}>
            <p className={styles.cardTitle}>Project Directory Structure</p>
            <span className={styles.helper}>Tick những thẻ cần định dạng, xem nội dung text bằng cách bấm "Xem nội dung".</span>
          </div>
          {uniqueTags.length > 0 && (
            <div className={styles.tagList}>
              {uniqueTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className={getTagChipClassName(selectedTags.includes(tag))}
                  onClick={() => handleToggleTag(tag)}
                >
                  {`<${tag}>`}
                </button>
              ))}
            </div>
          )}
          <div className={styles.filterBar}>
            <div>
              <p className={styles.filterTitle}>Filter căn chỉnh nhanh</p>
              <span className={styles.filterHint}>Chọn kiểu căn để áp dụng cho toàn bộ thẻ đã liệt kê.</span>
            </div>
            <div className={styles.filterButtons}>
              <button
                type="button"
                className={getFilterButtonClassName(globalAlignment, 'justify')}
                onClick={() => handleApplyGlobalAlignment('justify')}
              >
                Căn đều tất cả
              </button>
              <button
                type="button"
                className={getFilterButtonClassName(globalAlignment, 'center')}
                onClick={() => handleApplyGlobalAlignment('center')}
              >
                Căn giữa tất cả
              </button>
            </div>
          </div>
          <div
            className={`${styles.tableWrapper} ${isTableExpanded ? styles.tableWrapperExpanded : styles.tableWrapperCollapsed}`}
          >
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Thẻ HTML</th>
                  <th>Nội dung</th>
                </tr>
              </thead>
              <tbody>
                {nodes.map((node) => (
                  <tr key={node.id}>
                    <td>
                      <label className={styles.tagRow}>
                        <input
                          type="checkbox"
                          checked={Boolean(selectedMap[node.id])}
                          onChange={() => handleSelectNode(node.id)}
                        />
                        <span className={styles.tagLabel} style={{ paddingLeft: `${node.depth * 16}px` }}>
                          {`<${node.tag.toLowerCase()}>`}
                        </span>
                      </label>
                    </td>
                    <td className={styles.textColumn}>
                      {node.text ? (
                        <button type="button" className={styles.linkButton} onClick={() => setTextPreview(node)}>
                          Xem nội dung
                        </button>
                      ) : (
                        <span className={styles.textPlaceholder}>Không có text</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={styles.tableFooter}>
            <button
              type="button"
              className={styles.expandButton}
              onClick={() => setIsTableExpanded((prev) => !prev)}
            >
              {isTableExpanded ? 'Thu gọn bảng' : 'Mở rộng bảng'}
            </button>
            <div className={styles.actions}>
              <button type="button" className={styles.secondaryButton} onClick={handleClearSelections}>
                Bỏ chọn
              </button>
              <button type="button" className={styles.primaryButton} onClick={handleFormatSelection}>
                Định dạng &amp; căn đều
              </button>
            </div>
          </div>
        </section>
      )}

      {formattedHtml && (
        <section className={styles.card}>
          <div className={styles.outputHeader}>
            <p className={styles.cardTitle}>Kết quả định dạng</p>
            <span className={styles.helper}>Căn đều dựa trên level của thẻ.</span>
            <button type="button" className={styles.copyButton} onClick={() => handleCopyHtml(formattedHtml)}>
              Copy HTML
            </button>
          </div>
          <pre className={styles.codeBlock}>{formattedHtml}</pre>
        </section>
      )}

      {textPreview && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <p className={styles.modalTitle}>{`Nội dung của <${textPreview.tag.toLowerCase()}>`}</p>
              <button type="button" className={styles.closeButton} onClick={() => setTextPreview(null)}>
                Đóng
              </button>
            </div>
            <div className={styles.modalBody}>
              <pre>{textPreview.text}</pre>
            </div>
          </div>
        </div>
      )}
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
        className={styles.toastContainer}
        toastClassName={() => styles.toastWrapper}
        bodyClassName={() => styles.toastBody}
      />
    </div>
  );
}

function parseDocumentNodes(childNodes, depth = 0, path = []) {
  const nodes = [];
  const elementNodes = Array.from(childNodes).filter((node) => node.nodeType === Node.ELEMENT_NODE);

  elementNodes.forEach((node, index) => {
    const element = node;
    const nodePath = [...path, index];
    const nodeId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
    const textContent = element.textContent?.trim().replace(/\s+/g, ' ') ?? '';

    nodes.push({
      id: nodeId,
      tag: element.tagName,
      depth,
      text: textContent || '',
      path: nodePath,
    });

    if (element.children?.length) {
      nodes.push(...parseDocumentNodes(element.children, depth + 1, nodePath));
    }
  });

  return nodes;
}

function applyAlignmentByPath(root, path, alignmentType = DEFAULT_ALIGNMENT) {
  if (!root || !path?.length) {
    return;
  }

  let current = root;
  for (let i = 0; i < path.length; i += 1) {
    const index = path[i];
    if (!current.children || !current.children[index]) {
      return;
    }
    current = current.children[index];
  }

  applyAlignmentStyle(current, alignmentType);
}

function applyAlignmentStyle(element, alignmentType = DEFAULT_ALIGNMENT) {
  if (!element) {
    return;
  }

  const rule = ALIGNMENT_RULES[alignmentType];
  if (!rule) {
    return;
  }

  const existingStyle = element.getAttribute('style') ?? '';
  const styleWithoutOldRule = existingStyle.replace(/text-align:[^;]+;?/gi, '').trim();
  const mergedStyle = [styleWithoutOldRule, rule].filter(Boolean).join(' ').trim();
  element.setAttribute('style', mergedStyle);
}

function serializeBodyContent(body) {
  return body?.innerHTML?.trim() ?? '';
}

function getFilterButtonClassName(activeAlignment, targetAlignment) {
  return targetAlignment === activeAlignment
    ? `${styles.filterButton} ${styles.filterButtonActive}`
    : styles.filterButton;
}

function getTagChipClassName(isSelected) {
  return isSelected ? `${styles.tagChip} ${styles.tagChipActive}` : styles.tagChip;
}

function buildSelectedMap(nodeList, selectedTagSet) {
  const map = {};
  nodeList.forEach((node) => {
    if (selectedTagSet.has(node.tag.toLowerCase())) {
      map[node.id] = true;
    }
  });
  return map;
}

function extractUniqueTags(nodeList) {
  const tagSet = new Set();
  nodeList.forEach((node) => {
    if (node.tag) {
      tagSet.add(node.tag.toLowerCase());
    }
  });
  return Array.from(tagSet).sort();
}

function applyGlobalAlignment(htmlContent, tagList, alignmentType) {
  const value = htmlContent.trim();
  if (!value || !tagList?.length || !alignmentType) {
    return '';
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(value, 'text/html');
  if (!doc || doc.querySelector('parsererror')) {
    return '';
  }

  tagList.forEach((tagName) => {
    const elements = doc.body?.getElementsByTagName(tagName) ?? [];
    Array.from(elements).forEach((element) => {
      applyAlignmentStyle(element, alignmentType);
    });
  });

  return serializeBodyContent(doc.body);
}

async function handleCopyHtml(content) {
  try {
    await navigator.clipboard.writeText(content);
    showToast('success', 'Đã copy HTML');
  } catch (error) {
    showToast('error', 'Copy thất bại, thử lại');
  }
}

const TOAST_CONFIG = {
  success: {
    title: 'Hoàn tất',
    cardClass: styles.toastCardSuccess,
    markerClass: styles.toastMarkerSuccess,
  },
  info: {
    title: 'Thông báo',
    cardClass: styles.toastCardInfo,
    markerClass: styles.toastMarkerInfo,
  },
  error: {
    title: 'Có lỗi xảy ra',
    cardClass: styles.toastCardError,
    markerClass: styles.toastMarkerError,
  },
  warning: {
    title: 'Cần chú ý',
    cardClass: styles.toastCardWarning,
    markerClass: styles.toastMarkerWarning,
  },
};

function showToast(variant, message) {
  const config = TOAST_CONFIG[variant];
  if (!config) {
    return;
  }

  toast(
    <div className={`${styles.toastCard} ${config.cardClass}`}>
      <span className={`${styles.toastMarker} ${config.markerClass}`} />
      <div className={styles.toastText}>
        <p className={styles.toastTitle}>{config.title}</p>
        <p className={styles.toastMessage}>{message}</p>
      </div>
    </div>,
    {
      className: styles.toastWrapper,
      bodyClassName: styles.toastBody,
      icon: false,
      closeButton: false,
    }
  );
}

export default HtmlAlignmentPage;

