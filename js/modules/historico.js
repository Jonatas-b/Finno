import { filtrarPorMesECategoria, somarValores } from "./filtros.js";
import { calcularResumoDoMes } from "./calculos.js";
import { getUserConfig } from "./usuario.js";
import { obterMesAtual, converterDataParaEscrita } from "../utils/data.js";
import { criarLinhaTabelaHistorico, exibirBadgeRestante } from "./transacoes.js";
import { formatarComoMoeda } from "../utils/moeda.js";
import { categorias } from "../utils/categorias.js";

function mostrar(elemento, visivel) {
  elemento.style.display = visivel ? "" : "none";
}

function escrever(id, texto) {
  document.getElementById(id).innerText = texto;
}

function tituloDoMes(mesFiltrado) {
  return mesFiltrado === "" ? "Todos os meses" : converterDataParaEscrita(mesFiltrado);
}

function desenharTabela(lista, titulo) {
  const tbody = document.getElementById("tabelaLancamentosHistorico");

  escrever("mesAtualTabelaHistorico", titulo);
  tbody.innerHTML = "";

  if (lista.length === 0) {
    tbody.insertAdjacentHTML("beforeend", `<tr><td colspan="5">Nenhum resultado encontrado.</td></tr>`);
    return;
  }

  lista.forEach(criarLinhaTabelaHistorico);
}

// Os cards dependem só do mês
function desenharCards(resumo, salario) {
  const badgeGasto = document.getElementById("percentualGastoHistorico");
  const badgeRestante = document.getElementById("percentualSalarioRestanteHistorico");

  escrever("totalGastoHistorico", formatarComoMoeda(resumo.gasto));
  mostrar(document.getElementById("cardSalarioHistorico"), resumo.mostraSalario);

  if (!resumo.mostraSalario) {
    escrever("textoSaldoRestante", "TOTAL RECEITA");
    escrever("saldoRestanteHistorico", formatarComoMoeda(resumo.receita));
    mostrar(badgeGasto, false);
    mostrar(badgeRestante, false);
    return;
  }

  escrever("salarioHistorico", formatarComoMoeda(salario));
  escrever("textoSaldoRestante", "SALDO RESTANTE");
  escrever("saldoRestanteHistorico", formatarComoMoeda(resumo.saldo));

  mostrar(badgeGasto, resumo.percentualGasto !== null);
  if (resumo.percentualGasto !== null) {
    badgeGasto.innerText = `${Math.round(resumo.percentualGasto)}% do salário`;
  }

  mostrar(badgeRestante, true);
  exibirBadgeRestante("percentualSalarioRestanteHistorico", resumo);
}

// Linha acima da tabela, só quando há categoria filtrada.
function desenharTotalDaCategoria(listaDaTabela, categoriaFiltrada) {
  const linha = document.getElementById("totalCategoriaFiltrada");
  const filtrando = categoriaFiltrada !== "todos";

  mostrar(linha, filtrando);
  if (filtrando) {
    linha.innerText = `${categorias[categoriaFiltrada].label} total: ${formatarComoMoeda(somarValores(listaDaTabela))}`;
  }
}

export function atualizarHistorico() {
  const mesFiltrado = document.getElementById("inputFiltroMes").value;
  const categoriaFiltrada = document.getElementById("inputFiltroCategoria").value;
  const { transacoes, salario, alerta } = getUserConfig();

  const listaDaTabela = filtrarPorMesECategoria(transacoes, mesFiltrado, categoriaFiltrada);
  const resumo = calcularResumoDoMes(transacoes, mesFiltrado, obterMesAtual(), salario, alerta);

  desenharTabela(listaDaTabela, tituloDoMes(mesFiltrado));
  desenharCards(resumo, salario);
  desenharTotalDaCategoria(listaDaTabela, categoriaFiltrada);
}

export function iniciarFiltrosHistorico() {
  const inputMes = document.getElementById("inputFiltroMes");
  const inputCategoria = document.getElementById("inputFiltroCategoria");

  inputMes.value = obterMesAtual();

  inputMes.addEventListener("input", atualizarHistorico);
  inputCategoria.addEventListener("input", atualizarHistorico);
}