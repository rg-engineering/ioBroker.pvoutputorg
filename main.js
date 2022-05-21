/*
 * pvoutputorg adapter für iobroker
 *
 * Created: 23.04.2022 18:39:28
 *  Author: Rene
*/

"use strict";

const utils = require("@iobroker/adapter-core");
const axios = require('axios');

const CronJob = require("cron").CronJob;

let cronJobs = [];

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
                CronStop();
                //clearInterval(intervalID);
                //intervalID = null;
                adapter && adapter.log && adapter.log.info && adapter.log.info("cleaned everything up...");
                callback();
            } catch (e) {
                callback();
            }
        },
        //#######################################
        //
        SIGINT: function () {
            CronStop();
            //clearInterval(intervalID);
            //intervalID = null;
            adapter && adapter.log && adapter.log.info && adapter.log.info("cleaned everything up...");
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

/* if isDonated
https://pvoutput.org/help/donations.html

Add Status
        The d date parameter must be not be older than 90 days from the current date.
        Extended parameters v7, v8, v9, v10, v11 and v12
        Maximum energy consumption v3 value increased to 9,999,999Wh
        Maximum power consumption v4 value increased to 2,000,000W
        Temperature v5 and Extended parameters v7 to v12 can be sent without v1 to v4
        Text message m1 parameter can be used as part of a custom alert subject or body message.

Add Batch Status
        The d date parameter must be not be older than 90 days from the current date.
        Extended parameters v7, v8, v9, v10, v11 and v12
        Maximum energy consumption v3 value increased to 9,999,999Wh
        Maximum power consumption v4 value increased to 2,000,000W
        Increased batch status size to 100 from 30

Add Output
        Batch updates up to 100 outputs per request.

Rate Limits
        The amount of API requests per system is increased to 300 per hour from 60.

Live Backload
        The number of days into the past live data may be uploaded is increased to 90 days from 14.

Get Status
        The sid1 parameter is enabled to retrieve live generation data from any system.

Get Output
        The sid1 parameter is enabled to retrieve daily generation data from any system.
        The maximum number of records returned increased to 150 from 50.
        The insolation parameter is enabeld to retrieve daily insolation data.

Get Statistic
        The sid1 parameter is enabled to retrieve statistics data from any system.

Get Supply
        The r parameter is enabled to retrieve the 24 hour supply and demand history for a state/region

Get Insolation
        The sid1 parameter is enabled to retrieve insolation data from any system
        The d parameter is enabled to use an alternative date
        The tz parameter is enabled to use an alternative timezone
        The ll parameter is enabled to use an alternative latitude/longitude

Delete Status
        The d date parameter must be not be older than 90 days from the current date.

*/



//let intervalID;
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
    //intervalID = setInterval(Do, readInterval * 60 * 1000);

    CronCreate(readInterval, DoRead)

    let writeInterval = 15;
    if (parseInt(adapter.config.writeInterval) > 0) {
        writeInterval = adapter.config.writeInterval;
    }
    else {
        adapter.log.warn("write interval not defined");
    }
    adapter.log.debug("write every  " + writeInterval + " minutes");
    //intervalID = setInterval(Do, readInterval * 60 * 1000);

    CronCreate(writeInterval, DoWrite)
    
}

async function DoRead() {

    adapter.log.debug("start reading ... " );

    await ReadData();
}

async function DoWrite() {

    adapter.log.debug("start writing ... ");

    await WriteData();
}

async function ReadData(){


    for (const system of adapter.config.PVSystems) {
        if (system.IsActive) {
            await read(system);
        }
    }
    adapter.log.debug("all systems read");

}


