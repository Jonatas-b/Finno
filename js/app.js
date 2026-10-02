import { trocaTela } from "./router.js";
import { capitalizar } from "./utils/texto.js";
import { formatarComoMoeda, desformatarMoeda } from "./utils/moeda.js";
import { carregarUsuario, getUserConfig, atualizarDadosUsuario } from "./modules/usuario.js";
import { lancarDespeza, carregarLancamentos, renderizarResumo, percentualComprometido } from "./modules/transacoes.js";
import { toggleTema } from "./modules/tema.js";
import { exibirDataAtual } from "./utils/data.js";
import { filtrarDespesasDoMes, somarValores, somarValoresReceitas } from "./utils/filtros.js";

function atualizarInfos() {
  carregarUsuario();
  const userConfig = getUserConfig();

  if (userConfig.tema == "dark") {
    document.documentElement.classList.add("dark");
  }

  document.getElementById('totalGasto').innerText = formatarComoMoeda(somarValores(exibirDataAtual()));

  const saldoRestante = (userConfig.salario - somarValores(exibirDataAtual())) + somarValoresReceitas(exibirDataAtual());;
  document.getElementById('saldoRestante').innerText = formatarComoMoeda(saldoRestante);

  if (saldoRestante < 0) {
    document.getElementById('saldoRestante').style.color = "var(--negativo)";
  }

  document.getElementById("saudacaoNome").innerText = `Olá, ${capitalizar(userConfig.nome)}`;
  document.getElementById("inputName").value = capitalizar(userConfig.nome);
  document.getElementById("salario").innerText = `${formatarComoMoeda(userConfig.salario)}`;
  document.getElementById("salarioHistorico").innerText = `${formatarComoMoeda(userConfig.salario)}`;
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
}

function pegarInformacoesDoUser() {

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

    atualizarInfos();
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


// Inicialização
trocaTela();
toggleTema();
atualizarInfos();
pegarInformacoesDoUser();
limparTodosDados();
lancarDespeza();
carregarLancamentos();
renderizarResumo();
exibirDataAtual();
trocarTipoLancamento();
percentualComprometido();

filtrarDespesasDoMes();
somarValores(exibirDataAtual);