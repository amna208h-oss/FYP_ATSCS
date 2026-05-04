import re

def main():
    # Read HTML file
    try:
        with open('templates/index.html', 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading file: {e}")
        return

    # Remove animation keyframes
    try:
        pattern = r'@keyframes\s+move\w+(?:-Main)?\s*\{[^}]+\}'
        cleaned_content = re.sub(pattern, '/* Animation removed */', content)
        print(f"Found and removed {content.count('@keyframes')} keyframe animations")
    except Exception as e:
        print(f"Error removing animations: {e}")
        return

    # Write back to file
    try:
        with open('templates/index.html', 'w', encoding='utf-8') as f:
            f.write(cleaned_content)
        print("Successfully saved cleaned HTML")
    except Exception as e:
        print(f"Error writing file: {e}")
        return

if __name__ == "__main__":
    main()
