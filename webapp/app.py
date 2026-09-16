"""Animax Suite — موقع ويب كامل لتحميل الأنمي واليوتيوب ورفعها إلى فيسبوك.
تشغيل التطوير: flask --app app run --debug
تشغيل الإنتاج : gunicorn -w 2 -b 0.0.0.0:8000 app:app
"""
import os
import re
import threading
from functools import wraps

from flask import (Flask, render_template, request, redirect, url_for,
                    session, jsonify, send_file, abort)

import config
from core.downloader import VideoDownloader
from core.parsers import get_anime_data, get_youtube_data, search_anime
from core.facebook import fb_upload_video, validate_video_file
from core import jobs, library

app = Flask(__name__)
app.secret_key = config.SECRET_KEY

os.makedirs(config.DOWNLOAD_DIR, exist_ok=True)
os.makedirs(config.YOUTUBE_DOWNLOAD_DIR, exist_ok=True)

QUALITY_MAP = {
    "SD": "bestvideo[height<=480]+bestaudio/best[height<=480]",
    "HD": "bestvideo[height<=720]+bestaudio/best[height<=720]",
    "FHD": "bestvideo[height<=1080]+bestaudio/best[height<=1080]",
}


def login_required(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        if not session.get("authed"):
            return redirect(url_for("login"))
        return view(*args, **kwargs)
    return wrapped


def safe_filename(name):
    name = re.sub(r"[\\/:*?\"<>|]+", "_", str(name)).strip()
    return name[:120] or "file"


# ============================================================
# 🔐 تسجيل الدخول
# ============================================================
@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        cfg = config.load_config()
        if request.form.get("password") == cfg["SITE_PASSWORD"]:
            session["authed"] = True
            return redirect(url_for("index"))
        return render_template("login.html", error="كلمة المرور غير صحيحة.")
    return render_template("login.html", error=None)


@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("login"))


# ============================================================
# 🏠 الصفحات
# ============================================================
@app.route("/")
@login_required
def index():
    entries = library.list_entries(str(config.BASE_DIR))
    total = len(entries)
    uploaded = sum(1 for e in entries if e["uploaded"])
    size_mb = round(sum(e["size"] for e in entries) / 1024 / 1024, 1)
    cfg = config.load_config()
    fb_configured = all([cfg["FB_PAGE_ID"], cfg["FB_ACCESS_TOKEN"], cfg["FB_APP_SECRET"]])
    stats = {"total": total, "uploaded": uploaded, "pending": total - uploaded, "size_mb": size_mb}
    return render_template("index.html", active="home", stats=stats, fb_configured=fb_configured)


@app.route("/anime")
@login_required
def anime_page():
    return render_template("anime.html", active="anime")


@app.route("/youtube")
@login_required
def youtube_page():
    return render_template("youtube.html", active="youtube")


@app.route("/downloads")
@login_required
def downloads_page():
    return render_template("downloads.html", active="downloads")


@app.route("/settings", methods=["GET", "POST"])
@login_required
def settings_page():
    saved = False
    if request.method == "POST":
        updates = {
            "FB_PAGE_ID": request.form.get("FB_PAGE_ID", "").strip(),
            "FB_ACCESS_TOKEN": request.form.get("FB_ACCESS_TOKEN", "").strip(),
            "FB_APP_SECRET": request.form.get("FB_APP_SECRET", "").strip(),
            "ANIME_SITE": request.form.get("ANIME_SITE", "").strip() or config.DEFAULTS["ANIME_SITE"],
        }
        new_password = request.form.get("SITE_PASSWORD", "").strip()
        if new_password:
            updates["SITE_PASSWORD"] = new_password
        config.save_config(updates)
        saved = True
    cfg = config.load_config()
    return render_template("settings.html", active="settings", cfg=cfg, saved=saved)


