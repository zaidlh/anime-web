"""الرفع إلى صفحة فيسبوك عبر Graph API (رفع مُجزّأ/chunked)."""
import os
import hmac
import hashlib
import requests


def generate_appsecret_proof(access_token, app_secret):
    return hmac.new(app_secret.encode(), access_token.encode(), hashlib.sha256).hexdigest()


def validate_video_file(file_path):
    import ffmpeg
    try:
        probe = ffmpeg.probe(file_path)
        video_stream = next((s for s in probe["streams"] if s["codec_type"] == "video"), None)
        if not video_stream:
            return False, "الملف لا يحتوي على تيار فيديو"
        return True, "الفيديو متوافق"
    except Exception as e:
        return False, f"خطأ فحص الملف: {e}"


def fb_upload_video(file_path, title, description, page_id, access_token, app_secret, on_progress=None):
    """on_progress(fraction: float 0..1) يُستدعى دورياً أثناء الرفع."""
    if not all([page_id, access_token, app_secret]):
        raise Exception("بيانات اعتماد فيسبوك غير مضبوطة. أضفها من صفحة الإعدادات.")

    appsecret_proof = generate_appsecret_proof(access_token, app_secret)
    file_size = os.path.getsize(file_path)

    start_res = requests.post(
        f"https://graph-video.facebook.com/v20.0/{page_id}/videos",
        params={"access_token": access_token, "appsecret_proof": appsecret_proof,
                "upload_phase": "start", "file_size": file_size}, timeout=30)
    if not start_res.ok:
        raise Exception(start_res.text)
    session_id = start_res.json()["upload_session_id"]

    start_offset, chunk_size = 0, 6 * 1024 * 1024
    with open(file_path, "rb") as f:
        while start_offset < file_size:
            chunk = f.read(chunk_size)
            chunk_res = requests.post(
                f"https://graph-video.facebook.com/v20.0/{page_id}/videos",
                params={"access_token": access_token, "appsecret_proof": appsecret_proof,
                        "upload_phase": "transfer", "upload_session_id": session_id,
                        "start_offset": start_offset},
                files={"video_file_chunk": chunk}, timeout=60)
            if not chunk_res.ok:
                raise Exception(chunk_res.text)
            start_offset = int(chunk_res.json().get("start_offset", start_offset + len(chunk)))
            if on_progress:
                on_progress(start_offset / file_size)

    finish_res = requests.post(
        f"https://graph-video.facebook.com/v20.0/{page_id}/videos",
        params={"access_token": access_token, "appsecret_proof": appsecret_proof,
                "upload_phase": "finish", "upload_session_id": session_id,
                "title": title, "description": description}, timeout=30)
    if not finish_res.ok:
        raise Exception(finish_res.text)
    return finish_res.json()["id"]
