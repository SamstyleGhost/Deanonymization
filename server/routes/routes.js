import { createRequire } from "module";
const require = createRequire(import.meta.url);

require('dotenv').config();

import express from 'express';
const router = express.Router();
import * as neo4j from 'neo4j-driver';

const URI= process.env.URI;
const USER= process.env.USER;
const PASSWORD= process.env.PASSWORD;
// const driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD));
// const session = driver.session()

import { cast_depth, count, create_graph_catalogue, create_graph_wannacry, format_timestamp, format_tx, graph_data, parse_timestamp, parse_tx, refresh_graph, update_depth } from "../lib/cypher.js";

router.get('/', async (req,res) => {

  await create_graph_wannacry();
  await update_depth();
  await cast_depth();
  await parse_timestamp();
  await parse_tx();
  await format_timestamp();
  await format_tx();
  const data = await graph_data();

  const num_of_nodes = await count();
  await refresh_graph();
  const num_of_relationships = await create_graph_catalogue();

  res.status(200).send({ data: data, num_of_nodes: num_of_nodes, num_of_relationships: num_of_relationships });
});


export default router;