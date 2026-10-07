import { getUserConfig } from "./usuario.js";

function pertenceAoMes(transacao, mesReferencia) {
  return transacao.data.slice(0, 7) === mesReferencia;
}

function ehReceita(transacao) {
  return transacao.categoria === "receita";
}

export function filtrarPorMesETipo(mesReferencia, tipo) {
  const userConfig = getUserConfig();

  return userConfig.transacoes.filter(transacao => {
    const mesCorresponde = pertenceAoMes(transacao, mesReferencia);
    const tipoCorresponde = tipo === "receita" ? ehReceita(transacao) : !ehReceita(transacao);
    return mesCorresponde && tipoCorresponde;
  });
}

export function somarValores(transacoes) {
  return transacoes.reduce((acumulador, transacao) => acumulador + transacao.valor, 0);
}