import { useEffect, useMemo, useRef, useState } from 'react';
import { Editor } from 'react-draft-wysiwyg';
import { ContentState, EditorState, Modifier, convertFromHTML, convertFromRaw, convertToRaw } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import { Copy, RefreshCw, Upload } from 'lucide-react';
import { useEditorStore } from '@/features/editor';
import styles from './index.module.css';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

function EditorPage() {
  const title = useEditorStore((state) => state.title);
  const subtitle = useEditorStore((state) => state.subtitle);
  const base64Content = useEditorStore((state) => state.base64Content);
  const hydrated = useEditorStore((state) => state.hydrated);
  const setTitle = useEditorStore((state) => state.setTitle);
  const setSubtitle = useEditorStore((state) => state.setSubtitle);
  const setBase64Content = useEditorStore((state) => state.setBase64Content);
  const setHtmlMeta = useEditorStore((state) => state.setHtmlMeta);
  const resetStore = useEditorStore((state) => state.reset);
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
  const [statusMessage, setStatusMessage] = useState('');
  const [hasHydratedContent, setHasHydratedContent] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!hydrated || hasHydratedContent) {
      return;
    }

    if (base64Content) {
      const restoredState = buildEditorStateFromBase64(base64Content);
      if (restoredState) {
        setEditorState(restoredState);
      } else {
        resetStore();
      }
    }

    setHasHydratedContent(true);
  }, [hydrated, hasHydratedContent, base64Content, resetStore]);

  const stats = useMemo(() => buildEditorStats(editorState), [editorState]);
  const toolbar = useMemo(getToolbarOptions, []);
  const rawContentPreview = useMemo(
    () => JSON.stringify(convertToRaw(editorState.getCurrentContent()), null, 2),
    [editorState]
  );

  const handleTitleChange = (event) => {
    setTitle(event.target.value);
  };

  const handleSubtitleChange = (event) => {
    setSubtitle(event.target.value);
  };

  const handleEditorChange = (nextState) => {
    setEditorState(nextState);
    const encoded = encodeEditorStateToBase64(nextState);
    setBase64Content(encoded);
  };

  const handleClear = () => {
    resetStore();
    setEditorState(EditorState.createEmpty());
    setStatusMessage('');
    setHtmlMeta(null);
  };

  const handleCopyRaw = async () => {
    try {
      await navigator.clipboard.writeText(rawContentPreview);
      setStatusMessage('Đã sao chép JSON của nội dung.');
    } catch (error) {
      setStatusMessage('Trình duyệt chặn thao tác sao chép.');
    }
  };

  const persistHtmlMetadata = (htmlContent, source, filename = null) => {
    const htmlBase64 = encodeTextToBase64(htmlContent);
    if (!htmlBase64) {
      setHtmlMeta(null);
      return;
    }
    setHtmlMeta({
      source,
      encoding: 'base64',
      originalFilename: filename,
      importedAt: new Date().toISOString(),
      value: htmlBase64,
    });
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const htmlContent = typeof reader.result === 'string' ? reader.result : '';
      importHtmlContent(htmlContent, {
        filename: file.name ?? null,
        source: 'html-file',
      });
      event.target.value = '';
    };
    reader.onerror = () => {
      setStatusMessage('Không thể đọc file HTML.');
    };
    reader.readAsText(file);
  };

  const importHtmlContent = (htmlContent, metadata = {}) => {
    const nextState = buildEditorStateFromHtml(htmlContent);
    if (!nextState) {
      setStatusMessage('HTML không hợp lệ hoặc không có nội dung.');
      return;
    }

    setEditorState(nextState);
    const encoded = encodeEditorStateToBase64(nextState);
    setBase64Content(encoded);
    persistHtmlMetadata(htmlContent, metadata.source ?? 'html', metadata.filename ?? null);
    setStatusMessage('Đã nhập nội dung từ file HTML.');
  };

  const handleEditorPaste = (text, html) => {
    if (!html) {
      return false;
    }

    const nextState = insertHtmlIntoEditorState(editorState, html);
    if (!nextState) {
      setStatusMessage('Không thể đọc nội dung HTML từ clipboard.');
      return false;
    }

    setEditorState(nextState);
    const encoded = encodeEditorStateToBase64(nextState);
    setBase64Content(encoded);
    persistHtmlMetadata(html, 'clipboard');
    setStatusMessage('Đã dán nội dung HTML.');

    return true;
  };

  const handleCopyHtml = async () => {
    try {
      const raw = convertToRaw(editorState.getCurrentContent());
      const html = draftToHtml(raw);
      await navigator.clipboard.writeText(html);
      setStatusMessage('Đã sao chép HTML của nội dung.');
    } catch (error) {
      setStatusMessage('Trình duyệt chặn thao tác sao chép.');
    }
  };

  return (
    <div className={styles.root}>
      <header className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>WYSIWYG editor</p>
          <h1 className={styles.title}>Blog Editor</h1>
          <p className={styles.subtitle}>
            Sử dụng trình soạn thảo để tạo nội dung có định dạng, xuất bản nhanh mà vẫn đảm bảo cấu
            trúc chuẩn.
          </p>
        </div>
        <div className={styles.actions}>
          <button type="button" className={`${styles.actionButton} ${styles.secondary}`} onClick={handleImportClick}>
            <Upload size={16} aria-hidden="true" />
            Nhập từ HTML
          </button>
          <button type="button" className={`${styles.actionButton} ${styles.secondary}`} onClick={handleCopyHtml}>
            <Copy size={16} aria-hidden="true" />
            Sao chép HTML
          </button>
          <button type="button" className={`${styles.actionButton} ${styles.secondary}`} onClick={handleClear}>
            <RefreshCw size={16} aria-hidden="true" />
            Làm mới
          </button>
          <button type="button" className={`${styles.actionButton} ${styles.primary}`} onClick={handleCopyRaw}>
            <Copy size={16} aria-hidden="true" />
            Sao chép JSON
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".html,.htm,text/html"
          onChange={handleImportFile}
          className={styles.fileInput}
        />
      </header>

      <section className={styles.editorCard}>
        <div className={styles.editorWrapper}>
          <Editor
            editorState={editorState}
            onEditorStateChange={handleEditorChange}
            handlePastedText={handleEditorPaste}
            toolbarClassName={styles.toolbar}
            wrapperClassName={styles.wrapper}
            editorClassName={styles.editor}
            placeholder="Bắt đầu viết nội dung của bạn..."
            toolbar={toolbar}
          />
        </div>
      </section>

      <section className={styles.detailsGrid}>
        <article className={styles.statCard}>
          <p className={styles.statLabel}>Thống kê</p>
          <div className={styles.statRow}>
            <div>
              <p className={styles.statValue}>{stats.words}</p>
              <p className={styles.statCaption}>Tổng số từ</p>
            </div>
            <div>
              <p className={styles.statValue}>{stats.characters}</p>
              <p className={styles.statCaption}>Ký tự</p>
            </div>
            <div>
              <p className={styles.statValue}>{stats.readingTime} phút</p>
              <p className={styles.statCaption}>Thời gian đọc</p>
            </div>
          </div>
        </article>

        <article className={styles.jsonCard}>
          <div className={styles.cardHeader}>
            <p className={styles.cardTitle}>Nội dung JSON</p>
            <button type="button" className={styles.textButton} onClick={handleCopyRaw}>
              <Copy size={16} aria-hidden="true" />
              Sao chép
            </button>
          </div>
          <pre className={styles.codeBlock} aria-live="polite">
            {rawContentPreview}
          </pre>
        </article>
      </section>

      {statusMessage && <p className={styles.feedback}>{statusMessage}</p>}
    </div>
  );
}

