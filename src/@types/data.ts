export interface CeisData {
  id: string;
  api: string;
  dataInicioSancao: string;
  dataFimSancao: string;
  descricaoResumida: string;
  nomeExibicao: string;
  descricao: string;
  sancionadoNome: string;
  cnpjFormatado: string;
  numeroProcesso: string;
}

export interface LenienciaData {
  id: string;
  api: string;
  dataInicioAcordo: string;
  dataFimAcordo: string;
  orgaoResponsavel: string;
  situacaoAcordo: string;
  sancoes: [
    {
      nomeInformadoOrgaoResponsavel: string;
      razaoSocial: string;
      cnpjFormatado: string;
    }
  ];
}