async function read(system) {

    let sURL = "";

    try {

        sURL = "https://pvoutput.org/service/r2/getsystem.jsp?";
        sURL += "key=" + system.ApiKey.replace(adapter.FORBIDDEN_CHARS, '_');
        sURL += "&sid=" + system.SystemId.replace(adapter.FORBIDDEN_CHARS, '_');

        adapter.log.debug("URL " + sURL);

        let buffer = await axios.get(sURL, { timeout: 5000 });

        adapter.log.debug("got data system " + typeof buffer.data + " " + JSON.stringify(buffer.data));

        /*
        got data system string "PV-System R-Wisch,2880,,16,180,Yingli YL 180,1,2500,SMA SB 2500,S,45.0,No,20081211,50.546189,12.36239,5;;0"
        */

        if (buffer != null && buffer.status == 200 && buffer.data != null && typeof buffer.data === "string") {
            let data = buffer.data.split(",");

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
            await adapter.setStateAsync(system.Name + ".System.InstallDate", { ack: true, val: toDate(data[12]) });
            await adapter.setStateAsync(system.Name + ".System.Latitude", { ack: true, val: Number(data[13]) });
            await adapter.setStateAsync(system.Name + ".System.Longitude", { ack: true, val: Number(data[14]) });
        }
        else {
            adapter.log.error("error system: " + JSON.stringify(buffer));
        }
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


        /*
        https://pvoutput.org/service/r2/getstatus.jsp?key=key&sid=system
        */

        sURL = "https://pvoutput.org/service/r2/getstatus.jsp?";
        sURL += "key=" + system.ApiKey.replace(adapter.FORBIDDEN_CHARS,'_');
        sURL += "&sid=" + system.SystemId.replace(adapter.FORBIDDEN_CHARS, '_');

        adapter.log.debug("URL " + sURL);

        buffer = await axios.get(sURL, { timeout: 5000 });

        adapter.log.debug("got data status " + typeof buffer.data + " " + JSON.stringify(buffer.data));
        /*
        got data string "20220424,10:00,548,168,NaN,NaN,0.058,0.0,235.0"
        */

        if (buffer != null && buffer.status == 200 && buffer.data != null && typeof buffer.data === "string") {

            let data = buffer.data.split(",");

            await adapter.setStateAsync(system.Name + ".Status.Date", { ack: true, val: toDate(data[0]) });
            await adapter.setStateAsync(system.Name + ".Status.Time", { ack: true, val: data[1] });
            await adapter.setStateAsync(system.Name + ".Status.EnergyGeneration", { ack: true, val: Number(data[2]) });
            await adapter.setStateAsync(system.Name + ".Status.PowerGeneration", { ack: true, val: Number(data[3]) });
            await adapter.setStateAsync(system.Name + ".Status.EnergyConsumption", { ack: true, val: Number(data[4]) });
            await adapter.setStateAsync(system.Name + ".Status.PowerConsumption", { ack: true, val: Number(data[5]) });
            await adapter.setStateAsync(system.Name + ".Status.NormalisedOutput", { ack: true, val: Number(data[6]) });
            await adapter.setStateAsync(system.Name + ".Status.Temperature", { ack: true, val: Number(data[7]) });
            await adapter.setStateAsync(system.Name + ".Status.Voltage", { ack: true, val: Number(data[8]) });
        }
        else {
            adapter.log.error("error status: " +  JSON.stringify(buffer));
        }
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
        sURL += "key=" + system.ApiKey.replace(adapter.FORBIDDEN_CHARS, '_');
        sURL += "&sid=" + system.SystemId.replace(adapter.FORBIDDEN_CHARS, '_');

        adapter.log.debug("URL " + sURL);

        buffer = await axios.get(sURL, { timeout: 5000 });

        adapter.log.debug("got data statistic " + typeof buffer.data + " " + JSON.stringify(buffer.data));

        /*
        got data statistic string "14088651,0,5932,1,16113,2.060,2375,20150510,20220424,5.595,20170424"
        */
        if (buffer != null && buffer.status == 200 && buffer.data != null && typeof buffer.data === "string") {
            let data = buffer.data.split(",");

            await adapter.setStateAsync(system.Name + ".Statistic.EnergyGenerated", { ack: true, val: Number(data[0]) });
            await adapter.setStateAsync(system.Name + ".Statistic.EnergyExported", { ack: true, val: Number(data[1]) });
            await adapter.setStateAsync(system.Name + ".Statistic.AverageGeneration", { ack: true, val: Number(data[2]) });
            await adapter.setStateAsync(system.Name + ".Statistic.MinimumGeneration", { ack: true, val: Number(data[3]) });
            await adapter.setStateAsync(system.Name + ".Statistic.MaximumGeneration", { ack: true, val: Number(data[4]) });
            await adapter.setStateAsync(system.Name + ".Statistic.AverageEfficiency", { ack: true, val: Number(data[5]) });
            await adapter.setStateAsync(system.Name + ".Statistic.Outputs", { ack: true, val: Number(data[6]) });
            await adapter.setStateAsync(system.Name + ".Statistic.ActualDateFrom", { ack: true, val: toDate(data[7]) });
            await adapter.setStateAsync(system.Name + ".Statistic.ActualDateTo", { ack: true, val: toDate(data[8]) });
            await adapter.setStateAsync(system.Name + ".Statistic.RecordEfficiency", { ack: true, val: Number(data[9]) });
            await adapter.setStateAsync(system.Name + ".Statistic.RecordDate", { ack: true, val: toDate(data[10]) });
        }
        else {
            adapter.log.error("error statistic: " + JSON.stringify(buffer));
        }
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


       

    }
    catch (e) {
        adapter.log.error("exception in read [" + e + "] " + sURL);
    }
}


