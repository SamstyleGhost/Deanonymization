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



// * page rank
export const pagerank = async () => {
  let query = `
    CALL gds.pageRank.write('myGraph', {
      maxIterations: 20,
      dampingFactor: 0.85,
      writeProperty: 'pageRank'
    })
  `

  const data = await handle(query);
  return data;
}

export const set_properties_for_degree_centrality = async () => {
  let query = `
    MATCH (n)
    SET n.out_degree = size([(n)-[:PAYS]->() | n])
    SET n.in_degree = size([(n)<-[:PAYS]-() | n])
    RETURN n.index,n.out_degree, n.in_degree, n.pageRank as pagerank, n.label, n.depth, n.time_stamp
    ORDER by pagerank asc
  `

  const data = handle(query);
  return data;
}

// * Amount data
// Amount Passing through Transaction node
export const total_amount_passing_tx_node = async () => {
  let query = `
    MATCH (n:output)-[r:PAYS]-(q:tx)
    WITH q, sum(r.amount) as total_btc
    SET q.total_amount = total_btc
    RETURN q.index as txid, total_btc
  `

  const data = handle(query);
  return data;
}

// Amount Passing through Address node
export const total_amount_passing_address_node = async () => {
  let query = `
    MATCH (n:output)-[r:PAYS]-(q:tx)
    WITH n, sum(r.amount) as total_btc
    SET n.total_amount = total_btc
    RETURN n.index as btc_addr, total_btc
  `

  const data = handle(query);
  return data;
}

// Risk rating of Transaction nodes
export const risk_rating_txt_node = async () => {
  let query = `
    MATCH (n)
    SET n.out_degree = size([(n)-[:PAYS]->() | n])
    SET n.in_degree = size([(n)<-[:PAYS]-() | n])
    RETURN n.index,n.out_degree, n.in_degree, n.pageRank as pagerank, n.label, n.depth, n.time_stamp
    ORDER by pagerank asc
  `
  await handle(query);

  query = `
    MATCH (n)
    WITH sum(n.in_degree+n.out_degree) as total_degrees
    MATCH (q:tx)
    WITH q,(q.in_degree+q.out_degree) as a, total_degrees as td1, q.total_amount as x
    SET q.risk_rating = (toFloat(a) / toFloat(td1)) * (x)
    RETURN q.index, q.risk_rating as risk_rating
  `

  const data = handle(query);
  return data;
}

// Risk rating of Address nodes
export const risk_rating_address_node = async () => {
  let query = `
    MATCH (n)
    SET n.out_degree = size([(n)-[:PAYS]->() | n])
    SET n.in_degree = size([(n)<-[:PAYS]-() | n])
    RETURN n.index,n.out_degree, n.in_degree, n.pageRank as pagerank, n.label, n.depth, n.time_stamp
    ORDER by pagerank asc
  `
  await handle(query);

  query = `
    MATCH (n)
    WITH sum(n.in_degree+n.out_degree) as total_degrees
    MATCH (q:output)
    WITH q,(q.in_degree+q.out_degree) as a, total_degrees as td1, q.total_amount as x
    SET q.risk_rating = (toFloat(a)/toFloat(td1))*(x)
    RETURN q.index, q.risk_rating as risk_rating
  `

  const data = handle(query);
  return data;
}


// * Graph Sage
// Deletes graph
export const delete_graph = async (graph) => {
  let query = `
    CALL gds.graph.drop(\'${graph}\');
  `

  await handle(query);
};

export const create_graph_catalog_for_graph_sage_model = async () => {
  let query = `
    CALL gds.graph.project(
      'addresses_with_transactions_1', 
      {
          output: {
              label: 'output',
              properties: {
                  risk_rating: {
                      property: 'risk_rating',
                      defaultValue: 0
                  },
                  pageRank: {
                      property: 'pageRank',
                      defaultValue: 0
                  },
                  in_degree: {
                      property: 'in_degree',
                      defaultValue: 0
                  },
                  out_degree: {
                      property: 'out_degree',
                      defaultValue: 0
                  },
                  total_amount: {
                      property: 'total_amount',
                      defaultValue: 0
                  }
              }
          },
          tx: {
              label: 'tx',
              properties: {
                  risk_rating: {
                      property: 'risk_rating',
                      defaultValue: 0
                  },
                  pageRank: {
                      property: 'pageRank',
                      defaultValue: 0
                  },
                  in_degree: {
                      property: 'in_degree',
                      defaultValue: 0
                  },
                  out_degree: {
                      property: 'out_degree',
                      defaultValue: 0
                  },
                  total_amount: {
                      property: 'total_amount',
                      defaultValue: 0
                  }
              }
          }
      },
      {
          PAYS: {
              type: 'PAYS',
              orientation: 'NATURAL',
              properties: {
                  amount: {
                      property: 'amount',
                      defaultValue: 0
                  }
              }
          }
      }
  )
  YIELD graphName, nodeCount, relationshipCount;
  `
  const data = await handle(query);
  return data;
};

export const delete_model = async (model) => {
  let query = `
    CALL gds.beta.model.drop(\'${model}\');
  `

  await handle(query);
};

export const train_graph_sage_model = async () => {
  let query = `
    CALL gds.beta.graphSage.train(
      'addresses_with_transactions_1',
      {
          modelName: 'weightedTrainedModel',
          featureProperties: ['pageRank', 'risk_rating', 'in_degree', 'out_degree', 'total_amount'],
          aggregator: 'mean',
          activationFunction: 'sigmoid',
          sampleSizes: [25, 10],
          relationshipWeightProperty: 'amount',
          relationshipTypes: ['PAYS']
      });
  `

  await handle(query);
};

export const test_different_hp_graph_sage = async () => {
  let query = `
    CALL gds.beta.graphSage.train('addresses_with_transactions_1',{
      modelName:'testModel',
      aggregator:'pool',
      batchSize:512,
      activationFunction:'relu',
      epochs:10,
      sampleSizes:[25,10],
      learningRate:0.0000001,
      embeddingDimension:256,
      featureProperties:['pageRank', 'risk_rating', 'in_degree', 'out_degree', 'total_amount']})
      YIELD modelInfo
      RETURN modelInfo
  `

  await handle(query);
};

export const FastRP = async () => {
  let query = `
    CALL gds.fastRP.stream('addresses_with_transactions_1',{
      relationshipTypes:['PAYS'],
      featureProperties: ['pageRank', 'risk_rating', 'in_degree', 'out_degree', 'total_amount'], //5 node features
      relationshipWeightProperty: 'amount',
      embeddingDimension: 250,
      iterationWeights: [0, 0, 1.0, 1.0],
      normalizationStrength:0.05
      //writeProperty: 'fastRP_Extended_Embedding'
    })
    YIELD nodeId, embedding
    RETURN gds.util.asNode(nodeId).index as name, gds.util.asNode(nodeId).risk_rating as exp, gds.util.asNode(nodeId).pageRank as pr, gds.util.asNode(nodeId).out_degree as outdeg, gds.util.asNode(nodeId).in_degree as indeg, gds.util.asNode(nodeId).total_amount as ta, gds.util.asNode(nodeId).time_stamp as ts, embedding as features
  `

  const data = await handle(query);
  return data;
}