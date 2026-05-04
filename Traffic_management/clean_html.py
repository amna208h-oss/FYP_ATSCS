import re

def clean_html_file():
    # Read the file
    with open('templates/index.html', 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Look for the main simulated camera div
    pattern = r'<div class="simulated-camera main-intersection".*?>(.*?)<!-- Additional Camera Feeds -->'
    
    match = re.search(pattern, content, re.DOTALL)
    if not match:
        print("Could not find simulation content")
        return
    
    # Extract the matched content and surrounding context
    match_start = match.start()
    match_end = match.end()
    
    # Go back to find the camera-stream div
    camera_stream_start = content.rfind('<div class="camera-stream', 0, match_start)
    if camera_stream_start == -1:
        print("Could not find camera-stream div")
        return
    
    # Create replacement HTML
    replacement = '''<div class="camera-stream position-absolute top-0 start-0 w-100 h-100">
  <div class="camera-fallback d-flex flex-column justify-content-center align-items-center text-center p-3 h-100 w-100">
    <i class="bi bi-camera-video-off text-secondary mb-2" style="font-size: 2rem;"></i>
    <h6 class="text-secondary">Camera offline</h6>
    <button class="btn btn-sm btn-primary btn-reconnect">
      <i class="bi bi-arrow-repeat me-1"></i>Connect
    </button>
  </div>
</div>'''
    
    # Replace the content
    remaining_content = content[match_end-20:]  # Keep a bit of the match in case the pattern isn't perfect
    end_marker = '<!-- Additional Camera Feeds -->'
    end_index = remaining_content.find(end_marker)
    if end_index == -1:
        print("Could not find end marker")
        return
    
    new_content = content[:camera_stream_start] + replacement + remaining_content[end_index:]
    
    # Remove animation keyframes
    new_content = re.sub(r'@keyframes\s+move\w+\s*\{[^}]+\}', '', new_content)
    
    # Write back to file
    with open('templates/index.html', 'w', encoding='utf-8') as file:
        file.write(new_content)
    
    print("Successfully cleaned the HTML file")

if __name__ == "__main__":
    clean_html_file()
