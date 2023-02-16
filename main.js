const fetch = require("node-fetch");
const fs = require('fs');
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const save_to_file_interval=10*60*1000  , poll_interval=5*1000;
let traffic_db={};
let traffic_db_stat={
    initialTimestamp:Date.now(),
    records:0,
    nodeRecords:{}
};
//TODO:暂时以data子项的键名为索引
function sub_processData(respJSON){
    if(respJSON.ret !== 1)return false;
    const nowTimestamp=Date.now();
    for (const nodeIdStr in (respJSON.data)) {
        const nodeId=parseInt(nodeIdStr);
        const nodeData=respJSON.data[nodeId];
        if(!traffic_db[nodeId]) {
            //Non-exist : Create new mem-db entry
            traffic_db[nodeId] = [];
            traffic_db_stat.nodeRecords[nodeId]=0;
        }
        //Insert into my memory db
        // console.log(response,nodeId,nodeIdStr);
        traffic_db[nodeId].push({
            ts:nowTimestamp,
            name:nodeData.node_name,
            usedByte:nodeData.ud
        });
        traffic_db_stat.nodeRecords[nodeId]++;
        traffic_db_stat.records++;
    }
    //Check if mem-db is full.Write to file if so.
    if(nowTimestamp > traffic_db_stat.initialTimestamp + save_to_file_interval)
        sub_mergeAndSave();
    console.log(traffic_db);
    // console.log(response);
}
function sub_mergeAndSave(){
    //Merge entries in mem-db, generate a general db for integrating in larger DB.
    // let db_for_save={};
    for (const nodeId in traffic_db) {
        const nodeEntries=traffic_db[nodeId];
        for(let nodeEntryID in nodeEntries){
            nodeEntryID=parseInt(nodeEntryID);
            if(nodeEntryID===0)continue;
            if(nodeEntries[nodeEntryID].usedByte===nodeEntries[nodeEntryID-1].usedByte){
                nodeEntries.splice(nodeEntryID,1);
                console.log(nodeEntries);
            }
        }
    }
    //TODO:建一个数据库用于保存一些信息。还没想好
    // JSON.parse(fs.readFileSync())
    //---------------
    // const savedInStreamCSV=``;
}
async function pullData_local(){
    await fetch("http://127.0.0.1/ta.json").then(response=>response.json()).then(response=>{sub_processData(response)});
}
async function pullData_local2(){
    await fetch("http://127.0.0.1/tb.json").then(response=>response.json()).then(response=>{sub_processData(response)});
}
async function pullData(){
    // fetch("http://127.0.0.1/ta.json", {
    fetch("https://www.cutecloud.net/user/ajax_data/chart/index_node_traffic", {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Cookie':require("./secret.js").cookie
        },
    }).then(response=>response.json()).then(response=>{sub_processData(response)});
}
pullData_local().then(r=>{
    console.log("-----------------------------------------------------");
    console.log("-----------------------------------------------------");
}).then(r=>{
    pullData_local2().then(sub_mergeAndSave)
});


