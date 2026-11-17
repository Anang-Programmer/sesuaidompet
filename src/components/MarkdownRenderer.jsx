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
  } catch {
    return <code className="font-mono text-xs text-rose-600">{mathStr}</code>;
  }
}

/**
 * Helper untuk mem-parse format inline seperti **bold**, *italic*, `code`, dan inline math ($...$, \(...\)).
 * Mendukung mode gelap (isDark) untuk kontras teks yang tajam dan jelas.
 */
function renderInlineFormatted(text, isDark = false) {
  if (!text) return null;

  const regex =
    /(\*\*.*?\*\*|\*(?!\*).*?\*|`.*?`|\\\[.*?\\\]|\\\(.*?\\\)|\$[^$\n]+?\$)/g;
  const tokens = text.split(regex);

  return tokens.map((token, i) => {
    if (!token) return null;

    if (token.startsWith('**') && token.endsWith('**') && token.length >= 4) {
      return (
        <strong
          key={i}
          className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}
        >
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
        <em
          key={i}
          className={`italic ${isDark ? 'text-emerald-200' : 'text-slate-700'}`}
        >
          {token.slice(1, -1)}
        </em>
      );
    }
    if (token.startsWith('`') && token.endsWith('`') && token.length >= 2) {
      return (
        <code
          key={i}
          className={`rounded-xs px-1 py-0.5 font-mono text-sm ${
            isDark
              ? 'bg-white/15 text-emerald-300'
              : 'bg-slate-100 text-emerald-800'
          }`}
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
 * Mendukung prop `isDark` / `theme="dark"` untuk tampilan latar gelap.
 */
export function MarkdownRenderer({
  content = '',
  className = '',
  isDark = false,
  theme = 'light',
}) {
  if (!content) return null;

  const darkMode = isDark || theme === 'dark';
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
        className={`my-3 overflow-hidden rounded-sm border shadow-2xs ${
          darkMode ? 'border-white/15 bg-black/40' : 'border-slate-200 bg-white'
        }`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            {headers.length > 0 && (
              <thead
                className={`border-b font-bold ${
                  darkMode
                    ? 'border-white/15 bg-white/10 text-emerald-200'
                    : 'border-slate-200 bg-slate-50 text-slate-700'
                }`}
              >
                <tr>
                  {headers.map((h, hi) => (
                    <th key={hi} className="px-3 py-2 whitespace-nowrap">
                      {renderInlineFormatted(h, darkMode)}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody
              className={
                darkMode ? 'divide-y divide-white/10' : 'divide-y divide-slate-100'
              }
            >
              {rows.map((row, ri) => (
                <tr
                  key={ri}
                  className={darkMode ? 'hover:bg-white/5' : 'hover:bg-slate-50/50'}
                >
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      className={`px-3 py-2 ${
                        darkMode ? 'text-white/90' : 'text-slate-700'
                      }`}
                    >
                      {renderInlineFormatted(cell, darkMode)}
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
          className={`my-2.5 space-y-1.5 pl-4 text-xs list-decimal list-outside ${
            darkMode ? 'text-white/90' : 'text-slate-700'
          }`}
        >
          {items.map((item, idx) => (
            <li key={idx} className="leading-relaxed">
              {renderInlineFormatted(item, darkMode)}
            </li>
          ))}
        </ol>
      );
    } else {
      elements.push(
        <ul
          key={`list-${elements.length}`}
          className={`my-2.5 space-y-1.5 pl-4 text-xs list-disc list-outside ${
            darkMode ? 'text-white/90' : 'text-slate-700'
          }`}
        >
          {items.map((item, idx) => (
            <li key={idx} className="leading-relaxed">
              {renderInlineFormatted(item, darkMode)}
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
          className={`my-3 overflow-x-auto rounded-sm border px-4 py-2.5 text-center shadow-2xs ${
            darkMode
              ? 'border-white/15 bg-white/5 text-white'
              : 'border-slate-200 bg-slate-50/80 text-slate-900'
          }`}
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

    // 0. Handler Math Block Multi-Line
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

    // 1. Deteksi Math Block
    if (line === '\\[' || line === '$$') {
      flushTable();
      flushList();
      inMathBlock = true;
      mathDelimiter = line === '\\[' ? '\\]' : '$$';
      mathBlockLines = [];
      continue;
    }

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
          className={`my-3 overflow-x-auto rounded-sm border px-4 py-2.5 text-center shadow-2xs ${
            darkMode
              ? 'border-white/15 bg-white/5 text-white'
              : 'border-slate-200 bg-slate-50/80 text-slate-900'
          }`}
        >
          {renderMath(mathContent, true)}
        </div>
      );
      continue;
    }

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

    // 2. Deteksi Baris Tabel
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

    // 3. Deteksi Daftar Bullet
    if (/^[-*•]\s+/.test(line)) {
      const itemText = line.replace(/^[-*•]\s+/, '');
      if (!currentList || currentList.type !== 'ul') {
        flushList();
        currentList = { type: 'ul', items: [] };
      }
      currentList.items.push(itemText);
      continue;
    }

    // 4. Deteksi Daftar Angka
    if (/^\d+\.\s+/.test(line)) {
      const itemText = line.replace(/^\d+\.\s+/, '');
      if (!currentList || currentList.type !== 'ol') {
        flushList();
        currentList = { type: 'ol', items: [] };
      }
      currentList.items.push(itemText);
      continue;
    }

    flushList();

    // 5. Baris Kosong
    if (!line) {
      continue;
    }

    // 6. Horizontal Rule (---)
    if (/^---+$/.test(line)) {
      elements.push(
        <hr
          key={`hr-${i}`}
          className={`my-3.5 border-t ${
            darkMode ? 'border-white/15' : 'border-slate-200'
          }`}
        />
      );
      continue;
    }

    // 7. Heading 2 (## ...)
    if (line.startsWith('## ')) {
      elements.push(
        <h2
          key={`h2-${i}`}
          className={`mt-4 mb-2 text-sm font-bold border-b pb-1 ${
            darkMode
              ? 'text-white border-white/20'
              : 'text-slate-900 border-slate-200'
          }`}
        >
          {renderInlineFormatted(line.replace('## ', ''), darkMode)}
        </h2>
      );
      continue;
    }

    // 8. Heading 3 (### ...)
    if (line.startsWith('### ')) {
      elements.push(
        <h3
          key={`h3-${i}`}
          className={`mt-3 mb-1.5 text-xs font-bold uppercase tracking-wide ${
            darkMode ? 'text-emerald-300' : 'text-emerald-800'
          }`}
        >
          {renderInlineFormatted(line.replace('### ', ''), darkMode)}
        </h3>
      );
      continue;
    }

    // 9. Heading 4 (#### ...)
    if (line.startsWith('#### ')) {
      elements.push(
        <h4
          key={`h4-${i}`}
          className={`mt-2 mb-1 text-xs font-bold ${
            darkMode ? 'text-emerald-200' : 'text-slate-800'
          }`}
        >
          {renderInlineFormatted(line.replace('#### ', ''), darkMode)}
        </h4>
      );
      continue;
    }

    // 10. Blockquote (> ...)
    if (line.startsWith('> ')) {
      elements.push(
        <div
          key={`bq-${i}`}
          className={`my-2.5 rounded-sm border-l-2 p-2.5 text-xs ${
            darkMode
              ? 'border-emerald-400 bg-emerald-950/60 text-emerald-100'
              : 'border-emerald-500 bg-emerald-50/60 text-emerald-950'
          }`}
        >
          {renderInlineFormatted(line.replace('> ', ''), darkMode)}
        </div>
      );
      continue;
    }

    // 11. Paragraf Normal
    elements.push(
      <p
        key={`p-${i}`}
        className={`my-1.5 text-xs leading-relaxed ${
          darkMode ? 'text-white/90' : 'text-slate-700'
        }`}
      >
        {renderInlineFormatted(line, darkMode)}
      </p>
    );
  }

  flushMath();
  flushTable();
  flushList();

  return <div className={`space-y-1 ${className}`}>{elements}</div>;
}
