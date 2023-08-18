const BASE_URL = 'https://mercados.ambito.com';

const parseMoney = (value) => {
  const matches = value.match(/^(0|[1-9][0-9]*),([0-9]{2})$/);

  if (matches === null)
      throw new Error(`invalid number: ${value}`);

  return Number.parseFloat(`${matches[1]}.${matches[2]}`);
}

export class AmbitoProvider {
  #subtype;
  #endpoint;

  constructor(subtype, endpoint) {
    this.#subtype = subtype;
    this.#endpoint = endpoint;
  }

  async price() {
    const response = await fetch(`${BASE_URL}${this.#endpoint}`);

    try {
      const data = await response.json();

      if (!('compra' in data && 'venta' in data)) {
        console.log(`ERR! incomplete JSON: ${data}`);
        return undefined;
      }

      return {buy: parseMoney(data.compra), sell: parseMoney(data.venta)};
    } catch (e) {
      console.log(`error: ${e}`);
      return undefined;
    }
  }
}
