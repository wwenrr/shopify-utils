import { ContentState, EditorState, Modifier, convertFromHTML, convertFromRaw, convertToRaw } from 'draft-js';

export function buildEditorStats(state) {
  const text = state.getCurrentContent().getPlainText(' ').trim();
  if (!text) {
    return { words: 0, characters: 0, readingTime: 1 };
  }

  const words = text.split(/\s+/).filter(Boolean).length;
  const characters = text.length;
  const readingTime = Math.max(1, Math.ceil(words / 200));

  return { words, characters, readingTime };
}

export function getToolbarOptions() {
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

export function buildEditorStateFromBase64(base64Content) {
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

export function encodeEditorStateToBase64(state) {
  try {
    const raw = convertToRaw(state.getCurrentContent());
    return encodeRawContentToBase64(raw);
  } catch (error) {
    return null;
  }
}

export function encodeTextToBase64(text) {
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

export function buildEditorStateFromHtml(htmlContent) {
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

export function encodeRawContentToBase64(rawContent) {
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

export function decodeBase64ToRaw(base64Value) {
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

export function sanitizeRawContent(rawContent) {
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

export function insertHtmlIntoEditorState(editorState, htmlContent) {
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

export function createContentStateFromHtml(htmlContent) {
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
