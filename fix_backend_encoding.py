import os

files_to_fix = [
    r"c:\Users\21261\python-project-\Back-end\app\api\plagiat\__init__.py",
    r"c:\Users\21261\python-project-\Back-end\app\api\plagiat\plagiat_analysis.py",
    r"c:\Users\21261\python-project-\Back-end\app\api\plagiat\plagiat_dashboard.py"
]

for file_path in files_to_fix:
    if os.path.exists(file_path):
        try:
            # Try reading as UTF-16 (little endian) which handles the FF FE BOM
            # or just read as binary to strip null bytes if it's not valid UTF-16
            with open(file_path, 'rb') as f:
                content_bytes = f.read()
            
            # Replace null bytes
            clean_bytes = content_bytes.replace(b'\x00', b'')
            
            # Decode to string (assume utf-8 or latin-1 if utf-8 fails)
            try:
                content_str = clean_bytes.decode('utf-8')
            except UnicodeDecodeError:
                content_str = clean_bytes.decode('latin-1')

            # Write back as pure UTF-8
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content_str)
                
            print(f"Fixed encoding for: {file_path}")
        except Exception as e:
            print(f"Error fixing {file_path}: {e}")
