#!/usr/bin/env python3
"""
Generate placeholder media files for the FreeflowZee application.
Creates placeholder images, videos, audio files, and documents.
"""

from PIL import Image, ImageDraw, ImageFont
import os
import wave
import struct
import numpy as np

def create_placeholder_image(name, width=800, height=600, bg_color='#4F46E5'):
    """Create a placeholder image with text."""
    img = Image.new('RGB', (width, height), bg_color)
    draw = ImageDraw.Draw(img)
    
    # Try to use system font, fallback to default
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", height//10)
    except:
        try:
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", height//10)
        except:
            font = ImageFont.load_default()
    
    # Draw text
    text = f"Placeholder {name}"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    x = (width - text_width) // 2
    y = (height - text_height) // 2
    draw.text((x, y), text, fill='white', font=font)
    
    return img

def create_placeholder_audio(name, duration=30, sample_rate=44100):
    """Create a placeholder WAV file with a simple tone."""
    filename = f"public/media/{name}.wav"
    
    # Create directory if it doesn't exist
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    
    # Generate a simple sine wave
    t = np.linspace(0, duration, int(sample_rate * duration))
    frequency = 440  # A4 note
    samples = np.sin(2 * np.pi * frequency * t)
    
    # Scale to 16-bit range and convert to integers
    samples = (samples * 32767).astype(np.int16)
    
    # Write WAV file
    with wave.open(filename, 'w') as wav_file:
        wav_file.setnchannels(1)  # Mono
        wav_file.setsampwidth(2)  # 2 bytes per sample
        wav_file.setframerate(sample_rate)
        wav_file.writeframes(samples.tobytes())

def main():
    # Create media directory if it doesn't exist
    os.makedirs("public/media", exist_ok=True)
    
    # Generate placeholder images
    images = [
        {"name": "placeholder-image.jpg", "width": 800, "height": 600, "color": "#4F46E5"},
        {"name": "placeholder-screenshot.jpg", "width": 1920, "height": 1080, "color": "#10B981"},
        {"name": "homepage-mockup.jpg", "width": 1920, "height": 1080, "color": "#8B5CF6"},
        {"name": "homepage-thumb.jpg", "width": 400, "height": 300, "color": "#F59E0B"}
    ]
    
    for img in images:
        image = create_placeholder_image(img["name"], img["width"], img["height"], img["color"])
        filepath = f"public/media/{img['name']}"
        image.save(filepath, "JPEG", quality=85)
        print(f"Created {filepath}")
    
    # Generate placeholder audio
    create_placeholder_audio("placeholder-audio", duration=30)
    print("Created public/media/placeholder-audio.wav")
    
    # Create placeholder video file (just a text file since we can't generate real video)
    with open("public/media/placeholder-video.mp4", "w") as f:
        f.write("This is a placeholder video file. In production, replace with real video content.")
    print("Created public/media/placeholder-video.mp4")
    
    # Create placeholder document
    with open("public/media/placeholder-doc.pdf", "w") as f:
        f.write("This is a placeholder PDF file. In production, replace with real document content.")
    print("Created public/media/placeholder-doc.pdf")

if __name__ == "__main__":
    main() 