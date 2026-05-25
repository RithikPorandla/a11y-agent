import fs from 'fs';
import parser from '@babel/parser';
import traversePkg from '@babel/traverse';
const traverse = traversePkg.default || traversePkg;
import generatorPkg from '@babel/generator';
const generator = generatorPkg.default || generatorPkg;

// Read JSON input from standard input
async function readStdin() {
  return new Promise((resolve, reject) => {
    let data = '';
    process.stdin.on('data', chunk => {
      data += chunk;
    });
    process.stdin.on('end', () => {
      resolve(data);
    });
    process.stdin.on('error', err => {
      reject(err);
    });
  });
}

function getTagName(node) {
  if (!node || !node.name) return '';
  if (node.name.type === 'JSXIdentifier') {
    return node.name.name;
  } else if (node.name.type === 'JSXNamespacedName') {
    return `${node.name.namespace.name}:${node.name.name.name}`;
  } else if (node.name.type === 'JSXMemberExpression') {
    let parts = [];
    let curr = node.name;
    while (curr) {
      if (curr.type === 'JSXIdentifier') {
        parts.push(curr.name);
        break;
      }
      parts.push(curr.property.name);
      curr = curr.object;
    }
    return parts.reverse().join('.');
  }
  return '';
}

function getAttributesMap(openingElement) {
  const attrs = {};
  if (!openingElement || !openingElement.attributes) return attrs;
  
  openingElement.attributes.forEach(attr => {
    if (attr.type === 'JSXAttribute') {
      const name = attr.name.name;
      let valStr = '';
      if (attr.value) {
        if (attr.value.type === 'StringLiteral') {
          valStr = attr.value.value;
        } else if (attr.value.type === 'JSXExpressionContainer') {
          try {
            valStr = generator(attr.value.expression).code;
          } catch (e) {
            valStr = 'expression';
          }
        }
      } else {
        valStr = 'true';
      }
      attrs[name.toLowerCase()] = valStr;
    }
  });
  return attrs;
}

function parseOriginalTag(tagHtml) {
  let cleaned = tagHtml.trim();
  
  // Make sure it starts with '<'
  if (!cleaned.startsWith('<')) {
    cleaned = '<' + cleaned;
  }
  
  // Ensure it's parsed as a self-closing element to prevent parser from demanding a closing tag
  if (cleaned.endsWith('>')) {
    if (cleaned.endsWith('/>')) {
      // Already self-closing
    } else {
      cleaned = cleaned.slice(0, -1) + ' />';
    }
  } else {
    cleaned = cleaned + ' />';
  }
  
  try {
    const ast = parser.parse(cleaned, { plugins: ["jsx"] });
    const expr = ast.program.body[0].expression;
    if (expr && expr.type === 'JSXElement') {
      return expr.openingElement;
    }
  } catch (e) {
    // If parsing fails
  }
  return null;
}

function getAstSelector(path) {
  let selectorParts = [];
  let curr = path;
  
  while (curr && curr.node.type === 'JSXOpeningElement') {
    const tagName = getTagName(curr.node).toLowerCase();
    const myJSXElementPath = curr.parentPath;
    
    let index = 1;
    const parentJSXElementPath = myJSXElementPath.findParent(p => p.node.type === 'JSXElement');
    if (parentJSXElementPath && parentJSXElementPath.node && parentJSXElementPath.node.children) {
      const siblings = parentJSXElementPath.node.children.filter(child => 
        child.type === 'JSXElement' && getTagName(child.openingElement).toLowerCase() === tagName
      );
      const myIdx = siblings.indexOf(myJSXElementPath.node);
      if (myIdx !== -1) {
        index = myIdx + 1;
      }
    }
    
    if (index > 1) {
      selectorParts.push(`${tagName}:nth-of-type(${index})`);
    } else {
      selectorParts.push(tagName);
    }
    
    if (parentJSXElementPath) {
      curr = parentJSXElementPath.get('openingElement');
    } else {
      curr = null;
    }
  }
  return selectorParts.reverse().join(' > ');
}

function scoreSelector(candSelector, origSelector) {
  if (!origSelector) return 0;
  
  const candParts = candSelector.split(' > ');
  const origParts = origSelector.split(' > ');
  
  let matches = 0;
  let i = candParts.length - 1;
  let j = origParts.length - 1;
  
  while (i >= 0 && j >= 0) {
    if (candParts[i] === origParts[j]) {
      matches++;
    } else {
      break;
    }
    i--;
    j--;
  }
  
  return matches * 2000; // Massive bonus for sibling-index precision
}

