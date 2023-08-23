/*
 * Copyright (c) 2023 Lucas <lucas@lgv5.net>
 *
 * Permission to use, copy, modify, and distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */

export class AmbitoProvider {
  name = 'Ámbito';
  #base_url = 'https://mercados.ambito.com';
  #subtype;
  #endpoint;

  constructor(subtype, endpoint) {
    this.#subtype = subtype;
    this.#endpoint = endpoint;
  }

  async price() {
    const response = await fetch(`${this.#base_url}${this.#endpoint}`);

    try {
      const data = await response.json();

      if (!('compra' in data && 'venta' in data)) {
        console.log(`ERR! incomplete JSON: ${data}`);
        return undefined;
      }

      return {
        buy: this.#parseValue(data.compra),
        sell: this.#parseValue(data.venta),
        lastUpdate: 'fecha' in data ? data.fecha : 'n/a',
      };
    } catch (e) {
      console.log(`error: ${e}`);
      return undefined;
    }
  }

  #parseValue(value) {
    const matches = value.match(/^(0|[1-9][0-9]*),([0-9]{2})$/);

    if (matches === null)
        throw new Error(`invalid number: ${value}`);

    return Number.parseFloat(`${matches[1]}.${matches[2]}`);
  }

}
