import { createEffect, createSignal } from "solid-js";
import axios from "axios";

const GraphSage = () => {

  const [graphSageData, setGraphSageData] = createSignal([]);
  const [maxThreshold, setMaxThreshold] = createSignal();
  const [medThreshold, setMedThreshold] = createSignal();
  const [minThreshold, setMinThreshold] = createSignal();

  createEffect(() => {
    axios.get('http://localhost:5000/api/run-graph-sage')
      .then(response => {
        setGraphSageData(response.data.graphsage_data.records);
      })
      .catch(error => {
        console.error(error);
      })
  });

  createEffect(() => {
    let max = -9999;
    let min = 9999;
    
    graphSageData().map(item => {
      if(item._fields[1] > max) 
        max = item._fields[1];

      if(item._fields[1] < min)
        min = item._fields[1];
    })

    setMaxThreshold(max);
    setMinThreshold(min);
    setMedThreshold((max + min) / 2);
  })

  return (
    <div class="flex flex-col gap-4 w-full px-2">
      <div class="border-b-2 border-gray-700 flex w-full py-2">
        <div class="w-3/6">Node index</div>
        <div class="w-1/6">Exposure</div>
        <div class="w-1/6">Risk</div>
        <div class="w-1/6">Total Amount</div>
      </div>
      <div class="flex flex-col gap-2 overflow-y-auto">
        <For each={graphSageData()} >
          {item => (
            <div class="flex w-full py-1">
              <div class="w-3/6 truncate pr-4">{item._fields[0]}</div>
              <div class="w-1/6">{item._fields[1]}</div>
              <div class="w-1/6">
                {item._fields[1] >= medThreshold() && <p>High</p> }
                {item._fields[1] < medThreshold() && item._fields[1] >= minThreshold() && <p>Medium</p> }
                {item._fields[1] < minThreshold() && <p>Low</p> }
              </div>
              <div class="w-1/6">{item._fields[5]}</div>
            </div>
          )}
        </For>        
      </div>
    </div>
  )
};

export default GraphSage;