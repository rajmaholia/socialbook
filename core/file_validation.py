
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
