import { createRequire } from "module";
const require = createRequire(import.meta.url);

require('dotenv').config();

import * as neo4j from 'neo4j-driver';

const URI= process.env.URI;
const USER= process.env.USER;
const PASSWORD= process.env.PASSWORD;

const driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD));
const session = driver.session();

export const handle = async (query, params) => {
  try {
    // Query the database
    const result = await session.run(query, params);

    if(result.records.length == 0)
      return []

    return result;

  } catch (error) {
    console.error(error);
  }
};



// * create_graph_1
// Will create graph-table for us
export const create_graph_wannacry = async () => {
  let query = "match (a) -[r] -> () delete a, r";
  await handle(query);

  
  query = "match (a) delete a";
  await handle(query);

  query = `
    call apoc.load.json('12t9YDPgwueZ9NyMgw519p7AA8isjr6SMw_txs_outs.json') yield value
    UNWIND value.ins as ins
    UNWIND value.out as outs
    WITH value, ins, outs
    MERGE (tx:tx {index:value.txid, depth:value.depth_, time_stamp: apoc.date.format(value.time, 's', 'dd/MM/yyyy HH:mm:ss zzz')})
    MERGE (in :output {index: ins.address, label: coalesce(ins.label, "NA")}) 
    MERGE (in)-[p:PAYS {time_stamp: apoc.date.format(value.time, 's', 'dd/MM/yyyy HH:mm:ss zzz'), amount: ins.amount, next_tx: ins.next_tx}]->(tx)
    MERGE (out :output {index: outs.address, label: coalesce(outs.label, "NA")})
    MERGE (tx)-[q:PAYS {time_stamp: apoc.date.format(value.time, 's', 'dd/MM/yyyy HH:mm:ss zzz'), amount: outs.amount, next_tx: coalesce(outs.next_tx, "UNSPENT")}]->(out)
  `

  await handle(query);
  console.log("Graph created");
}

// post process for updating depth on address nodes
export const update_depth = async () => {
  let query = `
    MERGE (n:output)-[r:PAYS]-(p:tx)
    WITH n, COALESCE(n.depth, []) + p.depth AS depth
    UNWIND depth as d
    WITH n, collect(distinct d) AS unique
    set n.depth = unique
  `
  await handle(query);
}

// casting the 'depth' property into a Long Array
export const cast_depth = async () => {
  let query = `
    MATCH (n)
    SET n.depth = toIntegerorNull(n.depth)
  `

  await handle(query);
}

// Need to update the transaction nodes (tx) and the payment relationships [:PAYS]
export const parse_timestamp = async () => {
  let query = `
    MATCH ()-[r:PAYS]->()
    SET r.time_stamp = apoc.date.parse(r.time_stamp,'ms', 'dd/MM/yyyy HH:mm:ss zzz')
  `

  await handle(query);
}

export const parse_tx = async () => {
  let query = `
    MATCH (tx:tx)
    SET tx.time_stamp = apoc.date.parse(tx.time_stamp,'ms', 'dd/MM/yyyy HH:mm:ss zzz')
  `

  await handle(query);
}

export const format_timestamp = async () => {
  let query = `
    MATCH ()-[r:PAYS]->()
    SET r.time_stamp = apoc.date.format(r.time_stamp,'ms', 'dd/MM/yyyy HH:mm:ss zzz')
  `

  await handle(query);
}

export const format_tx = async () => {
  let query = `
    MATCH (tx:tx)
    SET tx.time_stamp = apoc.date.format(tx.time_stamp,'ms', 'dd/MM/yyyy HH:mm:ss zzz')
  `

  await handle(query);
}

export const graph_data = async () => {
  let query = `
    MATCH p=()-[r:PAYS]->() RETURN p 
  `

  const data = await handle(query);
  return data;
}

export const count = async () => {
  let query = `
    MATCH (n) RETURN COUNT(n)
  `

  const data = await handle(query);
  return data;
}

export const create_graph_catalogue = async () => {
  let query = `
    CALL gds.graph.project('myGraph', ['output', 'tx'], '*') YIELD graphName, nodeCount, relationshipCount;
  `

  const data = await handle(query);
  return data;
}

export const refresh_graph = async () => {
  let query = `
    CALL gds.graph.drop('myGraph') YIELD graphName;
  `
  
  await handle(query);
}

