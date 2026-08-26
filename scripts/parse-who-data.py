"""
Parse WHO Growth Standards data files (official WHO Anthro files) and WHO Reference 2007
into TypeScript data files.

Sources:
- WHO Child Growth Standards (0-5 years, 0-1856 days):
  From WorldHealthOrganization/mnf-anthro-analyzer-offline repository (official WHO GitHub)
  - weianthro.txt (Weight-for-age, daily)
  - lenanthro.txt (Length-for-age, 0-731 days, recumbent)
  - hcanthro.txt (Height-for-age, 0-1856 days, standing)
  - wflanthro.txt (Weight-for-length, 45-110 cm, recumbent, 0.1 cm step)
  - wfhanthro.txt (Weight-for-height, 65-120 cm, standing, 0.1 cm step)
  - bmianthro.txt (BMI-for-age, daily)

- WHO Reference 2007 (5-19 years, 61-228 months):
  From erik1066/anthstat-statistics repository
  - WHO2007_BMI (BMI-for-age)
  - WHO2007_HeightAge (Height-for-age)

Output: src/lib/who/data/{indicator}_{sex}.ts files
        with TypeScript arrays of {day|cm, L, M, S} entries.
"""

import os
import re
from collections import defaultdict

OUT_DIR = "/home/z/my-project/src/lib/who/data"
os.makedirs(OUT_DIR, exist_ok=True)

# ============ Parse WHO Anthro 0-5 years ============

def parse_anthro_age_file(path):
    """Parse weianthro.txt / bmianthro.txt format: sex, age (days), L, M, S[, loh]
    Returns dict: {(sex, day): {L, M, S}}"""
    data = {}
    with open(path) as f:
        header = f.readline()
        for line in f:
            parts = line.strip().split()
            if len(parts) < 5:
                continue
            try:
                sex = int(parts[0])  # 1=boys, 2=girls
                age = int(parts[1])
                L = float(parts[2])
                M = float(parts[3])
                S = float(parts[4])
                data[(sex, age)] = (L, M, S)
            except (ValueError, IndexError):
                continue
    return data

def parse_anthro_height_age_file(path):
    """Parse lenanthro.txt / hcanthro.txt format: sex, age (days), L, M, S, loh (optional)
    Returns dict: {(sex, day): {L, M, S, loh}}"""
    data = []
    with open(path) as f:
        header = f.readline()
        for line in f:
            parts = line.strip().split()
            if len(parts) < 5:
                continue
            try:
                sex = int(parts[0])
                age = int(parts[1])
                L = float(parts[2])
                M = float(parts[3])
                S = float(parts[4])
                loh = parts[5] if len(parts) >= 6 else None
                data.append((sex, age, L, M, S, loh))
            except (ValueError, IndexError):
                continue
    return data

def parse_anthro_height_value_file(path):
    """Parse wflanthro.txt / wfhanthro.txt format: sex, length/height (cm float), L, M, S, lorh
    Returns dict: {(sex, cm*10): {L, M, S, cm}}"""
    data = {}
    with open(path) as f:
        header = f.readline()
        for line in f:
            parts = line.strip().split()
            if len(parts) < 5:
                continue
            try:
                sex = int(parts[0])
                cm = float(parts[1])
                L = float(parts[2])
                M = float(parts[3])
                S = float(parts[4])
                data[(sex, round(cm * 10))] = (L, M, S, cm)
            except (ValueError, IndexError):
                continue
    return data


# Parse all 6 WHO Anthro files
print("Parsing WHO Anthro 0-5 years files...")
wfa_data = parse_anthro_age_file("/tmp/who-data/weianthro.txt")
lhfa_raw = parse_anthro_height_age_file("/tmp/who-data/lenanthro.txt")
wfl_data = parse_anthro_height_value_file("/tmp/who-data/wflanthro.txt")
wfh_data = parse_anthro_height_value_file("/tmp/who-data/wfhanthro.txt")
bfa_raw = parse_anthro_height_age_file("/tmp/who-data/bmianthro.txt")

# Split LFA/HFA by loh column
lfa_data = {}
hfa_data = {}
for sex, age, L, M, S, loh in lhfa_raw:
    if loh == "L":
        lfa_data[(sex, age)] = (L, M, S)
    elif loh == "H":
        hfa_data[(sex, age)] = (L, M, S)

