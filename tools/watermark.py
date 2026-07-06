import os
from PIL import Image

def apply_watermark(input_folder, watermark_path):
    print("Loading watermark:", watermark_path)
    watermark = Image.open(watermark_path).convert("RGBA")
    
    # We'll make the watermark 20% of the image width
    for filename in os.listdir(input_folder):
        if not filename.endswith(".webp"):
            continue
            
        filepath = os.path.join(input_folder, filename)
        try:
            base_image = Image.open(filepath).convert("RGBA")
            
            # Calculate new size for watermark
            w_width, w_height = watermark.size
            b_width, b_height = base_image.size
            
            target_w_width = int(b_width * 0.25)
            target_w_height = int(w_height * (target_w_width / w_width))
            
            # Resize watermark
            resized_watermark = watermark.resize((target_w_width, target_w_height), Image.Resampling.LANCZOS)
            
            # Change opacity (optional, but requested "as a watermark")
            alpha = resized_watermark.split()[3]
            alpha = alpha.point(lambda p: p * 0.5) # 50% opacity
            resized_watermark.putalpha(alpha)
            
            # Position at bottom right
            position = (b_width - target_w_width - 20, b_height - target_w_height - 20)
            
            # Create a transparent layer the size of base_image and paste watermark on it
            transparent = Image.new('RGBA', base_image.size, (0,0,0,0))
            transparent.paste(resized_watermark, position, mask=resized_watermark)
            
            # Composite
            watermarked_image = Image.alpha_composite(base_image, transparent)
            watermarked_image = watermarked_image.convert("RGB") # Convert back to RGB for webp
            
            watermarked_image.save(filepath, "WEBP")
            print(f"Watermarked: {filename}")
        except Exception as e:
            print(f"Failed to watermark {filename}: {e}")

if __name__ == "__main__":
    apply_watermark(
        input_folder="assets/images/products/asadental",
        watermark_path="C:/Users/garbarking/Downloads/asadental_logo.png"
    )
