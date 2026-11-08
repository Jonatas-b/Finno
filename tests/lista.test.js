import { test } from "node:test";
import assert from "node:assert/strict";
import { atualizarPorId, removerPorId } from "../js/modules/lista.js";

// Cada teste cria a sua própria lista: um teste nunca depende do que outro fez.
const criarLista = () => [
  { id: 1, descricao: "mercado", valor: 150.5, categoria: "alimentacao", data: "2026-11-10", recorrencia: "unica" },
  { id: 2, descricao: "luz", valor: 200, categoria: "moradia", data: "2026-11-11", recorrencia: "mensal" },
  { id: 3, descricao: "cinema", valor: 40, categoria: "lazer", data: "2026-11-12", recorrencia: "unica" },
];

test("atualizarPorId: atualiza o item com o id informado", () => {
  const resultado = atualizarPorId(criarLista(), 2, { descricao: "conta de luz", valor: 210 });

  assert.equal(resultado[1].descricao, "conta de luz");
  assert.equal(resultado[1].valor, 210);
});

test("atualizarPorId: campos que não vieram em novosDados são preservados", () => {
  const resultado = atualizarPorId(criarLista(), 2, { descricao: "conta de luz" });

  assert.equal(resultado[1].valor, 200);
  assert.equal(resultado[1].categoria, "moradia");
  assert.equal(resultado[1].data, "2026-11-11");
  assert.equal(resultado[1].recorrencia, "mensal");
});

test("atualizarPorId: os outros itens ficam idênticos", () => {
  const original = criarLista();
  const resultado = atualizarPorId(criarLista(), 2, { descricao: "conta de luz" });

  assert.deepEqual(resultado[0], original[0]);
  assert.deepEqual(resultado[2], original[2]);
});

test("atualizarPorId: o id do item editado não muda", () => {
  const resultado = atualizarPorId(criarLista(), 2, { descricao: "conta de luz" });

  assert.equal(resultado[1].id, 2);
});

test("atualizarPorId: um id falso em novosDados não sobrescreve o id original", () => {
  const resultado = atualizarPorId(criarLista(), 2, { id: 999, descricao: "conta de luz" });

  assert.equal(resultado[1].id, 2);
  assert.equal(resultado.some(item => item.id === 999), false);
});

test("atualizarPorId: id inexistente devolve uma lista equivalente à de entrada", () => {
  const resultado = atualizarPorId(criarLista(), 404, { descricao: "nada" });

  assert.deepEqual(resultado, criarLista());
});

test("atualizarPorId: a lista original não é alterada", () => {
  const original = criarLista();
  const descricaoAntes = original[1].descricao;
  const valorAntes = original[1].valor;

  const resultado = atualizarPorId(original, 2, { descricao: "conta de luz", valor: 999 });

  assert.equal(original[1].descricao, descricaoAntes);
  assert.equal(original[1].valor, valorAntes);
  assert.notEqual(resultado, original);
  assert.notEqual(resultado[1], original[1]);
});

test("atualizarPorId: lista vazia devolve lista vazia", () => {
  assert.deepEqual(atualizarPorId([], 1, { descricao: "x" }), []);
});
// removerPorId
test("removerPorId: remove o item com o id informado", () => {
  const resultado = removerPorId(criarLista(), 2);

  assert.equal(resultado.length, 2);
  assert.equal(resultado.some(item => item.id === 2), false);
});

test("removerPorId: os outros itens ficam idênticos e na mesma ordem", () => {
  const original = criarLista();
  const resultado = removerPorId(criarLista(), 2);

  assert.deepEqual(resultado, [original[0], original[2]]);
});

test("removerPorId: id inexistente devolve uma lista equivalente (não remove o último)", () => {
  const resultado = removerPorId(criarLista(), 404);

  assert.deepEqual(resultado, criarLista());
});

test("removerPorId: a lista original não é alterada", () => {
  const original = criarLista();

  const resultado = removerPorId(original, 1);

  assert.equal(original.length, 3);
  assert.deepEqual(original, criarLista());
  assert.notEqual(resultado, original);
});

test("removerPorId: lista vazia devolve lista vazia", () => {
  assert.deepEqual(removerPorId([], 1), []);
});

test("removerPorId: remover o único item devolve lista vazia", () => {
  assert.deepEqual(removerPorId([criarLista()[0]], 1), []);
});