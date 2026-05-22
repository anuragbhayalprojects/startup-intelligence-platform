import requests
from bs4 import BeautifulSoup
import pandas as pd

from pathlib import Path
import sys

# =====================================
# INPUTS
# =====================================

geography = sys.argv[1]

sector = sys.argv[2]

limit = int(sys.argv[3])

# =====================================
# PATHS
# =====================================

BASE_DIR = Path.home() / "Projects/startup-intelligence"

output_path = (

    BASE_DIR
    / "csv/entrackr_startups.csv"
)

# =====================================
# SEARCH URL
# =====================================

search_url = (
    f"https://entrackr.com/?s={sector}"
)

print(f"\nOpening: {search_url}")

headers = {

    "User-Agent":
        "Mozilla/5.0"
}

response = requests.get(

    search_url,

    headers=headers
)

print(f"Status Code: {response.status_code}")

# =====================================
# PARSE HTML
# =====================================

soup = BeautifulSoup(

    response.text,

    "html.parser"
)

articles = soup.find_all("article")

startups = []

# =====================================
# EXTRACT ARTICLES
# =====================================

for article in articles:

    try:

        title_tag = article.find("h2")

        link_tag = article.find("a")

        if not title_tag or not link_tag:

            continue

        title = title_tag.get_text(
            strip=True
        )

        link = link_tag.get("href")

        description = article.get_text(
            " ",
            strip=True
        )

        startup_record = {

            "startup_name":
                title[:100],

            "description":
                description[:1000],

            "source":
                "Entrackr",

            "startup_url":
                link
        }

        startups.append(
            startup_record
        )

        print(f"Added: {title}")

        if len(startups) >= limit:

            break

    except Exception as e:

        print(e)

# =====================================
# SAVE CSV
# =====================================

df = pd.DataFrame(startups)

df = df.drop_duplicates(
    subset=["startup_name"]
)

df.to_csv(

    output_path,

    index=False
)

print("\n==========================")
print(f"Saved {len(df)} startups")
print(f"Output: {output_path}")
print("==========================")