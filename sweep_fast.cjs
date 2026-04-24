const fs = require('fs');
const path = require('path');

function processFile(file) {
  let c = fs.readFileSync(file, 'utf8');
  let changed = false;
  
  if (c.includes('bg-[#F3F5F5]')) { c = c.split('bg-[#F3F5F5]').join('bg-muted'); changed = true; }
  if (c.includes('bg-white')) { c = c.split('bg-white').join('bg-card'); changed = true; }
  if (c.includes('text-black')) { c = c.split('text-black').join('text-foreground'); changed = true; }
  if (c.includes('text-gray-500')) { c = c.split('text-gray-500').join('text-muted-foreground'); changed = true; }
  if (c.includes('text-gray-400')) { c = c.split('text-gray-400').join('text-muted-foreground'); changed = true; }
  if (c.includes('text-gray-700')) { c = c.split('text-gray-700').join('text-muted-foreground'); changed = true; }
  if (c.includes('border-gray-200')) { c = c.split('border-gray-200').join('border-border'); changed = true; }
  if (c.includes('border-gray-100')) { c = c.split('border-gray-100').join('border-border'); changed = true; }

  if (changed) fs.writeFileSync(file, c, 'utf8');
}

function walk(dir) {
  let list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
    let stat = fs.statSync(file);
    if (stat && stat.isDirectory()) walk(file);
    else if(file.endsWith('.tsx') || file.endsWith('.ts')) {
      processFile(file);
    }
  });
}

walk('e:/Work/flowlio-fe/src/components/super admin section');
// Check newsletter page if in another folder
if (fs.existsSync('e:/Work/flowlio-fe/src/pages/superadminnewsletter.page.tsx')) {
  processFile('e:/Work/flowlio-fe/src/pages/superadminnewsletter.page.tsx');
}

console.log('Sweep completed instantly');
