export function atualizarPorId(lista, id, novosDados) {
  return lista.map(item => (item.id === id ? { ...item, ...novosDados, id } : item));
}

// filter mantém o que não tem o id: um id inexistente não remove nada.
export function removerPorId(lista, id) {
  return lista.filter(item => item.id !== id);
}