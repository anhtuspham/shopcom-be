import {query, validationResult} from 'express-validator';

export const validateGetProducts = [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page phải là số nguyên dương."),
    query("limit")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Limit phải là số nguyên dương."),
    query("category")
      .optional()
      .isIn(["Laptop", "Smartphone", "Tablet", "Headphone"])
      .withMessage("Danh mục không hợp lệ."),
    query("brand")
      .optional()
      .isString()
      .trim()
      .notEmpty()
      .withMessage("Brand phải là chuỗi không rỗng."),
    query("search")
      .optional()
      .isString()
      .trim()
      .withMessage("Search phải là chuỗi."),
    query("sort")
      .optional()
      .isIn(["priceAsc", "priceDesc", "rating", "newest"])
      .withMessage("Sort không hợp lệ."),

    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map((err) => err.msg);
        return res.status(400).json({ errors: errorMessages });
      }
      next();
    },
  ];