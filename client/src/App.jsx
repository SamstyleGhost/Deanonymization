import { Router, Route } from "@solidjs/router";

import { Sidebar } from "./components";
import { Graph, TransactionAmount, AddressAmount, TransactionRating, AddressRating, PageRank, GraphSage } from "./pages";

function App() {

  return (
    <div class="flex w-full h-dvh overflow-hidden bg-background text-text">
      <Sidebar />
      <div class="w-full h-dvh overflow-y-auto">
        <Router>
          <Route path='/' component={Graph} />
          <Route path='/transaction-node-amount' component={TransactionAmount} />
          <Route path='/address-node-amount' component={AddressAmount} />
          <Route path='/transaction-risk-rating' component={TransactionRating} />
          <Route path='/address-risk-rating' component={AddressRating} />
          <Route path='/page-rank' component={PageRank} />
          <Route path='/graph-sage' component={GraphSage} />
        </Router>
      </div>
    </div>
  );
}

export default App;