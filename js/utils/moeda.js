export function formatarComoMoeda(numero) {
  return numero.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

export function desformatarMoeda(valorMascarado) {
  let apenasDigitos = valorMascarado.replace(/\D/g, "");
  return Number(apenasDigitos) / 100;
}