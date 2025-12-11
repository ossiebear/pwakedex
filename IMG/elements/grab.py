# Grab type icons from Bulbapedia
# Written Fully by AI

import os
import requests
from bs4 import BeautifulSoup

types = [
    "Normal", "Fighting", "Flying", "Poison", "Ground",
    "Rock", "Bug", "Ghost", "Steel", "Fire", "Water",
    "Grass", "Electric", "Psychic", "Ice", "Dragon",
    "Dark", "Fairy", "Stellar"
]

BASE_URL = "https://archives.bulbagarden.net/wiki/File:{}_icon_SV.png"

# output directory
outdir = "type_icons"
os.makedirs(outdir, exist_ok=True)

headers = {"User-Agent": "Mozilla/5.0"}

for t in types:
    print(f"Fetching {t}…")
    url = BASE_URL.format(t)

    # get the file page
    page = requests.get(url, headers=headers)
    soup = BeautifulSoup(page.text, "html.parser")

    # find the actual image link (the full-size PNG)
    img = soup.find("a", {"class": "internal"})
    if not img:
        print(f"  ❌ Could not find image for {t}")
        continue

    href = img["href"]
    if href.startswith("//"):
        img_url = "https:" + href
    else:
        img_url = href

    print(f"  → {img_url}")

    # download image bytes
    data = requests.get(img_url, headers=headers).content
    filename = os.path.join(outdir, f"{t.lower()}.png")  # lowercase here

    # save
    with open(filename, "wb") as f:
        f.write(data)

    print(f"  ✔ Saved to {filename}")

print("\nAll done!")
