import type { Metadata } from "next";

/**
 * Importação do componente de formulário de pré-cadastro utilizando o alias de caminho configurado.
 */
import FormularioPreCadastro from "@components/forms/FormularioPreCadastro";


export const metadata: Metadata = {
  title: "Voluntário global",
  description: "Formulário para voluntariado global",
};

/**
 * Componente da página/seção de Voluntário Global responsável por renderizar o formulário de pré-cadastro.
 */
const VoluntarioGlobal = () => {
    return (
        <main>
            <div className="w-full max-w-4xl mx-auto p-6 mt-10 bg-white shadow-lg rounded-xl">
                <FormularioPreCadastro />
            </div>
        </main>
    );
};

export default VoluntarioGlobal;