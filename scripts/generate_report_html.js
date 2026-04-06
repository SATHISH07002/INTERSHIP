const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");
const inputPath = path.join(projectRoot, "PROJECT_SUBMISSION_REPORT.md");
const outputPath = path.join(projectRoot, "PROJECT_SUBMISSION_REPORT.html");

const markdown = fs.readFileSync(inputPath, "utf8").replace(/\r\n/g, "\n");
const lines = markdown.split("\n");

const escapeHtml = (text) =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const formatInline = (text) =>
  escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");

let html = "";
let inUl = false;
let inOl = false;
let inTable = false;
let inCode = false;

const closeLists = () => {
  if (inUl) {
    html += "</ul>\n";
    inUl = false;
  }
  if (inOl) {
    html += "</ol>\n";
    inOl = false;
  }
};

const closeTable = () => {
  if (inTable) {
    html += "</table>\n";
    inTable = false;
  }
};

for (const rawLine of lines) {
  const line = rawLine.trim();

  if (line === "```" || line === "```text") {
    closeLists();
    closeTable();
    html += inCode ? "</pre>\n" : "<pre>\n";
    inCode = !inCode;
    continue;
  }

  if (inCode) {
    html += `${escapeHtml(rawLine)}\n`;
    continue;
  }

  if (!line) {
    closeLists();
    closeTable();
    continue;
  }

  if (line === "---") {
    closeLists();
    closeTable();
    html += "<hr />\n";
    continue;
  }

  if (line.startsWith("|")) {
    closeLists();
    if (/^\|[-\s|]+\|$/.test(line)) {
      continue;
    }

    if (!inTable) {
      html += "<table>\n";
      inTable = true;
    }

    const cells = line
      .slice(1, -1)
      .split("|")
      .map((cell) => cell.trim());

    const isHeader = cells.includes("Test Case") || cells.includes("Input");
    const tag = isHeader ? "th" : "td";
    html += `<tr>${cells.map((cell) => `<${tag}>${formatInline(cell)}</${tag}>`).join("")}</tr>\n`;
    continue;
  }

  closeTable();

  if (line.startsWith("# ")) {
    closeLists();
    html += `<h1>${formatInline(line.slice(2))}</h1>\n`;
    continue;
  }

  if (line.startsWith("## ")) {
    closeLists();
    html += `<h2>${formatInline(line.slice(3))}</h2>\n`;
    continue;
  }

  if (line.startsWith("### ")) {
    closeLists();
    html += `<h3>${formatInline(line.slice(4))}</h3>\n`;
    continue;
  }

  if (/^\d+\.\s+/.test(line)) {
    if (!inOl) {
      closeLists();
      html += "<ol>\n";
      inOl = true;
    }
    html += `<li>${formatInline(line.replace(/^\d+\.\s+/, ""))}</li>\n`;
    continue;
  }

  if (line.startsWith("- ")) {
    if (!inUl) {
      closeLists();
      html += "<ul>\n";
      inUl = true;
    }
    html += `<li>${formatInline(line.slice(2))}</li>\n`;
    continue;
  }

  closeLists();
  html += `<p>${formatInline(rawLine)}</p>\n`;
}

closeLists();
closeTable();

const documentHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>CertiTrust Project Report</title>
  <style>
    @page {
      size: A4;
      margin: 18mm 16mm;
    }
    body {
      font-family: "Times New Roman", serif;
      font-size: 12pt;
      line-height: 1.5;
      color: #111;
      max-width: 190mm;
      margin: 0 auto;
    }
    h1, h2, h3 {
      text-align: center;
      margin: 16px 0 10px;
      page-break-after: avoid;
    }
    h1 { font-size: 22pt; }
    h2 { font-size: 17pt; }
    h3 { font-size: 13pt; }
    p {
      text-align: justify;
      margin: 8px 0;
    }
    ul, ol {
      margin: 8px 0 12px 24px;
    }
    li {
      margin: 4px 0;
    }
    code, pre {
      font-family: Consolas, monospace;
    }
    pre {
      white-space: pre-wrap;
      border: 1px solid #bbb;
      padding: 10px;
      background: #f7f7f7;
    }
    hr {
      border: 0;
      border-top: 1px solid #777;
      margin: 18px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0;
      font-size: 11pt;
    }
    th, td {
      border: 1px solid #444;
      padding: 6px;
      text-align: left;
      vertical-align: top;
    }
    th {
      background: #efefef;
    }
  </style>
</head>
<body>
${html}
</body>
</html>`;

fs.writeFileSync(outputPath, documentHtml, "utf8");
console.log(outputPath);
