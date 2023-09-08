const axios = require('axios');


exports.initPayment = async () => {
  try {
    const apiKey = process.env.PAYMOB_API_KEY;
    const req = axios.post('https://accept.paymob.com/api/auth/tokens', {
      "api_key": apiKey,
    })
    const res = await req;
    return res.data.token;
  } catch (e) {
    throw new Error(e);
  }
}

exports.createOrder = async (token, amount, orderId) => {
  try {
    const req = axios.post('https://accept.paymob.com/api/ecommerce/orders', {
      "auth_token": token,
      "delivery_needed": "false",
      "amount_cents": amount,
      "currency": "EGP",
      "merchant_order_id": orderId,
    })
    const res = await req;
    console.log('one')
    console.log(res.data)
    return res.data.id;
  } catch (e) {
    throw new Error(e);
  }
}

exports.createPaymentKey = async (token, amount, orderId, integrationId) => {
  try {
    // console.log(orderId)
    const req = axios.post('https://accept.paymob.com/api/acceptance/payment_keys', {
      "auth_token": token,
      "amount_cents": amount,
      "expiration": 3600,
      "order_id": orderId,
      "currency": "EGP",
      "lock_order_when_paid": "true",
      "integration_id": integrationId,
      "billing_data": {
        "first_name": "Clifford",
        "last_name": "Nicolas",
        "phone_number": "+86(8)9135210487",
        "email": "claudette09@exa.com",
        "country": "EG",
        "apartment": "NA",
        "floor": "NA",
        "street": "NA",
        "building": "NA",
        "shipping_method": "NA",
        "postal_code": "NA",
        "city": "NA",
        "state": "NA"
      }
    })
    const res = await req;
    // console.log(res.data)
    return res.data.token;
  } catch (e) {
    throw new Error(e);
  }
}

exports.checkIfOrderPaid = async (token, transactionId) => {
  try {
    const req = axios.get(`https://accept.paymob.com/api/acceptance/transactions/${transactionId}`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
    const res = await req;
    return {
      isSuccess: res.data.success,
      amount_cents: res.data.amount_cents,
    };
  } catch (e) {
    throw new Error(e);
  }
}