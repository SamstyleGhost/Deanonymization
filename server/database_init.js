import { createRequire } from "module";
const require = createRequire(import.meta.url);

require('dotenv').config();

import * as neo4j from 'neo4j-driver';

const URI= process.env.URI;
const USER= process.env.USER;
const PASSWORD= process.env.PASSWORD;
const driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD));
const session = driver.session()


const dbInit = async () => {
  let query = `
  CALL gds.graph.project('myGraph', ['output', 'tx'], '*') YIELD graphName, nodeCount, relationshipCount;
  `
  await session.run(query);

  query = `
  CALL gds.pageRank.write('myGraph', {
    maxIterations: 20,
    dampingFactor: 0.85,
    writeProperty: 'pageRank'
  })
  `
  await session.run(query);

  query = `
  MATCH (n)
  SET n.out_degree = size([(n)-[:PAYS]->() | n])
  SET n.in_degree = size([(n)<-[:PAYS]-() | n])
  RETURN n.index,n.out_degree, n.in_degree, n.pageRank as pagerank, n.label, n.depth, n.time_stamp
  ORDER by pagerank asc
  `
  await session.run(query);

  query = `
  MATCH (n:output)-[r:PAYS]-(q:tx)
  WITH q, sum(r.amount) as total_btc
  SET q.total_amount = total_btc
  RETURN q.index as txid, total_btc
  `
  await session.run(query);

  query = `
  MATCH (n:output)-[r:PAYS]-(q:tx)
  WITH n, sum(r.amount) as total_btc
  SET n.total_amount = total_btc
  RETURN n.index as btc_addr, total_btc
  `
  await session.run(query);

  query = `
  MATCH (n)
  WITH sum(n.in_degree+n.out_degree) as total_degrees
  MATCH (q:tx)
  WITH q,(q.in_degree+q.out_degree) as a, total_degrees as td1, q.total_amount as x
  SET q.risk_rating = (toFloat(a) / toFloat(td1)) * (x)
  RETURN q.index, q.risk_rating as risk_rating
  `
  await session.run(query);

  query = `
  MATCH (n)
  WITH sum(n.in_degree+n.out_degree) as total_degrees
  MATCH (q:output)
  WITH q,(q.in_degree+q.out_degree) as a, total_degrees as td1, q.total_amount as x
  SET q.risk_rating = (toFloat(a)/toFloat(td1))*(x)
  RETURN q.index, q.risk_rating as risk_rating
  `
  await session.run(query);

  query = `
  MATCH (n)
  WITH sum(n.in_degree+n.out_degree) as total_degrees
  MATCH (q:output)
  WITH q,(q.in_degree+q.out_degree) as a, total_degrees as td1, q.total_amount as x
  SET q.risk_rating = (toFloat(a)/toFloat(td1))*(x)
  RETURN q.index, q.risk_rating as risk_rating
  `
  await session.run(query);

  query = `
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
  await session.run(query);

  query = `
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
    }
  )
  `
  await session.run(query);

  query = `
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
  await session.run(query);

  query = `
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
  await session.run(query);

  query = `
  CALL gds.beta.graphSage.stream(
    'addresses_with_transactions_1',
    {
      modelName: 'weightedTrainedModel'
    }
  )
  `
  await session.run(query);

  query = `
  CALL gds.beta.graphSage.stream(
    'addresses_with_transactions_1',
    {
      modelName: 'testModel'
    }
  )
  YIELD nodeId, embedding
  RETURN gds.util.asNode(nodeId).index as name, gds.util.asNode(nodeId).risk_rating as exp, gds.util.asNode(nodeId).pageRank as pr, gds.util.asNode(nodeId).out_degree as outdeg, gds.util.asNode(nodeId).in_degree as indeg, gds.util.asNode(nodeId).total_amount as ta, gds.util.asNode(nodeId).time_stamp as ts, embedding as features
  `
  await session.run(query);

  console.log("Database initalized");
  session.close();
}

dbInit();