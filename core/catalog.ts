export interface Region {
  id: string;
  code: string;
  city: string;
  country: string;
  planCount: number;
}

/** Prices are decimal strings in USD excluding taxes: hourly with 4 decimals, monthly with 2. */
export interface Plan {
  id: string;
  code: string;
  regionCode: string;
  cpuCount: number;
  cpuDescription: string;
  ramGb: number;
  diskDescription: string;
  bandwidthDescription: string;
  hourlyPrice: string;
  monthlyPrice: string;
  soldOut: boolean;
  /** Image codes the Plan can be installed with. */
  images: string[];
}

export interface Image {
  id: string;
  code: string;
  name: string;
  family: string;
  version: string;
}
