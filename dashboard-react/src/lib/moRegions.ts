/**
 * Missouri Regional Mapping
 * Maps counties to their regions for regional analysis
 */

export const MO_REGIONS: { [key: string]: string } = {
  // Northwest Region
  'ATCHISON': 'Northwest',
  'NODAWAY': 'Northwest',
  'WORTH': 'Northwest',
  'HARRISON': 'Northwest',
  'MERCER': 'Northwest',
  'PUTNAM': 'Northwest',
  'GENTRY': 'Northwest',
  'ANDREW': 'Northwest',
  'DEKALB': 'Northwest',
  'DAVIESS': 'Northwest',
  'GRUNDY': 'Northwest',
  'SULLIVAN': 'Northwest',

  // Northeast Region
  'SCHUYLER': 'Northeast',
  'SCOTLAND': 'Northeast',
  'CLARK': 'Northeast',
  'ADAIR': 'Northeast',
  'KNOX': 'Northeast',
  'LEWIS': 'Northeast',
  'LINN': 'Northeast',
  'MACON': 'Northeast',
  'SHELBY': 'Northeast',
  'MARION': 'Northeast',
  'RALLS': 'Northeast',
  'PIKE': 'Northeast',
  'MONROE': 'Northeast',

  // Kansas City Metro
  'JACKSON': 'Kansas City Metro',
  'CLAY': 'Kansas City Metro',
  'PLATTE': 'Kansas City Metro',
  'CASS': 'Kansas City Metro',

  // West Central
  'BUCHANAN': 'West Central',
  'CLINTON': 'West Central',
  'CALDWELL': 'West Central',
  'RAY': 'West Central',
  'CARROLL': 'West Central',
  'LAFAYETTE': 'West Central',
  'SALINE': 'West Central',
  'LIVINGSTON': 'West Central',
  'CHARITON': 'West Central',

  // Central Region
  'HOWARD': 'Central',
  'RANDOLPH': 'Central',
  'BOONE': 'Central',
  'CALLAWAY': 'Central',
  'AUDRAIN': 'Central',
  'MONTGOMERY': 'Central',
  'WARREN': 'Central',
  'LINCOLN': 'Central',
  'COLE': 'Central',
  'OSAGE': 'Central',
  'GASCONADE': 'Central',
  'FRANKLIN': 'Central',
  'COOPER': 'Central',
  'MONITEAU': 'Central',
  'MORGAN': 'Central',

  // St. Louis Metro
  'ST. LOUIS': 'St. Louis Metro',
  'ST. CHARLES': 'St. Louis Metro',
  'JEFFERSON': 'St. Louis Metro',
  'ST. LOUIS CITY': 'St. Louis Metro',

  // East Central
  'ST. FRANCOIS': 'East Central',
  'STE. GENEVIEVE': 'East Central',
  'WASHINGTON': 'East Central',
  'IRON': 'East Central',
  'MADISON': 'East Central',
  'REYNOLDS': 'East Central',
  'PERRY': 'East Central',

  // Southwest Region
  'JASPER': 'Southwest',
  'NEWTON': 'Southwest',
  'MCDONALD': 'Southwest',
  'BARRY': 'Southwest',
  'LAWRENCE': 'Southwest',
  'CHRISTIAN': 'Southwest',
  'STONE': 'Southwest',
  'TANEY': 'Southwest',
  'OZARK': 'Southwest',
  'DOUGLAS': 'Southwest',
  'WEBSTER': 'Southwest',
  'GREENE': 'Southwest',

  // South Central
  'CEDAR': 'South Central',
  'DADE': 'South Central',
  'POLK': 'South Central',
  'DALLAS': 'South Central',
  'LACLEDE': 'South Central',
  'WRIGHT': 'South Central',
  'TEXAS': 'South Central',
  'HOWELL': 'South Central',
  'SHANNON': 'South Central',
  'OREGON': 'South Central',
  'RIPLEY': 'South Central',
  'CARTER': 'South Central',
  'WAYNE': 'South Central',
  'BUTLER': 'South Central',

  // Southeast Region
  'BOLLINGER': 'Southeast',
  'CAPE GIRARDEAU': 'Southeast',
  'SCOTT': 'Southeast',
  'MISSISSIPPI': 'Southeast',
  'NEW MADRID': 'Southeast',
  'PEMISCOT': 'Southeast',
  'DUNKLIN': 'Southeast',
  'STODDARD': 'Southeast',

  // West Region
  'BATES': 'West',
  'VERNON': 'West',
  'BARTON': 'West',
  'ST. CLAIR': 'West',
  'HENRY': 'West',
  'JOHNSON': 'West',
  'BENTON': 'West',
  'PETTIS': 'West',
  'HICKORY': 'West',
  'CAMDEN': 'West',

  // South Region
  'MILLER': 'South',
  'MARIES': 'South',
  'PHELPS': 'South',
  'PULASKI': 'South',
  'CRAWFORD': 'South',
  'DENT': 'South',
};

export function getRegion(county: string): string {
  return MO_REGIONS[county.toUpperCase()] || 'Other';
}
