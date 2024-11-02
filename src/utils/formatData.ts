import { CeisData, LenienciaData } from "@/@types/data";

export const transformDataCies = (ceisData: any[]): CeisData[] => {
  return ceisData.map((originalData) => ({
    id: originalData.id,
    api: "CEIS",
    dataInicioSancao: originalData.dataInicioSancao,
    dataFimSancao: originalData.dataFimSancao,
    descricaoResumida: originalData.tipoSancao.descricaoResumida,
    nomeExibicao: originalData.fonteSancao.nomeExibicao,
    descricao: originalData.fundamentacao[0]?.descricao || "Sem descrição",
    sancionadoNome: originalData.sancionado.nome,
    cnpjFormatado: originalData.sancionado.codigoFormatado,
    numeroProcesso: originalData.numeroProcesso,
  }));
};

export const transformDataLeniencia = (
  lenienciaData: any[]
): LenienciaData[] => {
  return lenienciaData.map((originalData) => ({
    id: originalData.id,
    api: "leniencia",
    dataInicioAcordo: originalData.dataInicioAcordo,
    dataFimAcordo: originalData.dataFimAcordo,
    orgaoResponsavel: originalData.orgaoResponsavel,
    situacaoAcordo: originalData.situacaoAcordo,
    sancoes: [
      {
        nomeInformadoOrgaoResponsavel:
          originalData.sancoes[0].nomeInformadoOrgaoResponsavel,
        razaoSocial: originalData.sancoes[0].razaoSocial,
        cnpjFormatado: originalData.sancoes[0].cnpjFormatado,
      },
    ],
  }));
};

export const transformDataCnep = (cnepData: any[]): any[] => {
  return cnepData.map((originalData) => ({
    id: originalData.id,
    api: "Cnep",
    ...originalData,
  }));
};

export const transformDataCepim = (cepimData: any[]): any[] => {
  return cepimData.map((originalData) => ({
    id: originalData.id,
    api: "Cepim",
    ...originalData,
  }));
};

export const transformDataCeaf = (ceafData: any[]): any[] => {
  return ceafData.map((originalData) => ({
    id: originalData.id,
    api: "Ceaf",
    ...originalData,
  }));
};

export const formatDocument = (value: string): string => {
  const numbersOnly = value.replace(/\D/g, "");

  if (numbersOnly.length <= 11) {
    // Formatação para CPF
    if (numbersOnly.length <= 3) return numbersOnly;
    if (numbersOnly.length <= 6) return `${numbersOnly.slice(0, 3)}.${numbersOnly.slice(3)}`;
    if (numbersOnly.length <= 9) return `${numbersOnly.slice(0, 3)}.${numbersOnly.slice(3, 6)}.${numbersOnly.slice(6)}`;
    return `${numbersOnly.slice(0, 3)}.${numbersOnly.slice(3, 6)}.${numbersOnly.slice(6, 9)}-${numbersOnly.slice(9, 11)}`;
  } else {
    // Formatação para CNPJ
    if (numbersOnly.length <= 2) return numbersOnly;
    if (numbersOnly.length <= 5) return `${numbersOnly.slice(0, 2)}.${numbersOnly.slice(2)}`;
    if (numbersOnly.length <= 8) return `${numbersOnly.slice(0, 2)}.${numbersOnly.slice(2, 5)}.${numbersOnly.slice(5)}`;
    if (numbersOnly.length <= 12) return `${numbersOnly.slice(0, 2)}.${numbersOnly.slice(2, 5)}.${numbersOnly.slice(5, 8)}/${numbersOnly.slice(8)}`;
    return `${numbersOnly.slice(0, 2)}.${numbersOnly.slice(2, 5)}.${numbersOnly.slice(5, 8)}/${numbersOnly.slice(8, 12)}-${numbersOnly.slice(12, 14)}`;
  }
};