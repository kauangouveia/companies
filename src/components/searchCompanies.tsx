'use client';

import { useState } from 'react';
import { Wrapper } from './wrapper';
import Image from 'next/image';
import searchIcon from '@/assets/search.png';
import { CeisData, LenienciaData } from '@/@types/data';
import { formatDocument } from '@/utils/formatData';

export const SearchCompanies = () => {
  const [document, setDocument] = useState('');
  const [isloading, setIsloading] = useState(false);
  const [data, setData] = useState<(CeisData | LenienciaData)[]>([]);
  const [errorInput, setErrorInput] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [resultIA, setResultIA] = useState("")


  const handleDocument = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedDocument = formatDocument(e.target.value);
    setErrorInput(false);
    setDocument(formattedDocument);
  };


  const transformArray = () => {
    const resultCeis = data.filter((item) => item.api === "CEIS")[0]
    const resultCnep = data.filter((item) => item.api === "CNEP")[0]
    const resultCepim = data.filter((item) => item.api === "CEPIM")[0]
    const resultLeniencia = data.filter((item) => item.api === "LENIENCIA")[0]

    return {
      resultCeis,
      resultCnep,
      resultCepim,
      resultLeniencia
    }
  }

  const fetchApiIA = async () => {

    const { resultCeis, resultCnep, resultCepim, resultLeniencia } = transformArray();

    try {

      const analysisResponse = await fetch('/api/analyze-compliance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ceisData: resultCeis,
          cnepData: resultCnep,
          cepimData: resultCepim,
          acordosData: resultLeniencia
        })
      })

      const analysisData = await analysisResponse.json();

      setResultIA(analysisData.aiAnalysis)
    } catch (error) {
      console.log("Erro ao processar dados", error);
      setResultIA("Erro ao processar dados")
    }

  }

  const fetchApisConcurrently = async (e: React.FormEvent) => {
    setData([])
    e.preventDefault();
    setIsloading(true);
    setNoResults(false); // Resetar mensagem de erro antes da busca

    try {
      const ceisPromise = fetch(`/api/ceis?${document.length > 14 ? "cnpj" : "cpf"}=${document}`);
      const lenienciaPromise = fetch(`/api/leniencia?cnpj=${document}`);
      const cnepPromise = fetch(`/api/cnep?${document.length > 14 ? "cnpj" : "cpf"}=${document}`);
      const cepimPromise = fetch(`/api/cepim?cnpj=${document}`);

      const responses = await Promise.allSettled([
        ceisPromise,
        lenienciaPromise,
        cnepPromise,
        cepimPromise,
      ]);

      const [resultCeis, resultLeniencia, resultCnep, resultCepim] = await Promise.all(
        responses.map(async (response, index) => {
          if (response.status === "fulfilled" && response.value.ok) {
            const data = await response.value.json();
            return [data]
          } else {
            console.error(`Erro ao buscar dados da API ${["CEIS", "Leniencia", "CNEP", "CEPIM"][index]}`);
            return [];
          }
        })
      );

      const allData = [
        ...resultCeis,
        ...resultLeniencia,
        ...resultCnep,
        ...resultCepim,
      ];

      const formatData = allData.map((item) => {
        if (item.portalData.length === 0) {
          return { analysis: item.analysis.error, metadata: item.metadata, api: item.api }
        }

        return item
      })

      setData(formatData);


    } catch (error) {
      setData([]);
      setNoResults(true); // Mostrar erro se ocorrer algum problema
      console.log("Erro ao processar dados", error);
    } finally {
      setIsloading(false);
    }
  };

  return (
    <div className="w-full h-auto bg-white flex flex-col justify-center items-center gap-4">
      <div className="h-72 md:min-h-[600px] p-8 md:p-10 w-full flex flex-col gap-14 items-center justify-center bg-gradient-to-l from-[#1E4C78] to-[#1E4C78] via-[#1E4C78]">
        <h2 className="font-bold text-2xl md:text-4xl text-white">
          🧠 Bem-vindo ao Inteli Diligence 🧠
        </h2>
        <p className="mt-[-30px] text-[25px] font-bold">
          Insira um CNPJ para iniciar sua pesquisa
        </p>
        <form
          className="relative w-auto flex items-center justify-center"
          onSubmit={fetchApisConcurrently}
        >
          <input
            placeholder="Buscar..."
            type="text"
            value={document}
            onChange={handleDocument}
            maxLength={18}
            className={`w-[300px] md:w-[700px] h-14 rounded-xl border ${errorInput ? "border-red-500" : "border-black"} pl-8 bg-white outline-none text-black`}
          />

          <button className="absolute right-0 mr-5">
            <Image src={searchIcon} alt="search" width={20} height={20} />
          </button>

        </form>
        {data.length > 0 &&
          <button
            className="w-full md:w-[700px] bg-blue-950 text-white h-11 p-4 flex items-center justify-center rounded-lg font-bold  hover:bg-opacity-85 transition-all"
            onClick={() => { fetchApiIA() }}
          >
            GERAR PARECER
          </button>}
      </div>
      {data.length > 0 &&
        <div className="w-full max-w-[700px] h-full flex items-center justify-center p-4 text-black">
          <p className="text-justify text-black text-sm">{resultIA}</p>
        </div>
      }
      {isloading ? (
        <div className="h-28 w-full flex items-center justify-center">
          <div className="w-12 h-12  border-8 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {noResults ? (
            <div className="w-full text-center text-red-500 font-bold">
              CNPJ não encontrado nas listas do portal da transparência.
            </div>
          ) : (
            data.map((item, index) => (
              <Wrapper apiSearched={item.api} json={item} key={index} />
            ))
          )}
        </>
      )}


    </div>
  );
};
