/*
 * pvoutputorg adapter für iobroker
 *
 * Created: 23.04.2022 18:39:28
 *  Author: Rene
*/

"use strict";

const utils = require("@iobroker/adapter-core");
const axios = require('axios');

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


let intervalID;
async function main() {

    adapter.log.debug("start  ");

    
    await checkVariables();

    subscribeVars();


    let readInterval = 15;
    if (parseInt(adapter.config.readInterval) > 0) {
        readInterval = adapter.config.readInterval;
    }
    else {
        adapter.log.warn("read interval not defined");
    }
    adapter.log.debug("read every  " + readInterval + " minutes");
    intervalID = setInterval(Do, readInterval * 60 * 1000);
    
}

async function Do() {

    adapter.log.debug("starting ... " );

    await ReadData();

    //to do
    //await WriteData();
}


async function ReadData(){

    adapter.config.PVSystems
    for (const system of adapter.config.PVSystems) {
        await read(system);
    }
}


async function read(system) {

    try {
        /*
        https://pvoutput.org/service/r2/getstatus.jsp?key=key&sid=system
        */

        let sURL = "https://pvoutput.org/service/r2/getstatus.jsp?";
        sURL += "key=" + system.ApiKey;
        sURL += "&sid=" + system.SystemId;

        adapter.log.debug("URL " + sURL);

        let buffer = await axios.get(sURL);

        adapter.log.debug("got data status " + typeof buffer.data + " " + JSON.stringify(buffer.data));
        /*
        got data string "20220424,10:00,548,168,NaN,NaN,0.058,0.0,235.0"
        */

        let data = buffer.data.split(",");

        await adapter.setStateAsync(system.Name + ".Status.Date", { ack: true, val: data[0] });
        await adapter.setStateAsync(system.Name + ".Status.Time", { ack: true, val: data[1] });
        await adapter.setStateAsync(system.Name + ".Status.EnergyGeneration", { ack: true, val: Number(data[2]) });
        await adapter.setStateAsync(system.Name + ".Status.PowerGeneration", { ack: true, val: Number(data[3]) });
        await adapter.setStateAsync(system.Name + ".Status.EnergyConsumption", { ack: true, val: Number(data[4]) });
        await adapter.setStateAsync(system.Name + ".Status.PowerConsumption", { ack: true, val: Number(data[5]) });
        await adapter.setStateAsync(system.Name + ".Status.NormalisedOutput", { ack: true, val: Number(data[6]) });
        await adapter.setStateAsync(system.Name + ".Status.Temperature", { ack: true, val: Number(data[7]) });
        await adapter.setStateAsync(system.Name + ".Status.Voltage", { ack: true, val: Number(data[8]) });

        /*
         * 
         * Date yyyymmdd date 20210228
         * Time hh:mm time 13:00
         * Energy Generation number watt hours 359
         * Power Generation number watt 731 
         * Energy Consumption number watt hours 92
         * Power Consumption number watt 130 
         * Normalised Output number kW/kW 0.164
         * Temperature decimal celsius 21.4 
         * Voltage decimal volts 240.4
        */

        sURL = "https://pvoutput.org/service/r2/getstatistic.jsp?";
        sURL += "key=" + system.ApiKey;
        sURL += "&sid=" + system.SystemId;

        adapter.log.debug("URL " + sURL);

        buffer = await axios.get(sURL);

        adapter.log.debug("got data statistic " + typeof buffer.data + " " + JSON.stringify(buffer.data));

        /*
        got data statistic string "14088651,0,5932,1,16113,2.060,2375,20150510,20220424,5.595,20170424"
        */
        data = buffer.data.split(",");

        await adapter.setStateAsync(system.Name + ".Statistic.EnergyGenerated", { ack: true, val: Number(data[0]) });
        await adapter.setStateAsync(system.Name + ".Statistic.EnergyExported", { ack: true, val: Number(data[1]) });
        await adapter.setStateAsync(system.Name + ".Statistic.AverageGeneration", { ack: true, val: Number(data[2]) });
        await adapter.setStateAsync(system.Name + ".Statistic.MinimumGeneration", { ack: true, val: Number(data[3]) });
        await adapter.setStateAsync(system.Name + ".Statistic.MaximumGeneration", { ack: true, val: Number(data[4]) });
        await adapter.setStateAsync(system.Name + ".Statistic.AverageEfficiency", { ack: true, val: Number(data[5]) });
        await adapter.setStateAsync(system.Name + ".Statistic.Outputs", { ack: true, val: Number(data[6]) });
        await adapter.setStateAsync(system.Name + ".Statistic.ActualDateFrom", { ack: true, val: data[7] });
        await adapter.setStateAsync(system.Name + ".Statistic.ActualDateTo", { ack: true, val: data[8] });
        await adapter.setStateAsync(system.Name + ".Statistic.RecordEfficiency", { ack: true, val: Number(data[9]) });
        await adapter.setStateAsync(system.Name + ".Statistic.RecordDate", { ack: true, val: data[10] });

        /*
         * Energy Generated number watt hours 24600 
         * Energy Exported number watt hours 14220
         * Average Generation number watt hours 2220 
         * Minimum Generation number watt hours 800
         * Maximum Generation number watt hours 3400
         * Average Efficiency number kWh/kW 3.358 
         * Outputs number 27 
         * Actual Date From yyyymmdd date 20210201 
         * Actual Date To yyyymmdd date 20210228 
         * Record Efficiency number kWh/kW 4.653 
         * Record Date yyyymmdd date 20210205
         */


        sURL = "https://pvoutput.org/service/r2/getsystem.jsp?";
        sURL += "key=" + system.ApiKey;
        sURL += "&sid=" + system.SystemId;

        adapter.log.debug("URL " + sURL);

        buffer = await axios.get(sURL);

        adapter.log.debug("got data system " + typeof buffer.data + " " + JSON.stringify(buffer.data));

        /*
        got data system string "PV-System R-Wisch,2880,,16,180,Yingli YL 180,1,2500,SMA SB 2500,S,45.0,No,20081211,50.546189,12.36239,5;;0"
        */
        data = buffer.data.split(",");

        await adapter.setStateAsync(system.Name + ".System.SystemName", { ack: true, val: data[0] });
        await adapter.setStateAsync(system.Name + ".System.SystemSize", { ack: true, val: Number(data[1]) });
        await adapter.setStateAsync(system.Name + ".System.Postcode", { ack: true, val: Number(data[2]) });
        await adapter.setStateAsync(system.Name + ".System.Panels", { ack: true, val: Number(data[3]) });
        await adapter.setStateAsync(system.Name + ".System.PanelPower", { ack: true, val: Number(data[4]) });
        await adapter.setStateAsync(system.Name + ".System.PanelBrand", { ack: true, val: data[5] });
        await adapter.setStateAsync(system.Name + ".System.Inverters", { ack: true, val: Number(data[6]) });
        await adapter.setStateAsync(system.Name + ".System.InverterPower", { ack: true, val: Number(data[7]) });
        await adapter.setStateAsync(system.Name + ".System.InverterBrand", { ack: true, val: data[8] });
        await adapter.setStateAsync(system.Name + ".System.Orientation", { ack: true, val: data[9] });
        await adapter.setStateAsync(system.Name + ".System.ArrayTilt", { ack: true, val: Number(data[10]) });
        await adapter.setStateAsync(system.Name + ".System.Shade", { ack: true, val: data[11] });
        await adapter.setStateAsync(system.Name + ".System.InstallDate", { ack: true, val: data[12] });
        await adapter.setStateAsync(system.Name + ".System.Latitude", { ack: true, val: Number(data[13]) });
        await adapter.setStateAsync(system.Name + ".System.Longitude", { ack: true, val: Number(data[14]) });
       
        /*
         * System Name text PVOutput Demo
         * System Size number watts 3200 
         * Postcode / Zipcode number 2162
         * Panels number 10 
         * Panel Power number watts 320
         * Panel Brand text Enertech 
         * Inverters number 1 
         * Inverter Power watts 5000 
         * Inverter Brand text Fronius
         * Orientation text N
         * Array Tilt decimal degrees 20.0
         * Shade text No 
         * Install Date yyyymmdd date 20120228 
         * Latitude decimal -33.868135
         * Longitude decimal 151.133423
         */

    }
    catch (e) {
        adapter.log.error("exception in read [" + e + "]");
    }
}


