const Sidebar = () => {
  return (
    <div class="flex flex-col gap-8 border-r-2 border-primary rounded-r-lg">
      <div>
        <h1>Nelson&Murdock</h1>
      </div>
      <div class="w-80 flex flex-col gap-4 px-4">
        <div class="p-2 rounded-md hover:bg-secondary/60 duration-300 border-b-2 border-accent drop-shadow-sm shadow-sm">
          <a class="" href='/'>Graph</a>
        </div>
        <div class="p-2 rounded-md hover:bg-secondary/60 duration-300 border-b-2 border-accent drop-shadow-sm shadow-sm">
          <a class="" href='/transaction-node-amount'>Transaction Node Amount</a>
        </div>
        <div class="p-2 rounded-md hover:bg-secondary/60 duration-300 border-b-2 border-accent drop-shadow-sm shadow-sm">
          <a class="" href='/address-node-amount'>Address Node Amount</a>
        </div>
        <div class="p-2 rounded-md hover:bg-secondary/60 duration-300 border-b-2 border-accent drop-shadow-sm shadow-sm">
          <a class="" href='/transaction-risk-rating'>Transaction Risk Rating</a>
        </div>
        <div class="p-2 rounded-md hover:bg-secondary/60 duration-300 border-b-2 border-accent drop-shadow-sm shadow-sm">
          <a class="" href='/address-risk-rating'>Address Risk Rating</a>
        </div>
        <div class="p-2 rounded-md hover:bg-secondary/60 duration-300 border-b-2 border-accent drop-shadow-sm shadow-sm">
          <a class="" href='/page-rank'>Page Rank</a>
        </div>
        <div class="p-2 rounded-md hover:bg-secondary/60 duration-300 border-b-2 border-accent drop-shadow-sm shadow-sm">
          <a class="" href='/graph-sage'>Graph Sage</a>
        </div> 
      </div>
    </div>
  )
};

export default Sidebar;