export const categoriaReceita = "receita";

// Regra do mês em um lugar só: compara "AAAA-MM" inteiro como texto.
// data no formato "AAAA-MM-DD", mesReferencia no formato "AAAA-MM".
export function dataEstaNoMes(data, mesReferencia) {
  return data.slice(0, 7) === mesReferencia;
}

export function filtrarPorMes(transacoes, mesReferencia) {
  return transacoes.filter(t => dataEstaNoMes(t.data, mesReferencia));
}

export function filtrarPorCategoria(transacoes, categoria) {
  return transacoes.filter(t => t.categoria === categoria);
}

export function filtrarReceitas(transacoes) {
  return transacoes.filter(t => t.categoria === categoriaReceita);
}

export function filtrarDespesas(transacoes) {
  return transacoes.filter(t => t.categoria !== categoriaReceita);
}

export function somarValores(transacoes) {
  return transacoes.reduce((acumulador, t) => acumulador + t.valor, 0);
}

export function filtrarPorMesECategoria (lista, mes, categoria) {

  let resultadoFiltro = lista;

  if (mes !== "") { resultadoFiltro = filtrarPorMes(lista, mes); } 
  if (categoria !== "todos") { resultadoFiltro = filtrarPorCategoria(resultadoFiltro, categoria); }
  
  return resultadoFiltro;
}