export const categoriaReceita = "receita";

export function filtrarPorMes(transacoes, mesReferencia) {
  return transacoes.filter(t => t.data.slice(0, 7) === mesReferencia);
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