# BFA: WHO provides separate L (recumbent) and H (standing) values
# For BMI calculation: WHO uses Length for <24m and Height for >=24m
# We'll keep both, but calculator will choose based on age & measurement type
bfa_data = {}  # default (use L for <24m, H for >=24m) - same as WHO Anthro default
bfa_data_l = {}
bfa_data_h = {}
for sex, age, L, M, S, loh in bfa_raw:
    bfa_data_l[(sex, age)] = (L, M, S) if loh == "L" else bfa_data_l.get((sex, age))
    bfa_data_h[(sex, age)] = (L, M, S) if loh == "H" else bfa_data_h.get((sex, age))

# Default BFA: use L for <731 days (24m), H for >=731 days
for (sex, age), _ in lfa_data.items():
    if (sex, age) in bfa_data_l:
        bfa_data[(sex, age)] = bfa_data_l[(sex, age)]
for (sex, age), _ in hfa_data.items():
    if (sex, age) in bfa_data_h:
        bfa_data[(sex, age)] = bfa_data_h[(sex, age)]

print(f"  WFA: {len(wfa_data)} entries")
print(f"  LFA (loh=L, <24m): {len(lfa_data)} entries")
print(f"  HFA (loh=H, >=24m): {len(hfa_data)} entries")
print(f"  WFL: {len(wfl_data)} entries")
print(f"  WFH: {len(wfh_data)} entries")
print(f"  BFA (combined L+H): {len(bfa_data)} entries (L-only: {len(bfa_data_l)}, H-only: {len(bfa_data_h)})")


# ============ Parse WHO 2007 (5-19 years) ============

def parse_who2007_cs(path, section_name):
    """Parse WHO2007.data.cs file for a specific dictionary section.
    Returns dict: {(sex, month): (L, M, S)}"""
    with open(path) as f:
        content = f.read()

    # Find the section
    pattern = rf"WHO2007_{section_name}\s*=\s*new\s+Dictionary.*?\{{(.*?)\}};"
    match = re.search(pattern, content, re.DOTALL)
    if not match:
        raise ValueError(f"Section {section_name} not found")

    body = match.group(1)
    # Pattern: { key, new Lookup(Sex.Male/Sex.Female, month, L, M, S) }
    entries = re.findall(r"new\s+Lookup\((?:Sex\.)?(\w+),\s*(\d+),\s*(-?[\d.]+),\s*(-?[\d.]+),\s*(-?[\d.]+)\)", body)

    data = {}
    for sex_str, month_str, L_str, M_str, S_str in entries:
        sex = 1 if sex_str == "Male" else 2
        month = int(month_str)
        L = float(L_str)
        M = float(M_str)
        S = float(S_str)
        data[(sex, month)] = (L, M, S)
    return data


print("\nParsing WHO 2007 (5-19 years)...")
who2007_bfa = parse_who2007_cs("/tmp/WHO2007.data.cs", "BMI")
who2007_hfa = parse_who2007_cs("/tmp/WHO2007.data.cs", "HeightAge")
who2007_wfa = parse_who2007_cs("/tmp/WHO2007.data.cs", "WeightAge")

print(f"  WHO2007 BMI-for-age: {len(who2007_bfa)} entries")
print(f"  WHO2007 Height-for-age: {len(who2007_hfa)} entries")
print(f"  WHO2007 Weight-for-age: {len(who2007_wfa)} entries")


# ============ Generate TypeScript data files ============

def gen_ts_age_file(filename, indicator, sex_name, sex_code, data_dict, indicator_desc):
    """Generate TS file for age-based indicator (WFA, LFA, HFA, BFA).
    Data is sorted by age (day), output as array of [day, L, M, S]."""
    entries = []
    for (s, day), (L, M, S) in data_dict.items():
        if s == sex_code:
            entries.append((day, L, M, S))
    entries.sort(key=lambda x: x[0])

    lines = []
    lines.append("/**")
    lines.append(f" * WHO Child Growth Standards - {indicator_desc}")
    lines.append(f" * Sex: {sex_name}")
    lines.append(" *")
    lines.append(" * Source: Official WHO Anthro data files (World Health Organization)")
    lines.append(f" * Total entries: {len(entries)} (age in days)")
    lines.append(" *")
    lines.append(" * Format: [day, L, M, S]")
    lines.append(" *  - day: age in days")
    lines.append(" *  - L: Box-Cox power")
    lines.append(" *  - M: median")
    lines.append(" *  - S: coefficient of variation")
    lines.append(" *")
    lines.append(" * Z-score (LMS):")
    lines.append(" *   L != 0: Z = ((X/M)^L - 1) / (L * S)")
    lines.append(" *   L = 0:  Z = ln(X/M) / S")
    lines.append(" */")
    lines.append("")
    lines.append(f"export const {filename}: [number, number, number, number][] = [")
    for day, L, M, S in entries:
        lines.append(f"  [{day}, {L}, {M}, {S}],")
    lines.append("];")
    lines.append("")

    out_path = os.path.join(OUT_DIR, filename + ".ts")
    with open(out_path, "w") as f:
        f.write("\n".join(lines))
    return out_path, len(entries)


