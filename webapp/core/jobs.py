"""تتبّع بسيط للمهام الخلفية (تحميل/رفع) في الذاكرة، يُستقصى عبر الواجهة بالـ polling."""
import threading
import time
import uuid

_JOBS = {}
_LOCK = threading.Lock()
_MAX_JOBS = 200


def new_job(kind, meta=None):
    job_id = uuid.uuid4().hex[:12]
    with _LOCK:
        if len(_JOBS) > _MAX_JOBS:
            oldest = sorted(_JOBS.items(), key=lambda kv: kv[1]["created"])[: len(_JOBS) - _MAX_JOBS]
            for k, _ in oldest:
                _JOBS.pop(k, None)
        _JOBS[job_id] = {
            "id": job_id, "kind": kind, "status": "running", "log": [],
            "progress": 0.0, "created": time.time(), "result": None, "meta": meta or {},
        }
    return job_id


def log(job_id, line):
    with _LOCK:
        if job_id in _JOBS:
            _JOBS[job_id]["log"].append(line)


def set_progress(job_id, fraction):
    with _LOCK:
        if job_id in _JOBS:
            _JOBS[job_id]["progress"] = max(0.0, min(1.0, fraction))


def finish(job_id, status="done", result=None):
    with _LOCK:
        if job_id in _JOBS:
            _JOBS[job_id]["status"] = status
            _JOBS[job_id]["progress"] = 1.0
            _JOBS[job_id]["result"] = result


def get(job_id):
    with _LOCK:
        j = _JOBS.get(job_id)
        if not j:
            return None
        return {**j, "log": list(j["log"])}
