import { test } from "node:test";
import assert from "node:assert/strict";
import {
  calcularPercentual,
  resumirTransacoes,
  mesTemSalario,
  lerMetaPercentual,
  textoPercentualRestante,
  calcularResumoDoMes,
} from "../js/modules/calculos.js";

const t = (valor, categoria, data) => ({ valor, categoria, data });

const transacoes = [
  t(200, "alimentacao", "2026-10-05"),
  t(1000, "moradia", "2026-10-06"),
  t(300, "receita", "2026-10-07"),
  t(400, "alimentacao", "2026-09-05"),
  t(100, "receita", "2026-09-09"),
  t(50, "lazer", "2025-12-10"),
  t(70, "lazer", "2027-01-10"),
];

// calcularPercentual
test("percentual: salário zero devolve null", () => {
  assert.equal(calcularPercentual(100, 0), null);
});
test("percentual: salário negativo ou ausente devolve null", () => {
  assert.equal(calcularPercentual(100, -5), null);
  assert.equal(calcularPercentual(100, undefined), null);
});
test("percentual: valor zero devolve 0", () => {
  assert.equal(calcularPercentual(0, 5000), 0);
});
test("percentual: valor maior que o salário passa de 100", () => {
  assert.equal(calcularPercentual(7500, 5000), 150);
});
test("percentual: valor negativo devolve percentual negativo", () => {
  assert.equal(calcularPercentual(-1000, 5000), -20);
});

// resumirTransacoes
test("resumo: lista vazia", () => {
  assert.deepEqual(resumirTransacoes([]), { gasto: 0, receita: 0 });
});
test("resumo: só despesas", () => {
  assert.deepEqual(resumirTransacoes([t(10, "lazer", "x"), t(5, "moradia", "x")]), { gasto: 15, receita: 0 });
});
test("resumo: só receitas", () => {
  assert.deepEqual(resumirTransacoes([t(10, "receita", "x")]), { gasto: 0, receita: 10 });
});
test("resumo: mistura", () => {
  assert.deepEqual(
    resumirTransacoes([t(10, "lazer", "x"), t(30, "receita", "x"), t(5, "moradia", "x")]),
    { gasto: 15, receita: 30 },
  );
});

// mesTemSalario
test("salário: mês atual e futuro têm salário", () => {
  assert.equal(mesTemSalario("2026-10", "2026-10"), true);
  assert.equal(mesTemSalario("2026-11", "2026-10"), true);
});
test("salário: mês passado e campo vazio não têm", () => {
  assert.equal(mesTemSalario("2026-09", "2026-10"), false);
  assert.equal(mesTemSalario("", "2026-10"), false);
});
test("salário: virada de ano compara o ano antes do mês", () => {
  assert.equal(mesTemSalario("2025-12", "2026-10"), false);
  assert.equal(mesTemSalario("2027-01", "2026-10"), true);
});

// meta e texto
test("meta: lê texto com % e usa padrão quando inválida", () => {
  assert.equal(lerMetaPercentual("70%"), 70);
  assert.equal(lerMetaPercentual(""), 50);
  assert.equal(lerMetaPercentual(undefined), 50);
});
test("texto do restante: positivo, zero e excedido", () => {
  assert.equal(textoPercentualRestante(82.4), "82% restante");
  assert.equal(textoPercentualRestante(0), "0% restante");
  assert.equal(textoPercentualRestante(-30.2), "Excedeu 30%");
});

// calcularResumoDoMes
test("mês atual: salário, gasto e saldo do mês", () => {
  const r = calcularResumoDoMes(transacoes, "2026-10", "2026-10", 5000, "50%");
  assert.equal(r.mostraSalario, true);
  assert.equal(r.gasto, 1200);
  assert.equal(r.receita, 300);
  assert.equal(r.saldo, 4100);
  assert.equal(r.percentualGasto, 24);
  assert.equal(r.percentualRestante, 82);
  assert.equal(r.metaEstourada, false);
});
test("mês passado: só gasto e receita, sem saldo nem percentuais", () => {
  const r = calcularResumoDoMes(transacoes, "2026-09", "2026-10", 5000, "50%");
  assert.equal(r.mostraSalario, false);
  assert.equal(r.gasto, 400);
  assert.equal(r.receita, 100);
  assert.equal(r.saldo, null);
  assert.equal(r.percentualGasto, null);
  assert.equal(r.percentualRestante, null);
});
test("mês futuro: salário atual menos o que já está lançado", () => {
  const r = calcularResumoDoMes(transacoes, "2027-01", "2026-10", 5000, "50%");
  assert.equal(r.mostraSalario, true);
  assert.equal(r.gasto, 70);
  assert.equal(r.saldo, 4930);
});
test("campo vazio: soma todo o período, sem salário", () => {
  const r = calcularResumoDoMes(transacoes, "", "2026-10", 5000, "50%");
  assert.equal(r.mostraSalario, false);
  assert.equal(r.gasto, 1720);
  assert.equal(r.receita, 400);
});
test("virada de ano: 2025-12 é passado, 2027-01 é futuro", () => {
  assert.equal(calcularResumoDoMes(transacoes, "2025-12", "2026-10", 5000, "50%").mostraSalario, false);
  assert.equal(calcularResumoDoMes(transacoes, "2027-01", "2026-10", 5000, "50%").mostraSalario, true);
});
test("meta estourada depende do percentual gasto, não do restante", () => {
  const altas = [t(3000, "moradia", "2026-10-06"), t(1500, "receita", "2026-10-07")];
  const r = calcularResumoDoMes(altas, "2026-10", "2026-10", 5000, "50%");
  assert.equal(r.percentualGasto, 60);
  assert.equal(r.percentualRestante, 70);
  assert.equal(r.metaEstourada, true);
});
test("salário zero: valores existem, percentuais são null e a meta não estoura", () => {
  const r = calcularResumoDoMes(transacoes, "2026-10", "2026-10", 0, "50%");
  assert.equal(r.mostraSalario, true);
  assert.equal(r.saldo, -900);
  assert.equal(r.percentualGasto, null);
  assert.equal(r.percentualRestante, null);
  assert.equal(r.metaEstourada, false);
});
test("mês sem lançamentos: gasto zero e restante 100%", () => {
  const r = calcularResumoDoMes(transacoes, "2026-11", "2026-10", 5000, "50%");
  assert.equal(r.gasto, 0);
  assert.equal(r.percentualRestante, 100);
});