
import os

path = r"C:\Users\21261\python-project-\Back-end\app\api\plagiat\plagiat_analysis.py"

try:
    with open(path, 'rb') as f:
        content = f.read()
    
    if len(content) % 2 != 0:
        print(f"File has odd number of bytes ({len(content)}), trimming last byte.")
        content = content[:-1]

    # Try decoding
    decoded = content.decode('utf-16-le')
    print("Success decoding utf-16-le")
    print("First 50 chars:", repr(decoded[:50]))
    
    # Write back
    with open(path, 'w', encoding='utf-8') as f:
        f.write(decoded)
    print("Saved as utf-8")

except Exception as e:
    print(f"Error: {e}")
