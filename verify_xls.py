import pandas as pd
import os

file_path = r"c:\Users\USER\Documents\PDECE_CCOE 2024-2025RESULTS FOR PDE 1 DEPT CODE PDECE_CCOE SEMESTER 1 (1) - Copy.xls"

try:
    # Read the first few rows to understand the header structure
    # .xls files often have headers in the first few rows
    df = pd.read_excel(file_path, header=None, nrows=20)
    print("--- FIRST 20 ROWS OF THE FILE ---")
    print(df.to_string())
    print("\n--- FILE INFO ---")
    print(f"Shape: {df.shape}")
except Exception as e:
    print(f"Error reading file: {e}")
