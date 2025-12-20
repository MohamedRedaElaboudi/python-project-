
import os
import glob

directory = r"C:\Users\21261\python-project-\Back-end\app\api\plagiat"
files = glob.glob(os.path.join(directory, "*.py"))

for path in files:
    try:
        # Try reading as utf-16
        with open(path, 'r', encoding='utf-16') as f:
            content = f.read()
        
        # Verify it looks like python (has 'import' or 'def' or 'class' or is empty)
        # If it was actually utf-8, opening as utf-16 usually produces garbage or fails.
        if "properties" in content or "import" in content or "def " in content or len(content.strip()) == 0:
             # Write back as utf-8
            with open(path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Converted {path}")
        else:
             print(f"Skipped {path} (content didn't look like Python after utf-16 decode)")
             # Maybe it was already utf-8?
    except UnicodeError:
        print(f"UnicodeError reading {path} as utf-16, maybe it is already utf-8 or different encoding.")
    except Exception as e:
        print(f"Failed {path}: {e}")
