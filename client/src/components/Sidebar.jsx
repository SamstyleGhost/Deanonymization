import logo from './../assets/logo.png';

const Sidebar = () => {
  return (
    <div class="flex flex-col gap-8 border-r-2 border-primary rounded-r-lg">
      <div class="flex justify-center items-center py-4">
        <div class='p-4 drop-shadow-lg shadow-lg flex flex-col gap-2 justify-center items-center rounded-2xl bg-accent'>
          <image src={logo} width={40} height={40} />
          <h1 class='logo-font font-semibold'>Nelson & Murdock</h1>
        </div>
      </div>
      <div class="w-80 flex flex-col gap-4 px-4">
        <div class="p-2 rounded-md hover:bg-accent duration-300 border-b-2 border-accent drop-shadow-sm shadow-sm">
          <a class="" href='/'>Graph</a>
        </div>
        <div class="p-2 rounded-md hover:bg-accent duration-300 border-b-2 border-accent drop-shadow-sm shadow-sm">
          <a class="" href='/transaction-node-amount'>Transaction Node Amount</a>
        </div>
        <div class="p-2 rounded-md hover:bg-accent duration-300 border-b-2 border-accent drop-shadow-sm shadow-sm">
          <a class="" href='/address-node-amount'>Address Node Amount</a>
        </div>
        <div class="p-2 rounded-md hover:bg-accent duration-300 border-b-2 border-accent drop-shadow-sm shadow-sm">
          <a class="" href='/transaction-risk-rating'>Transaction Risk Rating</a>
        </div>
        <div class="p-2 rounded-md hover:bg-accent duration-300 border-b-2 border-accent drop-shadow-sm shadow-sm">
          <a class="" href='/address-risk-rating'>Address Risk Rating</a>
        </div>
        <div class="p-2 rounded-md hover:bg-accent duration-300 border-b-2 border-accent drop-shadow-sm shadow-sm">
          <a class="" href='/page-rank'>Page Rank</a>
        </div>
        <div class="p-2 rounded-md hover:bg-accent duration-300 border-b-2 border-accent drop-shadow-sm shadow-sm">
          <a class="" href='/graph-sage'>Graph Sage</a>
        </div> 
      </div>
    </div>
  )
};

export default Sidebar;