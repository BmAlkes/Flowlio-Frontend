export interface Country {
  code: string;
  name: string;
}

// A curated list covering Flowlio's main markets plus common
// international ones, with an "Other" fallback rather than the full
// ISO-3166 list (195 entries) to keep the signup select usable.
export const COUNTRIES: Country[] = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "GB", name: "United Kingdom" },
  { code: "IL", name: "Israel" },
  { code: "BR", name: "Brazil" },
  { code: "PT", name: "Portugal" },
  { code: "ES", name: "Spain" },
  { code: "MX", name: "Mexico" },
  { code: "AR", name: "Argentina" },
  { code: "CO", name: "Colombia" },
  { code: "CL", name: "Chile" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "IT", name: "Italy" },
  { code: "NL", name: "Netherlands" },
  { code: "BE", name: "Belgium" },
  { code: "CH", name: "Switzerland" },
  { code: "AT", name: "Austria" },
  { code: "SE", name: "Sweden" },
  { code: "NO", name: "Norway" },
  { code: "DK", name: "Denmark" },
  { code: "FI", name: "Finland" },
  { code: "IE", name: "Ireland" },
  { code: "PL", name: "Poland" },
  { code: "GR", name: "Greece" },
  { code: "AU", name: "Australia" },
  { code: "NZ", name: "New Zealand" },
  { code: "IN", name: "India" },
  { code: "SG", name: "Singapore" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "ZA", name: "South Africa" },
  { code: "JP", name: "Japan" },
  { code: "KR", name: "South Korea" },
  { code: "PH", name: "Philippines" },
  { code: "OTHER", name: "Other" },
];