function toDate(sDate) {

    //yyyymmdd
    const year = sDate.slice(0, 4);
    const month = sDate.slice(4, 6);
    const day = sDate.slice(6, 9);

    let oDate = new Date(year, month - 1, day);

    return oDate.toLocaleDateString();
}

//==========================================================================
//write to PVOutput.org

async function WriteData() {


    for (const system of adapter.config.PVSystems) {
        if (system.IsActive && system.Upload) {
            await write(system);
        }
    }
    adapter.log.debug("all systems written" );
}

async function write(system) {
    //https://pvoutput.org/help/api_specification.html
    //

    let sURL = "";

    try {

        sURL = "https://pvoutput.org/service/r2/addoutput.jsp?";
        sURL += "key=" + system.ApiKey.replace(adapter.FORBIDDEN_CHARS, '_');
        sURL += "&sid=" + system.SystemId.replace(adapter.FORBIDDEN_CHARS, '_');

        
        let date = new Date();
        const year = date.getFullYear();
        let month = date.getMonth();
        month = month + 1;
        let sMonth = "";
        if (month < 10) {
            sMonth = "0" + month;
        }
        else {
            sMonth = month;
        }
        const day = date.getDate();
        let sDate = year + sMonth + day;
        sURL += "&d=" + sDate;

        let generated = await adapter.getStateAsync(system.Name + ".Upload.Generated");
        if (generated != null && generated.val > 0) {
            sURL += "&g=" + generated.val;

            adapter.log.debug("URL " + sURL);

            let response = await axios.get(sURL, { timeout: 5000 });

            if (response != null && response.status == 200) {
                adapter.log.debug("data written ");
            }
            else {
                adapter.log.warn("data not written " + JSON.stringify(response));
            }
        }
        else {
            adapter.log.warn("no generated value on " + system.Name + ".Upload.Generated! upload skipped!");
        }

    }
    catch (e) {
        adapter.log.error("exception in write [" + e + "] " + sURL);
    }

}

