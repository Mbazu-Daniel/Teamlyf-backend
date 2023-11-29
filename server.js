import app from "./app.js";

const PORT = process.env.PORT;
console.log("Port: " + PORT);

app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});
