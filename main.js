const fetch = require("node-fetch");
let traffic_db={};
let traffic_db_stat={
    initialTimestamp:0,
    records:0
};
//TODO:暂时以data子项的键名为索引
async function pullData(){
    fetch("https://www.cutecloud.net/user/ajax_data/chart/index_node_traffic", {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Cookie':require("secret").cookie
        },
    }).then(response=>response.json()).then(response=>{
        if(response.ret !== 1)return false;
        const timestamp=Date.now();
        for (const nodeIdStr in Object.keys(response.data)) {
            const nodeData=response.data[nodeId];
            const nodeId=parseInt(nodeIdStr);
            if(traffic_db[nodeId]){
                //Insert into my memory db

            }else{
                //Create new mem-db entry
                traffic_db[nodeId]=[];
            }
        }
        for
        console.log(response);
    });
}
pullData();