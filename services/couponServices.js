const factory = require("./handlersFactory");
const Coupon = require("../models/couponModel");

//@Description -->   Get list of Coupons
//@Route -->   GET /api/v1/coupons
//@Access -->  Admin
exports.getCoupons = factory.getAll(Coupon);

//@Description -->   Get specific Coupon by id
//@Route -->   GET /api/v1/coupons/ :id
//@Access -->  Admin
exports.getCoupon = factory.getOne(Coupon);

//@Description -->   Create Coupon
//@Route -->   POST /api/v1/coupons
//@Access -->  Admin
exports.createCoupon = factory.createOne(Coupon);

//@Description -->   Update Coupon
//@Route -->   PUT /api/v1/coupons/id:
//@Access -->  Admin
exports.updateCoupon = factory.updateOne(Coupon);

//@Description -->   Delete Coupon
//@Route -->   DELETE /api/v1/coupons/id:
//@Access -->  Admin
exports.deleteCoupon = factory.deleteOne(Coupon);
