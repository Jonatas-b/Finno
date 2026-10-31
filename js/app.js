import { trocaTela } from "./router.js";
import { capitalizar } from "./utils/texto.js";
import { formatarComoMoeda, desformatarMoeda } from "./utils/moeda.js";
import { carregarUsuario, getUserConfig, atualizarDadosUsuario } from "./modules/usuario.js";
import { lancarDespesa, carregarLancamentos, renderizarResumo, percentualComprometido, cancelarLancamento } from "./modules/transacoes.js";
import { toggleTema } from "./modules/tema.js";
import { exibirDataAtual, obterMesAtual } from "./utils/data.js";
import { categoriaReceita, filtrarPorMes, filtrarPorCategoria, somarValores } from "./modules/filtros.js";
import { calcularResumoDoMes } from "./modules/calculos.js";
import { categorias, necessidade } from "./utils/categorias.js";
import { atualizarHistorico, iniciarFiltrosHistorico } from "./modules/historico.js";

function atualizarInfos() {
  carregarUsuario();
  const userConfig = getUserConfig();
  
  const transacoes = getUserConfig().transacoes;
  const doMes = filtrarPorMes(transacoes, obterMesAtual());

  const mesAtual = obterMesAtual();
  const resumo = calcularResumoDoMes(transacoes, mesAtual, mesAtual, userConfig.salario, userConfig.alerta);

  if (userConfig.tema == "dark") {
    document.documentElement.classList.add("dark");
  }

  document.getElementById('totalGasto').innerText = formatarComoMoeda(resumo.gasto);
  document.getElementById('saldoRestante').innerText = formatarComoMoeda(resumo.saldo);

  if (resumo.saldo < 0) {
    document.getElementById('saldoRestante').style.color = "var(--negativo)";
  } else {
    document.getElementById('saldoRestante').style.color = "var(--texto)";
  }  

  document.getElementById("saudacaoNome").innerText = `Olá, ${capitalizar(userConfig.nome)}`;
  document.getElementById("inputName").value = capitalizar(userConfig.nome);
  document.getElementById("salario").innerText = `${formatarComoMoeda(userConfig.salario)}`;
  if (localStorage.length >= 1) document.getElementById("inputSalario").value = formatarComoMoeda(userConfig.salario);

  function selecionarPorTexto() {
    const select = document.getElementById("inputAlerta");
    const textoProcurado = userConfig.alerta;
    for (let i = 0; i < select.options.length; i++) {
      if (select.options[i].text === textoProcurado) {
        select.selectedIndex = i;
        break;
      }
    }
  }
  selecionarPorTexto();

  exibirTabelaGastosPorCategoria(doMes); 
  // calcularGastosPorGrupo(doMes);

}

function pegarInformacoesDoUser() {

  // Formatar para moeda ao digitar no campo de salário nas configurações
  document.getElementById("inputSalario").addEventListener("input", function (evento) {
    let apenasDigitos = evento.target.value.replace(/\D/g, "");
    let valorEmReais = Number(apenasDigitos) / 100;
    evento.target.value = valorEmReais.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  });

  document.getElementById("btnSalvarInfoUser").addEventListener('click', function () {
    let userName = document.getElementById("inputName").value.trim();
    let salario = document.getElementById("inputSalario").value.trim();
    let alertaComprometimento = document.getElementById("inputAlerta").value.trim();

    atualizarDadosUsuario({
      nome: userName,
      salario: desformatarMoeda(salario),
      alerta: alertaComprometimento
    });

    atualizarTela();
  });
}

function trocarTipoLancamento () {
  const btnDespesa = document.getElementById('btnDespesa');
  const btnReceita = document.getElementById('btnReceita');

  btnReceita.addEventListener('click', function () {
    document.getElementById('btnReceita').classList.add('active');
    document.getElementById('btnDespesa').classList.remove('active');
    
    document.getElementById('category').insertAdjacentHTML("beforeend", `<option value="receita">Receita</option>`);
    document.getElementById('category').value = "receita";
    document.getElementById('category').disabled = true;
    
  })
  btnDespesa.addEventListener('click', function () {
    document.getElementById('btnDespesa').classList.add('active');
    document.getElementById('btnReceita').classList.remove('active');

    document.getElementById('category').value = 'alimentacao';
    document.getElementById('category').disabled = false;
    


    const ultima = document.getElementById('category').options[document.getElementById('category').options.length - 1];
    if (ultima?.value === "receita") ultima.remove();
  })

}

function limparTodosDados() {
  document.getElementById("btnDeleteAll").addEventListener('click', function () {
    localStorage.clear();
    location.reload(true);
  });
}

function exibirTabelaGastosPorCategoria (doMes) {
  let linhas = "";

  for (const [chave, info] of Object.entries(categorias)) {
    const ehReceita = chave === categoriaReceita;
    const total = somarValores(filtrarPorCategoria(doMes, chave));

    linhas += `
      <tr>
        <td class="item-name"><i class="fa-solid fa-circle" style="color: ${info.cor}"></i>${info.label}</td>
        <td style="color: ${ehReceita ? "var(--destaque)": "var(--negativo)"}">${ehReceita ? "+" : "-"} ${formatarComoMoeda(total)}</td>
      </tr>
    `;
  }

  document.getElementById('tabelaGastosPorCategoria').innerHTML = linhas;
}

// function calcularGastosPorGrupo (doMes) {
//   for (const [chave, info] of Object.entries(categorias)) {
//     const necessidadesTotal = somarValores(filtrarPorCategoria(doMes, necessidade.values));
//     // const desejosTotal = ;

//     console.log(necessidadesTotal)


//   }
// }

function atualizarTela() {
  atualizarInfos();
  carregarLancamentos();
  atualizarHistorico();
  renderizarResumo();
  percentualComprometido();
}

// Inicialização
trocaTela();
toggleTema();
pegarInformacoesDoUser();
limparTodosDados();
iniciarFiltrosHistorico();
lancarDespesa(atualizarTela);
exibirDataAtual();
trocarTipoLancamento();
atualizarTela();
cancelarLancamento();
