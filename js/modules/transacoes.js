import { categorias } from "../utils/categorias.js";
import { capitalizar } from "../utils/texto.js";
import { formatarComoMoeda, desformatarMoeda } from "../utils/moeda.js";
import { getUserConfig, carregarUsuario, adicionarTransacao, removerTransacao, atualizarTransacao } from "./usuario.js";
import { converterParaFormatoBR, obterMesAtual, converterDataParaEscrita } from "../utils/data.js";
import { filtrarPorMes, categoriaReceita, dataEstaNoMes } from "./filtros.js";
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

// FORMULÁRIO DE LANÇAMENTO: ler, preencher e limpar os campos
export function lerFormulario() {
  return {
    descricao: document.getElementById("description").value.trim(),
    valor: desformatarMoeda(document.getElementById("value").value.trim()),
    categoria: document.getElementById("category").value.trim(),
    data: document.getElementById("date").value.trim(),
    recorrencia: document.getElementById("recorrencia").value.trim(),
  };
}

// Caminho inverso de lerFormulario: o valor volta formatado como moeda.
export function preencherFormulario(transacao) {
  document.getElementById("description").value = transacao.descricao;
  document.getElementById("value").value = formatarComoMoeda(transacao.valor);
  document.getElementById("category").value = transacao.categoria;
  document.getElementById("date").value = transacao.data;
  document.getElementById("recorrencia").value = transacao.recorrencia;
}

export function limparFormulario() {
  document.getElementById("description").value = "";
  document.getElementById("value").value = "";
  document.getElementById("date").value = "";
}

// Define se o formulário está em modo despesa ou receita ("despesa" | "receita").
// É o único lugar que mexe no toggle e na option "Receita" do select:
// o clique nos botões e a edição de um lançamento chamam esta função.
export function definirTipo(tipo) {
  const ehReceita = tipo === "receita";
  const select = document.getElementById("category");
  const optionReceita = select.querySelector(`option[value="${categoriaReceita}"]`);

  document.getElementById("btnReceita").classList.toggle("active", ehReceita);
  document.getElementById("btnDespesa").classList.toggle("active", !ehReceita);

  if (ehReceita) {
    if (optionReceita === null) {
      select.insertAdjacentHTML("beforeend", `<option value="${categoriaReceita}">Receita</option>`);
    }
    select.value = categoriaReceita;
    select.disabled = true;
  } else {
    select.value = "alimentacao";
    select.disabled = false;
    if (optionReceita !== null) optionReceita.remove();
  }
}

let idEmEdicao = null;
const tituloFormularioPadrao = document.getElementById('tituloFormulario').textContent.trim();
const salvarLancamentoPadrao = document.getElementById('salvarLancamento').textContent.trim();
const cancelarLancamentoPadrao = document.getElementById('cancelarLancamento').textContent.trim();

export function iniciarEdicao (id) {
  const transacao = getUserConfig().transacoes.find(item => item.id === id);
  if (transacao === undefined) return;

  // Primeiro o tipo (cria a option "Receita" se preciso), depois os campos:
  // na ordem inversa, definirTipo sobrescreveria a categoria preenchida.
  definirTipo(transacao.categoria === categoriaReceita ? "receita" : "despesa");
  preencherFormulario(transacao);
  idEmEdicao = id;

  document.getElementById('tituloFormulario').textContent = "Editar lançamento";
  document.getElementById('salvarLancamento').textContent = "Salvar edição";
  document.getElementById('cancelarLancamento').textContent = "Cancelar edição";
}

export function encerrarEdicao () {
  document.getElementById('tituloFormulario').textContent = tituloFormularioPadrao;
  document.getElementById('salvarLancamento').textContent = salvarLancamentoPadrao;
  document.getElementById('cancelarLancamento').textContent = cancelarLancamentoPadrao;
  limparFormulario();
  definirTipo("despesa");
  idEmEdicao = null;
}

// A tabela de lançamentos mostra só o mês atual. Quando o lançamento cai em outro mês,
// devolve o aviso para o usuário saber onde ele foi parar; senão, texto vazio.
function avisoDeOutroMes(data) {
  if (dataEstaNoMes(data, obterMesAtual())) return "";

  return `\n\nEle foi salvo em ${converterDataParaEscrita(data)} e não aparece na tabela deste mês. Para vê-lo, use o Histórico.`;
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
    const dados = lerFormulario();
      
    if (dados.descricao === "" || dados.data === "") {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }
    if (dados.valor === 0) {
      alert("Informe um valor maior que zero.");
      return;
    }

    let mensagem;

    if (idEmEdicao !== null) {
      const atualizou = atualizarTransacao(idEmEdicao, dados);
      encerrarEdicao();
      mensagem = atualizou
        ? "Edição concluída." + avisoDeOutroMes(dados.data)
        : "Este lançamento não existe mais, então nada foi alterado.";
    } else {
      adicionarTransacao({ id: Date.now(), ...dados });
      limparFormulario();
      mensagem = "Lançamento concluído." + avisoDeOutroMes(dados.data);
    }

    aoSalvar();
    alert(mensagem);
    
  });
}

export function ligarAcoesDaTabela (aoSalvar) {
  document.getElementById('tabelaLancamentos').addEventListener('click', function (evento) {
    const btn = evento.target.closest("button");
    if (btn === null) return;

    const idBtnClicado = Number(btn.dataset.id);

    if (btn.dataset.acao === "excluir" && window.confirm("Tem certeza que deseja excluir o lançamento? Essa ação não pode ser desfeita!")) {
      removerTransacao(idBtnClicado);
      aoSalvar();
      if (idBtnClicado === idEmEdicao) {
        encerrarEdicao();
      }
    }
    else if (btn.dataset.acao === "editar") {
      iniciarEdicao(idBtnClicado);
      document.getElementById('description').focus();
    }
  });
}

export function cancelarLancamento () {
  document.getElementById('cancelarLancamento').addEventListener('click', () => {
    encerrarEdicao();
  });
}

// Badge "% restante" usado no dashboard e no histórico.
// Recebe o resumo de calcularResumoDoMes
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