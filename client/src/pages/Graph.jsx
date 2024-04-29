import { createEffect, createSignal, Show, For } from "solid-js";
import { Network } from "vis-network";
import axios from "axios";

const Graph = () => {

  const [data, setData] = createSignal([]);
  const [nodes, setNodes] = createSignal([]);
  const [edges, setEdges] = createSignal([]);
  const [networkData, setNetworkData] = createSignal({});
  const [selectedNode, setSelectedNode] = createSignal(null);
  const [outgoingTransactionData, setOutgoingTransactionData] = createSignal([]);
  const [incomingTransactionData, setIncomingTransactionData] = createSignal([]);

  let transactionRegex = /^[a-z0-9]{64}/;

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
        // console.log(response.data.num_of_nodes);
        // console.log(response.data.num_of_relationships);
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
    net.on('click', (params) => {
      setSelectedNode(params.nodes[0]);
    })
  });

  createEffect(() => {
    console.log(data());
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
        if(source_index === '12t9YDPgwueZ9NyMgw519p7AA8isjr6SMw')
          current_nodes.push({ id: source_index, label: source_index, color: 'red' })
        else
          current_nodes.push({ id: source_index, label: source_index, color: '#00FF7F' })

      }

      if(target_node_present === 0) {
        current_nodes.push({ id: target_index, label: target_index, color: '#97c2fc' })
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
        current_edges.push({ arrows: 'to', from: source_index, amount: amount, to: target_index })
      }

    })

    setNodes(current_nodes);
    setEdges(current_edges);

  });

  createEffect(() => {

    const outTransactionData = [];
    const inTransacationData = [];

    data().map(item => {
      if(item._fields[0].segments[0].start.properties.index === selectedNode()) {
        outTransactionData.push({ 
          to: item._fields[0].segments[0].end.properties.index, 
          amount: item._fields[0].segments[0].relationship.properties.amount, 
          time_stamp: item._fields[0].segments[0].relationship.properties.time_stamp 
        })
      }

      if(item._fields[0].segments[0].end.properties.index === selectedNode()) {
        inTransacationData.push({ 
          from: item._fields[0].segments[0].start.properties.index, 
          amount: item._fields[0].segments[0].relationship.properties.amount, 
          time_stamp: item._fields[0].segments[0].relationship.properties.time_stamp 
        })
      }

    })

    setOutgoingTransactionData(outTransactionData);
    setIncomingTransactionData(inTransacationData);
  })


  return (
    <div class="w-full overflow-x-hidden pb-4">
      <div ref={visJSRef} class="m-2 border-2 border-black rounded-md drop-shadow-md shadow-md"></div>
      <Show when={selectedNode()} fallback={<div class="ml-2"><p>Select a node to view additional details</p></div>}>
        <div class="flex flex-col gap-2 ml-2 py-4">
          <p>Current selected node: <span class="text-2xl font-semibold text-primary">{selectedNode()}</span></p>
        </div>
        <Show when={outgoingTransactionData().length !== 0}>
          <h3 class="ml-2 pb-1 text-xl font-semibold underline underline-offset-2">Outgoing Transactions</h3>
          <div class="flex flex-col gap-2 w-full ml-2 pb-8">
            <div class="flex w-full py-0.5 border-b border-secondary/55">
              <div class="w-1/2 truncate text-lg font-medium pr-8">Receiver address</div>
              <div class="w-1/4 text-lg font-medium pr-4">Amount</div>
              <div class="w-1/4 text-lg font-medium">Time Stamp</div>
            </div>
            <For each={outgoingTransactionData()}>
              {item => (
                <div class="flex w-full py-0.5">
                  <div class="w-1/2 truncate">{item.to}</div>
                  <div class="w-1/4">{item.amount}</div>
                  <div class="w-1/4">{item.time_stamp}</div>
                </div>
              )}
            </For>
          </div>
        </Show>
        <Show when={incomingTransactionData().length !== 0}>
          <h3 class="ml-2 pt-4 border-t-2 border-dashed border-black text-xl font-semibold underline underline-offset-2">Incoming Transactions</h3>
          <div class="flex flex-col gap-2 w-full ml-2">
            <div class="flex w-full py-0.5 border-b border-secondary/55">
              <div class="w-1/2 truncate text-lg font-medium pr-8">Sender address</div>
              <div class="w-1/4 text-lg font-medium pr-4">Amount</div>
              <div class="w-1/4 text-lg font-medium">Time Stamp</div>
            </div>
            <For each={incomingTransactionData()}>
              {item => (
                <div class="flex w-full py-0.5">
                  <div class="w-1/2 truncate">{item.from}</div>
                  <div class="w-1/4">{item.amount}</div>
                  <div class="w-1/4">{item.time_stamp}</div>
                </div>
              )}
            </For>
          </div>
        </Show>
      </Show>
    </div>
  )
};

export default Graph;