def gen_ts_height_file(filename, indicator, sex_name, sex_code, data_dict, indicator_desc, x_label):
    """Generate TS file for height-based indicator (WFL, WFH).
    Data is sorted by cm, output as array of [cm*10, L, M, S]."""
    entries = []
    for (s, cm10), (L, M, S, cm) in data_dict.items():
        if s == sex_code:
            entries.append((cm, L, M, S))
    entries.sort(key=lambda x: x[0])

    lines = []
    lines.append("/**")
    lines.append(f" * WHO Child Growth Standards - {indicator_desc}")
    lines.append(f" * Sex: {sex_name}")
    lines.append(" *")
    lines.append(" * Source: Official WHO Anthro data files (World Health Organization)")
    lines.append(f" * Total entries: {len(entries)} ({x_label} in cm, step 0.1 cm)")
    lines.append(" *")
    lines.append(" * Format: [cm_x10, L, M, S]")
    lines.append(" *  - cm_x10: length/height in cm multiplied by 10 (integer)")
    lines.append(" *  - L: Box-Cox power")
    lines.append(" *  - M: median")
    lines.append(" *  - S: coefficient of variation")
    lines.append(" */")
    lines.append("")
    lines.append(f"export const {filename}: [number, number, number, number][] = [")
    for cm, L, M, S in entries:
        lines.append(f"  [{int(round(cm * 10))}, {L}, {M}, {S}],")
    lines.append("];")
    lines.append("")

    out_path = os.path.join(OUT_DIR, filename + ".ts")
    with open(out_path, "w") as f:
        f.write("\n".join(lines))
    return out_path, len(entries)


def gen_ts_2007_file(filename, indicator, sex_name, sex_code, data_dict, indicator_desc):
    """Generate TS file for WHO 2007 reference (5-19 years)."""
    entries = []
    for (s, month), (L, M, S) in data_dict.items():
        if s == sex_code:
            entries.append((month, L, M, S))
    entries.sort(key=lambda x: x[0])

    lines = []
    lines.append("/**")
    lines.append(f" * WHO Reference 2007 - {indicator_desc}")
    lines.append(f" * Sex: {sex_name}")
    lines.append(" *")
    lines.append(" * Source: WHO Reference 2007 (for 5-19 year olds)")
    lines.append(" *         From WHO AnthroPlus software / WHO 2007 reference data")
    lines.append(f" * Total entries: {len(entries)} (age in months)")
    lines.append(" *")
    lines.append(" * Format: [month, L, M, S]")
    lines.append(" */")
    lines.append("")
    lines.append(f"export const {filename}: [number, number, number, number][] = [")
    for month, L, M, S in entries:
        lines.append(f"  [{month}, {L}, {M}, {S}],")
    lines.append("];")
    lines.append("")

    out_path = os.path.join(OUT_DIR, filename + ".ts")
    with open(out_path, "w") as f:
        f.write("\n".join(lines))
    return out_path, len(entries)


print("\nGenerating TypeScript data files...")

# WFA - Weight-for-age 0-5 years (1857 days each)
for sex_name, sex_code in [("boys", 1), ("girls", 2)]:
    p, n = gen_ts_age_file(
        f"wfa_{sex_name}",
        "WFA",
        sex_name,
        sex_code,
        wfa_data,
        f"Weight-for-Age (BB/U) - {sex_name}, 0-5 years"
    )
    print(f"  {p}: {n} entries")

