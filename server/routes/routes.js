import { createRequire } from "module";
const require = createRequire(import.meta.url);

require('dotenv').config();

import express from 'express';
const router = express.Router();
import * as neo4j from 'neo4j-driver';

const URI= process.env.URI;
const USER= process.env.USER;
const PASSWORD= process.env.PASSWORD;

const connectToDatabase = async (req, res, next) => {
  let driver;
  try {
    driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD));
    
  } catch (error) {
    console.error(`Connection error\n${error}\nCause: ${error.cause}`);
    await driver.close();
    return res.status(500).send({ message: error.cause})
  }

  res.driver = driver;

  next();
}


router.get('/', connectToDatabase, async (req,res) => {

  const serverInfo = await res.driver.getServerInfo()
  console.log(serverInfo);

  const nodes = [
    { id: 1, label: "Node 1" },
    { id: 2, label: "Node 2" },
    { id: 3, label: "Node 3" },
    { id: 4, label: "Node 4" },
    { id: 5, label: "Node 5" },
  ];

  const edges = [
    { from: 1, to: 3 },
    { from: 1, to: 2 },
    { from: 2, to: 4 },
    { from: 2, to: 5 },
    { from: 3, to: 3 },
  ]

  const data = {
    nodes: nodes,
    edges: edges
  }



  res.status(200).send({data: data});
});


export default router;