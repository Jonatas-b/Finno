import { filtrarPorMesECategoria } from "./filtros.js";
import { getUserConfig } from "./usuario.js";
import { obterMesAtual } from "../utils/data.js";
import { criarLinhaTabelaHistorico } from "./transacoes.js";

function desenharHistorico(lista) {
  const tbody = document.getElementById("tabelaLancamentosHistorico");

  tbody.innerHTML = "";

  if (lista.length === 0) {
    tbody.insertAdjacentHTML(
      "beforeend",
      `
      <tr><td colspan="5">Nenhum resultado encontrado.</td></tr>
    `,
    );
  } else {
    lista.forEach(function (elemento) {
      criarLinhaTabelaHistorico(elemento);
    });
  }
}

export function atualizarHistorico() {
  const mesFiltrado = document.getElementById("inputFiltroMes").value;
  const categoriaFiltrada = document.getElementById(
    "inputFiltroCategoria",
  ).value;
  const userConfig = getUserConfig();
  const resultadoFiltro = filtrarPorMesECategoria(
    userConfig.transacoes,
    mesFiltrado,
    categoriaFiltrada,
  );

  desenharHistorico(resultadoFiltro);
}

export function iniciarFiltrosHistorico() {
  const inputMes = document.getElementById("inputFiltroMes");
  const inputCategoria = document.getElementById("inputFiltroCategoria");

  inputMes.value = obterMesAtual();

  inputMes.addEventListener("input", () => {
    atualizarHistorico();
  });

  inputCategoria.addEventListener("input", () => {
    atualizarHistorico();
  });
}
