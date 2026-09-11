// js/editor.js - CodeMirror Editor Initialization & Autocomplete

const PYTHON_KEYWORDS = [
  "heapq", "heappop", "heappush", "heapify", "heappushpop", "heapreplace",
  "collections", "deque", "append", "pop", "popleft", "extend",
  "def", "return", "if", "else", "elif", "for", "while", "in", "not", "and", "or",
  "range", "len", "sum", "min", "max", "abs", "enumerate", "zip", "sorted",
  "float('inf')", "float('-inf')", "int", "str", "list", "dict", "set",
  "True", "False", "None", "print", "import", "from", "as", "pass", "continue", "break"
];

const SQL_KEYWORDS = [
  "SELECT", "FROM", "WHERE", "JOIN", "INNER JOIN", "LEFT JOIN", "RIGHT JOIN",
  "GROUP BY", "HAVING", "ORDER BY", "ASC", "DESC", "LIMIT",
  "DISTINCT", "COUNT", "SUM", "AVG", "MIN", "MAX",
  "AND", "OR", "NOT", "IN", "EXISTS", "BETWEEN", "LIKE", "IS NULL", "IS NOT NULL",
  "AS", "ON", "CASE", "WHEN", "THEN", "ELSE", "END", "UNION", "ALL"
];

export function createEditor({ textarea, onRunCode, onCodeChange }) {
  const editor = CodeMirror.fromTextArea(textarea, {
    mode: "python",
    theme: "material-darker",
    lineNumbers: true,
    indentUnit: 4,
    tabSize: 4,
    indentWithTabs: false,
    smartIndent: true,
    autoCloseBrackets: true,
    matchBrackets: true,
    lineWrapping: false,
    extraKeys: {
      "Tab": function (cm) {
        if (cm.somethingSelected()) {
          cm.indentSelection("add");
        } else {
          cm.replaceSelection("    ", "end");
        }
      },
      "Shift-Tab": function (cm) {
        cm.indentSelection("subtract");
      },
      "Ctrl-Space": "autocomplete",
      "Ctrl-Enter": function () { if (onRunCode) onRunCode(); },
      "Cmd-Enter": function () { if (onRunCode) onRunCode(); }
    }
  });

  // Autocomplete Hint Helper
  function getHintList(cm) {
    const cur = cm.getCursor();
    const token = cm.getTokenAt(cur);
    const start = token.start;
    const end = cur.ch;
    const word = token.string;

    const isSql = (cm.getOption("mode") === "text/x-sql");
    const dictionary = isSql ? SQL_KEYWORDS : PYTHON_KEYWORDS;

    if (!word || word.trim() === "" || /[^\w]/.test(word)) {
      return {
        list: dictionary.slice(0, 15),
        from: CodeMirror.Pos(cur.line, start),
        to: CodeMirror.Pos(cur.line, end)
      };
    }

    const matches = dictionary.filter(k => k.toLowerCase().startsWith(word.toLowerCase()));
    return {
      list: matches.length ? matches : [],
      from: CodeMirror.Pos(cur.line, start),
      to: CodeMirror.Pos(cur.line, end)
    };
  }

  CodeMirror.registerHelper("hint", "python", getHintList);
  CodeMirror.registerHelper("hint", "sql", getHintList);

  // Auto-trigger hint on character typing
  editor.on("inputRead", function (cm, change) {
    if (change.origin !== "+input") return;
    const text = change.text[0];
    if (/[a-zA-Z_\.]/.test(text)) {
      cm.showHint({ completeSingle: false });
    }
  });

  if (onCodeChange) {
    editor.on("change", () => onCodeChange(editor.getValue()));
  }

  return editor;
}
