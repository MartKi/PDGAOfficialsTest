# -*- coding: utf-8 -*-
"""Roterer svarmulighederne så det korrekte svar fordeles jævnt over A til D.
Indholdet ændres ikke, kun rækkefølgen af de fire svar."""
import json, sys
from collections import Counter

sti = sys.argv[1]
data = json.load(open(sti, encoding="utf-8"))
n = len(data)
maal = [n // 4 + (1 if i < n % 4 else 0) for i in range(4)]  # så jævnt som muligt
plads = []
for i, antal in enumerate(maal):
    plads += [i] * antal
# fordel målpladserne deterministisk hen over listen
plads = [plads[(i * 4 + i // 4) % n] for i in range(n)] if False else plads
for i, post in enumerate(data):
    oensket = plads[i % n]
    nuvaerende = post["korrekt"]
    if oensket == nuvaerende:
        continue
    svar = post["svar"]
    korrekt_tekst = svar[nuvaerende]
    resten = [s for j, s in enumerate(svar) if j != nuvaerende]
    ny = resten[:oensket] + [korrekt_tekst] + resten[oensket:]
    post["svar"] = ny
    post["korrekt"] = oensket
    assert ny[oensket] == korrekt_tekst

json.dump(data, open(sti, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
open(sti, "a", encoding="utf-8").write("\n")
print("korrekt efter balancering:", dict(sorted(Counter(p["korrekt"] for p in data).items())))
