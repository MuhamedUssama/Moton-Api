const { Schema, model } = require('mongoose');

const paymobTokensSchema = new Schema({
  token: {
    type: String,
    required: true
  },
  order: {
    type: Number,
    required: true
  },
  cartId: {
    type: Schema.Types.ObjectId,
    ref: 'Cart',
    required: true
  },
})

const PaymobToken = model('PaymobToken', paymobTokensSchema);
module.exports = PaymobToken;