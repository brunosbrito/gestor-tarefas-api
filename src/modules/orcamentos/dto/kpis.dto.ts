import { IsString, IsOptional } from 'class-validator';

export class KpisFiltroDto {
  @IsString()
  @IsOptional()
  mesAno?: string; // Formato: "YYYY-MM"
}

export interface KpisResponse {
  mesAno: string;
  qtdOrcamentos: number;
  valorOrcamentos: number;
  taxaConversao: number | null;
  margemBruta: number | null;
  margemLiquida: number | null;
  acoes5S: number;
  // Dados auxiliares
  qtdAprovados: number;
  qtdRejeitados: number;
  qtdEmAnalise: number;
  qtdRascunho: number;
  valorAprovados: number;
  // Tendência (últimos 6 meses)
  tendencia: Array<{
    mesAno: string;
    label: string;
    qtdOrcamentos: number;
    valorOrcamentos: number;
  }>;
}
