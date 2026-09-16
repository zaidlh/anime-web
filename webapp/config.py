"""إعدادات التطبيق. القيم الافتراضية تُقرأ من متغيرات البيئة (.env)،
ويمكن تعديلها لاحقاً من صفحة الإعدادات داخل الموقع (تُحفظ في instance/config.json)."""
import os
import json
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent
INSTANCE_DIR = BASE_DIR / "instance"
INSTANCE_DIR.mkdir(exist_ok=True)
CONFIG_FILE = INSTANCE_DIR / "config.json"

DEFAULTS = {
    "FB_PAGE_ID": os.getenv("FB_PAGE_ID", ""),
    "FB_ACCESS_TOKEN": os.getenv("FB_ACCESS_TOKEN", ""),
    "FB_APP_SECRET": os.getenv("FB_APP_SECRET", ""),
    "ANIME_SITE": os.getenv("ANIME_SITE", "https://www.animedar.xyz"),
    "SITE_PASSWORD": os.getenv("SITE_PASSWORD", "changeme"),
}


def load_config():
    cfg = dict(DEFAULTS)
    if CONFIG_FILE.exists():
        try:
            cfg.update(json.loads(CONFIG_FILE.read_text(encoding="utf-8")))
        except Exception:
            pass
    return cfg


def save_config(updates: dict):
    cfg = load_config()
    cfg.update({k: v for k, v in updates.items() if v is not None})
    CONFIG_FILE.write_text(json.dumps(cfg, ensure_ascii=False, indent=2), encoding="utf-8")
    return cfg


SECRET_KEY = os.getenv("FLASK_SECRET_KEY", "please-change-this-secret-key")
DOWNLOAD_DIR = str(BASE_DIR / "downloads")
YOUTUBE_DOWNLOAD_DIR = str(BASE_DIR / "youtube_downloads")
YOUTUBE_COOKIES_FILE = str(BASE_DIR / "youtube_cookies.txt")
MAX_CONTENT_LENGTH = None  # no upload limit needed; this app downloads, it doesn't accept uploads
