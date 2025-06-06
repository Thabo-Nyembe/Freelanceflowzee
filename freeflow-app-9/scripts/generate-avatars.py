#!/usr/bin/env python3
"""
Generate placeholder avatar images for the FreeflowZee application.
Creates proper JPEG images with colored backgrounds and initials.
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_avatar(name, size=128, bg_color='#4F46E5', text_color='white'):
    """Create a simple avatar image with initials on a colored background."""
    # Create image
    img = Image.new('RGB', (size, size), bg_color)
    draw = ImageDraw.Draw(img)
    
    # Get initials (first letter of first name)
    initial = name[0].upper()
    
    # Try to use system font, fallback to default
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", size//2)
    except:
        try:
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", size//2)
        except:
            font = ImageFont.load_default()
    
    # Calculate text position (center)
    bbox = draw.textbbox((0, 0), initial, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    x = (size - text_width) // 2
    y = (size - text_height) // 2
    
    # Draw text
    draw.text((x, y), initial, fill=text_color, font=font)
    
    return img

def main():
    # Avatar configurations
    avatars = [
        {"name": "alice", "bg_color": "#EF4444"},    # Red
        {"name": "bob", "bg_color": "#10B981"},      # Green  
        {"name": "jane", "bg_color": "#8B5CF6"},     # Purple
        {"name": "john", "bg_color": "#F59E0B"},     # Yellow
        {"name": "mike", "bg_color": "#06B6D4"},     # Cyan
        {"name": "client-1", "bg_color": "#6366F1"} # Indigo
    ]
    
    # Create avatars directory if it doesn't exist
    os.makedirs("public/avatars", exist_ok=True)
    
    for avatar in avatars:
        img = create_avatar(avatar["name"], bg_color=avatar["bg_color"])
        filepath = f"public/avatars/{avatar['name']}.jpg"
        img.save(filepath, "JPEG", quality=85)
        print(f"Created {filepath}")

if __name__ == "__main__":
    main() 