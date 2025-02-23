// src/types.ts
export interface Node {
  id: number;
  name: string;
  description?: string;
}

export interface MeasuringInstrument {
  id: number;
  node_id: number;
  vri_id: string;
  org_title: string;
  mit_number: string;
  mit_title: string;
  mit_notation: string;
  mi_modification?: string;
  mi_number: string;
  verification_date?: string;
  valid_date?: string;
  result_docnum: string;
}

export interface MeasuringInstrumentCreate {
  vri_id: string;
  org_title: string;
  mit_number: string;
  mit_title: string;
  mit_notation: string;
  mi_number: string;
  result_docnum: string;
  mi_modification?: string;
  verification_date?: string;
  valid_date?: string;
}
