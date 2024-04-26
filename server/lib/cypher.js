import * as neo4j from 'neo4j-driver';

const URI= process.env.URI;
const USER= process.env.USER;
const PASSWORD= process.env.PASSWORD;

driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD));
const session = driver.session();

const handle = async (query, params) => {
  try {
    // Query the database
    const result = await session.run(query, params);

    if(result.records.length == 0)
      return []
    
    return result

  } catch (error) {
    console.error(error);
  }
}