# -*- coding: utf-8 -*-
"""Tjekker en batchfil mod skemaet og konventionerne i GENERERING.md."""
import json, re, sys, glob
from collections import Counter

KATEGORIER = {"kastning og stance","lie og marker","OB og hazard","obstakler og lempelse",
              "straf og misplay","putting og Circle 1","etikette 810","Competition Manual"}
fejl = []
ider = set()
tekster = []
for sti in sorted(glob.glob("src/data/batches/*.json")):
    data = json.load(open(sti, encoding="utf-8"))
    for i, p in enumerate(data):
        hvor = f"{sti}#{i+1} ({p.get('id')})"
        felter = ["id","kategori","spoergsmaal","svar","korrekt","forklaring","regel","kilde","verificeret"]
        if list(p.keys()) != felter: fejl.append(f"{hvor}: felter eller rækkefølge afviger")
        if p["id"] in ider: fejl.append(f"{hvor}: id går igen")
        ider.add(p["id"])
        if p["kategori"] not in KATEGORIER: fejl.append(f"{hvor}: ukendt kategori")
        if len(p["svar"]) != 4 or not all(isinstance(s,str) and s.strip() for s in p["svar"]):
            fejl.append(f"{hvor}: svar skal være 4 tekster")
        if len(set(p["svar"])) != 4: fejl.append(f"{hvor}: to ens svarmuligheder")
        if not isinstance(p["korrekt"], int) or not 0 <= p["korrekt"] <= 3:
            fejl.append(f"{hvor}: korrekt uden for 0 til 3")
        if not isinstance(p["verificeret"], bool): fejl.append(f"{hvor}: verificeret skal være true eller false")
        if not re.fullmatch(r"\d{3}(\.\d{2})?|Competition Manual( \d+\.\d+)?", p["regel"]):
            fejl.append(f"{hvor}: regelnummer har mærkelig form: {p['regel']}")
        if p["regel"][0].isdigit():
            ventet = "https://www.pdga.com/rules/official-rules-disc-golf/" + p["regel"].replace(".","")
        elif p["regel"] == "Competition Manual":
            ventet = "https://www.pdga.com/rules/competition-manual-disc-golf-events"
        else:
            ventet = "https://www.pdga.com/rules/competition-manual/" + p["regel"].split()[-1].replace(".","")
        if p["kilde"] != ventet:
            fejl.append(f"{hvor}: kilde passer ikke til regelnummer")
        for forbudt in ["alle ovenstående","ingen af ovenstående","både a og b","alle af ovenstående"]:
            if any(forbudt in s.lower() for s in p["svar"]): fejl.append(f"{hvor}: forbudt svarmulighed")
        saetninger = [s for s in re.split(r"(?<=[.!?])\s+", p["forklaring"].strip()) if s]
        if not 2 <= len(saetninger) <= 4: fejl.append(f"{hvor}: forklaring har {len(saetninger)} sætninger")
        if "—" in p["spoergsmaal"] + p["forklaring"] or " - " in p["spoergsmaal"] + p["forklaring"]:
            fejl.append(f"{hvor}: tankestreg i brødtekst")
        tekster.append((p["regel"], p["spoergsmaal"], hvor))

# næsten ens spørgsmål på samme regel
def ord_af(t): return set(re.findall(r"\w+", t.lower()))
for i in range(len(tekster)):
    for j in range(i+1, len(tekster)):
        if tekster[i][0] != tekster[j][0]: continue
        a, b = ord_af(tekster[i][1]), ord_af(tekster[j][1])
        lighed = len(a & b) / max(1, len(a | b))
        if lighed > 0.62:
            fejl.append(f"næsten ens på regel {tekster[i][0]}: {tekster[i][2]} og {tekster[j][2]} ({lighed:.0%})")

print(f"{len(tekster)} spørgsmål tjekket i alt")
if fejl:
    print(f"{len(fejl)} problemer:")
    for f in fejl: print("  " + f)
    sys.exit(1)
print("ingen problemer")
