export function parseHtmlToBlocks(htmlString) {
  if (!htmlString || !htmlString.trim()) {
    return [];
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString.trim(), 'text/html');
  
  if (doc.querySelector('parsererror')) {
    return [];
  }

  const body = doc.body;
  if (!body) {
    return [];
  }

  return parseNodeTree(body.childNodes, 0);
}

function parseNodeTree(nodes, depth) {
  const blocks = [];
  const elementNodes = Array.from(nodes).filter(
    (node) => node.nodeType === Node.ELEMENT_NODE
  );

  elementNodes.forEach((node) => {
    const element = node;
    const blockId = generateBlockId();
    const outerHtml = element.outerHTML;
    const innerHtml = element.innerHTML;
    const tagName = element.tagName.toLowerCase();

    blocks.push({
      id: blockId,
      tag: tagName,
      depth,
      outerHtml,
      innerHtml,
      children: [],
    });

    if (element.children && element.children.length > 0) {
      const childBlocks = parseNodeTree(element.children, depth + 1);
      blocks[blocks.length - 1].children = childBlocks;
    }
  });

  return blocks;
}

function generateBlockId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function findBlockById(blocks, targetId) {
  for (const block of blocks) {
    if (block.id === targetId) {
      return block;
    }
    if (block.children && block.children.length > 0) {
      const found = findBlockById(block.children, targetId);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

export function insertBlockAtPosition(blocks, targetId, newHtml, insertType = 'inside') {
  const newBlocks = parseHtmlToBlocks(newHtml);
  if (newBlocks.length === 0) {
    return blocks;
  }

  if (insertType === 'inside') {
    return insertBlocksInsideRecursive(blocks, targetId, newBlocks);
  } else {
    return insertBlocksAfterRecursive(blocks, targetId, newBlocks);
  }
}

function insertBlocksInsideRecursive(blocks, targetId, newBlocks) {
  return blocks.map((block) => {
    if (block.id === targetId) {
      return {
        ...block,
        children: [...newBlocks, ...block.children],
      };
    }
    if (block.children && block.children.length > 0) {
      return {
        ...block,
        children: insertBlocksInsideRecursive(block.children, targetId, newBlocks),
      };
    }
    return block;
  });
}

function insertBlocksAfterRecursive(blocks, targetId, newBlocks) {
  const result = [];
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    if (block.id === targetId) {
      result.push(block);
      result.push(...newBlocks);
    } else {
      if (block.children && block.children.length > 0) {
        result.push({
          ...block,
          children: insertBlocksAfterRecursive(block.children, targetId, newBlocks),
        });
      } else {
        result.push(block);
      }
    }
  }
  return result;
}

export function deleteBlockById(blocks, targetId) {
  if (!Array.isArray(blocks)) {
    return [];
  }
  
  const result = [];
  for (const block of blocks) {
    if (block && block.id === targetId) {
      continue;
    }
    if (block && block.children && Array.isArray(block.children) && block.children.length > 0) {
      result.push({
        ...block,
        children: deleteBlockById(block.children, targetId),
      });
    } else if (block) {
      result.push(block);
    }
  }
  return result;
}

export function flattenBlocks(blocks) {
  const result = [];
  
  function traverse(blockList) {
    blockList.forEach((block) => {
      result.push(block);
      if (block.children && block.children.length > 0) {
        traverse(block.children);
      }
    });
  }
  
  traverse(blocks);
  return result;
}

export function serializeBlocksToHtml(blocks) {
  if (!Array.isArray(blocks) || blocks.length === 0) {
    return '';
  }

  function serializeBlock(block) {
    if (!block || !block.outerHtml) {
      return '';
    }
    return block.outerHtml;
  }

  return blocks.map(serializeBlock).join('\n');
}

export function updateBlockHtml(blocks, targetId, newHtml) {
  if (!Array.isArray(blocks)) {
    return [];
  }

  const newBlocks = parseHtmlToBlocks(newHtml);
  if (newBlocks.length === 0) {
    return blocks;
  }

  return updateBlockRecursive(blocks, targetId, newBlocks[0]);
}

function updateBlockRecursive(blocks, targetId, newBlock) {
  return blocks.map((block) => {
    if (block && block.id === targetId) {
      return {
        ...newBlock,
        id: targetId,
        depth: block.depth,
        children: block.children || [],
      };
    }
    if (block && block.children && Array.isArray(block.children) && block.children.length > 0) {
      return {
        ...block,
        children: updateBlockRecursive(block.children, targetId, newBlock),
      };
    }
    return block;
  });
}

