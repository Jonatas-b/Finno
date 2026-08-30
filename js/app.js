import { trocaTela } from "./router.js";
import { capitalizar } from "./utils/texto.js";
import { formatarComoMoeda, desformatarMoeda } from "./utils/moeda.js";
import { carregarUsuario, getUserConfig, atualizarDadosUsuario } from "./modules/usuario.js";
import { lancarDespeza, carregarLancamentos, renderizarResumo } from "./modules/transacoes.js";
import { toggleTema } from "./modules/tema.js";

function atualizarInfos() {
  carregarUsuario();
  const userConfig = getUserConfig();

  if (userConfig.tema == "dark") {
    document.documentElement.classList.add("dark");
  }

  document.getElementById("saudacaoNome").innerText = `Olá, ${capitalizar(userConfig.nome)}`;
  document.getElementById("inputName").value = capitalizar(userConfig.nome);
  document.getElementById("salario").innerText = `${formatarComoMoeda(userConfig.salario)}`;
  if (localStorage.length >= 1) document.getElementById("inputSalario").value = userConfig.salario;

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