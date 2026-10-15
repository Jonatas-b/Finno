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
      <td><div><button>Editar</button><button>Excluir</button></div></td>
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

export function lancarDespeza(aoSalvar) {
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

export function cancelarLancamento () {
  document.getElementById('cancelarLancamento').addEventListener('click', function () {
    document.getElementById("description").value = "";
    document.getElementById("value").value = "";
    document.getElementById("date").value = "";
  })
}

const idsBadgesRestante = ["percentualSalarioRestante", "percentualSalarioRestanteHistorico"];

function exibirBadgeRestante(id, texto, cor, fundo) {
  const badge = document.getElementById(id);

  badge.innerText = texto;
  badge.style.color = cor;
  badge.style.background = fundo;
}

export function percentualComprometido() {
  const userConfig = getUserConfig();
  const metaPercentual = parseInt(userConfig.alerta, 10);

  const graficoBarra = document.getElementById("barraMetaPercentual");
  const msgPercentualUtilizado = document.getElementById("percentualUtilizado");
  const mensagemAlerta = document.getElementById("mensagemAlerta");

  if (userConfig.salario <= 0) {
    idsBadgesRestante.forEach(function (id) {
      exibirBadgeRestante(id, "Defina seu salário", "var(--neutro)", "var(--semi-transparent-neutro)");
    });

    mensagemAlerta.innerText = "Cadastre seu salário para acompanhar a meta.";
    msgPercentualUtilizado.innerText = "Sem salário cadastrado";
    msgPercentualUtilizado.style.color = "var(--neutro)";
    graficoBarra.style.width = "0%";
    return;
  }

  const doMes = filtrarPorMes(userConfig.transacoes, obterMesAtual());
  const totalGasto = somarValores(filtrarDespesas(doMes));

  const percentualUtilizado = (totalGasto / userConfig.salario) * 100;
  const percentualRestante = 100 - Math.round(percentualUtilizado);
  const metaEstourada = percentualUtilizado > metaPercentual;

  const corStatus = metaEstourada ? "var(--negativo)" : "var(--destaque)";
  const fundoStatus = metaEstourada ? "var(--semi-transparent-bg-negativo)" : "var(--semi-transparent-bg)";
  const textoRestante = percentualRestante >= 0
    ? `${percentualRestante}% restante`
    : `Excedeu ${Math.abs(percentualRestante)}%`;

  idsBadgesRestante.forEach(function (id) {
    exibirBadgeRestante(id, textoRestante, corStatus, fundoStatus);
  });

  mensagemAlerta.innerText = `Meta: manter abaixo de ${metaPercentual}%`;
  msgPercentualUtilizado.innerText = `${Math.round(percentualUtilizado)}% utilizado`;
  msgPercentualUtilizado.style.color = corStatus;
  graficoBarra.style.width = `${Math.min(percentualUtilizado, 100)}%`;
  graficoBarra.style.background = corStatus;
}
