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
      provider: 'Ámbito',
      subtype: subtype,
      operation: 'buy',
    }, price.buy);
    usd_ars_rate.set({
      provider: 'Ámbito',
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
