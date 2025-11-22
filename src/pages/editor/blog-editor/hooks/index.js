import { useEffect, useMemo, useRef, useState } from 'react';
import { EditorState, convertToRaw } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import { useEditorStore } from '@/features/editor';
import {
  buildEditorStateFromBase64,
  encodeEditorStateToBase64,
  buildEditorStateFromHtml,
  insertHtmlIntoEditorState,
  encodeTextToBase64,
  buildEditorStats,
  getToolbarOptions,
} from '../utils';

export function useBlogEditor() {
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

  return {
    title,
    subtitle,
    editorState,
    statusMessage,
    fileInputRef,
    stats,
    toolbar,
    rawContentPreview,
    handleTitleChange,
    handleSubtitleChange,
    handleEditorChange,
    handleClear,
    handleCopyRaw,
    handleImportClick,
    handleImportFile,
    handleEditorPaste,
    handleCopyHtml,
  };
}
