import os

files_to_fix = [
    r"c:\Users\21261\python-project-\Front-end\src\components\plagiat\PlagiatScoreCard.tsx",
    r"c:\Users\21261\python-project-\Front-end\src\components\plagiat\SimilarityViewer.tsx",
    r"c:\Users\21261\python-project-\Front-end\src\components\plagiat\PlagiatResult.tsx",
    r"c:\Users\21261\python-project-\Front-end\src\components\plagiat\RiskIndicator.tsx",
    r"c:\Users\21261\python-project-\Front-end\src\components\plagiat\PlagiatStats.tsx"
]

for file_path in files_to_fix:
    if os.path.exists(file_path):
        try:
            with open(file_path, 'r', encoding='utf-8-sig') as f:
                content = f.read()
            
            # Write back with pure utf-8 (no BOM)
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Fixed encoding for: {file_path}")
        except Exception as e:
            print(f"Error fixing {file_path}: {e}")
    else:
        print(f"File not found: {file_path}")
