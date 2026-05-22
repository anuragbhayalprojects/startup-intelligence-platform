import pandas as pd
import ollama
import json

from pathlib import Path

from supabase_client import supabase

BASE_DIR = Path.home() / "Projects/startup-intelligence"

# =====================================
# PATHS
# =====================================

csv_folder = BASE_DIR / "csv"

prompt_path = (
    BASE_DIR
    / "prompts/startup_analysis.txt"
)

output_path = (
    BASE_DIR
    / "data/analysis_output.csv"
)

# =====================================
# LOAD ALL CSV FILES
# =====================================

csv_files = csv_folder.glob("*.csv")

all_dfs = []

for file in csv_files:

    try:

        temp_df = pd.read_csv(file)

        all_dfs.append(temp_df)

        print(f"Loaded: {file.name}")

    except Exception as e:

        print(e)

# =====================================
# COMBINE DATA
# =====================================

df = pd.concat(
    all_dfs,
    ignore_index=True
)

# =====================================
# REMOVE DUPLICATES
# =====================================

df = df.drop_duplicates(
    subset=["startup_name"]
)

print(f"\nTotal Startups: {len(df)}")

# =====================================
# LOAD PROMPT
# =====================================

with open(prompt_path, "r") as f:

    prompt_template = f.read()

results = []

# =====================================
# PROCESS STARTUPS
# =====================================

for _, row in df.iterrows():

    startup_name = row.get(
        "startup_name",
        ""
    )

    description = row.get(
        "description",
        ""
    )

    source = row.get(
        "source",
        ""
    )

    startup_url = row.get(
        "startup_url",
        ""
    )

    startup_data = f"""
    Startup Name:
    {startup_name}

    Description:
    {description}
    """

    final_prompt = prompt_template.replace(
        "{startup_data}",
        startup_data
    )

    print("\n================================")
    print(f"Processing: {startup_name}")
    print("================================")

    try:

        response = ollama.chat(

            model='qwen2.5:3b',

            messages=[

                {
                    'role': 'user',
                    'content': final_prompt
                }
            ]
        )

        content = response['message']['content']

        parsed = json.loads(content)

        # =====================================
        # STARTUP RECORD
        # =====================================

        startup_record = {

            "startup_name":
                startup_name,

            "startup_summary":
                parsed.get(
                    "startup_summary",
                    ""
                ),

            "sector":
                parsed.get(
                    "sector",
                    ""
                ),

            "subsector":
                parsed.get(
                    "subsector",
                    ""
                ),

            "geography":
                parsed.get(
                    "geography",
                    ""
                ),

            "country":
                parsed.get(
                    "country",
                    ""
                ),

            "relevant_icici_entities":
                ", ".join(
                    parsed.get(
                        "relevant_icici_entities",
                        []
                    )
                ),

            "use_cases":
                ", ".join(
                    parsed.get(
                        "use_cases",
                        []
                    )
                ),

            "bfsi_relevance_score":
                parsed.get(
                    "bfsi_relevance_score",
                    0
                ),

            "enterprise_readiness_score":
                parsed.get(
                    "enterprise_readiness_score",
                    0
                ),

            "priority_level":
                parsed.get(
                    "priority_level",
                    ""
                ),

            "source":
                source,

            "startup_url":
                startup_url,

            "raw_description":
                description
        }

        # =====================================
        # CHECK DUPLICATE
        # =====================================

        existing = supabase.table(
            "startup_analysis"
        ).select(
            "id"
        ).eq(
            "startup_name",
            startup_name
        ).execute()

        if len(existing.data) == 0:

            supabase.table(
                "startup_analysis"
            ).insert(
                startup_record
            ).execute()

            print("Inserted into Supabase")

        else:

            print("Startup already exists")

        results.append(
            startup_record
        )

    except Exception as e:

        print(e)

# =====================================
# SAVE OUTPUT CSV
# =====================================

output_df = pd.DataFrame(results)

output_df.to_csv(
    output_path,
    index=False
)

print("\n================================")
print("Analysis Complete")
print("================================")