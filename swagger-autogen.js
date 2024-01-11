import swaggerAutogen from "swagger-autogen";



const outputFile = "./swagger.json";
const endpointsFiles = ["./*/*/*.routes/*.js"];

const config = {
  info: {
    title: "Teamlyf API Documentation",
    description: "",
  },
  tags: [],
  host: "localhost:8000/api/v1",
  schemes: ["http", "https"],
};

swaggerAutogen(outputFile, endpointsFiles, config);
