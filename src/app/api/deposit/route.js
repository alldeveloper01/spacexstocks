export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0
import { getUserFromRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

const CURRENCY_MAP = {
  btc:          { currency: 'BTC',  network: 'Bitcoin'  },
  eth:          { currency: 'ETH',  network: 'Ethereum' },
  usdttrc20:    { currency: 'USDT', network: 'TRC20'    },
  usdterc20:    { currency: 'USDT', network: 'ERC20'    },
  trx:          { currency: 'TRX',  network: 'TRC20'    },
  bnbbsc:       { currency: 'BNB',  network: 'BEP20'    },
  sol:          { currency: 'SOL',  network: 'Solana'   },
  ltc:          { currency: 'LTC',  network: 'Litecoin' },
  usdcbsc:      { currency: 'USDC', network: 'BEP20'    },
  doge:         { currency: 'DOGE', network: 'Dogecoin' },
  xrp:          { currency: 'XRP',  network: 'Ripple'   },
  maticpolygon: { currency: 'POL',  network: 'Polygon'  },
}

export async function GET(req) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: deposits } = await supabaseAdmin
      .from('deposits')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    return Response.json({ deposits: deposits || [] })
  } catch {
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { amount, currency, method } = await req.json()

    const { data: minDepositSetting } = await supabaseAdmin
  .from('site_settings')
  .select('value')
  .eq('key', 'min_deposit')
  .single()
const MIN = Number(minDepositSetting?.value || 50)
    if (!amount || amount < MIN) {
      return Response.json({ error: `Minimum deposit amount is $${MIN}` }, { status: 400 })
    }
    if (!currency) {
      return Response.json({ error: 'Please select a currency' }, { status: 400 })
    }

    const currencyConfig = CURRENCY_MAP[currency]
    if (!currencyConfig) {
      return Response.json({ error: 'Unsupported currency' }, { status: 400 })
    }

    const orderId = `SX${user.id.split('-')[0]}${Date.now()}`

    // Try invoice first
    if (method !== 'static') {
      try {
        const invoiceRes = await fetch('https://api.oxapay.com/v1/payment/invoice', {
          method: 'POST',
          headers: {
            'merchant_api_key': process.env.OXAPAY_MERCHANT_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            amount,
            currency: 'USD',
            order_id: orderId,
            fee_paid_by_payer: 1,
            callback_url: 'https://spacestocks.finance/api/deposit/webhook',
            return_url: 'https://spacestocks.finance/dashboard/deposit?status=success',
            email: user.email,
            description: `SpaceX Stocks deposit for ${user.email}`,
            lifetime: 60
          })
        })

        const invoiceData = await invoiceRes.json()
        console.log('OxaPay invoice response:', JSON.stringify(invoiceData))

        if (invoiceData.data?.payment_url) {
          const trackId = invoiceData.data.track_id ? String(invoiceData.data.track_id) : null

          const { data: deposit, error: insertError } = await supabaseAdmin
            .from('deposits')
            .insert({
              user_id: user.id,
              amount,
              currency: currency.toLowerCase(),
              status: 'pending',
              payment_id: orderId,
              invoice_id: orderId,
              order_id: orderId,
              oxapay_track_id: trackId
            })
            .select()
            .single()

          if (insertError) {
            console.error('Deposit insert error:', JSON.stringify(insertError))
            throw new Error('Insert failed')
          }

          return Response.json({
            success: true,
            method: 'invoice',
            pay_link: invoiceData.data.payment_url,
            track_id: trackId,
            deposit_id: deposit.id,
            order_id: orderId
          })
        }
      } catch (err) {
        console.error('Invoice creation failed, falling back to static:', err)
      }
    }

    // Fallback — static address
    const oxaRes = await fetch('https://api.oxapay.com/v1/payment/static-address', {
      method: 'POST',
      headers: {
        'merchant_api_key': process.env.OXAPAY_MERCHANT_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        network: currencyConfig.network,
        callback_url: 'https://spacestocks.finance/api/deposit/webhook',
        order_id: orderId,
        description: `SpaceX Stocks deposit for ${user.email}`
      })
    })

    const oxaData = await oxaRes.json()
    console.log('OxaPay static address response:', JSON.stringify(oxaData))

    if (!oxaData.data?.address) {
      return Response.json({ error: 'Failed to generate deposit address. Please try again.' }, { status: 500 })
    }

    const address = oxaData.data.address
    const trackId = oxaData.data.track_id ? String(oxaData.data.track_id) : null

    const { data: deposit, error: insertError } = await supabaseAdmin
      .from('deposits')
      .insert({
        user_id: user.id,
        amount,
        currency: currency.toLowerCase(),
        status: 'pending',
        payment_id: orderId,
        invoice_id: orderId,
        order_id: orderId,
        oxapay_address: address,
        oxapay_track_id: trackId
      })
      .select()
      .single()

    if (insertError) {
      console.error('Deposit insert error:', JSON.stringify(insertError))
      return Response.json({ error: 'Failed to save deposit. Please try again.' }, { status: 500 })
    }

    return Response.json({
      success: true,
      method: 'static',
      address,
      currency: currencyConfig.currency,
      network: currencyConfig.network,
      amount,
      deposit_id: deposit.id,
      order_id: orderId
    })
  } catch (error) {
    console.error('Deposit error:', error)
    return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}