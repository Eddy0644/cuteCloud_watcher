const fetch = require("node-fetch");

//TODO:暂时以
async function pullData(){
    let fetch=require("node-fetch");
    let response = fetch("https://www.cutecloud.net/user/ajax_data/chart/index_node_traffic", {
        method: 'GET', // *GET, POST, PUT, DELETE, etc.
        headers: {
            'Content-Type': 'application/json',
            'Cookie':require("secret").cookie
        },
    }).then(response=>response.json()).then(response=>{
        if(response.ret !== 1)return false;
        console.log(response);
    });
}
pullData();