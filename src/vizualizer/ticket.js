export function ticket(ticket) {
  return `
*Bilhete Pago*
===========================
*Data:* ${ticket.createdAt}
*Mercado:* ${ticket.market}
===========================
*Colaborador:* ${ticket.buyerName}
*Cliente:* ${ticket.sellerName}
===========================
*Jogo:* ${ticket.name}
*Odd:* ${ticket.odd}
*Valor pago:* R$ ${(+ticket.value).toFixed(2).replace(".", ",")}
*Possivel retorno:* R$ ${(ticket.value * ticket.odd)
    .toFixed(2)
    .replace(".", ",")}
    `
    .replaceAll("=", "\\=")
    .replaceAll("-", "\\-")
    .replaceAll(".", "\\.");
}
