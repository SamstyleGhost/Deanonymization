import { createEffect, createSignal } from "solid-js";
import { Network } from "vis-network";
import axios from "axios";

const Graph = () => {

  const [data, setData] = createSignal([]);
  const [nodes, setNodes] = createSignal([]);
  const [edges, setEdges] = createSignal([]);
  const [networkData, setNetworkData] = createSignal({});

  let visJSRef;

  const options = {
    height: '600px',
    width: '100%',
    autoResize: true,
    nodes: {
      physics: true,
      shape: 'dot'
    },
    edges: {
      smooth: {
        enabled: true      }
    },
    physics: {
      enabled: true,
      stabilization: {
        enabled: true,
        fit: true,
        iterations: 3000,
        onlyDynamicEdges: false,
        updateInterval: 50
      }
  }
  };  

  let net;

  createEffect(() => {
    setNetworkData(
      {
        nodes: nodes(),
        edges: edges()
      }
    )
  })

  createEffect(() => {
    axios.get('http://localhost:5000/api/')
      .then((response) => {
        setData(response.data.data.records);
        console.log(response.data.num_of_nodes);
        console.log(response.data.num_of_relationships);
      })
      .catch((error) => {
        console.error(error);
      })
  });

  createEffect(() => {
    setNetworkData({
      nodes: nodes(),
      edges: edges()
    })
  })

  createEffect(() => {
    net = new Network(visJSRef, networkData(), options);
  })

  createEffect(() => {

    const current_nodes = [];
    const current_edges = [];

    data().map((item, index) => {

      const source_index = item._fields[0].segments[0].start.properties.index;
      const target_index = item._fields[0].segments[0].end.properties.index;
      const amount = item._fields[0].segments[0].relationship.properties.amount;

      let source_node_present = 0;
      let target_node_present = 0;
      
      for(let node of current_nodes) {
        if(node.id === source_index){
          source_node_present = 1;
          break;
        }
      }
      
      for(let node of current_nodes) {
        if(node.id === target_index){
          target_node_present = 1;
          break;
        }
      }

      if(source_node_present === 0) {
        current_nodes.push({ id: source_index, label: source_index, color:'#00FF7F' })
      }

      if(target_node_present === 0) {
        current_nodes.push({ id: target_index, label: target_index, color:'#00FF7F' })
      }


      let edge_present = 0;

      for(let edge of current_edges) {
        if(edge.from === source_index && edge.to === target_index) {
          edge_present = 1;
          edge.amount += amount;
          break;
        }
      }

      if(edge_present === 0) {
        current_edges.push({ "arrows": 'to', "from": source_index, amount: amount, "to": target_index })
      }

    })

    setNodes(current_nodes);
    setEdges(current_edges);

  })

  return (
    <div class="w-full">
      <div ref={visJSRef} class="border border-red-700"></div>
    </div>
  )
};

export default Graph;