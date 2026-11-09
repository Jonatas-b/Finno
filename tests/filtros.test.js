import { test } from "node:test";
import assert from "node:assert/strict";
import { dataEstaNoMes, filtrarPorMes } from "../js/modules/filtros.js";

test("dataEstaNoMes: data dentro do mês devolve true", () => {
  assert.equal(dataEstaNoMes("2026-11-10", "2026-11"), true);
});

test("dataEstaNoMes: primeiro e último dia do mês contam como dentro", () => {
  assert.equal(dataEstaNoMes("2026-11-01", "2026-11"), true);
  assert.equal(dataEstaNoMes("2026-11-30", "2026-11"), true);
});

test("dataEstaNoMes: mês anterior e posterior devolvem false", () => {
  assert.equal(dataEstaNoMes("2026-10-31", "2026-11"), false);
  assert.equal(dataEstaNoMes("2026-12-01", "2026-11"), false);
});

test("dataEstaNoMes: mesmo mês em outro ano devolve false", () => {
  assert.equal(dataEstaNoMes("2025-11-10", "2026-11"), false);
  assert.equal(dataEstaNoMes("2027-11-10", "2026-11"), false);
});

test("dataEstaNoMes: virada de ano não confunde dezembro com janeiro", () => {
  assert.equal(dataEstaNoMes("2027-01-01", "2026-12"), false);
  assert.equal(dataEstaNoMes("2026-12-31", "2027-01"), false);
});

test("filtrarPorMes continua usando a mesma regra", () => {
  const lista = [
    { id: 1, data: "2026-11-10" },
    { id: 2, data: "2026-10-31" },
    { id: 3, data: "2026-11-30" },
  ];

  assert.deepEqual(filtrarPorMes(lista, "2026-11").map(t => t.id), [1, 3]);
});