async function HandleStateChange(id, state) {

    //prepared for further extensions e.g. write data to PVOutput.org

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
        obj= {
            type: "state",
            common: {
                name: "Date",
                type: "string",
                role: "value",
                read: true,
                write: false
            }
        };
        await CreateObject(key, obj);

        key = system.Name + ".Status.Time";
        obj= {
            type: "state",
            common: {
                name: "Time",
                type: "string",
                role: "value",
                read: true,
                write: false
            }
        };
        await CreateObject(key, obj);

        key = system.Name + ".Status.EnergyGeneration";
        obj= {
            type: "state",
            common: {
                name: "Energy Generation",
                type: "number",
                role: "value",
                read: true,
                write: false,
                unit: "Wh"
            }
        };
        await CreateObject(key, obj);

        key = system.Name + ".Status.PowerGeneration";
        obj= {
            type: "state",
            common: {
                name: "Power Generation",
                type: "number",
                role: "value",
                read: true,
                write: false,
                unit: "W"
            }
        };
        await CreateObject(key, obj);

        key = system.Name + ".Status.EnergyConsumption";
        obj= {
            type: "state",
            common: {
                name: "Energy Consumption",
                type: "number",
                role: "value",
                read: true,
                write: false,
                unit: "Wh"
            }
        };
        await CreateObject(key, obj);

        key = system.Name + ".Status.PowerConsumption";
        obj= {
            type: "state",
            common: {
                name: "Power Consumption",
                type: "number",
                role: "value",
                read: true,
                write: false,
                unit: "W"
            }
        };
        await CreateObject(key, obj);

        key = system.Name + ".Status.NormalisedOutput";
        obj= {
            type: "state",
            common: {
                name: "Normalised Output",
                type: "number",
                role: "value",
                read: true,
                write: false,
                unit: "kW/kW"
            }
        };
        await CreateObject(key, obj);

        key = system.Name + ".Status.Temperature";
        obj= {
            type: "state",
            common: {
                name: "Temperature",
                type: "number",
                role: "value",
                read: true,
                write: false,
                unit: "°C"
            }
        };
        await CreateObject(key, obj);

        key = system.Name + ".Status.Voltage";
        obj= {
            type: "state",
            common: {
                name: "Voltage",
                type: "number",
                role: "value",
                read: true,
                write: false,
                unit: "V"
            }
        };
        await CreateObject(key, obj);

        // Statistic ====================================
        key = system.Name + ".Statistic.EnergyGenerated";
        obj= {
            type: "state",
            common: {
                name: "Energy Generated",
                type: "number",
                role: "value",
                read: true,
                write: false,
                unit: "Wh"
            }
        };
        await CreateObject(key, obj);

        key = system.Name + ".Statistic.EnergyExported";
        obj= {
            type: "state",
            common: {
                name: "Energy Exported",
                type: "number",
                role: "value",
                read: true,
                write: false,
                unit: "Wh"
            }
        };
        await CreateObject(key, obj);

        key = system.Name + ".Statistic.AverageGeneration";
        obj= {
            type: "state",
            common: {
                name: "Average Generation",
                type: "number",
                role: "value",
                read: true,
                write: false,
                unit: "Wh"
            }
        };
        await CreateObject(key, obj);

        key = system.Name + ".Statistic.MinimumGeneration";
        obj= {
            type: "state",
            common: {
                name: "Minimum Generation",
                type: "number",
                role: "value",
                read: true,
                write: false,
                unit: "Wh"
            }
        };
        await CreateObject(key, obj);

        key = system.Name + ".Statistic.MaximumGeneration";
        obj= {
            type: "state",
            common: {
                name: "Maximum Generation",
                type: "number",
                role: "value",
                read: true,
                write: false,
                unit: "Wh"
            }
        };
        await CreateObject(key, obj);

        key = system.Name + ".Statistic.AverageEfficiency";
        obj= {
            type: "state",
            common: {
                name: "Average Efficiency",
                type: "number",
                role: "value",
                read: true,
                write: false,
                unit: "kWh/kW"
            }
        };
        await CreateObject(key, obj);

        key = system.Name + ".Statistic.Outputs";
        obj= {
            type: "state",
            common: {
                name: "Outputs",
                type: "number",
                role: "value",
                read: true,
                write: false,
                unit: ""
            }
        };
        await CreateObject(key, obj);

        key = system.Name + ".Statistic.ActualDateFrom";
        obj= {
            type: "state",
            common: {
                name: "Actual Date From",
                type: "string",
                role: "value",
                read: true,
                write: false,
                unit: ""
            }
        };
        await CreateObject(key, obj);

        key = system.Name + ".Statistic.ActualDateTo";
        obj= {
            type: "state",
            common: {
                name: "Actual Date To",
                type: "string",
                role: "value",
                read: true,
                write: false,
                unit: ""
            }
        };
        await CreateObject(key, obj);

        key = system.Name + ".Statistic.RecordEfficiency";
        obj= {
            type: "state",
            common: {
                name: "Record Efficiency",
                type: "number",
                role: "value",
                read: true,
                write: false,
                unit: "kWh/kW"
            }
        };
        await CreateObject(key, obj);

        key = system.Name + ".Statistic.RecordDate";
        obj= {
            type: "state",
            common: {
                name: "Record Date",
                type: "string",
                role: "value",
                read: true,
                write: false,
                unit: ""
            }
        };
        await CreateObject(key, obj);


        // System ====================================
        key = system.Name + ".System.SystemName";
        obj= {
            type: "state",
            common: {
                name: "System Name",
                type: "string",
                role: "value",
                read: true,
                write: false,
                unit: ""
            }
        };
        await CreateObject(key, obj);

        key = system.Name + ".System.SystemSize";
        obj= {
            type: "state",
            common: {
                name: "System Size",
                type: "number",
                role: "value",
                read: true,
                write: false,
                unit: "W"
            }
        };
        await CreateObject(key, obj);

        key = system.Name + ".System.Postcode";
        obj= {
            type: "state",
            common: {
                name: "Postcode",
                type: "number",
                role: "value",
                read: true,
                write: false,
                unit: ""
            }
        };
        await CreateObject(key, obj);

        key = system.Name + ".System.Panels";
        obj= {
            type: "state",
            common: {
                name: "Panels",
                type: "number",
                role: "value",
                read: true,
                write: false,
                unit: ""
            }
        };
        await CreateObject(key, obj);

        key = system.Name + ".System.PanelPower";
        obj= {
            type: "state",
            common: {
                name: "Panel Power",
                type: "number",
                role: "value",
                read: true,
                write: false,
                unit: "W"
            }
        };
        await CreateObject(key, obj);

        key = system.Name + ".System.PanelBrand";
        obj= {
            type: "state",
            common: {
                name: "Panel Brand",
                type: "string",
                role: "value",
                read: true,
                write: false,
                unit: ""
            }
        };
        await CreateObject(key, obj);

        key = system.Name + ".System.Inverters";
        obj= {
            type: "state",
            common: {
                name: "Inverters",
                type: "number",
                role: "value",
                read: true,
                write: false,
                unit: ""
            }
        };
        await CreateObject(key, obj);

        key = system.Name + ".System.InverterPower";
        obj= {
            type: "state",
            common: {
                name: "Inverter Power",
                type: "number",
                role: "value",
                read: true,
                write: false,
                unit: "W"
            }
        };
        await CreateObject(key, obj);

        key = system.Name + ".System.InverterBrand";
        obj= {
            type: "state",
            common: {
                name: "Inverter Brand",
                type: "string",
                role: "value",
                read: true,
                write: false,
                unit: ""
            }
        };
        await CreateObject(key, obj);

        key = system.Name + ".System.Orientation";
        obj= {
            type: "state",
            common: {
                name: "Orientation",
                type: "string",
                role: "value",
                read: true,
                write: false,
                unit: ""
            }
        };
        await CreateObject(key, obj);

        key = system.Name + ".System.ArrayTilt";
        obj= {
            type: "state",
            common: {
                name: "Array Tilt",
                type: "number",
                role: "value",
                read: true,
                write: false,
                unit: ""
            }
        };
        await CreateObject(key, obj);

        key = system.Name + ".System.Shade";
        obj= {
            type: "state",
            common: {
                name: "Shade",
                type: "string",
                role: "value",
                read: true,
                write: false,
                unit: ""
            }
        };
        await CreateObject(key, obj);

        key = system.Name + ".System.InstallDate";
        obj = {
            type: "state",
            common: {
                name: "Install Date",
                type: "string",
                role: "value",
                read: true,
                write: false,
                unit: ""
            }
        };
        await CreateObject(key, obj);

        key = system.Name + ".System.Latitude";
        obj = {
            type: "state",
            common: {
                name: "Latitude",
                type: "number",
                role: "value",
                read: true,
                write: false,
                unit: ""
            }
        };
        await CreateObject(key, obj);

        key = system.Name + ".System.Longitude";
        obj = {
            type: "state",
            common: {
                name: "Longitude",
                type: "number",
                role: "value",
                read: true,
                write: false,
                unit: ""
            }
        };
        await CreateObject(key, obj);


        if (system.Upload) {
            key = system.Name + ".Upload.Generated";
            obj = {
                type: "state",
                common: {
                    name: "Generated Power for Upload",
                    type: "number",
                    role: "value",
                    read: true,
                    write: true,
                    unit: "Wh"
                }
            };
            await CreateObject(key, obj);

        }


    }
}

