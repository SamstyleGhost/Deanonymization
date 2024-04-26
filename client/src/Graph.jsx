import { createEffect, createSignal } from "solid-js";
import { Network } from "vis-network";
import axios from "axios";

const Graph = () => {

  const [data, setData] = createSignal([]);

  let visJSRef;

  const options = {
    height: '600px',
    width: '100%',
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

  let work;

  createEffect(() => {
    axios.get('http://localhost:5000/api/').then((response) => {
      setData(response.data.data)
    }).catch((error) => {
      console.error(error);
    })
  })

  createEffect(() => {
    work = new Network(visJSRef, data(), options);
  })

  return (
    <div ref={visJSRef} class="border border-red-700"></div>
  )
};

export default Graph;