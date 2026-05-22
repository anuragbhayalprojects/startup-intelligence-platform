import streamlit as st
import pandas as pd

from pathlib import Path
import sys

# =====================================
# PATH SETUP
# =====================================

BASE_DIR = Path.home() / "Projects/startup-intelligence"

backend_path = BASE_DIR / "backend"

sys.path.append(str(backend_path))

from supabase_client import supabase
from scraper_manager import run_pipeline

# =====================================
# PAGE CONFIG
# =====================================

st.set_page_config(

    page_title="ICICI Startup Discovery Engine",

    layout="wide"
)

st.title(
    "ICICI Startup Discovery Engine"
)

# =====================================
# DISCOVERY FILTERS
# =====================================

st.sidebar.header(
    "Discovery Filters"
)

source = st.sidebar.selectbox(

    "Source",

    [
        "Entrackr",
        "Y Combinator"
    ]
)

geography = st.sidebar.selectbox(

    "Geography",

    [
        "India",
        "USA",
        "Singapore"
    ]
)

sector = st.sidebar.selectbox(

    "Sector",

    [
        "FinTech",
        "Payments",
        "Lending",
        "InsurTech",
        "AI"
    ]
)

limit = st.sidebar.slider(

    "Number of Companies",

    5,
    100,
    20
)

# =====================================
# DISCOVER BUTTON
# =====================================

if st.sidebar.button(
    "Discover Startups"
):

    with st.spinner(
        "Running startup discovery pipeline..."
    ):

        run_pipeline(

            source,
            geography,
            sector,
            limit
        )

    st.success(
        "Startup discovery completed"
    )

    st.rerun()

# =====================================
# LOAD DATA
# =====================================

try:

    response = supabase.table(
        "startup_analysis"
    ).select("*").execute()

    df = pd.DataFrame(response.data)

except Exception as e:

    st.error(e)

    st.stop()

# =====================================
# EMPTY CHECK
# =====================================

if df.empty:

    st.warning(
        "No startup data available."
    )

    st.stop()

# =====================================
# DASHBOARD FILTERS
# =====================================

st.sidebar.header(
    "Dashboard Filters"
)

source_filter = st.sidebar.multiselect(

    "Filter Sources",

    df["source"]
    .dropna()
    .unique()
    .tolist(),

    default=df["source"]
    .dropna()
    .unique()
    .tolist()
)

sector_filter = st.sidebar.multiselect(

    "Filter Sectors",

    df["sector"]
    .dropna()
    .unique()
    .tolist(),

    default=df["sector"]
    .dropna()
    .unique()
    .tolist()
)

priority_filter = st.sidebar.multiselect(

    "Filter Priority",

    df["priority_level"]
    .dropna()
    .unique()
    .tolist(),

    default=df["priority_level"]
    .dropna()
    .unique()
    .tolist()
)

# =====================================
# FILTER LOGIC
# =====================================

filtered_df = df.copy()

filtered_df = filtered_df[
    filtered_df["source"]
    .isin(source_filter)
]

filtered_df = filtered_df[
    filtered_df["sector"]
    .isin(sector_filter)
]

filtered_df = filtered_df[
    filtered_df["priority_level"]
    .isin(priority_filter)
]

# =====================================
# METRICS
# =====================================

st.subheader(
    "Platform Metrics"
)

col1, col2, col3 = st.columns(3)

col1.metric(
    "Total Startups",
    len(filtered_df)
)

avg_score = round(

    filtered_df[
        "bfsi_relevance_score"
    ].mean(),

    2
)

col2.metric(
    "Average BFSI Score",
    avg_score
)

high_priority_count = len(

    filtered_df[
        filtered_df[
            "priority_level"
        ] == "High"
    ]
)

col3.metric(
    "High Priority",
    high_priority_count
)

# =====================================
# DISPLAY TABLE
# =====================================

st.subheader(
    "Startup Intelligence"
)

display_columns = [

    "startup_name",

    "country",

    "sector",

    "subsector",

    "source",

    "bfsi_relevance_score",

    "enterprise_readiness_score",

    "priority_level"
]

st.dataframe(

    filtered_df[
        display_columns
    ],

    use_container_width=True
)

# =====================================
# STARTUP DETAILS
# =====================================

st.subheader(
    "Startup Details"
)

selected_startup = st.selectbox(

    "Select Startup",

    filtered_df[
        "startup_name"
    ].tolist()
)

startup_data = filtered_df[

    filtered_df[
        "startup_name"
    ] == selected_startup

].iloc[0]

col1, col2 = st.columns(2)

with col1:

    st.markdown(
        "### Basic Information"
    )

    st.write(
        f"**Startup:** {startup_data['startup_name']}"
    )

    st.write(
        f"**Country:** {startup_data['country']}"
    )

    st.write(
        f"**Sector:** {startup_data['sector']}"
    )

    st.write(
        f"**Subsector:** {startup_data['subsector']}"
    )

with col2:

    st.markdown(
        "### Scores"
    )

    st.write(
        f"**BFSI Relevance Score:** {startup_data['bfsi_relevance_score']}"
    )

    st.write(
        f"**Enterprise Readiness Score:** {startup_data['enterprise_readiness_score']}"
    )

    st.write(
        f"**Priority:** {startup_data['priority_level']}"
    )

st.markdown(
    "### Startup Summary"
)

st.write(
    startup_data["startup_summary"]
)

st.markdown(
    "### Relevant ICICI Entities"
)

st.write(
    startup_data["relevant_icici_entities"]
)

st.markdown(
    "### Use Cases"
)

st.write(
    startup_data["use_cases"]
)

st.markdown(
    "### Startup URL"
)

st.write(
    startup_data["startup_url"]
)