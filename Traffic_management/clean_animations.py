import re

with open('templates/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove animation keyframes
pattern = r'@keyframes\s+move\w+(?:-Main)?\s*\{[^}]+\}'
cleaned_content = re.sub(pattern, '/* Animation removed */', content)

# Write back to file
with open('templates/index.html', 'w', encoding='utf-8') as f:
    f.write(cleaned_content)

print("Removed animation keyframes from index.html") 