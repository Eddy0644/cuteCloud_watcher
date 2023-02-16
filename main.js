const fetch = require("node-fetch");
const fs = require('fs');
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const save_to_file_interval=10*60*1000  , poll_interval=5*1000;
let traffic_db={};
let traffic_db_stat={
    initialTimestamp:0,
    records:0,
    nodeRecords:{}
};
//TODO:暂时以data子项的键名为索引
async function pullData(){
    fetch("http://127.0.0.1/ta.json", {
    // fetch("https://www.cutecloud.net/user/ajax_data/chart/index_node_traffic", {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Cookie':require("./secret.js").cookie
        },
    }).then(response=>response.json()).then(response=>{
        if(response.ret !== 1)return false;
        const nowTimestamp=Date.now();
        for (const nodeIdStr in Object.keys(response.data)) {
            const nodeId=parseInt(nodeIdStr);
            const nodeData=response.data[nodeId];
            if(!traffic_db[nodeId]) {
                //Non-exist : Create new mem-db entry
                traffic_db[nodeId] = [];
                traffic_db_stat.nodeRecords[nodeId]=0;
            }
            //Insert into my memory db
            console.log(response,nodeId,nodeIdStr);
            traffic_db[nodeId].push({
                ts:nowTimestamp,
                name:nodeData.node_name,
                usedByte:nodeData.ud
            });
            traffic_db_stat.nodeRecords[nodeId]++;
            traffic_db_stat.records++;
        }
        //Check if mem-db is full.Write to file if so.
        if(nowTimestamp > traffic_db_stat.initialTimestamp + save_to_file_interval){
            //Merge entries in mem-db, generate a general db for integrating in larger DB.
            // let db_for_save={};
            for (const nodeId in traffic_db) {
                const nodeEntries=traffic_db[nodeId];
                for(const nodeEntryID in nodeEntries){
                    if(nodeEntryID===0)continue;
                    if(nodeEntries[nodeEntryID]===nodeEntries[nodeEntryID-1]){
                        nodeEntries.splice(nodeEntryID,1);
                    }
                }
            }
            //TODO:建一个数据库用于保存一些信息。还没想好
            // JSON.parse(fs.readFileSync())
            //---------------
            // const savedInStreamCSV=``;
        }
        console.log(response);
    });
}
pullData();