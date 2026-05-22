#!/bin/zsh

source ~/.zprofile

cd $HOME/Projects/startup-intelligence

source venv/bin/activate

streamlit run dashboard/dashboard.py