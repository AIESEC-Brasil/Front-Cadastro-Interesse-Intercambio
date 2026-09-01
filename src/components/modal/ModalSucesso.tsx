/**
 * @file ModalSucesso.tsx
 * @description Modal de sucesso dinâmica com botão de fechar (×) e dois botões no rodapé (Editar dados e Confirmar), totalmente em português.
 */
import ButtonEditar from '../ui/buttons/ButtonEditar';
import ButtonConfirmar from '../ui/buttons/ButtonConfirmar';
import type { SummaryModalProps } from '../../type/componentes';

/**
 * Confirmação intermediária antes do envio.
 *
 * Fechar ou editar chama `aoEditar`; confirmar chama `aoConfirmar`. O modal não
 * conhece a API: ele apenas apresenta o resumo recebido e delega a decisão ao
 * hook que controla o formulário.
 */
const ModalSucesso = ({
    aberta,
    titulo = "Confirme seus dados",
    mensagem,
    resumoDados,
    aoEditar,
    aoConfirmar
}: SummaryModalProps) => {
    if (!aberta) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden relative">
                
                {/* Cabeçalho com o botão X para fechar */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-blue-900 truncate pr-2">{titulo}</h3>
                    <button 
                        onClick={aoEditar}
                        className="text-gray-400 hover:text-gray-600 transition text-2xl font-bold leading-none cursor-pointer shrink-0"
                        aria-label="Fechar"
                    >
                        &times;
                    </button>
                </div>

                {/* Corpo da Modal com limitação de altura responsiva */}
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    {mensagem && <p className="text-gray-700 mb-4 whitespace-pre-line">{mensagem}</p>}

                    {/* Exibe o resumo estruturado */}
                    {resumoDados && (
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-3 max-w-full">
                            {Object.entries(resumoDados).map(([chave, valor], index) => (
                                <div key={index} className="text-sm border-b border-gray-200/60 pb-2 last:border-0 last:pb-0 min-w-0">
                                    <strong className="text-gray-700 block mb-0.5">{chave}:</strong>
                                    
                                    {/* Se o valor for um array */}
                                    {Array.isArray(valor) ? (
                                        <ul className="list-disc list-inside pl-2 space-y-0.5 text-gray-600">
                                            {valor.map((item, idx) => (
                                                <li key={idx} className="truncate" title={String(item)}>
                                                    {String(item)}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <span 
                                            className="text-gray-600 block pl-2 truncate" 
                                            title={String(valor)}
                                        >
                                            {String(valor)}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Rodapé */}
                <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
                    <ButtonEditar 
                        texto="Editar dados" 
                        aoClicar={aoEditar} 
                    />
                    <ButtonConfirmar 
                        texto="Confirmar" 
                        aoClicar={aoConfirmar} 
                    />
                </div>
            </div>
        </div>
    );
};

export default ModalSucesso;