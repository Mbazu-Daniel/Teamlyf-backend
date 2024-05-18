import { httpServer } from "./app.js";

const PORT = process.env.PORT;

httpServer.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});