async function HandleStateChange(id, state) {
   

    if (state.ack !== true) {

        adapter.log.debug("handle state change " + id);
        const ids = id.split(".");

        //just dummy
        //if (ids[2] === "cmd") {
        //    await do_Command();
        //}
        //else {
            adapter.log.warn("unhandled state change " + id);
        //}
    }

}

function subscribeVars() {
    //adapter.subscribeStates("cmd");
}


async function checkVariables() {
    adapter.log.debug("init variables ");


    for (const system of adapter.config.PVSystems) {

        let key;
        let obj;

        // Status ====================================
        key = system.Name + ".Status.Date" ; 
        await adapter.setObjectNotExistsAsync(key, {
            type: "state",
            common: {
                name: "Date",
                type: "string",
                role: "value",
                read: true,
                write: false
            }
        });

        key = system.Name + ".Status.Time";
        await adapter.setObjectNotExistsAsync(key, {
            type: "state",
            common: {
                name: "Time",
                type: "string",
                role: "value",
                read: true,
                write: false
            }
        });

        key = system.Name + ".Status.EnergyGeneration";
        await adapter.setObjectNotExistsAsync(key, {
            type: "state",
            common: {
                name: "Energy Generation",
                type: "number",
                role: "value",
                read: true,
                write: false,
                unit: "Wh"
            }
        });

        key = system.Name + ".Status.PowerGeneration";
        await adapter.setObjectNotExistsAsync(key, {
            type: "state",
            common: {
                name: "Power Generation",
                type: "number",
                role: "value",
                read: true,
                write: false,
                unit: "W"
            }
        });

        key = system.Name + ".Status.EnergyConsumption";
        await adapter.setObjectNotExistsAsync(key, {
            type: "state",
            common: {
                name: "Energy Consumption",
                type: "number",
                role: "value",
                read: true,
                write: false,
                unit: "Wh"
            }
        });

        key = system.Name + ".Status.PowerConsumption";
        await adapter.setObjectNotExistsAsync(key, {
            type: "state",
            common: {
                name: "Power Consumption",
                type: "number",
                role: "value",
                read: true,
                write: false,
                unit: "W"
            }
        });

        key = system.Name + ".Status.NormalisedOutput";
        await adapter.setObjectNotExistsAsync(key, {
            type: "state",
            common: {
                name: "Normalised Output",
                type: "number",
                role: "value",
                read: true,
                write: false,
                unit: "kW/kW"
            }
        });

        key = system.Name + ".Status.Temperature";
        await adapter.setObjectNotExistsAsync(key, {
            type: "state",
            common: {
                name: "Temperature",
                type: "number",
                role: "value",
                read: true,
                write: false,
                unit: "°C"
            }
        });

        key = system.Name + ".Status.Voltage";
        await adapter.setObjectNotExistsAsync(key, {
            type: "state",
            common: {
                name: "Voltage",
                type: "number",
                role: "value",
                read: true,
                write: false,
                unit: "V"
            }
        });

        // Statistic ====================================
        key = system.Name + ".Statistic.EnergyGenerated";
        await adapter.setObjectNotExistsAsync(key, {
            type: "state",
            common: {
                name: "Energy Generated",
                type: "number",
                role: "value",
                read: true,
                write: false,
                unit: "Wh"
            }
        });

        key = system.Name + ".Statistic.EnergyExported";
        await adapter.setObjectNotExistsAsync(key, {
            type: "state",
            common: {
                name: "Energy Exported",
                type: "number",
                role: "value",
                read: true,
                write: false,
                unit: "Wh"
            }
        });

        key = system.Name + ".Statistic.AverageGeneration";
        await adapter.setObjectNotExistsAsync(key, {
            type: "state",
            common: {
                name: "Average Generation",
                type: "number",
                role: "value",
                read: true,
                write: false,
                unit: "Wh"
            }
        });

        key = system.Name + ".Statistic.MinimumGeneration";
        await adapter.setObjectNotExistsAsync(key, {
            type: "state",
            common: {
                name: "Minimum Generation",
                type: "number",
                role: "value",
                read: true,
                write: false,
                unit: "Wh"
            }
        });

        key = system.Name + ".Statistic.MaximumGeneration";
        await adapter.setObjectNotExistsAsync(key, {
            type: "state",
            common: {
                name: "Maximum Generation",
                type: "number",
                role: "value",
                read: true,
                write: false,
                unit: "Wh"
            }
        });

        key = system.Name + ".Statistic.AverageEfficiency";
        await adapter.setObjectNotExistsAsync(key, {
            type: "state",
            common: {
                name: "Average Efficiency",
                type: "number",
                role: "value",
                read: true,
                write: false,
                unit: "kWh/kW"
            }
        });

        key = system.Name + ".Statistic.Outputs";
        await adapter.setObjectNotExistsAsync(key, {
            type: "state",
            common: {
                name: "Outputs",
                type: "number",
                role: "value",
                read: true,
                write: false,
                unit: ""
            }
        });

        key = system.Name + ".Statistic.ActualDateFrom";
        await adapter.setObjectNotExistsAsync(key, {
            type: "state",
            common: {
                name: "Actual Date From",
                type: "string",
                role: "value",
                read: true,
                write: false,
                unit: ""
            }
        });

        key = system.Name + ".Statistic.ActualDateTo";
        await adapter.setObjectNotExistsAsync(key, {
            type: "state",
            common: {
                name: "Actual Date To",
                type: "string",
                role: "value",
                read: true,
                write: false,
                unit: ""
            }
        });

        key = system.Name + ".Statistic.RecordEfficiency";
        await adapter.setObjectNotExistsAsync(key, {
            type: "state",
            common: {
                name: "Record Efficiency",
                type: "number",
                role: "value",
                read: true,
                write: false,
                unit: "kWh/kW"
            }
        });

        key = system.Name + ".Statistic.RecordDate";
        await adapter.setObjectNotExistsAsync(key, {
            type: "state",
            common: {
                name: "Record Date",
                type: "string",
                role: "value",
                read: true,
                write: false,
                unit: ""
            }
        });


        // System ====================================
        key = system.Name + ".System.SystemName";
        await adapter.setObjectNotExistsAsync(key, {
            type: "state",
            common: {
                name: "System Name",
                type: "string",
                role: "value",
                read: true,
                write: false,
                unit: ""
            }
        });

        key = system.Name + ".System.SystemSize";
        await adapter.setObjectNotExistsAsync(key, {
            type: "state",
            common: {
                name: "System Size",
                type: "number",
                role: "value",
                read: true,
                write: false,
                unit: "W"
            }
        });

        key = system.Name + ".System.Postcode";
        await adapter.setObjectNotExistsAsync(key, {
            type: "state",
            common: {
                name: "Postcode",
                type: "number",
                role: "value",
                read: true,
                write: false,
                unit: ""
            }
        });

        key = system.Name + ".System.Panels";
        await adapter.setObjectNotExistsAsync(key, {
            type: "state",
            common: {
                name: "Panels",
                type: "number",
                role: "value",
                read: true,
                write: false,
                unit: ""
            }
        });

        key = system.Name + ".System.PanelPower";
        await adapter.setObjectNotExistsAsync(key, {
            type: "state",
            common: {
                name: "Panel Power",
                type: "number",
                role: "value",
                read: true,
                write: false,
                unit: "W"
            }
        });

        key = system.Name + ".System.PanelBrand";
        await adapter.setObjectNotExistsAsync(key, {
            type: "state",
            common: {
                name: "Panel Brand",
                type: "string",
                role: "value",
                read: true,
                write: false,
                unit: ""
            }
        });

        key = system.Name + ".System.Inverters";
        await adapter.setObjectNotExistsAsync(key, {
            type: "state",
            common: {
                name: "Inverters",
                type: "number",
                role: "value",
                read: true,
                write: false,
                unit: ""
            }
        });

        key = system.Name + ".System.InverterPower";
        await adapter.setObjectNotExistsAsync(key, {
            type: "state",
            common: {
                name: "Inverter Power",
                type: "number",
                role: "value",
                read: true,
                write: false,
                unit: "W"
            }
        });

        key = system.Name + ".System.InverterBrand";
        await adapter.setObjectNotExistsAsync(key, {
            type: "state",
            common: {
                name: "Inverter Brand",
                type: "string",
                role: "value",
                read: true,
                write: false,
                unit: ""
            }
        });

        key = system.Name + ".System.Orientation";
        await adapter.setObjectNotExistsAsync(key, {
            type: "state",
            common: {
                name: "Orientation",
                type: "string",
                role: "value",
                read: true,
                write: false,
                unit: ""
            }
        });

        key = system.Name + ".System.ArrayTilt";
        await adapter.setObjectNotExistsAsync(key, {
            type: "state",
            common: {
                name: "Array Tilt",
                type: "number",
                role: "value",
                read: true,
                write: false,
                unit: ""
            }
        });

        key = system.Name + ".System.Shade";
        await adapter.setObjectNotExistsAsync(key, {
            type: "state",
            common: {
                name: "Shade",
                type: "string",
                role: "value",
                read: true,
                write: false,
                unit: ""
            }
        });

        key = system.Name + ".System.InstallDate";
        await adapter.setObjectNotExistsAsync(key, {
            type: "state",
            common: {
                name: "Install Date",
                type: "string",
                role: "value",
                read: true,
                write: false,
                unit: ""
            }
        });

        key = system.Name + ".System.Latitude";
        await adapter.setObjectNotExistsAsync(key, {
            type: "state",
            common: {
                name: "Latitude",
                type: "number",
                role: "value",
                read: true,
                write: false,
                unit: ""
            }
        });


        key = system.Name + ".System.Longitude";
        await adapter.setObjectNotExistsAsync(key, {
            type: "state",
            common: {
                name: "Longitude",
                type: "number",
                role: "value",
                read: true,
                write: false,
                unit: ""
            }
        });

    }


    
    
}




// If started as allInOne/compact mode => return function to create instance
if (module && module.parent) {
    module.exports = startAdapter;
} else {
    // or start the instance directly
    startAdapter();
} 