async function CreateObject(key, obj) {

    const obj_new = await adapter.getObjectAsync(key);
    //adapter.log.warn("got object " + JSON.stringify(obj_new));

    if (obj_new != null) {

        if ((obj_new.common.role != obj.common.role
            || obj_new.common.type != obj.common.type
            || (obj_new.common.unit != obj.common.unit && obj.common.unit != null)
            || obj_new.common.read != obj.common.read
            || obj_new.common.write != obj.common.write
            || obj_new.common.name != obj.common.name)
            && obj.type === "state"
        ) {
            adapter.log.warn("change object " + JSON.stringify(obj) + " " + JSON.stringify(obj_new));
            await adapter.extendObject(key, {
                common: {
                    name: obj.common.name,
                    role: obj.common.role,
                    type: obj.common.type,
                    unit: obj.common.unit,
                    read: obj.common.read,
                    write: obj.common.write
                }
            });
        }
    }
    else {
        await adapter.setObjectNotExistsAsync(key, obj);
    }
}

//===============================================================================
//cron functions
function CronStop() {
    if (cronJobs.length > 0) {
        adapter.log.debug("delete " + cronJobs.length + " cron jobs");
        //cancel all cron jobs...
        const start = cronJobs.length - 1;
        for (let n = start; n >= 0; n--) {
            cronJobs[n].stop();
        }
        cronJobs = [];
    }
}

