import { createEffect, createSignal } from "solid-js";
import axios from "axios";

const AddressRating = () => {

  const [ratingData, setRatingData] = createSignal([]);

  createEffect(() => {
    axios.get('http://localhost:5000/api/risk-rating-address-node')
      .then(response => {
        setRatingData(response.data.risk_rating_address_data.records);
      })
      .catch(error => {
        console.error(error);
      })
  })

  return (
    <div class="flex flex-col gap-4 w-full">
      <div class="border-b-2 border-gray-700 flex w-full py-2">
        <div class="w-2/3">Node index</div>
        <div class="w-1/3">Risk rating</div>
      </div>
      <div class="flex flex-col gap-2 overflow-y-auto">
        <For each={ratingData()} >
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

export default AddressRating;