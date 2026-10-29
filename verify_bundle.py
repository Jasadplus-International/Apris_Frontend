"""Verify the generated ReportBundle zip: 3 files, structure, contents vs legacy rules."""
import zipfile, io, os
from openpyxl import load_workbook

zp = zipfile.ZipFile("ReportBundle_test.zip")
print("=== BUNDLE CONTENTS ===")
for info in zp.infolist():
    print(f"  {info.filename}  {info.file_size} bytes")

def probe(ws, r, c):
    return ws.cell(row=r, column=c).value

for fn in zp.namelist():
    print("\n" + "=" * 90)
    print("FILE:", fn)
    wb = load_workbook(io.BytesIO(zp.read(fn)))
    print("  sheets:", wb.sheetnames)
    ws = wb[wb.sheetnames[0]]

    if "BroadSheet" in fn:
        cw_cols = [c for c in range(1, ws.max_column + 1) if ws.cell(row=5, column=c).value == "CW"]
        tut = min(c for c in range(1, ws.max_column + 1) if ws.cell(row=5, column=c).value == "TUT")
        print(f"  course blocks: {len(cw_cols)} (main at {cw_cols[0]}...")
        print(f"  TUT col: {tut}")
        # first scored student row
        for r in range(7, ws.max_row + 1):
            name = ws.cell(row=r, column=4).value
            t = ws.cell(row=r, column=7).value
            if name and t is not None and isinstance(t, (int, float)):
                print(f"  r{r}: {name[:26]} | CWEX={ws.cell(row=r,column=5).value},{ws.cell(row=r,column=6).value} T={t} GP={ws.cell(row=r,column=8).value} GD={ws.cell(row=r,column=9).value}")
                vals = {h: ws.cell(row=r, column=tut - 2 + i).value for i, h in enumerate(
                    ["CUMM","GP","TUT","TUP","TGP","GPA","PUT","CUT","PTGP","CGPT","CGPA","CUO"])}
                print("      summary:", {k: vals[k] for k in ["TUT","TUP","TGP","GPA","PUT","CUT","PTGP","CGPT","CGPA","CUO"]})
                gpa = vals["GPA"]
                calc = vals["TGP"] / vals["TUT"]
                print(f"      check GPA==TGP/TUT: {abs(calc - gpa) < 1e-9} | CGPA==CGPT/CUT: {abs(vals['CGPT']/vals['CUT'] - vals['CGPA']) < 0.005}")
                break
        # carry-over section
        lr = next((r for r in range(7, ws.max_row + 1) if ws.cell(row=r, column=4).value == "CARRY OVER STUDENTS"), None)
        if lr:
            co = [(c, cw_cols.index(c)) for c in cw_cols if c > tut]
            print(f"  CARRY OVER label r{lr}; reserve blocks: {len(co)}")
            cr = lr + 2
            for rr in range(cr, ws.max_row):
                if ws.cell(row=rr, column=3).value == "END":
                    print(f"  END marker at r{rr}")
                    break
                mv = [str(ws.cell(row=rr, column=c).value) for c, _ in co]
                cv = ws.cell(row=rr, column=tut + 10).value
                pv = ws.cell(row=rr, column=tut + 12).value
                n_filled = sum(1 for v in mv if v not in ("None", ""))
                print(f"  carry r{rr}: SNO={ws.cell(row=rr,column=1).value} {str(ws.cell(row=rr,column=3).value)[:22]} reserve_filled={n_filled} PASSED={str(cv)[:28]} FAILED={str(pv)[:28]}")

    elif "Summary" in fn:
        ws1 = wb[wb.sheetnames[0]]
        print("  headers:", [ws1.cell(row=1, column=c).value for c in range(1, 6)])
        for r in range(3, 8):
            print(f"  r{r}:", [str(ws1.cell(row=r, column=c).value)[:30] for c in range(1, 6)])
        if len(wb.sheetnames) > 1:
            ws2 = wb[wb.sheetnames[1]]
            print("  sheet2 title:", ws2.title)
            for r in range(1, 5):
                print(f"  s2 r{r}:", [str(ws2.cell(row=r, column=c).value)[:34] for c in range(1, 7)])

    elif "CoverPage" in fn:
        imgs = getattr(ws, "_images", [])
        print(f"  images: {len(imgs)}")
        for img in imgs:
            print(f"    anchor: {img.anchor if isinstance(img.anchor, str) else img.anchor._from.col}, {getattr(img.anchor, '_from', None) and img.anchor._from.row}")
        print("  r10 B cell:", ws.cell(row=10, column=2).value)
        print("  r9 B cell:", ws.cell(row=9, column=2).value)
        for r in range(9, 20):
            v1, v2 = ws.cell(row=r, column=2).value, ws.cell(row=r, column=3).value
            if v1 or v2:
                print(f"  r{r}: {v1} | {v2}")
zp.close()