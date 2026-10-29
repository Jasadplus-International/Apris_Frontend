"""Column-level diff: legacy reference .xls vs our generated broadsheet .xlsx."""
import pandas as pd
from openpyxl import load_workbook

LEG = r"C:\Users\USER\Documents\PDECE_CCOE 2024-2025RESULTS FOR PDE 1 DEPT CODE PDECE_CCOE SEMESTER 1 (1).xls"
GEN = r"C:\Users\USER\arpis-frontend\NCE1_BroadSheet_2024_2025.xlsx"

ldf = pd.read_excel(LEG, header=None)
lw = load_workbook(GEN)
lws = lw["Data1"] if "Data1" in lw.sheetnames else lw.active

def getl(r, c):  # legacy 0-based
    v = ldf.iat[r, c] if c < ldf.shape[1] else None
    return None if pd.isna(v) else v

def getg(r, c):  # generated 1-based
    return lws.cell(row=r, column=c).value

print("LEGACY shape:", ldf.shape, "| GENERATED max:", lws.max_row, "x", lws.max_column)

# ---- Row-by-row header zone (rows 1..6) for first 45 columns ----
print("\n=== HEADER + FIRST DATA ROWS, cols 1-30 (1-based) ===")
for r in range(1, 8):
    lvals = [(c, str(getl(r - 1, c - 1))[:16]) for c in range(1, 31) if getl(r - 1, c - 1) is not None]
    gvals = [(c, str(getg(r, c))[:16]) for c in range(1, 31) if getg(r, c) is not None]
    print(f"r{r} LEG:", lvals if lvals else "(empty)")
    print(f"r{r} GEN:", gvals if gvals else "(empty)")

# ---- Summary zone: find where headers TUT..PREVIOUS are in both ----
print("\n=== SUMMARY ZONE (legacy 0-based 130-155 vs generated cols 131-156) ===")
print("LEG r5(0b4):", [(c, str(getl(4, c))[:18]) for c in range(130, 156) if getl(4, c) is not None])
print("GEN r5     :", [(c, str(getg(5, c))[:18]) for c in range(131, 156) if getg(5, c) is not None])
print("LEG r7(0b6):", [(c, str(getl(6, c))[:18]) for c in range(130, 156) if getl(6, c) is not None])
# generated first data row (r7)
print("GEN r7     :", [(c, str(getg(7, c))[:18]) for c in range(131, 156) if getg(7, c) is not None])

# ---- far right carry-over block ----
print("\n=== FAR-RIGHT CARRY BLOCK (legacy 0-based 152-177 vs generated) ===")
print("LEG r5(0b4):", [(c, str(getl(4, c))[:14]) for c in range(152, 177) if getl(4, c) is not None])
print("LEG r7(0b6):", [(c, str(getl(6, c))[:14]) for c in range(152, 177) if getl(6, c) is not None])
gmax = lws.max_column
print("GEN max_col:", gmax)
print("GEN r5:", [(c, str(getg(5, c))[:14]) for c in range(gmax - 6, gmax + 1) if getg(5, c) is not None])

# ---- carry-over section rows ----
print("\n=== CARRY-OVER / END MARKERS ===")
for r in range(4, ldf.shape[0]):
    for c in range(0, 8):
        v = getl(r, c)
        if v is not None and str(v) in ("CARRY OVER STUDENTS", "END"):
            print(f"LEG r{r+1} c{c+1}: {v}")
for r in range(4, lws.max_row + 1):
    for c in range(1, 8):
        v = getg(r, c)
        if v is not None and str(v) in ("CARRY OVER STUDENTS", "END"):
            print(f"GEN r{r} c{c}: {v}")

# ---- merged cells in both (legacy via openpyxl read of xls not possible; report gen only) ----
print("\n=== GENERATED merged cells (first 40) ===")
print(list(lws.merged_cells.ranges)[:40])