const fs = require('fs');
const p = 'e:/Work/flowlio-fe/src/components/support/supportheader.tsx';
let c = fs.readFileSync(p, 'utf8');

// Fix the notification gradient box (the white box issue)
c = c.replace(
  'from-blue-500/5 to-indigo-50 p-6 rounded-lg border border-blue-200 mt-5',
  'bg-card p-6 rounded-lg border border-border mt-5'
);
// clean up leftover gradient prefix
c = c.replace('bg-gradient-to-r bg-card', 'bg-card');

// Fix hardcoded text-gray-800 → text-foreground
c = c.split('text-gray-800').join('text-foreground');

// hover:bg-blue-100 → hover:bg-muted (notification list items)
c = c.split('hover:bg-blue-100').join('hover:bg-muted');

// text-slate-600 → text-muted-foreground (activity text)
c = c.split('text-slate-600').join('text-muted-foreground');
c = c.split('text-slate-500').join('text-muted-foreground');

// bg-slate-200 → bg-muted (activity timeline dot)
c = c.split('bg-slate-200').join('bg-muted');
c = c.split('outline-slate-300').join('outline-border');

fs.writeFileSync(p, c, 'utf8');
console.log('Fixed supportheader.tsx');
