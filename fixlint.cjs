const fs = require('fs');

// Fix duplicate border-border in subscriptionsheader.tsx
const p = 'e:/Work/flowlio-fe/src/components/super admin section/subscriptions/subscriptionsheader.tsx';
let c = fs.readFileSync(p, 'utf8');
// Remove the extra 'border-border ' that was inserted before 'rounded-md border'
c = c.replace('bg-card border-border rounded-md border border-border flex-1 overflow-hidden gap-0', 'bg-card rounded-md border border-border flex-1 overflow-hidden gap-0');
// Fix all 'border-border border border-border' patterns 
c = c.replace(/border-border\s+border\s+border-border/g, 'border border-border');
// Fix input/textarea 'border border-border border-border'
c = c.replace(/\bborder border-border border-border\b/g, 'border border-border');
fs.writeFileSync(p, c, 'utf8');
console.log('fixed subs');

// Quick check all super admin section files for remaining bg-white
function walk(dir) {
  let list = [];
  try { list = fs.readdirSync(dir); } catch(e) { return; }
  list.forEach(function(file) {
    file = dir + '/' + file;
    let stat;
    try { stat = fs.statSync(file); } catch(e) { return; }
    if (stat && stat.isDirectory()) walk(file);
    else if(file.endsWith('.tsx') || file.endsWith('.ts')) {
      let c2 = fs.readFileSync(file, 'utf8');
      if (c2.includes('bg-white') || c2.includes('from-gray-50') || c2.includes('from-blue-50') || c2.includes('from-green-50')) {
        console.log('STILL HAS HARDCODED BG:', file);
      }
    }
  });
}
walk('e:/Work/flowlio-fe/src/components/super admin section');
walk('e:/Work/flowlio-fe/src/components/common');
console.log('scan done');