function deleteCronJob(id) {

    cronJobs[id].stop();

    if (id === cronJobs.length - 1) {
        cronJobs.pop(); //remove last
    }
    else {
        delete cronJobs[id];
    }
    CronStatus();


}

function CronCreate(Minute, callback) {

    try {

        const timezone = adapter.config.timezone || "Europe/Berlin";

        //https://crontab-generator.org/
        let cronString = "*/" + Minute + " * * * * ";


        const nextCron = cronJobs.length;

        adapter.log.debug("create cron job #" + nextCron + " every " + Minute + " string: " + cronString + " " + timezone);

        //details see https://www.npmjs.com/package/cron
        cronJobs[nextCron] = new CronJob(cronString,
            () => callback(),
            () => adapter.log.debug("cron job stopped"), // This function is executed when the job stops
            true,
            timezone
        );

    }
    catch (e) {
        adapter.log.error("exception in CronCreate [" + e + "]");
    }
}

function CronStatus() {
    let n = 0;
    let length = 0;
    try {
        if (typeof cronJobs !== undefined && cronJobs != null) {

            length = cronJobs.length;
            //adapter.log.debug("cron jobs");
            for (n = 0; n < length; n++) {
                if (typeof cronJobs[n] !== undefined && cronJobs[n] != null) {
                    adapter.log.debug("cron status = " + cronJobs[n].running + " next event: " + timeConverter("DE", cronJobs[n].nextDates()));
                }
            }

            if (length > 500) {
                adapter.log.warn("more then 500 cron jobs existing for this adapter, this might be a configuration error! (" + length + ")");
            }
            else {
                adapter.log.info(length + " cron job(s) created");
            }
        }
    }
    catch (e) {
        adapter.log.error("exception in getCronStat [" + e + "] : " + n + " of " + length);
    }
}





// If started as allInOne/compact mode => return function to create instance
if (module && module.parent) {
    module.exports = startAdapter;
} else {
    // or start the instance directly
    startAdapter();
} 