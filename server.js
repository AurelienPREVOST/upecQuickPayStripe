// Importations nécessaires
const Koa = require('koa');
const Router = require('@koa/router');
const serve = require('koa-static');
const bodyParser = require('koa-bodyparser');
const Stripe = require('stripe');
const path = require('path');

const app = new Koa();
const router = new Router();
const stripe = new Stripe('votre clé stripe privé (la public n est pas necessaire juste pour un checkout)')

app.use(bodyParser());
app.use(serve(path.join(__dirname, 'public')));

router.get('/', async (ctx) => {
  ctx.type = 'html';
  ctx.body = require('fs').createReadStream(path.join(__dirname, 'public', 'index.html'));
});

router.post('/create-checkout-session', async (ctx) => {
  const { amount } = ctx.request.body;

  if (!amount || parseFloat(amount) <= 0) {
    ctx.status = 400;
    ctx.body = { error: 'Invalid amount' };
    return;
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Paiement événementiel',
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'https://upec-cisse.jimdosite.com/',
      cancel_url: 'http://www.google.fr/', // Page d'echec a créé
    });

    ctx.body = { url: session.url };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: error.message };
  }
});

app.use(router.routes()).use(router.allowedMethods());

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