function scoreCandidate(candidate, path, original, originalNameStr, originalSelector) {
  const candName = getTagName(candidate);
  
  // Match tag name
  if (original) {
    const origName = getTagName(original);
    if (candName.toLowerCase() !== origName.toLowerCase()) {
      return -10000;
    }
  } else if (originalNameStr) {
    if (candName.toLowerCase() !== originalNameStr.toLowerCase()) {
      return -10000;
    }
  } else {
    return -10000;
  }
  
  const candAttrs = getAttributesMap(candidate);
  
  let score = 0;
  
  if (original) {
    const origAttrs = getAttributesMap(original);
    
    // 1. Check classes (className / class)
    const candClass = candAttrs['classname'] || candAttrs['class'] || '';
    const origClass = origAttrs['classname'] || origAttrs['class'] || '';
    const candClassWords = new Set(candClass.split(/\s+/).filter(Boolean));
    const origClassWords = new Set(origClass.split(/\s+/).filter(Boolean));
    let commonClasses = 0;
    for (const word of origClassWords) {
      if (candClassWords.has(word)) {
        commonClasses++;
      }
    }
    score += commonClasses * 100;
    
    // 2. Check id
    if (origAttrs['id'] && candAttrs['id'] === origAttrs['id']) {
      score += 500;
    }
    
    // 3. Check click handlers presence
    const origHasClick = origAttrs['onclick'] || origAttrs['ontap'] || origAttrs['onpress'];
    const candHasClick = candAttrs['onclick'] || candAttrs['ontap'] || candAttrs['onpress'];
    if (!!origHasClick === !!candHasClick) {
      score += 300;
      if (origHasClick && origHasClick === candHasClick) {
        score += 500;
      }
    } else {
      score -= 200;
    }
    
    // 4. Check src/href
    if (origAttrs['src'] && candAttrs['src'] === origAttrs['src']) {
      score += 300;
    }
    if (origAttrs['href'] && candAttrs['href'] === origAttrs['href']) {
      score += 300;
    }
    
    // 5. Match other attributes
    for (const key of Object.keys(origAttrs)) {
      if (['classname', 'class', 'id', 'onclick', 'src', 'href'].includes(key)) {
        continue;
      }
      if (candAttrs[key] === origAttrs[key]) {
        score += 150;
      }
    }
  } else {
    score += 50;
  }
  
  // 6. Selector similarity score (resolves identical siblings collisions completely)
  if (originalSelector) {
    try {
      const candSelector = getAstSelector(path);
      score += scoreSelector(candSelector, originalSelector);
    } catch (e) {
      // Fallback if selector construction fails
    }
  }
  
  return score;
}

async function main() {
  try {
    const inputStr = await readStdin();
    if (!inputStr.trim()) {
      console.log(JSON.stringify({ success: false, error: "Empty input received via stdin" }));
      process.exit(1);
    }
    
    const payload = JSON.parse(inputStr);
    const { source_code, original_tag, attributes_to_add, selector } = payload;
    
    if (!source_code || !original_tag) {
      console.log(JSON.stringify({ success: false, error: "Missing source_code or original_tag in payload" }));
      process.exit(1);
    }
    
    // Parse the full file AST
    let fileAst;
    try {
      fileAst = parser.parse(source_code, {
        sourceType: "module",
        plugins: [
          "jsx",
          "typescript",
          "decorators-legacy",
          "classProperties",
          "objectRestSpread",
          "exportDefaultFrom",
          "dynamicImport"
        ]
      });
    } catch (e) {
      console.log(JSON.stringify({ success: false, error: `Babel parser failed: ${e.message}` }));
      process.exit(0);
    }
    
    // Parse original tag
    const origOpeningElement = parseOriginalTag(original_tag);
    let originalTagNameFallback = '';
    if (!origOpeningElement) {
      const match = original_tag.match(/^<([a-zA-Z0-9:-]+)/);
      if (match) {
        originalTagNameFallback = match[1];
      } else {
        originalTagNameFallback = 'div';
      }
    }
    
    // Traverse AST to find best matching element
    let bestNodePath = null;
    let bestScore = -1000;
    
    traverse(fileAst, {
      JSXOpeningElement(path) {
        const score = scoreCandidate(path.node, path, origOpeningElement, origOpeningElement ? null : originalTagNameFallback, selector);
        if (score > bestScore) {
          bestScore = score;
          bestNodePath = path;
        }
      }
    });
    
    if (!bestNodePath || bestScore < -500) {
      console.log(JSON.stringify({ success: false, error: `Could not find a matching JSX tag in the AST for: ${original_tag}` }));
      process.exit(0);
    }
    
    // Parse attributes to add
    let newAttributes = [];
    if (attributes_to_add && attributes_to_add.trim()) {
      try {
        const dummyCode = `<dummy ${attributes_to_add} />`;
        const dummyAst = parser.parse(dummyCode, { plugins: ["jsx"] });
        newAttributes = dummyAst.program.body[0].expression.openingElement.attributes;
      } catch (e) {
        console.log(JSON.stringify({ success: false, error: `Failed to parse attributes to add: ${attributes_to_add}. Error: ${e.message}` }));
        process.exit(0);
      }
    }
    
    // Inject attributes
    const targetNode = bestNodePath.node;
    newAttributes.forEach(newAttr => {
      if (newAttr.type === 'JSXAttribute') {
        const newAttrName = newAttr.name.name;
        const existingIdx = targetNode.attributes.findIndex(
          attr => attr.type === 'JSXAttribute' && attr.name.name === newAttrName
        );
        
        if (existingIdx !== -1) {
          targetNode.attributes[existingIdx] = newAttr;
        } else {
          targetNode.attributes.push(newAttr);
        }
      } else {
        targetNode.attributes.push(newAttr);
      }
    });
    
    // Regenerate the file content
    const output = generator(fileAst, {
      retainLines: true,
      keepDecisions: true
    }, source_code);
    
    console.log(JSON.stringify({
      success: true,
      patched_code: output.code,
      error: null
    }));
    
  } catch (e) {
    console.log(JSON.stringify({ success: false, error: `Unhandled AST error: ${e.message}` }));
  }
}

main();
