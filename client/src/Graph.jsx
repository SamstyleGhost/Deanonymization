import { createEffect, createSignal } from "solid-js";
import { Network } from "vis-network";
import { DataSet } from 'vis-data';
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
      shape: 'dot',
      margin: 1
    },
    edges: {
      smooth: {
        enabled: true,
        type: 'dynamic'
      }
    },
    physics: {
      enabled: true,
      stabilization: {
        enabled: true,
        fit: true,
        iterations: 1000,
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
    axios.get('http://localhost:5000/api/').then((response) => {
      setData(response.data.data.records);
    }).catch((error) => {
      console.error(error);
    })
  });

  createEffect(() => {
    console.log(edges());
    console.log(nodes());
  })

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

    data().map((item, index) => {

      const source_index = item._fields[0].segments[0].start.properties.index;
      const target_index = item._fields[0].segments[0].end.properties.index;
      const amount = item._fields[0].segments[0].relationship.properties.amount;

      let node_present = 0;
      
      for(let node of nodes()) {
        if(node.id === source_index || node.id === target_index){
          node_present = 1;
          break;
        }
      }

      if(node_present === 0) {
        setNodes(prev => [...prev, { id: source_index, label: source_index, color:'#00FF7F' }, { id: target_index, label: target_index, color:'#00FF7F' }])
      }


      let edge_present = 0;

      for(let edge of edges()) {
        if(edge.from === source_index && edge.to === target_index) {
          edge.amount += amount;
          edge_present = 1;
          break;
        }
      }

      if(edge_present === 0) {
        setEdges(prev => [...prev, { from: source_index, to: target_index, amount: amount, arrows: 'to', label: 'PAYS' }])
      }

    })

  })

  return (
    <div>

      <div ref={visJSRef} class="border border-red-700"></div>
      <div>{edges().length}</div>
    </div>
  )
};

export default Graph;