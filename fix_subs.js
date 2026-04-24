const fs = require('fs');
const p = 'e:/Work/flowlio-fe/src/components/super admin section/subscriptions/subscriptionsheader.tsx';
let c = fs.readFileSync(p, 'utf8');

c = c.replace(/className=\"([^\"]*)bg-white([^\"]*)\"/g, (match, p1, p2) => `className="${p1}bg-card border-border${p2}"`);
c = c.replace(/border-gray-200/g, 'border-border');
c = c.replace(/className=\"([^\"]*)bg-\\[#F3F5F5\\]([^\"]*)\"/g, (match, p1, p2) => `className="${p1}bg-muted${p2}"`);
c = c.replace(/text-black/g, 'text-foreground');
c = c.replace(/text-gray-500/g, 'text-muted-foreground');
c = c.replace(/text-gray-400/g, 'text-muted-foreground');
c = c.replace(/text-gray-700/g, 'text-muted-foreground');

fs.writeFileSync(p, c, 'utf8');
console.log('Fixed subscriptionsheader');
