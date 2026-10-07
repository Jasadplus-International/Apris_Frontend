import pandas as pd

cover_path = r"c:\Users\USER\Documents\PDECE_CCOE 2024-2025 COVERPAGE FOR PDE 1 DEPT CODE PDECE_CCOE SEMESTER 2 (2).xls"
summary_path = r"c:\Users\USER\Documents\PDECE_CCOE 2024-2025 SUMMARY FOR PDE 1 DEPT CODE PDECE_CCOE SEMESTER 2 (2).xls"

def analyze_file(path, label):
    print(f"\n--- ANALYZING {label} ---")
    try:
        df = pd.read_excel(path, header=None, nrows=15)
        print(df.to_string())
    except Exception as e:
        print(f"Error reading {label}: {e}")

analyze_file(cover_path, "COVER PAGE")
analyze_file(summary_path, "SUMMARY SHEET")
