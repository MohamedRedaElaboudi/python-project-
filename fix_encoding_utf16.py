import os

files_to_fix = [
    r"c:\Users\21261\python-project-\Front-end\src\components\plagiat\PlagiatScoreCard.tsx",
    r"c:\Users\21261\python-project-\Front-end\src\components\plagiat\SimilarityViewer.tsx"
]

for file_path in files_to_fix:
    if os.path.exists(file_path):
        try:
            # Try reading as UTF-16 (little endian) which handles the FF FE BOM
            with open(file_path, 'r', encoding='utf-16') as f:
                content = f.read()
            
            # Write back as pure UTF-8
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Fixed encoding for: {file_path}")
        except Exception as e:
            print(f"Error fixing {file_path}: {e}")
            # Fallback try with iso-8859-1 just to see content if needed
            try:
                 with open(file_path, 'r', encoding='iso-8859-1') as f:
                    print(f"Fallback read head: {f.read(20)}")
            except:
                pass
