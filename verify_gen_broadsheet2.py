import datetime
from openpyxl import load_workbook
wb = load_workbook("NCE1_BroadSheet_2024_2025.xlsx")
ws = wb["Data1"]
print("Sheet:", ws.title, "dims:", ws.dimensions, "| max_row:", ws.max_row, "max_col:", ws.max_column)

def gp(r, c):
    v = ws.cell(row=r, column=c).value
    return v

print("\nr2 c4:", gp(2, 4))
for c in range(5, 20):
    v = gp(2, c)
    if v: print(f"  r2 c{c}:", str(v)[:50])
print("r3:", [gp(3, c) for c in [2, 3, 4]])
for c in range(5, 25):
    v = gp(3, c)
    if v: print(f"  r3 c{c}:", v)
print("r4 c4:", gp(4, 4))
for c in range(5, 25):
    v = gp(4, c)
    if v: print(f"  r4 c{c}:", v)

r5 = [gp(5, c) for c in range(1, ws.max_column + 1)]
print("\nr5 headers (nonblank):", [(i + 1, v) for i, v in enumerate(r5) if v][:14])
print("... summary zone:", [(i + 1, v) for i, v in enumerate(r5) if v][38:60])

# First student row
first_r = 7
row7 = [gp(first_r, c) for c in range(1, 26)]
print("\nr7 c1-25:", row7[:10], "...", row7[10:25])
# summary zone of r7
r7 = [gp(first_r, c) for c in range(5 + 34 * 5 - 4, 5 + 34 * 5 + 15)]
print("r7 summary cols:", r7)

# find carry-over marker
for r in range(first_r, ws.max_row + 1):
    if gp(r, 4) == "CARRY OVER STUDENTS":
        print(f"\nCARRY OVER header row: {r}")
        for rr in range(r, min(r + 4, ws.max_row + 1)):
            v1, v3, v4 = gp(rr, 1), gp(rr, 3), gp(rr, 4)
            print(f"  r{rr}: SNO={v1} matric={v3} name={v4}")
            if rr == r + 2:
                print("  first carry row summary+trailer:",
                      [str(gp(rr, 5 + 34 * 5 + k))[:22] for k in range(14, 18)])
    if gp(r, 3) == "END":
        print(f"END row: {r}")
        break

# GPA consistency check on a scored student row
import math
for r in range(7, 40):
    tut = gp(r, 5 + 34 * 5 + 2)
    tgp = gp(r, 5 + 34 * 5 + 4)
    gpa = gp(r, 5 + 34 * 5 + 5)
    if tut and tgp and gpa:
        calc = tgp / tut
        print(f"\nr{r} TUT={tut} TGP={tgp} GPA={gpa} | TGP/TUT = {calc} | match 7dp: {abs(calc - float(gpa)) < 1e-9}")
        break