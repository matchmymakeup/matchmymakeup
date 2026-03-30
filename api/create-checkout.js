import Stripe from 'stripe';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return res.status(500).json({ error: 'Stripe not configured' });
  }

  const stripe = new Stripe(stripeKey);

  try {
    const origin = req.headers.origin || 'https://matchmymakeup.vercel.app';

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'aud',
            unit_amount: 499,
            recurring: { interval: 'month' },
            product_data: {
              name: 'MatchMyMakeup Premium',
              description: 'Match against 500+ products from 100+ brands. Personalised advice from your beauty consultant.',
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/MatchResults?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/ColorScanner`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to create checkout session' });
  }
}
