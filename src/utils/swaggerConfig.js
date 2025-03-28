import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "ShopCom API",
      version: "1.0.0",
      description: "API Documentation for ShopCom",
    },
    servers: [
      {
        url: "http://localhost:5000", // Thay bằng URL backend của bạn
      },
    ],
  },
  apis: ["./src/routes/**/*.js"], // Chỉ định các file chứa API để tự động sinh tài liệu
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app) => {
  app.use("/swagger", swaggerUi.serve, swaggerUi.setup(specs));
};
