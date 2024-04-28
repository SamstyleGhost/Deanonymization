import { createEffect, createSignal } from "solid-js";
import axios from "axios";


const TransactionAmount = () => {

  const [amountData, setAmountData] = createSignal([]);

  createEffect(() => {
    axios.get('http://localhost:5000/api/amount-tx-node')
      .then(response => {
        setAmountData(response.data.amount_tx_node_data.records);
      })
      .catch(error => {
        console.error(error);
      })
  })
  
  return (
    <div class="flex flex-col gap-4 w-full">
      <div class="border-b-2 border-gray-700 flex w-full py-2">
        <div class="w-2/3">Node index</div>
        <div class="w-1/3">Total BTC</div>
      </div>
      <div class="flex flex-col gap-2 overflow-y-auto">
        <For each={amountData()} >
          {item => (
            <div class="flex w-full py-1">
              <div class="w-2/3 truncate pr-4">{item._fields[0]}</div>
              <div class="w-1/3">{item._fields[1]}</div>
            </div>
          )}
        </For>        
      </div>
    </div>
  )
};

export default TransactionAmount;