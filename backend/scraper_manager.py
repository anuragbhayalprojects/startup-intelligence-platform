import subprocess
import os

from pathlib import Path

BASE_DIR = Path.home() / "Projects/startup-intelligence"

# =====================================
# RUN COMPLETE PIPELINE
# =====================================

def run_pipeline(

    source,
    geography,
    sector,
    limit
):

    print("\n========================")
    print("STARTING PIPELINE")
    print("========================")

    print(f"Source: {source}")
    print(f"Geography: {geography}")
    print(f"Sector: {sector}")
    print(f"Limit: {limit}")

    # =====================================
    # CLEAR OLD CSV FILES
    # =====================================

    csv_folder = BASE_DIR / "csv"

    for file in csv_folder.glob("*.csv"):

        os.remove(file)

    print("\nOld CSV files cleared")

    # =====================================
    # SELECT SCRAPER
    # =====================================

    if source == "Entrackr":

        scraper_path = (

            BASE_DIR
            / "crawlers/entrackr/entrackr_scraper.py"
        )

    elif source == "Y Combinator":

        scraper_path = (

            BASE_DIR
            / "crawlers/yc/yc_scraper.py"
        )

    else:

        raise Exception(
            "Invalid source selected"
        )

    # =====================================
    # RUN SCRAPER
    # =====================================

    print("\nRunning scraper...")

    subprocess.run([

        "python",

        str(scraper_path),

        geography,

        sector,

        str(limit)

    ])

    print("\nScraping completed")

    # =====================================
    # RUN AI ANALYSIS
    # =====================================

    analysis_script = (

        BASE_DIR
        / "backend/analyze_csv.py"
    )

    print("\nRunning AI analysis...")

    subprocess.run([

        "python",

        str(analysis_script)

    ])

    print("\nAI analysis completed")

    print("\n========================")
    print("PIPELINE COMPLETE")
    print("========================")