const fs = require('fs');
const path = require('path');

let totalFixed = 0;
let filesFixed = [];

// Files/patterns to SKIP (where white bg is intentional like status dot indicators on colored badges)
const skipPatterns = [
  'dot: "bg-white"',   // Status indicator dots on colored badges - intentional
  "dot: 'bg-white'",
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // Replace bg-white in className strings - but preserve dot indicator patterns
  // Simple string replacements for common patterns
  const replacements = [
    // Full container backgrounds
    [/bg-white\/80/g, 'bg-card/80'],
    [/bg-white\/60/g, 'bg-card/60'],
    // Input fields: bg-white rounded → bg-background rounded
    [/bg-white rounded-full/g, 'bg-background rounded-full'],
    [/bg-white rounded-xl/g, 'bg-card rounded-xl'],
    [/bg-white rounded-lg/g, 'bg-card rounded-lg'],
    [/bg-white rounded-md/g, 'bg-card rounded-md'],
    [/bg-white rounded/g, 'bg-background rounded'],
    // Standalone bg-white in classNames (not dot indicators)
    [/bg-white border/g, 'bg-card border'],
    [/bg-white flex/g, 'bg-card flex'],
    [/bg-white p-/g, 'bg-card p-'],
    [/bg-white w-/g, 'bg-card w-'],
    [/bg-white text-/g, 'bg-background text-'],
    // Border gray
    [/border-gray-200/g, 'border-border'],
    [/border-gray-100/g, 'border-border'],
    [/border-gray-300/g, 'border-border'],
    // Text colors
    [/text-gray-600(?!\/)/g, 'text-muted-foreground'],
    [/text-gray-500(?!\/)/g, 'text-muted-foreground'],
    [/text-gray-400(?!\/)/g, 'text-muted-foreground'],
    [/text-gray-700(?!\/)/g, 'text-foreground'],
    [/text-gray-900(?!\/)/g, 'text-foreground'],
    [/text-black(?!\s*\/)/g, 'text-foreground'],
    // Background grays  
    [/bg-gray-50(?!\/)/g, 'bg-muted/50'],
    [/bg-gray-100(?!\/)/g, 'bg-muted'],
    [/bg-gray-200(?!\/)/g, 'bg-muted'],
    [/from-gray-50/g, 'from-muted/30'],
    [/from-gray-100/g, 'from-muted/50'],
    [/to-gray-100/g, 'to-muted/50'],
    [/from-blue-50/g, 'from-blue-500/5'],
    [/to-blue-100/g, 'to-blue-500/10'],
    [/from-green-50/g, 'from-green-500/5'],
    [/to-green-100/g, 'to-green-500/10'],
    [/from-purple-50/g, 'from-purple-500/5'],
    [/to-purple-100/g, 'to-purple-500/10'],
    [/from-orange-50/g, 'from-orange-500/5'],
    [/to-orange-100/g, 'to-orange-500/10'],
    [/from-indigo-50/g, 'from-indigo-500/5'],
    [/to-indigo-100/g, 'to-indigo-500/10'],
    [/from-yellow-50/g, 'from-yellow-500/5'],
    [/to-yellow-100/g, 'to-yellow-500/10'],
    [/from-red-50/g, 'from-red-500/5'],
    [/to-red-100/g, 'to-red-500/10'],
    // placeholder
    [/placeholder:text-gray-400/g, 'placeholder:text-muted-foreground'],
    [/placeholder:text-gray-500/g, 'placeholder:text-muted-foreground'],
    // focus text
    [/focus:text-black/g, 'focus:text-foreground'],
  ];

  for (const [from, to] of replacements) {
    content = content.replace(from, to);
  }

  // Remaining standalone bg-white that wasn't caught above
  // Only replace if NOT part of dot: "bg-white" pattern
  if (content.includes('bg-white') && !filePath.includes('RichTextEditor')) {
    const lines = content.split('\n');
    const newLines = lines.map(line => {
      // Skip dot indicator lines (status badge dots - intentionally white on colored bg)
      if (line.includes('dot:') && line.includes('bg-white')) return line;
      // Skip color picker related files
      if (line.includes('bg-white') && line.includes('color')) return line;
      return line.replace(/bg-white/g, 'bg-card');
    });
    content = newLines.join('\n');
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    filesFixed.push(filePath);
    totalFixed++;
  }
}

function walk(dir, extensions = ['.tsx', '.ts']) {
  if (!fs.existsSync(dir)) return;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath, extensions);
    } else if (extensions.some(ext => file.endsWith(ext))) {
      try { processFile(fullPath); } catch(e) { console.error('Error on:', fullPath, e.message); }
    }
  });
}

// Target all src directories
const targets = [
  'e:/Work/flowlio-fe/src/pages',
  'e:/Work/flowlio-fe/src/components',
];

targets.forEach(t => walk(t));

console.log(`\n✅ Fixed ${totalFixed} files:`);
filesFixed.forEach(f => console.log(' -', f.replace('e:/Work/flowlio-fe/src/', '')));
