import asyncHandler from "express-async-handler";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// add product to cart
const addProductToCart = asyncHandler(async (req, res) => {
  const { productId, variantIndex, quantity } = req.body;
  
  const userId = req.user._id;

  const product = await Product.findById(productId);


  if (!product) {
    return res.status(404).json({ message: "Sản phẩm không tồn tại" });
  }

  if (!product.variants[variantIndex]) {
    return res.status(400).json({ message: "Biến thể không tồn tại" });
  }

  const variant = product.variants[variantIndex];

  if (quantity > variant.quantity) {
    return res.status(400).json({
      message: "Số lượng sản phẩm trong giỏ hàng không hợp lệ",
    });
  }

  let cart = await Cart.findOne({ userId });
  if (!cart) {
    if(quantity < 0){
      return res.status(400).json({
        message: "Số lượng sản phẩm trong giỏ hàng không hợp lệ",
      });
    }
    cart = new Cart({
      userId,
      products: [{ productId, variantIndex, variantProduct: variant, price: variant.price, quantity }],
      totalPrice: variant.price * quantity,
    });
  } else if (cart.products.length === 0) {
    if(quantity < 0){
      return res.status(400).json({
        message: "Số lượng sản phẩm trong giỏ hàng không hợp lệ",
      });
    }
    cart.products.push({
      productId,
      variantIndex,
      variantProduct: variant,
      price: variant.price,
      quantity,
    });
  } else {
    const productIndex = cart.products.findIndex(
      (p) =>
        p.productId.toString() === productId &&
        p.variantIndex === parseInt(variantIndex)
    );

    if (productIndex !== -1) {
      // san pham da co trong gio hang
      if (cart.products[productIndex].quantity > variant.quantity) {
        return res.status(400).json({
          message: "Số lượng sản phẩm trong giỏ hàng vượt quá số lượng tồn kho",
        });
      }

      cart.products[productIndex].quantity += parseInt(quantity);
      if (cart.products[productIndex].quantity < 1) {
        cart.products = cart.products.filter(
          (p) =>
            p.productId.toString() !== productId ||
            p.variantIndex !== parseInt(variantIndex)
        );
      }
    } else {
      // san pham chua co trong gio hang
      cart.products.push({
        productId,
        variantIndex,
        variantProduct: variant,
        price: variant.price,
        quantity,
      });
    }

  }

  cart.totalPrice = cart.products.reduce(
    (sum, product) => sum + product.quantity * product.price,
    0
  );

  await cart.save();
  res.status(200).json({ message: "Cập nhật giỏ hàng thành công", cart });
});

const removeProductFromCart = asyncHandler(async (req, res) => {
  const { productId, variantIndex } = req.body;
  const userId = req.user._id;

  let cart = await Cart.findOne({ userId });

  if (!cart) {
    return res.status(404).json({ message: "Giỏ hàng không tồn tại" });
  }

  const initialLength = cart.products.length;
  cart.products = cart.products.filter(
    (p) =>
      p.productId.toString() !== productId ||
      p.variantIndex !== parseInt(variantIndex)
  );

  if (cart.products.length === initialLength) {
    return res.status(404).json({ message: "Sản phẩm không có trong giỏ hàng" });
  }

  cart.totalPrice = cart.products.reduce(
    (sum, product) => sum + product.quantity * product.price,
    0
  );

  if (cart.products.length === 0) {
    await Cart.findOneAndDelete({ userId });
    return res.status(200).json({ message: "Giỏ hàng đã bị xóa vì không còn sản phẩm" });
  }

  await cart.save();
  res.status(200).json({ message: "Xóa sản phẩm khỏi giỏ hàng thành công", cart });
});

const getUserCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const cart = await Cart.findOne({ userId });
  
  if (!cart) {
    return res.status(404).json({ message: "Giỏ hàng trống" });
  }

  res.status(200).json(cart);
});


export { addProductToCart, removeProductFromCart, getUserCart };
