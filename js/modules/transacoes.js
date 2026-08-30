import { categorias } from "../utils/categorias.js";
import { formatarComoMoeda, desformatarMoeda } from "../utils/moeda.js";
import { getUserConfig, carregarUsuario, adicionarTransacao } from "./usuario.js";

export function criarLinhaTabela(transacao) {
  document.getElementById("tabelaLancamentos").insertAdjacentHTML("beforeend", `
    <tr>
      <td>${transacao.descricao}</td>
      <td class="item-name"><i class="fa-solid fa-circle" style="color: ${categorias[transacao.categoria].cor}"></i>${categorias[transacao.categoria].label}</td>
      <td>${transacao.data}</td>
      <td>${transacao.tipo}</td>
      <td>${formatarComoMoeda(transacao.valor)}</td>
      <td><div><button>Editar</button><button>Excluir</button><div></td>
    </tr>
  `);
}

export function criarLinhaTabelaResumo(transacao) {
  document.getElementById("tabelaResumo").insertAdjacentHTML("beforeend", `
    <tr>
      <td>${transacao.descricao}</td>
      <td class="item-name"><i class="fa-solid fa-circle" style="color: ${categorias[transacao.categoria].cor}"></i>${categorias[transacao.categoria].label}</td>
      <td>${formatarComoMoeda(transacao.valor)}</td>
    </tr>
  `);
}

export function renderizarResumo() {
  document.getElementById("tabelaResumo").innerHTML = "";

  const userConfig = getUserConfig();
  const ultimosLancamentos = userConfig.transacoes.slice(-4);

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

  userConfig.transacoes.forEach(function (elemento) {
    criarLinhaTabela(elemento);
  });
}

export function lancarDespeza() {
  carregarUsuario();

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
    let lancamentoTipo = document.getElementById("type").value.trim();
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
      tipo: lancamentoTipo,
      recorrencia: lancamentoRecorrencia
    };

    adicionarTransacao(novaTransacao);
    criarLinhaTabela(novaTransacao);
    renderizarResumo();

    document.getElementById("description").value = "";
    document.getElementById("value").value = "";
    document.getElementById("date").value = "";
  });
}