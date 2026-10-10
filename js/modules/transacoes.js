import { categorias } from "../utils/categorias.js";
import { capitalizar } from "../utils/texto.js";
import { formatarComoMoeda, desformatarMoeda } from "../utils/moeda.js";
import { getUserConfig, carregarUsuario, adicionarTransacao } from "./usuario.js";
import { converterParaFormatoBR, obterMesAtual } from "../utils/data.js";
import { filtrarPorMes, filtrarDespesas, somarValores } from "./filtros.js";

// EXIBIR AS LINHAS DAS TABELAS DE LANÇAMENTO, RESUMO NO DASHBOARD E HISTÓRICO

export function criarLinhaTabelaLancamentos(transacao) {
  document.getElementById("tabelaLancamentos").insertAdjacentHTML("beforeend", `
    <tr>
      <td>${capitalizar(transacao.descricao)}</td>
      <td class="item-name"><i class="fa-solid fa-circle" style="color: ${categorias[transacao.categoria].cor}"></i>${categorias[transacao.categoria].label}</td>
      <td>${converterParaFormatoBR(transacao.data)}</td>
      <td>${capitalizar(transacao.recorrencia)}</td>
      <td>${formatarComoMoeda(transacao.valor)}</td>
      <td><div><button>Editar</button><button>Excluir</button><div></td>
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
  carregarUsuario();
  const userConfig = getUserConfig();

  if (userConfig.transacoes.length === 0) {
    document.getElementById("tabelaLancamentos").insertAdjacentHTML("beforeend", `
      <tr><td colspan="6">Nenhum lançamento ainda.</td></tr>
    `);

    document.getElementById("tabelaLancamentosHistorico").insertAdjacentHTML("beforeend", `
      <tr><td colspan="5">Nenhum lançamento ainda.</td></tr>
    `);
    return;
  }

  const lancamentosDoMes = filtrarPorMes(userConfig.transacoes, obterMesAtual());

  lancamentosDoMes.forEach(function (elemento) {
    criarLinhaTabelaLancamentos(elemento);
    criarLinhaTabelaHistorico(elemento);
  });
}

export function lancarDespeza() {
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
    criarLinhaTabelaLancamentos(novaTransacao);
    renderizarResumo();
    criarLinhaTabelaHistorico();

    document.getElementById("description").value = "";
    document.getElementById("value").value = "";
    document.getElementById("date").value = "";
  });
}

export function percentualComprometido () {
  const userConfig = getUserConfig();
  const metaPercentual = userConfig.alerta;

  const transacoes = getUserConfig().transacoes;

  const doMes = filtrarPorMes(transacoes, obterMesAtual());
  const despesas = filtrarDespesas(doMes);
  const totalGasto = somarValores(despesas);
  let percentualUtilizado = (totalGasto / userConfig.salario) * 100;

  if (isNaN(percentualUtilizado)) {
    percentualUtilizado = 0;
  }

  // Exibir Percentual Restante no Dashboard 
  const percentualSalarioRestante = 100 - Math.round(percentualUtilizado);
  document.getElementById('percentualSalarioRestante').innerText = `${percentualSalarioRestante}% restante`;
  if (percentualSalarioRestante <= (100 - parseInt((metaPercentual)))) {
    document.getElementById('percentualSalarioRestante').style.color = "var(--negativo)";
    document.getElementById('percentualSalarioRestante').style.background = "var(--semi-transparent-bg-negativo)";
  }

  // Exibir Percentual Restante no Histórico
  document.getElementById('percentualSalarioRestanteHistorico').innerText = `${percentualSalarioRestante}% restante`;
  if (percentualSalarioRestante <= (100 - parseInt((metaPercentual)))) {
    document.getElementById('percentualSalarioRestanteHistorico').style.color = "var(--negativo)";
    document.getElementById('percentualSalarioRestanteHistorico').style.background = "var(--semi-transparent-bg-negativo)";
  }

  const graficoBarra = document.getElementById('barraMetaPercentual');
  const msgPercentualUtilizado = document.getElementById('percentualUtilizado');

  document.getElementById('mensagemAlerta').innerText = `Meta: manter abaixo de ${metaPercentual}`;
  graficoBarra.style.width = `${percentualUtilizado}%`;
  msgPercentualUtilizado.innerText = `${Math.round(percentualUtilizado)}% utilizado`;

   // Exibir Percentual Restante no card da barra 
  if(percentualUtilizado <= parseInt(metaPercentual)) {
    graficoBarra.style.background = "var(--destaque)";
    msgPercentualUtilizado.style.color = "var(--destaque)";
  } else {
    graficoBarra.style.background = "var(--negativo)";
    msgPercentualUtilizado.style.color = "var(--negativo)";
  }
}