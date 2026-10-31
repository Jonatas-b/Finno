// Regras de cálculo do Finno
import { filtrarDespesas, filtrarReceitas, filtrarPorMesECategoria, somarValores } from "./filtros.js";

const META_PERCENTUAL_PADRAO = 50;

// Converte userConfig.alerta para número
export function lerMetaPercentual(alerta) {
  const meta = parseInt(alerta, 10);
  return Number.isNaN(meta) ? META_PERCENTUAL_PADRAO : meta;
}

// Devolve null quando não existe salário válido (zero, negativo ou ausente)
export function calcularPercentual(valor, salario) {
  if (!(salario > 0)) return null;
  return (valor / salario) * 100;
}

export function resumirTransacoes(lista) {
  return {
    gasto: somarValores(filtrarDespesas(lista)),
    receita: somarValores(filtrarReceitas(lista)),
  };
}

// O salário só vale para o mês atual e posteriores, e só quando há mês escolhido (filtro do histórico)
export function mesTemSalario(mesFiltrado, mesAtual) {
  return mesFiltrado !== "" && mesFiltrado >= mesAtual;
}

export function textoPercentualRestante(percentual) {
  const arredondado = Math.round(percentual);
  return arredondado >= 0
    ? `${arredondado}% restante`
    : `Excedeu ${Math.abs(arredondado)}%`;
}

// Resumo que alimenta os cards. Depende só do mês (mês vazio = todo o período)
export function calcularResumoDoMes(transacoes, mesFiltrado, mesAtual, salario, alerta) {
  const doMes = filtrarPorMesECategoria(transacoes, mesFiltrado, "todos");
  const { gasto, receita } = resumirTransacoes(doMes);
  const meta = lerMetaPercentual(alerta);
  const mostraSalario = mesTemSalario(mesFiltrado, mesAtual);

  if (!mostraSalario) {
    return {
      mostraSalario,
      gasto,
      receita,
      saldo: null,
      percentualGasto: null,
      percentualRestante: null,
      meta,
      metaEstourada: false,
    };
  }

  const saldo = salario - gasto + receita;
  const percentualGasto = calcularPercentual(gasto, salario);
  const percentualRestante = calcularPercentual(saldo, salario);

  return {
    mostraSalario,
    gasto,
    receita,
    saldo,
    percentualGasto,
    percentualRestante,
    meta,
    metaEstourada: percentualGasto !== null && percentualGasto > meta,
  };
}