const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/components/**/*.tsx');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  // Clean up fill-white where it breaks icons in dark mode
  content = content.replace(/className=\"[^\"]*fill-white text-foreground size-5[^\"]*\"/g, 'className=\"text-white size-5\"');
  content = content.replace(/<Eye className=\"fill-white size-7 \" \/>/g, '<Eye className=\"text-white size-5\" />');
  content = content.replace(/<PencilLine className=\"fill-white text-white\" \/>/g, '<PencilLine className=\"text-white\" />');
  content = content.replace(/<FaRegTrashAlt className=\"text-white fill-white size-4 \" \/>/g, '<FaRegTrashAlt className=\"text-white size-4\" />');
  content = content.replace(/<IoEye className=\"size-6 fill-white\" \/>/g, '<IoEye className=\"size-5 text-white\" />');
  content = content.replace(/<Square className=\"size-4 fill-white\" \/>/g, '<Square className=\"size-4 text-white\" />');
  content = content.replace(/<Play className=\"size-3 fill-white\" \/>/g, '<Play className=\"size-3 text-white\" />');
  content = content.replace(/<Eye className=\"fill-white text-foreground size-5\" \/>/g, '<Eye className=\"text-white size-5\" />');
  
  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log('Fixed', file);
  }
});