# ============================================================
# 🔌 API — أنمي
# ============================================================
@app.route("/api/anime/search", methods=["POST"])
@login_required
def api_anime_search():
    query = (request.json or {}).get("query", "").strip()
    if not query:
        return jsonify({"error": "الرجاء إدخال اسم للبحث"}), 400
    cfg = config.load_config()
    try:
        results = search_anime(query, cfg["ANIME_SITE"])
    except Exception as e:
        return jsonify({"error": str(e)}), 502
    return jsonify({"results": results})


@app.route("/api/anime/fetch", methods=["POST"])
@login_required
def api_anime_fetch():
    url = (request.json or {}).get("url", "").strip()
    if not url:
        return jsonify({"error": "الرابط مطلوب"}), 400
    try:
        data = get_anime_data(url)
    except Exception as e:
        return jsonify({"error": str(e)}), 502
    return jsonify({"data": data})


@app.route("/api/anime/download", methods=["POST"])
@login_required
def api_anime_download():
    body = request.json or {}
    anime_title = body.get("anime_title", "Anime")
    quality = body.get("quality", "HD")
    episodes = body.get("episodes", [])
    if not episodes:
        return jsonify({"error": "لم يتم اختيار أي حلقة"}), 400

    job_id = jobs.new_job("anime_download")

    def worker():
        downloader = VideoDownloader(destination_folder=config.DOWNLOAD_DIR)
        base_dir = str(config.BASE_DIR)
        for i, ep in enumerate(episodes):
            ep_label = ep.get("episode", str(i + 1))
            jobs.log(job_id, f"🔄 الحلقة {ep_label} ...")
            jobs.set_progress(job_id, i / max(1, len(episodes)))
            quality_data = ep.get("quality_data") or []
            if not quality_data:
                jobs.log(job_id, f"⚠️ لا توجد بيانات لهذه الجودة للحلقة {ep_label}")
                continue
            filename = safe_filename(f"{anime_title}_{ep_label}") + ".mp4"
            try:
                result = downloader.download(quality_data, filename=filename)
            except Exception as e:
                result = None
                jobs.log(job_id, f"❌ خطأ في الحلقة {ep_label}: {e}")
            if result:
                jobs.log(job_id, f"✅ نجح تحميل الحلقة {ep_label}")
                library.add_entry(base_dir, "anime", anime_title, f"الحلقة {ep_label}", result, quality)
            else:
                jobs.log(job_id, f"❌ فشل تحميل الحلقة {ep_label}")
        jobs.log(job_id, "💯 اكتمل التحميل!")
        jobs.finish(job_id, "done")

    threading.Thread(target=worker, daemon=True).start()
    return jsonify({"job_id": job_id})


# ============================================================
# 🔌 API — يوتيوب
# ============================================================
@app.route("/api/youtube/fetch", methods=["POST"])
@login_required
def api_youtube_fetch():
    url = (request.json or {}).get("url", "").strip()
    if not url:
        return jsonify({"error": "الرابط مطلوب"}), 400
    try:
        data = get_youtube_data(url, config.YOUTUBE_COOKIES_FILE)
    except Exception as e:
        return jsonify({"error": str(e)}), 502
    return jsonify({"data": data})


@app.route("/api/youtube/download", methods=["POST"])
@login_required
def api_youtube_download():
    import yt_dlp
    body = request.json or {}
    quality = body.get("quality", "HD")
    videos = body.get("videos", [])
    if not videos:
        return jsonify({"error": "لم يتم اختيار أي فيديو"}), 400

    job_id = jobs.new_job("youtube_download")

    def worker():
        base_dir = str(config.BASE_DIR)
        for i, v in enumerate(videos):
            title = v.get("Title", "video")
            jobs.log(job_id, f"🔄 {title[:40]} ...")
            jobs.set_progress(job_id, i / max(1, len(videos)))
            try:
                outtmpl = os.path.join(config.YOUTUBE_DOWNLOAD_DIR, safe_filename(f"{v.get('id')}_{title}") + ".%(ext)s")
                ydl_opts = {"format": QUALITY_MAP.get(quality, "best"), "outtmpl": outtmpl,
                            "quiet": True, "no_warnings": True, "cookiefile": config.YOUTUBE_COOKIES_FILE}
                with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                    info = ydl.extract_info(v.get("url"), download=True)
                    path = ydl.prepare_filename(info)
                jobs.log(job_id, f"✅ تم تحميل: {title[:40]}")
                library.add_entry(base_dir, "youtube", title, v.get("Uploader", ""), path, quality)
            except Exception as e:
                jobs.log(job_id, f"❌ فشل تحميل {title[:40]}: {e}")
        jobs.log(job_id, "💯 اكتمل التحميل!")
        jobs.finish(job_id, "done")

    threading.Thread(target=worker, daemon=True).start()
    return jsonify({"job_id": job_id})


