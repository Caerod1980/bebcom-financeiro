import React, { useState } from 'react';
import {
  Bot,
  Send,
  Loader,
  Sparkles,
  Brain,
  BarChart3,
  Wallet,
} from 'lucide-react';
import toast from 'react-hot-toast';

const IABebcom = () => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        'Olá, Rodrigo. Eu sou a IA Bebcom, sua consultora gerencial. Posso ajudar a interpretar dados financeiros, fluxo de caixa, ticket médio, desempenho, despesas e estratégias da operação.',
    },
  ]);

  const suggestions = [
    'Como está meu fluxo de caixa?',
    'O que posso fazer para melhorar o ticket médio?',
    'Quais pontos merecem atenção na operação?',
    'Como posso reduzir despesas sem prejudicar a loja?',
  ];

  const handleAsk = async () => {
    if (!question.trim()) {
      toast.error('Digite uma pergunta para a IA Bebcom.');
      return;
    }

    const userMessage = {
      role: 'user',
      content: question,
    };

    setMessages((prev) => [...prev, userMessage]);
    setQuestion('');
    setLoading(true);

    try {
      // Resposta inicial simulada.
      // Na próxima etapa conectaremos ao backend e aos dados reais.
      const aiMessage = {
        role: 'assistant',
        content:
          'Análise inicial: nesta primeira fase, estou pronta para atuar como consultora gerencial. Na próxima etapa vou me conectar aos dados reais do Bebcom Financeiro para analisar DRE, fluxo de caixa, contas, estoque e relatório gerencial com segurança, apenas em modo leitura.',
      };

      setTimeout(() => {
        setMessages((prev) => [...prev, aiMessage]);
        setLoading(false);
      }, 700);
    } catch (error) {
      toast.error('Erro ao consultar a IA Bebcom.');
      console.error(error);
      setLoading(false);
    }
  };

  const handleSuggestion = (text) => {
    setQuestion(text);
  };

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <div className="flex flex-col lg:flex-row justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bot className="w-7 h-7 text-amber-600" />
            IA Bebcom
          </h1>

          <p className="text-sm text-gray-600 mt-1">
            Consultora gerencial para análise financeira, operacional e estratégica
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 text-amber-600 p-3 rounded-xl">
              <Brain className="w-6 h-6" />
            </div>

            <div>
              <p className="text-sm text-gray-500">Modo</p>
              <h3 className="font-bold text-gray-900">
                Consultoria Gerencial
              </h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 text-blue-600 p-3 rounded-xl">
              <BarChart3 className="w-6 h-6" />
            </div>

            <div>
              <p className="text-sm text-gray-500">Dados</p>
              <h3 className="font-bold text-gray-900">
                Leitura Segura
              </h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 text-green-600 p-3 rounded-xl">
              <Wallet className="w-6 h-6" />
            </div>

            <div>
              <p className="text-sm text-gray-500">Objetivo</p>
              <h3 className="font-bold text-gray-900">
                Decisão Estratégica
              </h3>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="p-5 border-b">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Conversa com a IA
          </h2>

          <p className="text-sm text-gray-600 mt-1">
            Pergunte sobre finanças, fluxo, ticket médio, operação, marketing e gestão.
          </p>
        </div>

        <div className="p-5 space-y-4 min-h-[420px] bg-gray-50">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-3xl rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  message.role === 'user'
                    ? 'bg-amber-600 text-white'
                    : 'bg-white text-gray-800 border shadow-sm'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border shadow-sm rounded-2xl px-4 py-3 flex items-center gap-2 text-sm text-gray-600">
                <Loader className="w-4 h-4 animate-spin text-amber-500" />
                IA Bebcom analisando...
              </div>
            </div>
          )}
        </div>

        <div className="p-5 border-t bg-white">
          <div className="flex flex-wrap gap-2 mb-4">
            {suggestions.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => handleSuggestion(item)}
                className="px-3 py-2 text-xs rounded-full bg-gray-100 hover:bg-amber-100 text-gray-700 hover:text-amber-700 transition"
              >
                {item}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="input-field flex-1"
              rows="2"
              placeholder="Digite sua pergunta para a IA Bebcom..."
            />

            <button
              type="button"
              onClick={handleAsk}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
            >
              {loading ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Perguntar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IABebcom;
