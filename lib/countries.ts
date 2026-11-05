const CODES =
  "AD AE AF AG AI AL AM AO AR AT AU AW AZ BA BB BD BE BF BG BH BI BJ BM BN BO BR BS BT BW BY BZ CA CD CG CH CI CL CM CN CO CR CU CV CY CZ DE DJ DK DM DO DZ EC EE EG ER ES ET FI FJ FR GA GB GD GE GH GI GM GN GQ GR GT GY HK HN HR HT HU ID IE IL IN IQ IS IT JM JO JP KE KG KH KM KN KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MG MK ML MM MN MO MR MT MU MV MW MX MY MZ NA NE NG NI NL NO NP NZ OM PA PE PG PH PK PL PR PT PY QA RE RO RS RW SA SB SC SE SG SI SK SL SM SN SO SR SV SZ TD TG TH TJ TN TO TR TT TW TZ UA UG US UY UZ VC VE VN VU WS ZM ZW".split(
    " "
  );

export function countryNames(): string[] {
  let names: string[];
  try {
    const dn = new Intl.DisplayNames(["en"], { type: "region" });
    names = CODES.map((c) => dn.of(c) ?? c);
  } catch {
    names = CODES;
  }
  return ["South Africa", ...names.sort((a, b) => a.localeCompare(b))];
}
