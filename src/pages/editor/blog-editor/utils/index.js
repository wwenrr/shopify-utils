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

export function groupH2Blocks(blocks) {
  if (!Array.isArray(blocks) || blocks.length === 0) {
    return blocks;
  }

  const result = [];
  let i = 0;

  while (i < blocks.length) {
    const block = blocks[i];
    
    if (block && block.tag === 'h2') {
      const groupBlocks = [block];
      i++;
      
      while (i < blocks.length && blocks[i] && blocks[i].tag !== 'h2') {
        groupBlocks.push(blocks[i]);
        i++;
      }
      
      if (groupBlocks.length > 1) {
        const groupId = generateBlockId();
        const groupHtml = groupBlocks.map(b => b.outerHtml || '').join('\n');
        const wrappedHtml = `<section class="h2-group">${groupHtml}</section>`;
        const wrappedBlocks = parseHtmlToBlocks(wrappedHtml);
        
        if (wrappedBlocks.length > 0) {
          const wrappedBlock = wrappedBlocks[0];
          wrappedBlock.id = groupId;
          wrappedBlock.depth = block.depth || 0;
          wrappedBlock.children = groupBlocks;
          result.push(wrappedBlock);
        } else {
          result.push(...groupBlocks);
        }
      } else {
        result.push(block);
      }
    } else {
      result.push(block);
      i++;
    }
  }

  return result;
}

export function ungroupH2Blocks(blocks) {
  if (!Array.isArray(blocks) || blocks.length === 0) {
    return blocks;
  }

  const result = [];

  function flattenBlock(block) {
    if (!block) return;

    if (block.tag === 'section' && block.outerHtml && block.outerHtml.includes('h2-group')) {
      if (block.children && Array.isArray(block.children) && block.children.length > 0) {
        block.children.forEach(child => {
          if (child.tag === 'section' && child.outerHtml && child.outerHtml.includes('h2-group')) {
            flattenBlock(child);
          } else {
            result.push(child);
          }
        });
      }
    } else {
      if (block.children && Array.isArray(block.children) && block.children.length > 0) {
        const hasGroupedChild = block.children.some(
          child => child.tag === 'section' && child.outerHtml && child.outerHtml.includes('h2-group')
        );

        if (hasGroupedChild) {
          block.children.forEach(child => {
            if (child.tag === 'section' && child.outerHtml && child.outerHtml.includes('h2-group')) {
              flattenBlock(child);
            } else {
              result.push(child);
            }
          });
        } else {
          result.push(block);
        }
      } else {
        result.push(block);
      }
    }
  }

  blocks.forEach(block => {
    flattenBlock(block);
  });

  return result;
}

export function isH2Grouped(blocks) {
  if (!Array.isArray(blocks) || blocks.length === 0) {
    return false;
  }

  function checkBlock(block) {
    if (block && block.tag === 'section' && block.outerHtml && block.outerHtml.includes('h2-group')) {
      return true;
    }
    if (block && block.children && Array.isArray(block.children) && block.children.length > 0) {
      return block.children.some(child => checkBlock(child));
    }
    return false;
  }

  return blocks.some(block => checkBlock(block));
}

