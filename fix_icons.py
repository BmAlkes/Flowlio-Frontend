import os
import glob
import re

files = glob.glob('src/components/**/*.tsx', recursive=True)
count = 0
for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content
    
    # 1. CirclePlus
    content = re.sub(r'className="fill-white text-foreground size-5"', 'className="text-white size-5"', content)
    
    # 2. Eye
    content = re.sub(r'className="fill-white size-7 "', 'className="text-white size-5"', content)
    
    # 3. FaRegTrashAlt
    content = re.sub(r'className="text-white fill-white size-4 "', 'className="text-white size-4"', content)
    
    # 4. PencilLine
    content = re.sub(r'className="fill-white text-white"', 'className="text-white size-5"', content)
    
    # 5. IoEye
    content = re.sub(r'className="size-6 fill-white"', 'className="size-5 text-white"', content)
    
    # 6. MdDataSaverOn
    content = re.sub(r'className="size-5 fill-\[#1797B9\]/90 hover:fill-white transition-all duration-300"', 'className="size-5 text-[#1797B9]/90 hover:text-white transition-all duration-300"', content)

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed {filepath}")
        count += 1

print(f"Total files fixed: {count}")
