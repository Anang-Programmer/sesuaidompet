import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

/**
 * Render formula matematika menggunakan KaTeX secara aman tanpa melempar error.
 */
function renderMath(mathStr, displayMode = false) {
  try {
    const html = katex.renderToString(mathStr, {
      displayMode,
      throwOnError: false,
    });
    return (
      <span
        className={
          displayMode
            ? 'block my-1.5 overflow-x-auto text-center'
            : 'inline-block mx-0.5 align-middle'
        }
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  } catch (err) {
    return <code className="font-mono text-xs text-rose-600">{mathStr}</code>;
  }
}

/**
 * Helper untuk mem-parse format inline seperti **bold**, *italic*, `code`, dan inline math ($...$, \(...\)).
 */
function renderInlineFormatted(text) {
  if (!text) return null;

  // Regex untuk:
  // 1. Bold: **text**
  // 2. Italic: *text* (bukan **)
  // 3. Code: `text`
  // 4. Display LaTeX inline: \[text\]
  // 5. Inline LaTeX: \(text\)
  // 6. Math: $text$
  const regex =
    /(\*\*.*?\*\*|\*(?!\*).*?\*|`.*?`|\\\[.*?\\\]|\\\(.*?\\\)|\$[^\$\n]+?\$)/g;
  const tokens = text.split(regex);

  return tokens.map((token, i) => {
    if (!token) return null;

    if (token.startsWith('**') && token.endsWith('**') && token.length >= 4) {
      return (
        <strong key={i} className="font-bold text-slate-900">
          {token.slice(2, -2)}
        </strong>
      );
    }
    if (
      token.startsWith('*') &&
      token.endsWith('*') &&
      !token.startsWith('**') &&
      token.length >= 2
    ) {
      return (
        <em key={i} className="italic text-slate-700">
          {token.slice(1, -1)}
        </em>
      );
    }
    if (token.startsWith('`') && token.endsWith('`') && token.length >= 2) {
      return (
        <code
          key={i}
          className="rounded-xs bg-slate-100 px-1 py-0.5 font-mono text-[11px] text-emerald-800"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    if (token.startsWith('\\[') && token.endsWith('\\]') && token.length >= 4) {
      const math = token.slice(2, -2);
      return <React.Fragment key={i}>{renderMath(math, true)}</React.Fragment>;
    }
    if (token.startsWith('\\(') && token.endsWith('\\)') && token.length >= 4) {
      const math = token.slice(2, -2);
      return (
        <React.Fragment key={i}>{renderMath(math, false)}</React.Fragment>
      );
    }
    if (
      token.startsWith('$') &&
      token.endsWith('$') &&
      token.length >= 3 &&
      !token.startsWith('$$')
    ) {
      const math = token.slice(1, -1);
      return (
        <React.Fragment key={i}>{renderMath(math, false)}</React.Fragment>
      );
    }
    return token;
  });
}

/**
 * Komponen perender Markdown kaya fitur dan ringan:
 * Mendukung Headings (##, ###), Tabel Markdown GFM, Formula Matematika LaTeX (KaTeX),
 * Daftar Bullet (- , * , • ), Daftar Angka (1. ), Blockquote (>), dan Teks Format Inline.
 */
export function MarkdownRenderer({ content = '', className = '' }) {
  if (!content) return null;

  const lines = content.split('\n');
  const elements = [];
  let currentTable = null;
  let currentList = null; // { type: 'ul' | 'ol', items: [] }
  let inMathBlock = false;
  let mathDelimiter = '';
  let mathBlockLines = [];

  function flushTable() {
    if (!currentTable) return;
    const { headers, rows } = currentTable;
    elements.push(
      <div
        key={`table-${elements.length}`}
        className="my-3 overflow-hidden rounded-sm border border-slate-200 bg-white shadow-2xs"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            {headers.length > 0 && (
              <thead className="border-b border-slate-200 bg-slate-50 font-bold text-slate-700">
                <tr>
                  {headers.map((h, hi) => (
                    <th key={hi} className="px-3 py-2 whitespace-nowrap">
                      {renderInlineFormatted(h)}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody className="divide-y divide-slate-100">
              {rows.map((row, ri) => (
                <tr key={ri} className="hover:bg-slate-50/50">
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-3 py-2 text-slate-700">
                      {renderInlineFormatted(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
    currentTable = null;
  }

  function flushList() {
    if (!currentList || currentList.items.length === 0) {
      currentList = null;
      return;
    }
    const { type, items } = currentList;
    if (type === 'ol') {
      elements.push(
        <ol
          key={`list-${elements.length}`}
          className="my-2.5 space-y-1.5 pl-4 text-xs text-slate-700 list-decimal list-outside"
        >
          {items.map((item, idx) => (
            <li key={idx} className="leading-relaxed">
              {renderInlineFormatted(item)}
            </li>
          ))}
        </ol>
      );
    } else {
      elements.push(
        <ul
          key={`list-${elements.length}`}
          className="my-2.5 space-y-1.5 pl-4 text-xs text-slate-700 list-disc list-outside"
        >
          {items.map((item, idx) => (
            <li key={idx} className="leading-relaxed">
              {renderInlineFormatted(item)}
            </li>
          ))}
        </ul>
      );
    }
    currentList = null;
  }

  function flushMath() {
    if (!inMathBlock && mathBlockLines.length === 0) return;
    const rawMath = mathBlockLines.join('\n').trim();
    if (rawMath) {
      elements.push(
        <div
          key={`math-${elements.length}`}
          className="my-3 overflow-x-auto rounded-sm border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-center text-slate-900 shadow-2xs"
        >
          {renderMath(rawMath, true)}
        </div>
      );
    }
    inMathBlock = false;
    mathDelimiter = '';
    mathBlockLines = [];
  }

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    // 0. Handler Math Block Multi-Line yang sedang berlangsung
    if (inMathBlock) {
      const isClosing =
        (mathDelimiter === '\\]' && (line === '\\]' || line.endsWith('\\]'))) ||
        (mathDelimiter === '$$' && (line === '$$' || line.endsWith('$$')));

      if (isClosing) {
        if (line !== '\\]' && line !== '$$') {
          const contentBefore = line.slice(0, -mathDelimiter.length);
          if (contentBefore.trim()) mathBlockLines.push(contentBefore.trim());
        }
        flushMath();
        continue;
      }
      mathBlockLines.push(rawLine);
      continue;
    }

    // 1. Deteksi Math Block: \[ atau $$
    if (line === '\\[' || line === '$$') {
      flushTable();
      flushList();
      inMathBlock = true;
      mathDelimiter = line === '\\[' ? '\\]' : '$$';
      mathBlockLines = [];
      continue;
    }

    // Deteksi Math Block satu baris: \[ formula \] atau $$ formula $$
    if (
      (line.startsWith('\\[') && line.endsWith('\\]') && line.length >= 4) ||
      (line.startsWith('$$') && line.endsWith('$$') && line.length >= 4)
    ) {
      flushTable();
      flushList();
      const mathContent = line.slice(2, -2).trim();
      elements.push(
        <div
          key={`math-${elements.length}`}
          className="my-3 overflow-x-auto rounded-sm border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-center text-slate-900 shadow-2xs"
        >
          {renderMath(mathContent, true)}
        </div>
      );
      continue;
    }

    // Deteksi baris yang diawali \[ atau $$ tanpa penutup di baris yang sama
    if (line.startsWith('\\[') && !line.endsWith('\\]')) {
      flushTable();
      flushList();
      inMathBlock = true;
      mathDelimiter = '\\]';
      mathBlockLines = [line.slice(2).trim()];
      continue;
    }
    if (line.startsWith('$$') && !line.endsWith('$$')) {
      flushTable();
      flushList();
      inMathBlock = true;
      mathDelimiter = '$$';
      mathBlockLines = [line.slice(2).trim()];
      continue;
    }

    // 2. Deteksi Baris Tabel (diawali dan diakhiri dengan '|')
    if (line.startsWith('|') && line.endsWith('|')) {
      flushList();
      const cells = line
        .split('|')
        .slice(1, -1)
        .map((c) => c.trim());

      const isSeparator = cells.every((c) => /^:?-+:?$/.test(c));
      if (isSeparator) {
        continue;
      }

      if (!currentTable) {
        currentTable = { headers: cells, rows: [] };
      } else {
        currentTable.rows.push(cells);
      }
      continue;
    } else {
      flushTable();
    }

    // 3. Deteksi Daftar Bullet (- item, * item, atau • item)
    if (/^[-*•]\s+/.test(line)) {
      const itemText = line.replace(/^[-*•]\s+/, '');
      if (!currentList || currentList.type !== 'ul') {
        flushList();
        currentList = { type: 'ul', items: [] };
      }
      currentList.items.push(itemText);
      continue;
    }

    // 4. Deteksi Daftar Angka / Ordered List (1. item, 2. item)
    if (/^\d+\.\s+/.test(line)) {
      const itemText = line.replace(/^\d+\.\s+/, '');
      if (!currentList || currentList.type !== 'ol') {
        flushList();
        currentList = { type: 'ol', items: [] };
      }
      currentList.items.push(itemText);
      continue;
    }

    // Jika bukan baris list, flush list yang aktif
    flushList();

    // 5. Baris Kosong
    if (!line) {
      continue;
    }

    // 6. Horizontal Rule (---)
    if (/^---+$/.test(line)) {
      elements.push(
        <hr key={`hr-${i}`} className="my-3.5 border-t border-slate-200" />
      );
      continue;
    }

    // 7. Heading 2 (## ...)
    if (line.startsWith('## ')) {
      elements.push(
        <h2
          key={`h2-${i}`}
          className="mt-4 mb-2 text-sm font-bold text-slate-900 border-b border-slate-200 pb-1"
        >
          {renderInlineFormatted(line.replace('## ', ''))}
        </h2>
      );
      continue;
    }

    // 8. Heading 3 (### ...)
    if (line.startsWith('### ')) {
      elements.push(
        <h3
          key={`h3-${i}`}
          className="mt-3 mb-1.5 text-xs font-bold uppercase tracking-wide text-emerald-800"
        >
          {renderInlineFormatted(line.replace('### ', ''))}
        </h3>
      );
      continue;
    }

    // 9. Heading 4 (#### ...)
    if (line.startsWith('#### ')) {
      elements.push(
        <h4
          key={`h4-${i}`}
          className="mt-2 mb-1 text-xs font-bold text-slate-800"
        >
          {renderInlineFormatted(line.replace('#### ', ''))}
        </h4>
      );
      continue;
    }

    // 10. Blockquote (> ...)
    if (line.startsWith('> ')) {
      elements.push(
        <div
          key={`bq-${i}`}
          className="my-2.5 rounded-sm border-l-2 border-emerald-500 bg-emerald-50/60 p-2.5 text-xs text-emerald-950"
        >
          {renderInlineFormatted(line.replace('> ', ''))}
        </div>
      );
      continue;
    }

    // 11. Paragraf Normal
    elements.push(
      <p
        key={`p-${i}`}
        className="my-1.5 text-xs leading-relaxed text-slate-700"
      >
        {renderInlineFormatted(line)}
      </p>
    );
  }

  // Bersihkan sisa buffer di akhir teks
  flushMath();
  flushTable();
  flushList();

  return <div className={`space-y-1 ${className}`}>{elements}</div>;
}
