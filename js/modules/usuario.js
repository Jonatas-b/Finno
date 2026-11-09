import { atualizarPorId, removerPorId } from "./lista.js";

// Objeto user
let userConfig = {
  nome: "",
  salario: 0,
  alerta: 50 + "%",
  tema: "light",
  transacoes: []
}

export function getUserConfig() {
  return userConfig;
}

export function atualizarDadosUsuario({ nome, salario, alerta }) {
  userConfig.nome = nome;
  userConfig.salario = salario;
  userConfig.alerta = alerta;
  salvarUsuario();
}

export function carregarUsuario() {
  let data = localStorage.getItem("finno_user");
  if (data) {
    userConfig = JSON.parse(data);
    // Garante propriedades padrão caso não existam
    userConfig.nome = userConfig.nome || "";
    userConfig.salario = userConfig.salario || 0;
    userConfig.alerta = userConfig.alerta || 50 + "%";
    userConfig.tema = userConfig.tema || "light";
    userConfig.transacoes = userConfig.transacoes || [];
    
    return userConfig;
  }
  return null;
}

export function salvarUsuario() {
  localStorage.setItem("finno_user", JSON.stringify(userConfig));
}

export function adicionarTransacao(transacao) {
  userConfig.transacoes.push(transacao);
  salvarUsuario();
}

export function removerTransacao (id) {
  userConfig.transacoes = removerPorId(userConfig.transacoes, id);
  salvarUsuario();
}

// Devolve true se atualizou e false se o lançamento não existe mais.
// Relê o localStorage antes: outra aba pode ter apagado o lançamento (ou os dados)
// depois que esta página carregou, e a memória desta aba estaria desatualizada.
export function atualizarTransacao(id, novosDados) {
  if (carregarUsuario() === null) return false;
  if (!userConfig.transacoes.some(item => item.id === id)) return false;

  userConfig.transacoes = atualizarPorId(userConfig.transacoes, id, novosDados);
  salvarUsuario();
  return true;
}

export function atualizarTema(tema) {
  userConfig.tema = tema;
  salvarUsuario();
}