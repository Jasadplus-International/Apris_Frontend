from openpyxl import load_workbook
wb = load_workbook("BroadSheet test file", read_only=True) if False else None

import os, glob
path = max(glob.glob(r"C:\Users\USER\Documents\btest.xlsx") + glob.glob("test_broadsheet.xlsx") +
           glob.glob(r"C:\Users\USER\arpis-backend\BroadSheet_*.xlsx") +
           glob.glob(r"C:\Users\USER\arpis-frontend\BroadSheet_*.xlsx"),
           key=os.path.getmtime)
print("Inspecting:", path)
wb = load_workbook(path)
ws = wb.active if not wb.sheetnames or "Data1" not in wb.sheetnames else wb["Data1"]
print("Sheet:", ws.title, "dims:", ws.dimensions)

def prow(r, c1, c2, label):
    vals = []
    for c in range(c1, c2 + 1):
        v = ws.cell(row=r, column=c).value
        vals.append(str(v)[:14] if v is not None else "")
    print(f"{label} r{r} c{c1}-{c2}:", vals)

print("\n--- HEADER BLOCK ---")
prow(2, 1, 40, "r2")
prow(3, 1, 40, "r3")
prow(4, 1, 40, "r4")
prow(5, 1, 40, "r5")
print("\n--- SUMMARY HEADERS (r5) ---")
prow(5, 35, 60, "r5")
print("\n--- FIRST STUDENT ROW (r7) ---")
prow(7, 1, 24, "r7 summary-zone")
prow(7, 33, 55, "r7")
print("\n--- TAIL ROWS ---")
nrows = ws.max_row
for r in range(nrows - 3, nrows + 1):
    print(f"r{r}:", [str(ws.cell(row=r, column=c).value)[:24] for c in [1, 3, 4, 42, 43, 44]])