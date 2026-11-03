import React from 'react';
import type { FinalSuccessModalProps } from '../../types/componentes';

const configuracoes = {
  cadastro: {
    titulo: 'Cadastro Realizado com Sucesso!',
    mensagem: 'Em breve entraremos em contato com você, fique atento ao e-mail ou ao telefone que você informou.',
    botao: 'Entendido',
    tema: 'verde',
    mostrarDetalhes: true,
    mostrarFechar: false,
  },
  preCadastroB2c: {
    titulo: 'Pré-cadastro feito com sucesso!',
    mensagem: '',
    botao: 'Entendido',
    tema: 'verde',
    mostrarDetalhes: false,
    mostrarFechar: false,
  },
  qualificacao: {
    titulo: 'Dados enviados com sucesso!',
    mensagem: 'Valeu pelas informações adicionais! 💙',
    botao: 'Ok',
    tema: 'azul',
    mostrarDetalhes: false,
    mostrarFechar: true,
  },
} as const;

/** Apresenta a confirmação final de acordo com o fluxo concluído. */
export default function ModalSucesso({
  aberta,
  tipo,
  emailReferencia,
  senha,
  aoFechar,
}: FinalSuccessModalProps) {
  if (!aberta) return null;

  const config = configuracoes[tipo];
  const cores = config.tema === 'azul'
    ? { titulo: 'text-blue-900', botao: 'bg-blue-600 hover:bg-blue-700' }
    : { titulo: 'text-green-600', botao: 'bg-green-600 hover:bg-green-700' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div
        className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-2xl max-w-md w-full"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-sucesso-titulo"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id="modal-sucesso-titulo" className={`text-xl font-bold mb-3 ${cores.titulo}`}>
            {config.titulo}
          </h2>
          {config.mostrarFechar && (
            <button
              type="button"
              onClick={aoFechar}
              className="text-gray-400 hover:text-gray-600 transition text-2xl font-bold leading-none cursor-pointer"
              aria-label="Fechar"
            >
              &times;
            </button>
          )}
        </div>

        {config.mensagem && (
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">{config.mensagem}</p>
        )}

        {config.mostrarDetalhes && (
          <div className="bg-zinc-100 dark:bg-zinc-800 p-3 rounded-lg mb-6 space-y-1 text-sm text-zinc-700 dark:text-zinc-300">
            {emailReferencia && (
              <p>
                <strong className="text-zinc-900 dark:text-zinc-100">E-mail referência:</strong>{' '}
                {emailReferencia}
              </p>
            )}
            {senha && (
              <p>
                <strong className="text-zinc-900 dark:text-zinc-100">Senha cadastrada:</strong>{' '}
                {senha}
              </p>
            )}
          </div>
        )}

        <button
          onClick={aoFechar}
          className={`w-full py-2 px-4 text-white rounded-lg transition-colors font-medium cursor-pointer ${cores.botao}`}
        >
          {config.botao}
        </button>
      </div>
    </div>
  );
}
