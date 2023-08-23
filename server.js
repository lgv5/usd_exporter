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

import express from 'express';
import { Gauge, collectDefaultMetrics, register } from 'prom-client';
import { AmbitoProvider } from './providers.js';

process.title = process.env.npm_package_name || 'usd_exporter';

const port = process.env.npm_package_config_port || 29000;
const interval = process.env.npm_package_config_interval ||
  (60 * 1000);

const usd_ars_rate = new Gauge({
  name: 'usd_ars_rate',
  help: 'USD ARS rate',
  labelNames: ['provider', 'subtype', 'operation'],
});

const providers = {
  blue: new AmbitoProvider('blue', '/dolar/informal/variacion'),
  ccl: new AmbitoProvider('ccl', '/dolarrava/cl/variacion'),
  cripto: new AmbitoProvider('cripto', '/dolarcripto/variacion'),
};

for (const [subtype, provider] of Object.entries(providers)) {
  const f = async () => {
    const price = await provider.price();

    if (price === undefined)
      return;

    usd_ars_rate.set({
      provider: provider.name,
      subtype: subtype,
      operation: 'buy',
    }, price.buy);
    usd_ars_rate.set({
      provider: provider.name,
      subtype: subtype,
      operation: 'sell',
    }, price.sell);
  };

  setImmediate(f);
  setInterval(f, interval);
}

collectDefaultMetrics();

const app = express();
app.get('/metrics', async (req, res) => {
  res.setHeader('Content-Type', register.contentType);
  res.send(await register.metrics());
});
for (const host of ['127.0.0.1', '::1']) {
  app.listen(port, host, () => {
    console.log(`Server is running at http://${host}:${port}`);
  });
}
