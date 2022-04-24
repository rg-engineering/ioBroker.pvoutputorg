/*
 * pvoutputorg adapter für iobroker
 *
 * Created: 23.04.2022 18:39:28
 *  Author: Rene


*/


"use strict";




const utils = require("@iobroker/adapter-core");

let adapter;
function startAdapter(options) {
    options = options || {};
    Object.assign(options, {
        name: "pvoutputorg",
        //#######################################
        //
        ready: function () {
            try {
                //adapter.log.debug('start');
                main();
            }
            catch (e) {
                adapter.log.error("exception catch after ready [" + e + "]");
            }
        },
        //#######################################
        //  is called when adapter shuts down
        unload: function (callback) {
            try {
                adapter && adapter.log && adapter.log.info && adapter.log.info("cleaned everything up...");
                //to do stop intervall
                callback();
            } catch (e) {
                callback();
            }
        },
        //#######################################
        //
        SIGINT: function () {
            adapter && adapter.log && adapter.log.info && adapter.log.info("cleaned everything up...");
            CronStop();
        },
        //#######################################
        //  is called if a subscribed object changes
        //objectChange: function (id, obj) {
        //    adapter.log.debug("[OBJECT CHANGE] ==== " + id + " === " + JSON.stringify(obj));
        //},
        //#######################################
        // is called if a subscribed state changes
        //stateChange: function (id, state) {
        //HandleStateChange(id, state);
        //},
        stateChange: async (id, state) => {
            await HandleStateChange(id, state);
        },
        //#######################################
        //
    });
    adapter = new utils.Adapter(options);

    return adapter;
}

const axios = require('axios');




async function main() {

    adapter.log.debug("start  ");

    /*
    await checkVariables();

    subscribeVars();


    let readInterval = 5;
    if (parseInt(adapter.config.readInterval) > 0) {
        readInterval = adapter.config.readInterval;
    }
    adapter.log.debug("read every  " + readInterval + " minutes");
    intervalID = setInterval(Do, readInterval * 60 * 1000);
    */
}

async function Do() {

    adapter.log.debug("starting ... " );

    await ReadData();

    await WriteData();
}


async function HandleStateChange(id, state) {
   

    if (state.ack !== true) {

        adapter.log.debug("handle state change " + id);
        const ids = id.split(".");

        if (ids[2] === "cmd") {
            await do_Command();
        }
        else {
            adapter.log.warn("unhandled state change " + id);
        }
    }

}

function subscribeVars() {
    adapter.subscribeStates("cmd");
}


async function checkVariables() {
    adapter.log.debug("init variables ");

    let key;
    let obj;

    key = "cmd";
    await adapter.setObjectNotExistsAsync(key, {
        type: "state",
        common: {
            name: "command",
            type: "string",
            role: "text",
            read: true,
            write: true
        }
    });

    
}




// If started as allInOne/compact mode => return function to create instance
if (module && module.parent) {
    module.exports = startAdapter;
} else {
    // or start the instance directly
    startAdapter();
} 