function buildEditorStats(state) {
  const text = state.getCurrentContent().getPlainText(' ').trim();
  if (!text) {
    return { words: 0, characters: 0, readingTime: 1 };
  }

  const words = text.split(/\s+/).filter(Boolean).length;
  const characters = text.length;
  const readingTime = Math.max(1, Math.ceil(words / 200));

  return { words, characters, readingTime };
}

function getToolbarOptions() {
  return {
    options: ['inline', 'blockType', 'fontSize', 'list', 'textAlign', 'colorPicker', 'link', 'history'],
    inline: {
      options: ['bold', 'italic', 'underline', 'strikethrough', 'monospace'],
    },
    list: {
      options: ['unordered', 'ordered'],
    },
    textAlign: {
      options: ['left', 'center', 'right', 'justify'],
    },
  };
}

function buildEditorStateFromBase64(base64Content) {
  const rawContent = decodeBase64ToRaw(base64Content);
  if (!rawContent) {
    return null;
  }

  const sanitized = sanitizeRawContent(rawContent);
  if (!sanitized) {
    return null;
  }

  try {
    return EditorState.createWithContent(convertFromRaw(sanitized));
  } catch (error) {
    return null;
  }
}

function encodeEditorStateToBase64(state) {
  try {
    const raw = convertToRaw(state.getCurrentContent());
    return encodeRawContentToBase64(raw);
  } catch (error) {
    return null;
  }
}

