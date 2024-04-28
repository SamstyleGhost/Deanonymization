const Sidebar = () => {
  return (
    <div class="w-80 flex flex-col gap-2">
      <a href='/'>Graph</a>
      <a href='/transaction-node-amount'>Transaction Node Amount</a>
      <a href='/address-node-amount'>Address Node Amount</a>
      <a href='/transaction-risk-rating'>Transaction Risk Rating</a>
      <a href='/address-risk-rating'>Address Risk Rating</a>
      <a href='/page-rank'>Page Rank</a>
      <a href='/graph-sage'>Graph Sage</a>
    </div>
  )
};

export default Sidebar;