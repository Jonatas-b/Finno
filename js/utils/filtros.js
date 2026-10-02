import { getUserConfig } from "../modules/usuario.js";

export function filtrarDespesasDoMes(mesReferencia) {

  const userConfig = getUserConfig();
  return userConfig.transacoes.filter(
    t => t.categoria !== "receita" && t.data.slice(0, 7) === mesReferencia
  );

}

export function somarValores(mesReferencia) {
  const despesasMes = filtrarDespesasDoMes(mesReferencia);
  
  return despesasMes.reduce((acumulador, transacao) => acumulador + transacao.valor, 0); 
}

export function filtrarReceitasDoMes(mesReferencia) {

  const userConfig = getUserConfig();
  return userConfig.transacoes.filter(
    t => t.categoria === "receita" && t.data.slice(0, 7) === mesReferencia
  );

}

export function somarValoresReceitas (mesReferencia) {
  const receitasMes = filtrarReceitasDoMes(mesReferencia);
  
  return receitasMes.reduce((acumulador, transacao) => acumulador + transacao.valor, 0); 
}