function encodeTextToBase64(text) {
  if (typeof window === 'undefined' || !text) {
    return null;
  }

  try {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(text);
    let binary = '';
    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    return window.btoa(binary);
  } catch (error) {
    return null;
  }
}

function buildEditorStateFromHtml(htmlContent) {
  const contentState = createContentStateFromHtml(htmlContent);
  if (!contentState) {
    return null;
  }

  try {
    return EditorState.createWithContent(contentState);
  } catch (error) {
    return null;
  }
}

function encodeRawContentToBase64(rawContent) {
  if (typeof window === 'undefined' || !rawContent) {
    return null;
  }

  try {
    const json = JSON.stringify(rawContent);
    const encoder = new TextEncoder();
    const bytes = encoder.encode(json);
    let binary = '';
    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    return window.btoa(binary);
  } catch (error) {
    return null;
  }
}

function decodeBase64ToRaw(base64Value) {
  if (typeof window === 'undefined' || !base64Value) {
    return null;
  }

  try {
    const binary = window.atob(base64Value);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const decoder = new TextDecoder();
    const json = decoder.decode(bytes);
    return JSON.parse(json);
  } catch (error) {
    return null;
  }
}

function sanitizeRawContent(rawContent) {
  if (!rawContent || !Array.isArray(rawContent.blocks)) {
    return null;
  }

  const entityMap = rawContent.entityMap ?? {};
  const sanitizedEntityMap = Object.entries(entityMap).reduce((acc, [key, value]) => {
    if (value && key !== 'null' && key !== 'undefined') {
      acc[String(key)] = value;
    }
    return acc;
  }, {});

  const blocks = rawContent.blocks.map((block) => {
    if (!Array.isArray(block.entityRanges) || block.entityRanges.length === 0) {
      return block;
    }

    const entityRanges = block.entityRanges
      .map((range) => ({
        ...range,
        key: range.key === null || range.key === undefined ? undefined : range.key,
      }))
      .filter((range) => sanitizedEntityMap[String(range.key)] !== undefined)
      .map((range) => ({
        ...range,
        key: parseInt(range.key, 10),
      }));

    return {
      ...block,
      entityRanges,
    };
  });

  return {
    ...rawContent,
    entityMap: sanitizedEntityMap,
    blocks,
  };
}

function insertHtmlIntoEditorState(editorState, htmlContent) {
  const contentFromHtml = createContentStateFromHtml(htmlContent);
  if (!contentFromHtml) {
    return null;
  }

  const fragment = contentFromHtml.getBlockMap();
  const newContent = Modifier.replaceWithFragment(
    editorState.getCurrentContent(),
    editorState.getSelection(),
    fragment
  );
  const selectionAfter = newContent.getSelectionAfter();
  if (!selectionAfter) {
    return null;
  }

  const nextState = EditorState.push(editorState, newContent, 'insert-fragment');
  return EditorState.forceSelection(nextState, selectionAfter);
}

function createContentStateFromHtml(htmlContent) {
  if (!htmlContent || !htmlContent.trim()) {
    return null;
  }

  try {
    const blocksFromHtml = convertFromHTML(htmlContent);
    if (!blocksFromHtml || !blocksFromHtml.contentBlocks?.length) {
      return null;
    }

    return ContentState.createFromBlockArray(
      blocksFromHtml.contentBlocks,
      blocksFromHtml.entityMap
    );
  } catch (error) {
    return null;
  }
}

export default EditorPage;

