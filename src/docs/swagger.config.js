import swaggerJSDoc from "swagger-jsdoc";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "ShipNow API",
      version: "1.0.0",
      description:
        "Professional API documentation for ShipNow, covering user management, products, orders, deliveries, mock data generation, and logging.",
    },
    servers: [
      {
        url: "http://localhost:8080",
        description: "Local development server",
      },
    ],
  },
  apis: ["./src/docs/**/*.yaml"],
};

export const swaggerSpecs = swaggerJSDoc(swaggerOptions);