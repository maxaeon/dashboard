"""Fetches NPR RSS feeds and writes data/npr.json. Run by the GitHub Action once a day."""
import json, re, html, urllib.request, datetime
from xml.etree import ElementTree as ET

FEEDS = [("1001", "Top stories"), ("1007", "Science"), ("1128", "Health")]

def clean(s):
    s = html.unescape(re.sub(r"<[^>]+>", "", s or ""))
    return re.sub(r"\s+", " ", s).strip()

out = {"updated": datetime.datetime.now(datetime.timezone.utc).isoformat(), "feeds": []}
for fid, name in FEEDS:
    url = f"https://feeds.npr.org/{fid}/rss.xml"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "morning-dashboard"})
        xml = urllib.request.urlopen(req, timeout=30).read()
        root = ET.fromstring(xml)
        items = []
        for it in root.iter("item"):
            items.append({
                "title": clean(it.findtext("title")),
                "link": (it.findtext("link") or "").strip(),
                "description": clean(it.findtext("description"))[:180],
            })
            if len(items) >= 8:
                break
        out["feeds"].append({"id": fid, "name": name, "items": items})
    except Exception as e:
        out["feeds"].append({"id": fid, "name": name, "items": [], "error": str(e)})

with open("data/npr.json", "w") as f:
    json.dump(out, f, indent=2)
print("wrote data/npr.json")
