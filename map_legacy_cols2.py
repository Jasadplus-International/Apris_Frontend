import pandas as pd
path = r"C:\Users\USER\Documents\PDECE_CCOE 2024-2025RESULTS FOR PDE 1 DEPT CODE PDECE_CCOE SEMESTER 1 (1).xls"
df = pd.read_excel(path, header=None)

# Carry-over rows and END: cols 0-10 and 130-177
print("=== ROWS 70-77 (1-based), main-grid identity cols ===")
for ridx in range(69, min(df.shape[0], 77)):
    row = df.iloc[ridx]
    print(f"row {ridx+1}: SNO={row[0]} | c1={row[1]} | c2={row[2]} | NAME={row[3]} | MATRIC?={row[2]}")

print("\n=== ROW 73-77, summary zone cols 136-152 (0-based) ===")
for ridx in range(72, min(df.shape[0], 77)):
    vals = df.iloc[ridx, 136:153].tolist()
    print(f"row {ridx+1}:", [str(v)[:14] for v in vals])

print("\n=== ROW 74, right block cols 152-177 (0-based) ===")
for ridx in range(72, min(df.shape[0], 77)):
    vals = df.iloc[ridx, 152:177].tolist()
    print(f"row {ridx+1}:", [str(v)[:12] for v in vals])

# Check a mid-list regular row for CUMM/GP cols values
print("\n=== ROW 8 (regular), summary zone cols 136-152 ===")
vals = df.iloc[7, 136:153].tolist()
print([str(v)[:16] for v in vals])