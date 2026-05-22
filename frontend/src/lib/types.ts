export type StartupSource =
  | "Entrackr"
  | "VCCircle"
  | "Y Combinator"
  | "Product Hunt"
  | "Manual CSV Upload";

export type PriorityLevel = "Critical" | "High" | "Medium" | "Low";

export type ICICIEntity =
  | "ICICI Bank"
  | "ICICI Lombard"
  | "ICICI Prudential Life"
  | "ICICI Securities"
  | "ICICI AMC"
  | "ICICI Housing Finance";

export interface Startup {
  id: string;
  name: string;
  country: string;
  sector: string;
  subsector: string;
  source: StartupSource;
  bfsi_relevance_score: number;
  enterprise_readiness_score: number;
  priority_level: PriorityLevel;
  icici_entity_mapping: ICICIEntity[];
  website?: string;
  description?: string;
  founded_year?: number;
  funding_stage?: string;
  total_funding_usd?: number;
  employee_count?: string;
  founders?: string[];
  ai_analysis?: string;
  ai_strengths?: string[];
  ai_risks?: string[];
  ai_recommended_action?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DiscoveryFilters {
  source?: StartupSource;
  geography?: string;
  sector?: string;
  subsector?: string;
  count?: number;
  min_bfsi_score?: number;
  priority?: PriorityLevel;
}

export interface DashboardMetrics {
  total_startups: number;
  high_priority_count: number;
  avg_bfsi_score: number;
  sources_active: number;
  by_source: { source: string; count: number }[];
  by_sector: { sector: string; count: number }[];
  by_priority: { priority: string; count: number }[];
}
