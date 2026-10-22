// Собирает все модули из js/ в один файл app.bundle.js (обычный скрипт, без import/export).
// Так приложение запускается даже из файла на диске и не ломается, если на хостинг
// не попала какая-то вложенная папка. Запуск: node build.mjs (или npm run build).
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';

const ENTRY = 'js/app.js';
const modules = new Map();

function resolve(from, spec) {
  return path.posix.normalize(path.posix.join(path.posix.dirname(from), spec));
}

function transform(id) {
  let src = readFileSync(id, 'utf8');
  const deps = [];
  const exportsList = [];

  src = src.replace(/^import\s+([\s\S]*?)\s+from\s+['"](.+?)['"];?/gm, (_, clause, spec) => {
    const dep = resolve(id, spec);
    deps.push(dep);
    const req = `__req(${JSON.stringify(dep)})`;
    clause = clause.trim();
    if (clause.startsWith('* as ')) return `const ${clause.slice(5).trim()} = ${req};`;
    if (clause.startsWith('{')) {
      const names = clause.slice(1, -1).split(',').map((s) => s.trim()).filter(Boolean)
        .map((s) => s.replace(/^(\w+)\s+as\s+(\w+)$/, '$1: $2'));
      return `const { ${names.join(', ')} } = ${req};`;
    }
    return `const ${clause} = ${req}.default;`;
  });
  src = src.replace(/^import\s+['"](.+?)['"];?/gm, (_, spec) => {
    const dep = resolve(id, spec);
    deps.push(dep);
    return `__req(${JSON.stringify(dep)});`;
  });
  src = src.replace(/^export\s+(async\s+function|function|const|let|class)\s+(\w+)/gm, (_, kind, name) => {
    exportsList.push(name);
    return `${kind} ${name}`;
  });
  src = src.replace(/^export\s+default\s+/gm, () => {
    exportsList.push('default: __default');
    return 'const __default = ';
  });
  if (/^\s*(import|export)\s/m.test(src)) throw new Error(`Не удалось разобрать import/export в ${id}`);
  modules.set(id, { src, exportsList });
  for (const d of deps) if (!modules.has(d)) transform(d);
}

transform(ENTRY);

const parts = [...modules].map(([id, { src, exportsList }]) =>
  `__f[${JSON.stringify(id)}] = function () {\n${src}\nreturn { ${exportsList.join(', ')} };\n};`);

const bundle = `// Собрано автоматически из папки js/ командой node build.mjs — не редактируйте вручную.
(function () {
'use strict';
const __f = {};
const __c = {};
function __req(id) {
  if (!(id in __c)) {
    if (!__f[id]) throw new Error('Нет модуля ' + id);
    __c[id] = __f[id]();
  }
  return __c[id];
}
${parts.join('\n\n')}
__req(${JSON.stringify(ENTRY)});
})();
`;

writeFileSync('app.bundle.js', bundle);

// Метка версии в index.html, чтобы Telegram не показывал старую версию из кеша
const hash = createHash('sha1').update(bundle + readFileSync('css/app.css', 'utf8')).digest('hex').slice(0, 8);
const html = readFileSync('index.html', 'utf8')
  .replace(/src="app\.bundle\.js(\?v=\w+)?"/, `src="app.bundle.js?v=${hash}"`)
  .replace(/href="css\/app\.css(\?v=\w+)?"/, `href="css/app.css?v=${hash}"`);
writeFileSync('index.html', html);

console.log(`app.bundle.js: ${modules.size} модулей, ${(bundle.length / 1024).toFixed(0)} КБ, версия ${hash}`);
