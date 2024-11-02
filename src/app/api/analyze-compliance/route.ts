import { NextResponse } from "next/server";
import OpenAI from 'openai';
import dotenv from "dotenv";

dotenv.config();

export async function POST(request: Request) {
  try {
    // Validar se a chave da API da OpenAI está configurada
    const openaiApiKey = process.env.OPENAI_API_KEY;
    console.log("Chave da API OpenAI:", openaiApiKey);  
    if (!openaiApiKey) {
      return NextResponse.json(
        { error: "Chave da API OpenAI não configurada" },
        { status: 500 }
      );
    }

    // Inicializar o cliente da OpenAI
    const openai = new OpenAI({
      apiKey: openaiApiKey,
    });

    // Obter os dados do corpo da requisição
    const portalData = await request.json();

    // Validar se existem dados para análise
    if (!portalData || (Array.isArray(portalData) && portalData.length === 0)) {
      return NextResponse.json(
        { error: "Nenhum dado fornecido para análise" },
        { status: 400 }
      );
    }

    // Preparar o prompt para a IA
    const systemPrompt = `
    Você é um assistente da Auditoria interna da Algar Holding e tem a responsabilidade de avaliar 
    retornos em json a partir de requisições feitas em API's do portal da transparência, os quais 
    possuem informações sobre a presença de CNPJ's nas listas públicas CEIS, CEPIM, CNEP e 
    Acordos de Leniência. Você deve analisar esses retornos JSON e retornar um parecer dizendo 
    se a Algar deve ou não estabelecer relações comerciais com aquele CNPJ. Quando for analisar 
    os JSON, seja crítico em relação ao conteúdo das informações.`;

    const userPrompt = `Por favor, analise os seguintes dados e forneça um parecer detalhado:
    ${JSON.stringify(portalData, null, 2)}`;

    // Fazer a chamada para a API da OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // ou "gpt-4" ou "gpt-3.5-turbo" dependendo da necessidade
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      temperature: 0.5,
      max_tokens: 1000
    });

    // Extrair a resposta da IA
    const aiResponse = completion.choices[0]?.message?.content || "Não foi possível gerar uma análise.";

    // Estruturar a resposta
    const analysis: AnalysisResult = {
      rawData: portalData,
      aiAnalysis: aiResponse,
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
      metadata: {
        model: completion.model,
        promptTokens: completion.usage?.prompt_tokens,
        completionTokens: completion.usage?.completion_tokens,
        totalTokens: completion.usage?.total_tokens
      }
    };

    // Opcional: Salvar a análise em um banco de dados ou sistema de logs
    // await saveAnalysisToDatabase(analysis);

    return NextResponse.json(analysis);

  } catch (error) {
    console.error("Erro ao processar análise:", error);
    return NextResponse.json(
      { 
        error: "Erro ao processar a análise", 
        details: error instanceof Error ? error.message : "Erro desconhecido"
      },
      { status: 500 }
    );
  }
}

// Função auxiliar para salvar a análise (implementar conforme necessidade)
// async function saveAnalysisToDatabase(analysis: AnalysisResult) {
//   // Implementar a lógica de salvamento no banco de dados
//   // Exemplo: MongoDB, PostgreSQL, etc.
//   console.log("Análise salva:", analysis.requestId);
// }

// Interfaces para tipagem
interface AnalysisResult {
  rawData: any;
  aiAnalysis: string;
  timestamp: string;
  requestId: string;
  metadata: {
    model: string;
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}