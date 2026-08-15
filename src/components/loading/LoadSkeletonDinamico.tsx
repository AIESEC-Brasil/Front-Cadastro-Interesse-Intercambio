import React from 'react';

interface LoadSkeletonProps {
  aberta: boolean;
  // Cada número no array representa quantas colunas aquela linha vai ter (ex: [2, 1, 3, 4])
  layoutLinhas?: number[]; 
}

export default function LoadSkeletonDinamico({ 
  aberta, 
  layoutLinhas = [2, 1, 1] // Padrão caso não passe nada
}: LoadSkeletonProps) {
  if (!aberta) return null;

  // Função auxiliar para mapear o número de colunas para a classe correta do Tailwind
  const obterClasseGrid = (colunas: number) => {
    switch (colunas) {
      case 2: return 'grid-cols-1 sm:grid-cols-2';
      case 3: return 'grid-cols-1 sm:grid-cols-3';
      case 4: return 'grid-cols-1 sm:grid-cols-4';
      default: return 'grid-cols-1'; // 1 coluna (full)
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full animate-pulse">
      {/* Linhas geradas dinamicamente com base nas colunas solicitadas */}
      <div className="flex flex-col gap-4">
        {layoutLinhas.map((qtdColunas, indexLinha) => (
          <div 
            key={indexLinha} 
            className={`grid ${obterClasseGrid(qtdColunas)} gap-4`}
          >
            {/* Cria a quantidade exata de inputs simulados para aquela linha */}
            {Array.from({ length: qtdColunas }).map((_, indexCampo) => (
              <div key={indexCampo} className="flex flex-col gap-2">
                <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3"></div>
                <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded-lg w-full"></div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Botão de carregamento */}
      <div className="mt-2 flex">
        <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded-lg w-full"></div>
      </div>
    </div>
  );
}