import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import { createServer } from "http";
import connectDB from "./db/index.js";
import { app } from "./app.js";
import { initSocket } from "./socket.js"; 

const PORT = process.env.PORT || 8000;

connectDB().then(() => {
  const httpServer = createServer(app);   
  initSocket(httpServer);             
  httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}); 