"""فهرس الملفات المُحمَّلة (أنمي + يوتيوب) — يُستخدم في صفحة "الملفات الجاهزة للرفع"."""
import json
import os
import threading
import time
import uuid

_LOCK = threading.Lock()


def _library_path(base_dir):
    return os.path.join(base_dir, "instance", "library.json")


def _read(base_dir):
    path = _library_path(base_dir)
    if not os.path.exists(path):
        return []
    try:
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, OSError):
        return []


def _write(base_dir, items):
    path = _library_path(base_dir)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(items, f, ensure_ascii=False, indent=2)


def add_entry(base_dir, kind, title, subtitle, file_path, quality=None):
    with _LOCK:
        items = _read(base_dir)
        entry = {
            "id": uuid.uuid4().hex[:12], "kind": kind, "title": title, "subtitle": subtitle,
            "path": file_path, "quality": quality,
            "size": os.path.getsize(file_path) if os.path.exists(file_path) else 0,
            "created": time.time(), "uploaded": False, "fb_video_id": None,
        }
        items.append(entry)
        _write(base_dir, items)
        return entry


def list_entries(base_dir):
    with _LOCK:
        items = _read(base_dir)
    items = [it for it in items if os.path.exists(it["path"])]
    items.sort(key=lambda it: it["created"], reverse=True)
    return items


def get_entry(base_dir, entry_id):
    for it in _read(base_dir):
        if it["id"] == entry_id:
            return it
    return None


def mark_uploaded(base_dir, entry_id, fb_video_id):
    with _LOCK:
        items = _read(base_dir)
        for it in items:
            if it["id"] == entry_id:
                it["uploaded"] = True
                it["fb_video_id"] = fb_video_id
        _write(base_dir, items)


def remove_entry(base_dir, entry_id):
    with _LOCK:
        items = _read(base_dir)
        remaining = [it for it in items if it["id"] != entry_id]
        _write(base_dir, remaining)
