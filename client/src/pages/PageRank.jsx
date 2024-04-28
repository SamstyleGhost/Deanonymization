import { createEffect, createSignal } from "solid-js";
import { For } from "solid-js";
import axios from "axios";

const PageRank = () => {

  const [pageRankData, setPageRankData] = createSignal([]);

  createEffect(() => {
    axios.get('http://localhost:5000/api/page-rank')
      .then((response) => {
        setPageRankData(response.data.degree_data.records);
      })
      .catch(error => {
        console.error(error);
      })
  })

  return (
    <div class="flex flex-col gap-4 w-full">
      <div class="border-b-2 border-gray-700 flex w-full py-2">
        <div class="w-3/6">Node index</div>
        <div class="w-1/6">In degree</div>
        <div class="w-1/6">Out degree</div>
        <div class="w-1/6">Page Rank</div>
      </div>
      <div class="flex flex-col gap-2 overflow-y-auto">
        <For each={pageRankData()} >
          {item => (
            <div class="flex w-full py-1">
              <div class="w-3/6 truncate pr-4">{item._fields[0]}</div>
              <div class="w-1/6">{item._fields[2].low}</div>
              <div class="w-1/6">{item._fields[1].low}</div>
              <div class="w-1/6">{item._fields[3]}</div>
            </div>
          )}
        </For>        
      </div>
    </div>
  )
};

export default PageRank;