# ============================================================
# 🔌 API — الرفع إلى فيسبوك
# ============================================================
@app.route("/api/upload/facebook", methods=["POST"])
@login_required
def api_upload_facebook():
    entry_ids = (request.json or {}).get("entry_ids", [])
    if not entry_ids:
        return jsonify({"error": "لم يتم اختيار أي ملف"}), 400

    base_dir = str(config.BASE_DIR)
    cfg = config.load_config()
    job_id = jobs.new_job("facebook_upload")

    def worker():
        ok_count = 0
        for entry_id in entry_ids:
            entry = library.get_entry(base_dir, entry_id)
            if not entry or not os.path.exists(entry["path"]):
                jobs.log(job_id, f"❌ ملف غير موجود ({entry_id})")
                continue
            jobs.log(job_id, f"🔄 جاري رفع: {entry['title']} - {entry['subtitle']}")
            valid, msg = validate_video_file(entry["path"])
            if not valid:
                jobs.log(job_id, f"❌ {entry['title']}: {msg}")
                continue

            def on_progress(frac, _entry=entry):
                jobs.set_progress(job_id, frac)

            try:
                vid = fb_upload_video(
                    entry["path"], f"{entry['title']} - {entry['subtitle']}", entry["subtitle"],
                    cfg["FB_PAGE_ID"], cfg["FB_ACCESS_TOKEN"], cfg["FB_APP_SECRET"],
                    on_progress=on_progress,
                )
                library.mark_uploaded(base_dir, entry_id, vid)
                jobs.log(job_id, f"✅ تم رفع {entry['title']} (ID: {vid})")
                ok_count += 1
            except Exception as e:
                jobs.log(job_id, f"❌ فشل رفع {entry['title']}: {e}")
        jobs.log(job_id, f"💯 انتهى الرفع — نجح {ok_count} من {len(entry_ids)}")
        jobs.finish(job_id, "done")

    threading.Thread(target=worker, daemon=True).start()
    return jsonify({"job_id": job_id})


# ============================================================
# 🔌 API — الوظائف الخلفية والملفات
# ============================================================
@app.route("/api/job/<job_id>")
@login_required
def api_job(job_id):
    job = jobs.get(job_id)
    if not job:
        return jsonify({"error": "job not found"}), 404
    return jsonify(job)


@app.route("/api/downloads/list")
@login_required
def api_downloads_list():
    base_dir = str(config.BASE_DIR)
    return jsonify({"entries": library.list_entries(base_dir)})


@app.route("/api/downloads/<entry_id>/delete", methods=["POST"])
@login_required
def api_downloads_delete(entry_id):
    base_dir = str(config.BASE_DIR)
    entry = library.get_entry(base_dir, entry_id)
    if entry and os.path.exists(entry["path"]):
        try:
            os.remove(entry["path"])
        except OSError:
            pass
    library.remove_entry(base_dir, entry_id)
    return jsonify({"ok": True})


@app.route("/downloads/file/<entry_id>")
@login_required
def downloads_file(entry_id):
    base_dir = str(config.BASE_DIR)
    entry = library.get_entry(base_dir, entry_id)
    if not entry or not os.path.exists(entry["path"]):
        abort(404)
    return send_file(entry["path"], as_attachment=True)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5000)), debug=os.getenv("FLASK_DEBUG", "0") == "1")
