const paypal = require("paypal-rest-sdk");

const environment = new paypal.core.LiveEnvironment(
  process.env.PAYPAL_CLIENT_ID,
  process.env.PAYPAL_CLIENT_SECRET
);
const client = new paypal.core.PayPalHttpClient(environment);

const createOrder = async () => {
  const request = new paypal.orders.OrdersCreateRequest();
  request.requestBody({
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "USD",
          value: "10.00", // Total order amount
        },
      },
    ],
  });

  try {
    const response = await client.execute(request);
    const orderID = response.result.id;
    return response.result.links.find((link) => link.rel === "approve").href;
  } catch (error) {
    console.error(error);
    throw new Error("Error creating order");
  }
};

module.exports = {
  createOrder,
};
