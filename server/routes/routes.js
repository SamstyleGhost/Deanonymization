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

import { cast_depth, count, create_graph_catalogue, create_graph_wannacry, format_timestamp, format_tx, graph_data, pagerank, parse_timestamp, parse_tx, refresh_graph, set_properties_for_degree_centrality, total_amount_passing_tx_node, total_amount_passing_address_node, update_depth, risk_rating_txt_node, risk_rating_address_node, delete_graph, create_graph_catalog_for_graph_sage_model, delete_model, train_graph_sage_model, test_different_hp_graph_sage, FastRP } from "../lib/cypher.js";

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

router.get('/page-rank', async (req, res) => {
  const pagerank_data = await pagerank();
  const degree_data = await set_properties_for_degree_centrality();
  // console.log(degree_data);
  // console.log(pagerank_data);

  res.status(200).send({ pagerank_data: pagerank_data, degree_data: degree_data })
});

router.get('/amount-tx-node', async (req,res) => {
  const amount_tx_node_data = await total_amount_passing_tx_node();

  res.status(200).send({ amount_tx_node_data: amount_tx_node_data });
});

router.get('/amount-address-node', async (req,res) => {
  const amount_address_node_data = await total_amount_passing_address_node();

  res.status(200).send({ amount_address_node_data: amount_address_node_data });
});

router.get('/risk-rating-tx-node', async (req,res) => {
  const risk_rating_tx_data = await risk_rating_txt_node();

  res.status(200).send({ risk_rating_tx_data: risk_rating_tx_data });
});

router.get('/risk-rating-address-node', async (req,res) => {
  const risk_rating_address_data = await risk_rating_address_node();

  res.status(200).send({ risk_rating_address_data: risk_rating_address_data });
});

router.get('/run-graph-sage', async(req,res) => {
  await delete_graph('addresses_with_transactions_1');
  await create_graph_catalog_for_graph_sage_model();
  await delete_model('weightedTrainedModel');
  await train_graph_sage_model();
  await delete_model('testModel');
  await test_different_hp_graph_sage();
  const graphsage_data = await FastRP();

  res.status(200).send({ graphsage_data: graphsage_data });
})

export default router;