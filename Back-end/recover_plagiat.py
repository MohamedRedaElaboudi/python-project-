
import os

path = r"C:\Users\21261\python-project-\Back-end\app\api\plagiat\plagiat_analysis.py"

try:
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    raw_bytes = content.encode('utf-16-le')
    
    # Try decoding with replace to ignore encoding errors in comments/strings
    recovered_text = raw_bytes.decode('utf-8', errors='replace')
    
    print("Recovered text start:", recovered_text[:100])
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(recovered_text)
        
    print("Successfully recovered and saved plagiat_analysis.py")

except Exception as e:
    print(f"Error: {e}")
