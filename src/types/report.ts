export interface MaterialProduction {
  ebooks: number;
  printedBooks: number;
}

export interface VisualIdentity {
  created: number;
}

export interface DiagrammedMaterial {
  platform: 'AVACEAD' | 'AVAMEC';
  program: string;
  quantity: number;
}

export interface ReportData {
  id: string;
  period: string;
  startDate: string;
  endDate: string;
  materialProduction: MaterialProduction;
  visualIdentity: VisualIdentity;
  diagrammedMaterials: DiagrammedMaterial[];
  createdAt: string;
}

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  platform?: 'AVACEAD' | 'AVAMEC' | 'all';
  program?: string;
}

export interface InstitutionInfo {
  name: string;
  sector: string;
  logo?: string;
}