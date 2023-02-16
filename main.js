const fetch = require("node-fetch");
const fs = require('fs');
// const logger=require('./logger')().cyLogger;
const {dataEntryLogger,cyLogger}=require('./logger')();
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const save_to_file_interval=10*60*1000  , poll_interval=5*1000;
let traffic_db={};
let traffic_db_stat={
    initialTimestamp:Date.now(),
    records:0,
    nodeRecords:{}
};

// No exiting when reach :EOF
// alwaysSleep(1000);
// function alwaysSleep(timeout) {
//     setTimeout(alwaysSleep, timeout, timeout);
// }
//----------

//以data子项的键名为索引
function sub_processData(respJSON,is_local){
    if(respJSON.ret !== 1)return false;
    const nowTimestamp=Date.now();
    if(!is_local)cyLogger.debug(`Refreshed Data, ${JSON.stringify(respJSON.data)}`);
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
    //Check if mem-db is full.If so, Write to file.
    if(nowTimestamp > traffic_db_stat.initialTimestamp + save_to_file_interval)
        sub_mergeAndSave();

    // logger.debug(traffic_db);
    // console.log(response);
}



//Merge entries in mem-db, generate a general db for integrating into larger DB.
function sub_mergeAndSave(){
    //use json to store data
    let savedDB=JSON.parse(fs.readFileSync("database.json").toString());
    let toSaveInCSV="";
    const convertToLocaleTime=(ts)=>{
        // add 8 hours to let ISO time fits the china one.
        let a=new Date(ts+28800*1000);
        // return a.toDateString()+a.toTimeString().substring(0,9);
        return a.toISOString().replace('T',' ').replace('Z','');
    };
    //start iterating over the array
    for (const nodeId in traffic_db) {
        //nodeId is the key of outer circulation

        //get a copy of node-in-db
        let nodeEntries=traffic_db[nodeId];

        //Circulate to delete duplicate items
        for(let nodeEntryID in nodeEntries){
            nodeEntryID=parseInt(nodeEntryID);

            //The first entry of a node has nothing to compare, as of now
            if(nodeEntryID===0)continue;

            //Delete an entry that have no changes since last entry
            if(nodeEntries[nodeEntryID].usedByte===nodeEntries[nodeEntryID-1].usedByte){
                nodeEntries.splice(nodeEntryID,1);
            }
        }
        //Save back into mem-db
        traffic_db[nodeId]=nodeEntries;

        //Check in savedDB and merge into
            //In savedDB I use node_name for index.
            const nodeName=nodeEntries[0].name;
        let createdNow=false;
        if(!savedDB[nodeName]){
            //this means a new node which didn't appear in former times.
            //Start creating an entry in savedDB
            savedDB[nodeName]=[];
            createdNow=true;
        }
        let last_entry_in_savedDB=(!createdNow)?savedDB[nodeName][savedDB[nodeName].length-1]:{
            usedByte:0,
            ts2:nodeEntries[0].ts
        };
        for (const nodeEntriesKey in nodeEntries) {
            const thisEntry=nodeEntries[nodeEntriesKey];
            if(last_entry_in_savedDB.usedByte===thisEntry.usedByte){
                //usedByte not change, not inserting
                continue;
            }
            //Saving
            const saveObj={
                ts1:last_entry_in_savedDB.ts2,
                usedByte:thisEntry.usedByte,
                ts2:thisEntry.ts,
                increment:(!createdNow)?thisEntry.usedByte-last_entry_in_savedDB.usedByte:-1
            };
            savedDB[nodeName].push(saveObj);

            // toSaveInCSV+=`${nodeName}\t\t,${convertToLocaleTime(saveObj.ts1)}, ${convertToLocaleTime(saveObj.ts2)}, ${saveObj.usedByte},${saveObj.increment}\n`;
            // dataEntryLogger.info(toSaveInCSV);
            dataEntryLogger.addContext("nodeName",nodeName.replace(" ",""));
            dataEntryLogger.addContext("usedTraffic",(saveObj.usedByte/1024/1024).toFixed(3));
            dataEntryLogger.addContext("increment",saveObj.increment);

            dataEntryLogger.info(`${convertToLocaleTime(saveObj.ts1)}, ${convertToLocaleTime(saveObj.ts2)}`);
            //Refresh last_entry_in_savedDB
            last_entry_in_savedDB=savedDB[nodeName][savedDB[nodeName].length-1];
        } // for (const nodeEntriesKey in nodeEntries)

    }
    fs.writeFileSync("database.json",JSON.stringify(savedDB,null,2));
    //okTODO:Save in CSV for processing manually using Excel.
    // const writeStream = fs.createWriteStream('dataLog.csv', { flags: 'a' ,encoding: 'utf8'});
    // writeStream.write(toSaveInCSV+'\n');
    // writeStream.end();
    // const savedInStreamCSV=``;
}
async function pullData_local(){
    await fetch("http://127.0.0.1/ta.json").then(response=>response.json()).then(response=>{sub_processData(response,1)});
}
async function pullData_local2(){
    await fetch("http://127.0.0.1/tb.json").then(response=>response.json()).then(response=>{sub_processData(response,1)});
}
async function pullData(){
    await fetch("https://www.cutecloud.net/user/ajax_data/chart/index_node_traffic", {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Cookie':require("./secret.js").cookie
        },
    }).then(response=>response.json()).then(response=>{sub_processData(response,0)});
}
pullData_local().then(r=>{
    pullData().then(sub_mergeAndSave).then(r=>{
        console.log(traffic_db);
    })
});
// setTimeout(cb=>{pullData().then(sub_mergeAndSave).then(r=>{
//     console.log(traffic_db);
// });
// },2500);

