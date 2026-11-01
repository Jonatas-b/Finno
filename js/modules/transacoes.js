import { categorias } from "../utils/categorias.js";
import { capitalizar } from "../utils/texto.js";
import { formatarComoMoeda, desformatarMoeda } from "../utils/moeda.js";
import { getUserConfig, carregarUsuario, adicionarTransacao, removerTransacao } from "./usuario.js";
import { converterParaFormatoBR, obterMesAtual } from "../utils/data.js";
import { filtrarPorMes } from "./filtros.js";
import { calcularResumoDoMes, textoPercentualRestante } from "./calculos.js";
// EXIBIR AS LINHAS DAS TABELAS DE LANÇAMENTO, RESUMO NO DASHBOARD E HISTÓRICO

export function criarLinhaTabelaLancamentos(transacao) {
  document.getElementById("tabelaLancamentos").insertAdjacentHTML("beforeend", `
    <tr>
      <td>${capitalizar(transacao.descricao)}</td>
      <td class="item-name"><i class="fa-solid fa-circle" style="color: ${categorias[transacao.categoria].cor}"></i>${categorias[transacao.categoria].label}</td>
      <td>${converterParaFormatoBR(transacao.data)}</td>
      <td>${capitalizar(transacao.recorrencia)}</td>
      <td>${formatarComoMoeda(transacao.valor)}</td>
      <td><div><button data-id="${transacao.id}" data-acao="editar" >Editar</button><button data-id="${transacao.id}" data-acao="excluir" >Excluir</button></div></td>
    </tr>
  `);
}

export function criarLinhaTabelaResumo(transacao) {
  document.getElementById("tabelaResumo").insertAdjacentHTML("beforeend", `
    <tr>
      <td>${capitalizar(transacao.descricao)}</td>
      <td class="item-name"><i class="fa-solid fa-circle" style="color: ${categorias[transacao.categoria].cor}"></i>${categorias[transacao.categoria].label}</td>
      <td>${formatarComoMoeda(transacao.valor)}</td>
    </tr>
  `);
}

export function criarLinhaTabelaHistorico(transacao) {
  document.getElementById("tabelaLancamentosHistorico").insertAdjacentHTML("beforeend", `
    <tr>
      <td>${capitalizar(transacao.descricao)}</td>
      <td class="item-name"><i class="fa-solid fa-circle" style="color: ${categorias[transacao.categoria].cor}"></i>${categorias[transacao.categoria].label}</td>
      <td>${converterParaFormatoBR(transacao.data)}</td>
      <td>${capitalizar(transacao.recorrencia)}</td>
      <td>${formatarComoMoeda(transacao.valor)}</td>
    </tr>
  `);
}

export function renderizarResumo() {
  document.getElementById("tabelaResumo").innerHTML = "";

  const userConfig = getUserConfig();
  const lancamentosDoMes = filtrarPorMes(userConfig.transacoes, obterMesAtual());
  const ultimosLancamentos = lancamentosDoMes.slice(-4).reverse();

  if (ultimosLancamentos.length === 0) {
    document.getElementById("tabelaResumo").insertAdjacentHTML("beforeend", `
      <tr><td colspan="3">Nenhum lançamento ainda.</td></tr>
    `);
    return;
  }

  ultimosLancamentos.forEach(function (transacao) {
    criarLinhaTabelaResumo(transacao);
  });
}

export function carregarLancamentos() {
  document.getElementById("tabelaLancamentos").innerHTML = "";

  carregarUsuario();
  const userConfig = getUserConfig();
  const lancamentosDoMes = filtrarPorMes(userConfig.transacoes, obterMesAtual());

  if (lancamentosDoMes.length === 0) {
    document.getElementById("tabelaLancamentos").insertAdjacentHTML("beforeend", `
      <tr><td colspan="6">Nenhum lançamento ainda.</td></tr>
    `);
  }

  lancamentosDoMes.forEach(function (elemento) {
    criarLinhaTabelaLancamentos(elemento);
  });
}

