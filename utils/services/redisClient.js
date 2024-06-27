// import { createClient } from "redis";

// const client = createClient({
//   url: process.env.UPSTASH_REDIS,
// });

// (async () => {
//   client.on("error", (err) => {
//     console.log("Redis Client Error", err);
//   });
//   client.on("ready", () => console.log("Redis is ready"));

//   await client.connect();

//   await client.ping();
// })();
// export default client;
