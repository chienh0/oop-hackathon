import requests
import time
from api_keys import X_API_KEY

# Upload 
base_url = "https://api.deepscribe.ai/partners/v1/note"

payload = { "format": "m4a" }
upload_headers = {
    "accept": "application/json",
    "content-type": "application/json",
    "X-API-KEY": X_API_KEY
}

response = requests.post(base_url, json=payload, headers=upload_headers).json()
noteId = response["noteId"]
upload_url = response["audioUploadUrl"]
file_path = "audio_files/ems_youtube_clip_1.m4a"
def upload_audio_file(url, file_path):
    """
    Uploads an audio file to the specified URL using a PUT request.

    :param url: The URL to which the file will be uploaded
    :param file_path: The path to the audio file to upload
    :return: The response from the server
    """
    try:
        with open(file_path, 'rb') as file:
            response = requests.put(url, data=file)
            response.raise_for_status()  # Raise an exception for HTTP errors
            return response
    except requests.exceptions.RequestException as e:
        print(f"An error occurred: {e}")
        return None
    
response = upload_audio_file(upload_url, file_path)
print(response.text)
print(f"noteID: {noteId}")
print("--- Waiting 120 seconds ---")
time.sleep(120)
# GET the data
get_url = f"https://api.deepscribe.ai/partners/v1/note/{noteId}"

get_headers = {
    "accept": "application/json",
    "X-API-KEY": X_API_KEY
}

response = requests.get(get_url, headers=get_headers)

print(response.text)
