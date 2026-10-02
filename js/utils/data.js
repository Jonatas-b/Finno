import { capitalizar } from "./texto.js";
import { formatarComoMoeda } from "./moeda.js";
import { somarValores } from "./filtros.js";

// Criar um objeto Date com a data e hora atuais
export function exibirDataAtual() {

    const agora = new Date();

    // Obter partes da data
    const dia = agora.getDate();
    const mes = agora.getMonth() + 1;
    const ano = agora.getFullYear();

    const monthNameLong = capitalizar(agora.toLocaleString('pt-BR', {month: 'long'}));
    const monthNameShort = capitalizar(agora.toLocaleString('pt-BR', {month: 'short'}));

    // Extrai apenas "YYYY-MM"
    let mesAnoAtual = agora.toISOString().slice(0, 7);

    document.getElementById('mesAbreviado').innerText = `${monthNameShort.slice(0, -1)} / ${ano}`;
    document.getElementById('msgMesAno').innerText = `Resumo de ${monthNameLong} de ${ano}`;

    document.getElementById('nomeMesTabela').innerText = monthNameLong + " " + ano;
    document.getElementById('mesAtualTabelaHistorico').innerText = monthNameLong + " " + ano;
    document.getElementById('dataAtualAnalise').innerText = `${monthNameLong} ${ano} · gráficos e recomendações`;

    return mesAnoAtual
}

export function converterParaFormatoBR(dataISO) {
    if (typeof dataISO !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dataISO)) {
        console.error("Formato inválido. Use 'YYYY-MM-DD'.");
        return null;
    }

    const [ano, mes, dia] = dataISO.split("-");
    return `${dia}/${mes}/${ano}`;
}
