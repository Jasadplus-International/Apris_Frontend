import pandas as pd
path = r"C:\Users\USER\Documents\PDECE_CCOE 2024-2025RESULTS FOR PDE 1 DEPT CODE PDECE_CCOE SEMESTER 1 (1).xls"
df = pd.read_excel(path, header=None)
# Headers row (0-based 4) vs first data row (0-based 6), right section
start, end = 120, df.shape[1]
hdr = df.iloc[4, start:end].tolist()
dat = df.iloc[6, start:end].tolist()
print("HEADER (row5) -> DATA (row7)")
for i, (h, v) in enumerate(zip(hdr, dat), start=start):
    print(f"  col {i:4d}  hdr={str(h)[:16]:<18} val={str(v)[:20]}")
print()
print("Full shape:", df.shape)
# also check where carry-over students appear (search 'CARRY' down column D)
for ridx in range(4, min(df.shape[0], 400)):
    for cidx in range(0, 6):
        sval = str(df.iat[ridx, cidx])
        if 'CARRY' in sval.upper() or 'REGULAR' in sval.upper() or 'END' == sval or 'END.' == sval.strip('.'):
            print(f"marker at row {ridx+1} (0-based {ridx}) col {cidx}: {repr(df.iat[ridx, cidx])}")