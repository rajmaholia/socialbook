
from django.core.exceptions import ValidationError
from PIL import Image  # To check image dimensions
from moviepy.editor import VideoFileClip
from io import BytesIO

def validate_image(file):
    try:
        with Image.open(file) as img:
            img.verify()  # This will raise an exception if the image is not valid
        return True
    except Image.UnidentifiedImageError:
        return False


def validate_video(file):
    try:
        with file, BytesIO(file.read()) as file_buffer:
            # Check video duration using moviepy
            print("working")
            clip = VideoFileClip(file_buffer, audio=False)
            print(clip)
            duration = clip.duration

            # Set your desired duration limit (in seconds)
            max_duration = 60

            if duration > max_duration:
                raise ValidationError('Video duration exceeds 60 seconds.')
            else:
                return {'is_valid': True}

    except Exception as e:
        return {'is_valid': False, 'error': str(e)}

def is_image(file_path):
    image_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp']
    # Check file extension
    if any(file_path.lower().endswith(ext) for ext in image_extensions):
        return True
    # Additional checks based on file content can be added here (e.g., using Pillow library)
    return False

def is_video(file_path):
    video_extensions = ['.mp4', '.avi', '.mkv', '.mov', '.wmv', '.flv', '.webm']
    # Check file extension
    if any(file_path.lower().endswith(ext) for ext in video_extensions):
        return True
    # Additional checks based on file content can be added here
    return False
