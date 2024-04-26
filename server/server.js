import { createRequire } from "module";
const require = createRequire(import.meta.url);

require('dotenv').config();

const app = require('express')();
const cors = require('cors');


import router from "./routes/routes.js";

const corsOptions = {
  origin: 'http://localhost:3000'
}

app.use(cors(corsOptions));
app.use('/api', router);

app.listen(process.env.PORT);
