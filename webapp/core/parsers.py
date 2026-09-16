"""استخراج بيانات الأنمي ويوتيوب، والبحث عن الأنمي بالاسم."""
import requests
from bs4 import BeautifulSoup


def get_anime_data(url):
    response = requests.get(url, timeout=20)
    soup = BeautifulSoup(response.text, "html.parser")

    title_el = soup.find("h1", class_="entry-title")
    if not title_el:
        raise ValueError("تعذر العثور على عنوان الأنمي في هذه الصفحة — تأكد أن الرابط صحيح.")
    title = title_el.text.strip()

    info_content = soup.find("div", class_="info-content")
    info = str(info_content) if info_content else ""

    image_element = soup.find("img", alt="صورة وغلاف الأنمي")
    image_url = image_element["src"].split("?")[0] if image_element else None

    soup_info = BeautifulSoup(info, "html.parser")
    data = {}
    for span in soup_info.find_all("span"):
        if not span.b:
            continue
        key = span.b.text.strip(":")
        value = span.b.next_sibling.strip() if span.b.next_sibling else ""
        if span.a:
            value = span.a.text
        elif span.time:
            value = span.time.text
        data[key] = value

    genxed = soup_info.find("div", class_="genxed")
    genres = [a.text for a in genxed.find_all("a")] if genxed else []
    data["صنف"] = ", ".join(genres)
    info_dict = data.copy()

    ep_list_el = soup.find("div", id="EpList1")
    ep_list = [ep.text.strip() for ep in ep_list_el.find_all("div")] if ep_list_el else []

    server_list_el = soup.find("div", id="ServerList1")
    servers = server_list_el.find_all("div", class_="serversss") if server_list_el else []

    all_data = []
    for index, server in enumerate(servers):
        li_elements = server.find_all("li")
        ep_entry = {
            "id": index,
            "Episode": ep_list[index] if index < len(ep_list) else str(index + 1),
            "Anime": title, "Image": image_url,
            **info_dict,
            "quality-data-FHD": [], "quality-data-HD": [], "quality-data-SD": [],
        }
        for li in li_elements:
            quality = li.get("quality-data")
            item = {"class": li.get("class")[0] if li.get("class") else None,
                     "data": li.get("data"), "source": li.get("source"), "type": li.get("type")}
            if quality in ("FHD", "HD", "SD"):
                ep_entry[f"quality-data-{quality}"].append(item)
        all_data.append(ep_entry)

    return {"Title": title, "Image": image_url, "Info": {"dict": info_dict}, "Episodes": all_data}


def search_anime(query, site_base):
    resp = requests.get(f"{site_base.rstrip('/')}/", params={"s": query}, timeout=20)
    soup = BeautifulSoup(resp.text, "html.parser")

    anchors = (soup.select(".listupd .bsx a") or soup.select(".result-item a") or
               soup.select("article a") or [])
    domain = site_base.split("//")[-1]
    results, seen = [], set()
    for a in anchors:
        href = a.get("href")
        if not href or href in seen or domain not in href:
            continue
        title = a.get("title") or a.get_text(strip=True)
        img = a.find("img")
        if img and not title:
            title = img.get("alt", "")
        if not title:
            continue
        seen.add(href)
        results.append({"title": title.strip(), "url": href,
                         "image": (img.get("src") if img else None)})
        if len(results) >= 12:
            break
    return results


def get_youtube_data(url, cookies_file):
    import yt_dlp
    ydl_opts = {"quiet": True, "extract_flat": True, "no_warnings": True, "cookiefile": cookies_file}
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=False)
        entries = [info] if "entries" not in info else info["entries"]
        episodes = [{
            "id": i, "Episode": i + 1,
            "Title": e.get("title", "Unknown Title"),
            "url": e.get("url") or e.get("webpage_url") or url,
            "Thumbnail": e.get("thumbnail", ""),
            "Duration": e.get("duration_string", "N/A"),
            "Uploader": e.get("uploader", "N/A"),
        } for i, e in enumerate(entries)]
        return {"Info": {"title": info.get("title", "YouTube Content"),
                          "uploader": info.get("uploader", "N/A")},
                "Episodes": episodes}
