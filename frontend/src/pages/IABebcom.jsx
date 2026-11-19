import { iaService } from '../services/api';
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

  const currentQuestion = question;

  const userMessage = {
    role: 'user',
    content: currentQuestion,
  };

  setMessages((prev) => [...prev, userMessage]);
  setQuestion('');
  setLoading(true);

  try {
    const response = await iaService.ask(currentQuestion);

    const data = response.data;

    const aiMessage = {
      role: 'assistant',
      content: data.answer,
    };

    setMessages((prev) => [...prev, aiMessage]);
  } catch (error) {
    console.error(error);

    toast.error(
      error.message || 'Erro ao consultar a IA Bebcom.'
    );
  } finally {
    setLoading(false);
  }
}; 

  const handleSuggestion = (text) => {
    setQuestion(text);
  };

  return (
    <div className="p-3 sm:p-4 md:p-6">
     
      {/* MELHORIA VISUAL 1.2 — Cabeçalho compacto */}
      <div className="mb-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-amber-100 rounded-2xl">
            <Bot className="w-7 h-7 text-amber-600" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              IA Bebcom
            </h1>
            <p className="text-sm text-gray-600">
              Sua consultora de inteligência gerencial
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          <div className="flex items-center gap-2 px-3 py-2 bg-white border rounded-xl shadow-sm">
            <Brain className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-semibold text-gray-700">
              Consultoria Gerencial
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 bg-white border rounded-xl shadow-sm">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-semibold text-gray-700">
              Leitura Segura
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 bg-white border rounded-xl shadow-sm">
            <Wallet className="w-4 h-4 text-green-600" />
            <span className="text-xs font-semibold text-gray-700">
              Decisão Estratégica
            </span>
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

        <div className="p-5 space-y-4 min-h-[180px] max-h-[520px] overflow-y-auto bg-gray-50">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div className={`max-w-3xl rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                message.role === 'user' ? 'bg-amber-600 text-white' : 'bg-white text-gray-800 border shadow-sm'
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