# LFA - Length-for-age 0-2 years (731 days)
for sex_name, sex_code in [("boys", 1), ("girls", 2)]:
    p, n = gen_ts_age_file(
        f"lfa_{sex_name}",
        "LFA",
        sex_name,
        sex_code,
        lfa_data,
        f"Length-for-Age (PB/U) - {sex_name}, 0-2 years (recumbent)"
    )
    print(f"  {p}: {n} entries")

# HFA - Height-for-age 2-5 years (1857 days)
for sex_name, sex_code in [("boys", 1), ("girls", 2)]:
    p, n = gen_ts_age_file(
        f"hfa_{sex_name}",
        "HFA",
        sex_name,
        sex_code,
        hfa_data,
        f"Height-for-Age (TB/U) - {sex_name}, 0-5 years (standing)"
    )
    print(f"  {p}: {n} entries")

# WFL - Weight-for-length 0-2 years (45-110 cm)
for sex_name, sex_code in [("boys", 1), ("girls", 2)]:
    p, n = gen_ts_height_file(
        f"wfl_{sex_name}",
        "WFL",
        sex_name,
        sex_code,
        wfl_data,
        f"Weight-for-Length (BB/PB) - {sex_name}, 45-110 cm (recumbent)",
        "length"
    )
    print(f"  {p}: {n} entries")

# WFH - Weight-for-height 2-5 years (65-120 cm)
for sex_name, sex_code in [("boys", 1), ("girls", 2)]:
    p, n = gen_ts_height_file(
        f"wfh_{sex_name}",
        "WFH",
        sex_name,
        sex_code,
        wfh_data,
        f"Weight-for-Height (BB/TB) - {sex_name}, 65-120 cm (standing)",
        "height"
    )
    print(f"  {p}: {n} entries")

# BFA - BMI-for-age 0-5 years (1857 days)
for sex_name, sex_code in [("boys", 1), ("girls", 2)]:
    p, n = gen_ts_age_file(
        f"bfa_{sex_name}",
        "BFA",
        sex_name,
        sex_code,
        bfa_data,
        f"BMI-for-Age (IMT/U) - {sex_name}, 0-5 years"
    )
    print(f"  {p}: {n} entries")

# WHO 2007 - for 5-19 years
for sex_name, sex_code in [("boys", 1), ("girls", 2)]:
    p, n = gen_ts_2007_file(
        f"bfa519_{sex_name}",
        "BFA2007",
        sex_name,
        sex_code,
        who2007_bfa,
        f"BMI-for-Age (IMT/U) - {sex_name}, 5-19 years"
    )
    print(f"  {p}: {n} entries")

    p, n = gen_ts_2007_file(
        f"hfa519_{sex_name}",
        "HFA2007",
        sex_name,
        sex_code,
        who2007_hfa,
        f"Height-for-Age (TB/U) - {sex_name}, 5-19 years"
    )
    print(f"  {p}: {n} entries")

print("\nAll TypeScript data files generated successfully!")
print(f"Output directory: {OUT_DIR}")

# Print a sample to verify
print("\n=== Sample verification ===")
print("WFA Boys day 0 (should be M=3.3464 kg, L=0.3487, S=0.14602):")
print(f"  Actual: {wfa_data.get((1, 0))}")
print("LFA Boys day 0 (should be M=49.8842 cm, L=1, S=0.03795):")
print(f"  Actual: {lfa_data.get((1, 0))}")
print("HFA Boys day 730 (24m, should have M~86.45 cm, L=1, S~0.030):")
print(f"  Actual: {hfa_data.get((1, 730))}")
print("HFA Boys day 853 (28m, expected M~108 cm):")
print(f"  Actual: {hfa_data.get((1, 853))}")
print("WFL Boys at 60 cm (should be M=5.9907 kg, L=-0.3521, S=0.08342):")
print(f"  Actual: {wfl_data.get((1, 600))}")
print("WFH Boys at 89 cm (should be M=12.6495 kg, L=-0.3521, S=0.08045):")
print(f"  Actual: {wfh_data.get((1, 890))}")
print("BFA Boys day 0 (L=recumbent, should be M=13.4069, L=-0.3053, S=0.0956):")
print(f"  Actual: {bfa_data.get((1, 0))}")
print("BFA Boys day 730 (H=standing, expected M~15.5):")
print(f"  Actual: {bfa_data.get((1, 730))}")
print("WHO2007 BFA Boys month 61 (should be M=15.2641, L=-0.7387, S=0.0839):")
print(f"  Actual: {who2007_bfa.get((1, 61))}")