export function lancarDespesa(aoSalvar) {
  carregarUsuario();

  // Formata número para valor em Reais ao digitar
  document.getElementById("value").addEventListener("input", function (evento) {
    let apenasDigitos = evento.target.value.replace(/\D/g, "");
    let valorEmReais = Number(apenasDigitos) / 100;
    evento.target.value = valorEmReais.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  });

  document.getElementById("salvarLancamento").addEventListener('click', function () {
    let lancamentoDescricao = document.getElementById("description").value.trim();
    let lancamentoValor = document.getElementById("value").value.trim();
    let lancamentoCategoria = document.getElementById("category").value.trim();
    let lancamentoData = document.getElementById("date").value.trim();
    let lancamentoRecorrencia = document.getElementById("recorrencia").value.trim();

    if (lancamentoDescricao === "" || lancamentoValor === "" || lancamentoData === "") {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    const novaTransacao = {
      id: Date.now(),
      descricao: lancamentoDescricao,
      valor: desformatarMoeda(lancamentoValor),
      categoria: lancamentoCategoria,
      data: lancamentoData,
      recorrencia: lancamentoRecorrencia,
    };

    adicionarTransacao(novaTransacao);
    aoSalvar();

    alert("Lançamento concluído.")

    document.getElementById("description").value = "";
    document.getElementById("value").value = "";
    document.getElementById("date").value = "";
  });
}

export function excluirLancamento (aoSalvar) {
  document.getElementById('tabelaLancamentos').addEventListener('click', function (evento) {
    const btn = evento.target.closest("button");
    if (btn === null) return;

    const idBtnClicado = Number(btn.dataset.id);

    if (btn.dataset.acao === "excluir" && window.confirm("Tem certeza que deseja excluir o lançamento? Essa ação não pode ser desfeita!")) {
      removerTransacao(idBtnClicado);
      aoSalvar();
    }
  });
}

export function cancelarLancamento () {
  document.getElementById('cancelarLancamento').addEventListener('click', function () {
    document.getElementById("description").value = "";
    document.getElementById("value").value = "";
    document.getElementById("date").value = "";
  })
}

// Badge "% restante" usado no dashboard e no histórico.
// Recebe o resumo de calcularResumoDoMes, então a regra (texto e cor) fica num lugar só.
export function exibirBadgeRestante(id, resumo) {
  const badge = document.getElementById(id);

  if (resumo.percentualRestante === null) {
    badge.innerText = "Defina seu salário";
    badge.style.color = "var(--neutro)";
    badge.style.background = "var(--semi-transparent-neutro)";
    return;
  }

  badge.innerText = textoPercentualRestante(resumo.percentualRestante);
  badge.style.color = resumo.metaEstourada ? "var(--negativo)" : "var(--destaque)";
  badge.style.background = resumo.metaEstourada ? "var(--semi-transparent-bg-negativo)" : "var(--semi-transparent-bg)";
}

export function percentualComprometido() {
  const userConfig = getUserConfig();
  const mesAtual = obterMesAtual();
  const resumo = calcularResumoDoMes(userConfig.transacoes, mesAtual, mesAtual, userConfig.salario, userConfig.alerta);

  const graficoBarra = document.getElementById("barraMetaPercentual");
  const msgPercentualUtilizado = document.getElementById("percentualUtilizado");
  const mensagemAlerta = document.getElementById("mensagemAlerta");

  exibirBadgeRestante("percentualSalarioRestante", resumo);

  if (resumo.percentualGasto === null) {
    mensagemAlerta.innerText = "Cadastre seu salário para acompanhar a meta.";
    msgPercentualUtilizado.innerText = "Sem salário cadastrado";
    msgPercentualUtilizado.style.color = "var(--neutro)";
    graficoBarra.style.width = "0%";
    return;
  }

  const corStatus = resumo.metaEstourada ? "var(--negativo)" : "var(--destaque)";

  mensagemAlerta.innerText = `Meta: manter abaixo de ${resumo.meta}%`;
  msgPercentualUtilizado.innerText = `${Math.round(resumo.percentualGasto)}% utilizado`;
  msgPercentualUtilizado.style.color = corStatus;
  graficoBarra.style.width = `${Math.min(resumo.percentualGasto, 100)}%`;
  graficoBarra.style.background = corStatus;
}