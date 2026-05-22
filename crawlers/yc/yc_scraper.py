from playwright.sync_api import sync_playwright

import pandas as pd

from pathlib import Path

import sys

# =====================================
# INPUT PARAMETERS
# =====================================

geography = sys.argv[1]

sector = sys.argv[2]

limit = int(sys.argv[3])

BASE_DIR = Path.home() / "Projects/startup-intelligence"

output_path = (
    BASE_DIR
    / "csv/yc_startups.csv"
)

startups = []

with sync_playwright() as p:

    browser = p.chromium.launch(
        headless=False
    )

    page = browser.new_page()

    print("Opening YC page...")

    page.goto(
        "https://www.ycombinator.com/companies",
        timeout=60000
    )

    page.wait_for_timeout(5000)

    # Scroll
    for _ in range(5):

        page.mouse.wheel(0, 5000)

        page.wait_for_timeout(2000)

    cards = page.locator("a")

    count = cards.count()

    print(f"Found {count} elements")

    for i in range(count):

        try:

            text = cards.nth(i).inner_text().strip()

            href = cards.nth(i).get_attribute("href")

            if (
                text
                and len(text) > 20
                and "/companies/" in href
            ):

                lower_text = text.lower()

                # =====================================
                # SECTOR FILTER
                # =====================================

                if sector.lower() not in lower_text:

                    continue

                startups.append({

                    "startup_name":
                        text.split("\n")[0][:100],

                    "description":
                        text,

                    "source":
                        "Y Combinator",

                    "startup_url":
                        f"https://www.ycombinator.com{href}"
                })

                if len(startups) >= limit:

                    break

        except:

            pass

    browser.close()

df = pd.DataFrame(startups)

df = df.drop_duplicates(
    subset=["startup_name"]
)

df.to_csv(
    output_path,
    index=False
)

print(f"\nSaved {len(df)} startups")