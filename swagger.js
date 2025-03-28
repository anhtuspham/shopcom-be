import swaggerAutogen from "swagger-autogen";

const doc = {
  info: {
    title: "ShopCom API",
    description: "API Documentation for ShopCom",
    version: "1.0.0",
  },
  host: "localhost:5000",
  basePath: "/",
  schemes: ["http"],
  securityDefinitions: {
    BearerAuth: {
      type: "apiKey",  
      in: "header",
      name: "Authorization",
      description: "Nhập token theo định dạng: Bearer <your_token>",
    },
  },
  security: [{ BearerAuth: [] }], 
};

const outputFile = "./src/utils/swagger-output.json";
const endpointsFiles = ["./server.js"];

swaggerAutogen()(outputFile, endpointsFiles, doc).then(() => {
  console.log("Swagger JSON file has been generated!");
});