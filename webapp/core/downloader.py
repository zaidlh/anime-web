"""تحميل الفيديوهات من مصادر متعددة (Google Drive / Mega / 4shared / OK.ru)."""
import os
import subprocess


class VideoDownloader:
    def __init__(self, destination_folder="./videos"):
        self.destination_folder = destination_folder
        os.makedirs(self.destination_folder, exist_ok=True)
        self.dl_functions = {
            "drive": self.dl_drive, "mega": self.dl_mega,
            "4shared": self.dl_4shared, "ok": self.dl_ok,
        }
        self.priority_order = ["drive", "mega", "4shared", "ok"]

    def dl_drive(self, file_id, filename=None):
        import gdown
        url = f"https://drive.google.com/uc?id={file_id}"
        output = os.path.join(self.destination_folder, filename or f"{file_id}.mp4")
        try:
            gdown.download(url, output, quiet=False)
            return output
        except Exception as e:
            print(f"Erreur Drive: {file_id} - {e}")
            return None

    def dl_mega(self, video_id, filename=None):
        try:
            link = f"https://mega.nz/file/{video_id}"
            cmd = ["megatools", "dl", "--path", self.destination_folder, link]
            result = subprocess.run(cmd, capture_output=True, text=True)
            if result.returncode != 0:
                print(f"Erreur megatools: {result.stderr}")
                return None
            for file in os.listdir(self.destination_folder):
                if file.endswith(".mp4"):
                    path = os.path.join(self.destination_folder, file)
                    if filename:
                        new_path = os.path.join(self.destination_folder, filename)
                        os.rename(path, new_path)
                        return new_path
                    return path
            return None
        except Exception as e:
            print(f"Erreur Mega: {video_id} - {e}")
            return None

    def dl_4shared(self, video_id, filename=None):
        import youtube_dl
        video_url = f"https://www.4shared.com/video/{video_id}"
        file_path = os.path.join(self.destination_folder, filename or f"{video_id}.mp4")
        try:
            with youtube_dl.YoutubeDL({"outtmpl": file_path, "format": "best"}) as ydl:
                ydl.download([video_url])
            return file_path
        except Exception as e:
            print(f"Erreur 4shared: {video_id} - {e}")
            return None

    def dl_ok(self, video_id, filename=None):
        import youtube_dl
        video_url = f"https://ok.ru/video/{video_id}"
        file_path = os.path.join(self.destination_folder, filename or f"{video_id}.mp4")
        try:
            with youtube_dl.YoutubeDL({"outtmpl": file_path, "format": "best"}) as ydl:
                ydl.download([video_url])
            return file_path
        except Exception as e:
            print(f"Erreur OK: {video_id} - {e}")
            return None

    def download(self, data_anime, filename=None):
        for priority in self.priority_order:
            for anime in data_anime:
                if anime["class"] == priority:
                    try:
                        file_path = self.dl_functions[priority](anime["data"], filename=filename)
                        if file_path is not None:
                            return file_path
                    except Exception as e:
                        print(f"Erreur téléchargement: {anime['data']} ({priority}) - {e}")
        return None
