#!/usr/bin/env python3
"""
Create placeholder assets for Airnote app
"""
try:
    from PIL import Image, ImageDraw, ImageFont

    # Color palette
    PRIMARY = (134, 202, 195)  # #86CAC3
    BACKGROUND = (251, 250, 251)  # #FBFAFB

    # Create icon (1024x1024)
    icon = Image.new('RGB', (1024, 1024), PRIMARY)
    draw = ImageDraw.Draw(icon)
    # Draw a simple paper plane
    draw.polygon([(512, 300), (300, 512), (512, 450), (512, 724), (724, 512)], fill=(255, 255, 255))
    icon.save('assets/icon.png')
    print("✓ Created icon.png")

    # Create adaptive icon (1024x1024)
    adaptive = Image.new('RGB', (1024, 1024), PRIMARY)
    draw = ImageDraw.Draw(adaptive)
    draw.polygon([(512, 300), (300, 512), (512, 450), (512, 724), (724, 512)], fill=(255, 255, 255))
    adaptive.save('assets/adaptive-icon.png')
    print("✓ Created adaptive-icon.png")

    # Create splash (1284x2778)
    splash = Image.new('RGB', (1284, 2778), BACKGROUND)
    draw = ImageDraw.Draw(splash)
    # Draw centered paper plane
    offset_x = (1284 - 512) // 2
    offset_y = (2778 - 512) // 2
    draw.polygon([
        (offset_x + 256, offset_y + 100),
        (offset_x + 100, offset_y + 256),
        (offset_x + 256, offset_y + 200),
        (offset_x + 256, offset_y + 412),
        (offset_x + 412, offset_y + 256)
    ], fill=PRIMARY)
    splash.save('assets/splash.png')
    print("✓ Created splash.png")

    # Create favicon (48x48)
    favicon = Image.new('RGB', (48, 48), PRIMARY)
    draw = ImageDraw.Draw(favicon)
    draw.polygon([(24, 12), (12, 24), (24, 20), (24, 36), (36, 24)], fill=(255, 255, 255))
    favicon.save('assets/favicon.png')
    print("✓ Created favicon.png")

    print("\n✅ All assets created successfully!")

except ImportError:
    print("⚠️  Pillow not installed. Installing...")
    import subprocess
    subprocess.run(['pip3', 'install', 'Pillow'], check=True)
    print("✓ Pillow installed. Please run this script again.")
