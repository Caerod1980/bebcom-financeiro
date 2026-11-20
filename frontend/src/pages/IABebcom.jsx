import { iaService } from '../services/api';
import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  Loader,
  Sparkles,
  Brain,
  BarChart3,
  Wallet,
  Copy,
  Plus,
  Lightbulb,
  TrendingUp,
  AlertTriangle,
  SlidersHorizontal,
  CalendarClock,
} from 'lucide-react';
import toast from 'react-hot-toast';

const IABebcom = () => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);

  // MELHORIA 1.3-D — Controle do campo de digitação
  const questionInputRef = useRef(null);
  const sendingRef = useRef(false);
  
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        'Olá, Rodrigo. Eu sou a IA Bebcom, sua consultora gerencial. Posso ajudar a interpretar dados financeiros, fluxo de caixa, ticket médio, desempenho, despesas e estratégias da operação.',
    },
  ]);

  
  // MELHORIA 1.3-A — Rolagem automática da conversa
  const messagesContainerRef = useRef(null);

  // MELHORIA 1.3-C — Identifica a conversa atual
  const conversationIdRef = useRef(0);

  useEffect(() => {
    const container = messagesContainerRef.current;

    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages, loading]);


  
  
  // MELHORIA 1.4-B — Sugestões organizadas por assunto
  const suggestions = [
    {
      label: 'Fluxo de caixa',
      question: 'Como está meu fluxo de caixa?',
      icon: Wallet,
    },
    {
      label: 'Ticket médio',
      question: 'O que posso fazer para melhorar o ticket médio?',
      icon: TrendingUp,
    },
    {
      label: 'Riscos operacionais',
      question: 'Quais pontos merecem atenção na operação?',
      icon: AlertTriangle,
    },
    {
      label: 'Controle de despesas',
      question: 'Como posso reduzir despesas sem prejudicar a loja?',
      icon: SlidersHorizontal,
    },
    {
      label: 'Análise da DRE',
      question: 'Analise a DRE do último mês fechado.',
      icon: BarChart3,
    },
    {
      label: 'Contas a pagar',
      question: 'Quais são os compromissos financeiros pendentes?',
      icon: CalendarClock,
    },
  ];
 
  const handleAsk = async () => {
  // MELHORIA 1.3-D — Impedir envios simultâneos
  if (sendingRef.current) {
    return;
  }

  if (!question.trim()) {
    toast.error('Digite uma pergunta para a IA Bebcom.');
    return;
  }

  sendingRef.current = true;

  const currentQuestion = question;


  const requestConversationId = conversationIdRef.current; 

  const userMessage = {
    role: 'user',
    content: currentQuestion,
  };

  setMessages((prev) => [...prev, userMessage]);
  setQuestion('');
  setLoading(true);

  try {
    const response = await iaService.ask(currentQuestion);

    // Ignora respostas de conversas anteriores
    if (requestConversationId !== conversationIdRef.current) {
      return;
    }

    const data = response.data;

    const aiMessage = {
      role: 'assistant',
      content: data.answer,
    };

    setMessages((prev) => [...prev, aiMessage]);
   } catch (error) {
    if (requestConversationId !== conversationIdRef.current) {
      return;
    }

    console.error(error);

    toast.error(
      error.message || 'Erro ao consultar a IA Bebcom.'
    );
   
  } finally {
    if (requestConversationId === conversationIdRef.current) {
      sendingRef.current = false;
      setLoading(false);

      // Devolve o foco ao campo após a resposta
      questionInputRef.current?.focus();
    }
  }

}; 

   // MELHORIA 1.3-E — Foco nas perguntas sugeridas
    const handleSuggestion = (text) => {
    setQuestion(text);
    questionInputRef.current?.focus();
  };


  // MELHORIA 1.5-E — Destaque visual de valores monetários
  const renderFinancialValues = (text) => {
    if (typeof text !== 'string') {
      return text;
    }

    // Reconhece valores em reais no padrão brasileiro
    const currencyPattern =
      /R\$\s*-?(?:(?:\d{1,3}(?:\.\d{3})+)|\d+),\d{2}/g;

    return text.split(currencyPattern).flatMap((part, index, parts) => {
      const matches = [...text.matchAll(currencyPattern)];

      if (index === parts.length - 1) {
        return [part];
      }

      return [
        part,
        <span
          key={`currency-${index}`}
          className="font-semibold text-gray-900"
        >
          {matches[index][0]}
        </span>,
      ];
    });
  };

  
  // MELHORIA 1.5-A — Formatação visual segura das respostas
  const renderMessageContent = (content) => {
    if (typeof content !== 'string') {
      return content;
    }

    
    // MELHORIA 1.5-D — Reduzir espaços excessivos na exibição
    const lines = content.split('\n');

    return lines.map((line, index) => {
      const trimmedLine = line.trim();

      // Identifica linhas vazias próximas aos separadores
      const previousLine = lines[index - 1]?.trim() || '';
      const nextLine = lines[index + 1]?.trim() || '';

      const separatorPattern = /^[━─—-]{5,}$/;

      const isBlankNearSeparator =
        trimmedLine === '' &&
        (
          separatorPattern.test(previousLine) ||
          separatorPattern.test(nextLine)
        );


       // MELHORIA 1.5-C — Identificar separadores de seções
      const isSeparator = /^[━─—-]{5,}$/.test(trimmedLine);

      // MELHORIA 1.5-B — Reconhecer títulos principais
      const isMainTitle =
        /^(?:🚨\s*)?RADAR DE RISCO OPERACIONAL\b/i.test(trimmedLine) ||
        /^ANÁLISE (?:DA |DE )?DRE\b/i.test(trimmedLine);

      const isTitle =
        trimmedLine.length >= 5 &&
        trimmedLine.length <= 80 &&
        /[A-ZÁÉÍÓÚÂÊÔÃÕÇ]/.test(trimmedLine) &&
        trimmedLine === trimmedLine.toLocaleUpperCase('pt-BR') &&
        !/\d/.test(trimmedLine) &&
        !/[.!?]$/.test(trimmedLine);

      
      // Oculta apenas a linha vazia imediatamente próxima
      // a um separador, preservando o texto original.
      if (isBlankNearSeparator) {
        return null;
      }

      return (
        <React.Fragment key={index}>
          {index > 0 && '\n'}

         
          {isSeparator ? (
            <span
              className="block border-t border-gray-200 my-1"
              aria-hidden="true"
            />
          ) : isMainTitle ? (
            <span className="font-bold text-amber-700">
              {line}
            </span>
       
          ) : isTitle ? (
            <span className="font-bold text-gray-900">
              {line}
            </span>
          ) : (
            renderFinancialValues(line)
          )}

        </React.Fragment>
      );
    });
  };
  
  // MELHORIA 1.3-B — Copiar respostas da IA
  const handleCopyMessage = async (content) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success('Resposta copiada!');
    } catch (error) {
      console.error(error);
      toast.error('Não foi possível copiar a resposta.');
    }
  };

  
  // MELHORIA 1.3-C — Iniciar nova conversa
  const handleNewConversation = () => {
  conversationIdRef.current += 1;
  sendingRef.current = false;

    setMessages([
      {
        role: 'assistant',
        content:
          'Olá, Rodrigo. Eu sou a IA Bebcom, sua consultora gerencial. Posso ajudar a interpretar dados financeiros, fluxo de caixa, ticket médio, desempenho, despesas e estratégias da operação.',
      },
    ]);

    setQuestion('');
    setLoading(false);

    toast.success('Nova conversa iniciada!');
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
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Conversa com a IA
            </h2>

            <button
              type="button"
              onClick={handleNewConversation}
              className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition"
              title="Iniciar nova conversa"
            >
              <Plus className="w-4 h-4" />
              <span>Nova conversa</span>
            </button>
          </div>


          <p className="text-sm text-gray-600 mt-1">
            Pergunte sobre finanças, fluxo, ticket médio, operação, marketing e gestão.
          </p>
        </div>

        
        <div
          ref={messagesContainerRef}
          className="p-5 space-y-4 min-h-[180px] max-h-[520px] overflow-y-auto bg-gray-50"
        >

          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
             
              <div className={`max-w-3xl rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                message.role === 'user'
                  ? 'bg-amber-600 text-white'
                  : 'bg-white text-gray-800 border shadow-sm'
              }`}>
               {message.role === 'assistant'
                  ? renderMessageContent(message.content)
                  : message.content}

                {message.role === 'assistant' && (
                  <div className="flex justify-end mt-3 pt-2 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => handleCopyMessage(message.content)}
                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-amber-600 transition"
                      title="Copiar resposta"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Copiar
                    </button>
                  </div>
                )}
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

          {/* MELHORIA 1.4-B — Sugestões visuais */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-semibold text-gray-700">
                Sugestões para começar
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {suggestions.map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => handleSuggestion(item.question)}
                    title={item.question}
                    className="flex items-center gap-2 px-3 py-3 text-left text-xs font-medium rounded-xl border border-gray-200 bg-gray-50 text-gray-700 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 transition"
                  >
                    <Icon className="w-4 h-4 flex-shrink-0 text-amber-600" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            
            {/* MELHORIA 1.3-D — Digitação inteligente */}
            <textarea
              ref={questionInputRef}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (
                  e.key === 'Enter' &&
                  !e.shiftKey &&
                  !e.nativeEvent.isComposing
                ) {
                  e.preventDefault();

                  if (!loading && !sendingRef.current) {
                    handleAsk();
                  }
                }
              }}
              className="input-field flex-1"
              rows={2}
              placeholder="Digite sua pergunta para a IA Bebcom..."
              aria-label="Pergunta para a IA Bebcom"
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
