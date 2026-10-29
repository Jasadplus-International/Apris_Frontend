import pandas as pd
LEG = r"C:\Users\USER\Documents\PDECE_CCOE 2024-2025RESULTS FOR PDE 1 DEPT CODE PDECE_CCOE SEMESTER 1 (1).xls"
ldf = pd.read_excel(LEG, header=None)

def getl(r, c):
    v = ldf.iat[r, c] if c < ldf.shape[1] else None
    return None if pd.isna(v) else v

# 1. How many 5-col blocks in header row 4 (0-based)? scan for CW at block starts
print("=== Legacy r5 headers: ALL columns 1-140 with values (1-based) ===")
row = [(c, str(getl(4, c - 1))[:12]) for c in range(1, 141) if getl(4, c - 1) is not None]
# compress: print runs
print("total non-empty header cells:", len(row))
print(row)

# 2. Do data rows fill cols 45-137?
print("\n=== Legacy r7 (0b6) data: cols 40-140 ===")
row = [(c, str(getl(6, c - 1))[:12]) for c in range(40, 141) if getl(6, c - 1) is not None]
print(row)

print("\n=== Legacy r8 (0b7) data: cols 40-140 ===")
row = [(c, str(getl(7, c - 1))[:12]) for c in range(40, 141) if getl(7, c - 1) is not None]
print(row)

# 3. r2/r3/r4 in cols 36-140 (course titles/units for the extra blocks?)
for rr, lbl in [(1, "r2 TITLES"), (2, "r3 CODES"), (3, "r3 UNITS")]:
    row = [(c, str(getl(rr, c - 1))[:20]) for c in range(36, 141) if getl(rr, c - 1) is not None]
    print(f"\n=== Legacy {lbl} cols 36-140 ===")
    print(row)

# 4. Where exactly does the summary start? First TUT occurrence
for c in range(1, 180):
    v = getl(4, c - 1)
    if v is not None and str(v).strip() == "TUT":
        print("\nTUT header at 1-based col:", c)
        break
# 5. count of CW occurrences in header row
cws = [c for c in range(1, 180) if (getl(4, c - 1) or "") == "CW"]
print("CW header occurrences (1-based cols):", cws)
print("count:", len(cws))