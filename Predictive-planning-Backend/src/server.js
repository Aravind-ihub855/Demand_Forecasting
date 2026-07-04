const app = require("./app");
const env = require("./config/env");
const connectDb = require("./config/db");

const start = async () => {
  try {
    await connectDb();
    app.listen(env.port, () => {
      // eslint-disable-next-line no-console
      console.log(`Server running at http://localhost:${env.port}`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Startup error:", error);
    process.exit(1);
  }
};

start();
