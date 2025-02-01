const User = require('../models/userModel');

exports.addToCart = async (req, res, next) => {
  const { productId } = req.body;

  const userData = await User.findById(req.user);
  const cartData = await userData.cartData;
  const productIndex = cartData.findIndex(
    (item) => item.product.toString() === productId,
  );
  if (productIndex >= 0) {
    cartData[productIndex].quantity += 1;
  } else {
    cartData.push({ product: productId, quantity: 1 });
  }

  await User.findByIdAndUpdate(req.user, { cartData });

  res.status(201).json({
    status: 'success',
    message: 'Item Added Succssfully',
  });
};

exports.updateCart = async (req, res, next) => {
  const { productId, amount } = req.body;

  const userData = await User.findById(req.user);
  let cartData = await userData.cartData;
  const productIndex = cartData.findIndex(
    (item) => item.product.toString() === productId,
  );

  cartData[productIndex].quantity += amount;

  cartData = cartData.filter((item) => item.quantity > 0);

  await User.findByIdAndUpdate(req.user, { cartData });

  res.status(201).json({
    status: 'success',
    message: 'Item Updated',
  });
};

exports.getUserCart = async (req, res, next) => {
  const userData = await User.findById(req.user).populate({
    path: 'cartData.product',
    populate: { path: 'category', select: 'name' },
  });

  const cartData = userData.cartData.map((item) => ({
    quantity: item.quantity,
    id: item.product.id,
    name: item.product.name,
    description: item.product.description,
    richDescription: item.product.richDescription,
    images: item.product.images,
    price: item.product.price,
    category: item.product.category.name,
    countInStock: item.product.countInStock,
    isFeatured: item.product.isFeatured,
    dateCreated: item.product.dateCreated,
  }));

  res.status(201).json({
    status: 'success',
    cartData,
  });
};

exports.deleteCartItem = async (req, res, next) => {
  const { productId } = req.body;

  const userData = await User.findById(req.user);
  const cartData = await userData.cartData;
  const productIndex = cartData.findIndex(
    (item) => item.product.toString() === productId,
  );
  cartData.splice(productIndex, 1);

  await User.findByIdAndUpdate(req.user, { cartData });

  res.status(201).json({
    status: 'success',
    message: 'Item Deleted Succssfully',
  });
};