export function closeAllParentsAndSplit(blocks, targetId) {
  if (!Array.isArray(blocks)) {
    return blocks;
  }

  function findBlockWithPath(blocks, targetId, path = []) {
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      if (block && block.id === targetId) {
        return { block, path: [...path, { block, index: i, siblings: blocks }] };
      }
      if (block && block.children && Array.isArray(block.children) && block.children.length > 0) {
        const found = findBlockWithPath(block.children, targetId, [...path, { block, index: i, siblings: blocks }]);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }

  const found = findBlockWithPath(blocks, targetId);
  if (!found) {
    return blocks;
  }

  const { path } = found;
  const lastPathItem = path[path.length - 1];
  const siblings = lastPathItem.siblings;
  const index = lastPathItem.index;
  const remainingBlocks = siblings.slice(index + 1);

  if (remainingBlocks.length === 0 && path.length === 1) {
    return blocks;
  }

  const newSectionId = generateBlockId();
  let allRemainingBlocks = [];
  
  if (remainingBlocks.length > 0) {
    allRemainingBlocks.push(...remainingBlocks);
  }

  for (let i = path.length - 2; i >= 0; i--) {
    const parentItem = path[i];
    const parentSiblings = parentItem.siblings;
    const parentIndex = parentItem.index;
    const parentRemaining = parentSiblings.slice(parentIndex + 1);
    if (parentRemaining.length > 0) {
      allRemainingBlocks.push(...parentRemaining);
    }
  }

  if (allRemainingBlocks.length === 0) {
    if (path.length === 1) {
      return blocks;
    }
    const lastParentIndex = path.length - 2;
    const lastParentItem = path[lastParentIndex];
    const lastParentSiblings = lastParentItem.siblings;
    const lastParentBlockIndex = lastParentItem.index;
    
    const updatedLastParent = {
      ...lastParentItem.block,
      children: siblings.slice(0, index + 1).map(child => ({
        ...child,
        depth: (child.depth || 0)
      }))
    };

    return [...lastParentSiblings.slice(0, lastParentBlockIndex), updatedLastParent];
  }

  const newSectionHtml = allRemainingBlocks.map(b => b.outerHtml || '').join('\n');
  
  const newSection = {
    id: newSectionId,
    tag: 'section',
    depth: 0,
    outerHtml: `<section class="split-section">${newSectionHtml}</section>`,
    innerHtml: newSectionHtml,
    children: allRemainingBlocks.map(block => ({
      ...block,
      depth: (block.depth || 0) + 1
    }))
  };

  if (path.length === 1) {
    return [...siblings.slice(0, index + 1), newSection];
  }

  const lastParentIndex = path.length - 2;
  const lastParentItem = path[lastParentIndex];
  const lastParentSiblings = lastParentItem.siblings;
  const lastParentBlockIndex = lastParentItem.index;

  const updatedLastParent = {
    ...lastParentItem.block,
    outerHtml: (() => {
      const keptChildren = siblings.slice(0, index + 1);
      const keptHtml = keptChildren.map(c => c.outerHtml || '').join('\n');
      const parser = new DOMParser();
      const doc = parser.parseFromString(lastParentItem.block.outerHtml, 'text/html');
      const element = doc.body.firstElementChild;
      if (!element) return lastParentItem.block.outerHtml;
      const tag = element.tagName.toLowerCase();
      const className = element.className ? ` class="${element.className}"` : '';
      return `<${tag}${className}>${keptHtml}</${tag}>`;
    })(),
    innerHtml: siblings.slice(0, index + 1).map(c => c.outerHtml || '').join('\n'),
    children: siblings.slice(0, index + 1).map(child => ({
      ...child,
      depth: (child.depth || 0)
    }))
  };

  function closeParentsRecursive(pathIndex, currentSiblings) {
    if (pathIndex < 0) {
      return [...currentSiblings, newSection];
    }

    const pathItem = path[pathIndex];
    const block = pathItem.block;
    const index = pathItem.index;
    const siblings = pathItem.siblings;

    const updatedBlock = {
      ...block,
      outerHtml: (() => {
        const keptHtml = currentSiblings.map(c => c.outerHtml || '').join('\n');
        const parser = new DOMParser();
        const doc = parser.parseFromString(block.outerHtml, 'text/html');
        const element = doc.body.firstElementChild;
        if (!element) return block.outerHtml;
        const tag = element.tagName.toLowerCase();
        const className = element.className ? ` class="${element.className}"` : '';
        return `<${tag}${className}>${keptHtml}</${tag}>`;
      })(),
      innerHtml: currentSiblings.map(c => c.outerHtml || '').join('\n'),
      children: currentSiblings.map(child => ({
        ...child,
        depth: (child.depth || 0)
      }))
    };
    const updatedSiblings = [...siblings.slice(0, index), updatedBlock];
    
    if (pathIndex === 0) {
      return [...updatedSiblings, newSection];
    }
    
    return closeParentsRecursive(pathIndex - 1, updatedSiblings);
  }

  const result = closeParentsRecursive(lastParentIndex - 1, [...lastParentSiblings.slice(0, lastParentBlockIndex), updatedLastParent]);

  return result;
}

