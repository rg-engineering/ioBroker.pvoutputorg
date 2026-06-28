"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable prefer-template */
const axios_1 = __importDefault(require("axios"));
const base_1 = __importDefault(require("./base"));
class pvoutput extends base_1.default {
    adapter;
    id;
    name;
    config;
    useWeatherAdapter;
    OID_WeatherConditions;
    constructor(adapter, id, config, useWeatherAdapter, OID_WeatherConditions) {
        super(adapter, id, config);
        if (adapter != null) {
            this.adapter = adapter;
        }
        else {
            this.adapter = null;
        }
        this.id = id;
        this.name = config.Name;
        this.config = config;
        this.useWeatherAdapter = useWeatherAdapter;
        this.OID_WeatherConditions = OID_WeatherConditions;
        this.logDebug("instance created");
    }
    async read() {
        let sURL = "";
        if (this.adapter == null) {
            this.logError("adpater is null");
            return;
        }
        try {
            sURL = "https://pvoutput.org/service/r2/getsystem.jsp";
            //sURL += "key=" + system.ApiKey.replace(adapter.FORBIDDEN_CHARS, '_');
            //sURL += "&sid=" + system.SystemId.replace(adapter.FORBIDDEN_CHARS, '_');
            this.logDebug("URL " + sURL.replace(/key=.*&sid=/, "key=******&sid="));
            //let buffer = await axios.get(sURL, { timeout: 5000 });
            let data = null;
            let buffer = await this.getData(sURL, data);
            const SystemName = this.config.Name.replace(this.adapter.FORBIDDEN_CHARS, "_");
            if (buffer != null && buffer.status == 200 && buffer.data != null && typeof buffer.data === "string") {
                this.logDebug("got data system, data: " + JSON.stringify(buffer.data) + " headers " + JSON.stringify(buffer.headers));
                /*
                got data system string "PV-System R-Wisch,2880,,16,180,Yingli YL 180,1,2500,SMA SB 2500,S,45.0,No,20081211,50.546189,12.36239,5;;0"
                */
                const data = buffer.data.split(",");
                await this.adapter.setState(SystemName + ".System.SystemName", { ack: true, val: data[0] });
                await this.adapter.setState(SystemName + ".System.SystemSize", { ack: true, val: Number(data[1]) });
                await this.adapter.setState(SystemName + ".System.Postcode", { ack: true, val: Number(data[2]) });
                await this.adapter.setState(SystemName + ".System.Panels", { ack: true, val: Number(data[3]) });
                await this.adapter.setState(SystemName + ".System.PanelPower", { ack: true, val: Number(data[4]) });
                await this.adapter.setState(SystemName + ".System.PanelBrand", { ack: true, val: data[5] });
                await this.adapter.setState(SystemName + ".System.Inverters", { ack: true, val: Number(data[6]) });
                await this.adapter.setState(SystemName + ".System.InverterPower", { ack: true, val: Number(data[7]) });
                await this.adapter.setState(SystemName + ".System.InverterBrand", { ack: true, val: data[8] });
                await this.adapter.setState(SystemName + ".System.Orientation", { ack: true, val: data[9] });
                await this.adapter.setState(SystemName + ".System.ArrayTilt", { ack: true, val: Number(data[10]) });
                await this.adapter.setState(SystemName + ".System.Shade", { ack: true, val: data[11] });
                await this.adapter.setState(SystemName + ".System.InstallDate", { ack: true, val: this.toDate(data[12]) });
                await this.adapter.setState(SystemName + ".System.Latitude", { ack: true, val: Number(data[13]) });
                await this.adapter.setState(SystemName + ".System.Longitude", { ack: true, val: Number(data[14]) });
            }
            else {
                this.logError("error receiving system data: " + JSON.stringify(buffer));
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
            sURL = "https://pvoutput.org/service/r2/getstatus.jsp";
            //sURL += "key=" + system.ApiKey.replace(adapter.FORBIDDEN_CHARS, '_');
            //sURL += "&sid=" + system.SystemId.replace(adapter.FORBIDDEN_CHARS, '_');
            this.logDebug("URL " + sURL.replace(/key=.*&sid=/, "key=******&sid="));
            //let buffer = await axios.get(sURL, { timeout: 5000 });
            data = null;
            buffer = await this.getData(sURL, data);
            if (buffer != null && buffer.status == 200 && buffer.data != null && typeof buffer.data === "string") {
                this.logDebug("got data status, data " + JSON.stringify(buffer.data) + " headers " + JSON.stringify(buffer.headers));
                /*
                got data string "20220424,10:00,548,168,NaN,NaN,0.058,0.0,235.0"
                */
                const data = buffer.data.split(",");
                await this.adapter.setState(SystemName + ".Status.Date", { ack: true, val: this.toDate(data[0]) });
                await this.adapter.setState(SystemName + ".Status.Time", { ack: true, val: data[1] });
                await this.adapter.setState(SystemName + ".Status.EnergyGeneration", { ack: true, val: Number(data[2]) });
                await this.adapter.setState(SystemName + ".Status.PowerGeneration", { ack: true, val: Number(data[3]) });
                await this.adapter.setState(SystemName + ".Status.EnergyConsumption", { ack: true, val: Number(data[4]) });
                await this.adapter.setState(SystemName + ".Status.PowerConsumption", { ack: true, val: Number(data[5]) });
                await this.adapter.setState(SystemName + ".Status.NormalisedOutput", { ack: true, val: Number(data[6]) });
                await this.adapter.setState(SystemName + ".Status.Temperature", { ack: true, val: Number(data[7]) });
                await this.adapter.setState(SystemName + ".Status.Voltage", { ack: true, val: Number(data[8]) });
            }
            else {
                this.logError("error receiving status data: " + JSON.stringify(buffer));
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
            sURL = "https://pvoutput.org/service/r2/getstatistic.jsp";
            //sURL += "key=" + system.ApiKey.replace(adapter.FORBIDDEN_CHARS, '_');
            //sURL += "&sid=" + system.SystemId.replace(adapter.FORBIDDEN_CHARS, '_');
            this.logDebug("URL " + sURL.replace(/key=.*&sid=/, "key=******&sid="));
            //let buffer = await axios.get(sURL, { timeout: 5000 });
            data = null;
            buffer = await this.getData(sURL, data);
            if (buffer != null && buffer.status == 200 && buffer.data != null && typeof buffer.data === "string") {
                this.logDebug("got data statistic, data " + JSON.stringify(buffer.data) + " headers " + JSON.stringify(buffer.headers));
                /*
                got data statistic string "14088651,0,5932,1,16113,2.060,2375,20150510,20220424,5.595,20170424"
                */
                const data = buffer.data.split(",");
                await this.adapter.setState(SystemName + ".Statistic.EnergyGenerated", { ack: true, val: Number(data[0]) });
                await this.adapter.setState(SystemName + ".Statistic.EnergyExported", { ack: true, val: Number(data[1]) });
                await this.adapter.setState(SystemName + ".Statistic.AverageGeneration", { ack: true, val: Number(data[2]) });
                await this.adapter.setState(SystemName + ".Statistic.MinimumGeneration", { ack: true, val: Number(data[3]) });
                await this.adapter.setState(SystemName + ".Statistic.MaximumGeneration", { ack: true, val: Number(data[4]) });
                await this.adapter.setState(SystemName + ".Statistic.AverageEfficiency", { ack: true, val: Number(data[5]) });
                await this.adapter.setState(SystemName + ".Statistic.Outputs", { ack: true, val: Number(data[6]) });
                await this.adapter.setState(SystemName + ".Statistic.ActualDateFrom", { ack: true, val: this.toDate(data[7]) });
                await this.adapter.setState(SystemName + ".Statistic.ActualDateTo", { ack: true, val: this.toDate(data[8]) });
                await this.adapter.setState(SystemName + ".Statistic.RecordEfficiency", { ack: true, val: Number(data[9]) });
                await this.adapter.setState(SystemName + ".Statistic.RecordDate", { ack: true, val: this.toDate(data[10]) });
                await this.adapter.setState(SystemName + ".RateLimit.Remaining", { ack: true, val: Number(buffer.headers["x-rate-limit-remaining"]) });
                if (Number(buffer.headers["x-rate-limit-remaining"]) < 10) {
                    this.logError("too many requests per hour! remaining " + buffer.headers["x-rate-limit-remaining"] + " limit per hour is " + buffer.headers["x-rate-limit-limit"]);
                }
                await this.adapter.setState(SystemName + ".RateLimit.Limit", { ack: true, val: Number(buffer.headers["x-rate-limit-limit"]) });
                const oDate = new Date(Number(buffer.headers["x-rate-limit-reset"]) * 1000);
                await this.adapter.setState(SystemName + ".RateLimit.Reset", { ack: true, val: oDate.toLocaleString() });
            }
            else {
                this.logError("error receiving statistic data: " + JSON.stringify(buffer));
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
            this.logError("exception in read [" + String(e) + "] " + sURL);
        }
    }
    async getData(url, data) {
        let result = null;
        try {
            const config = {
                headers: {
                    "X-Pvoutput-Apikey": this.config.ApiKey,
                    "X-Pvoutput-SystemId": this.config.SystemId,
                    "X-Rate-Limit": 1
                },
                timeout: 5000
            };
            if (data != null && typeof data === "string") {
                url += "?" + data;
            }
            this.logDebug(" post url " + url + " data " + JSON.stringify(data));
            result = await axios_1.default.post(url, null, config);
            if (result == null || result.status != 200) {
                this.ShowError(result);
            }
        }
        catch (ex) {
            this.logError("post url " + url + " exception " + String(ex));
        }
        return result;
    }
    toDate(sDate) {
        //yyyymmdd 20250608
        const year = sDate.slice(0, 4);
        const month = sDate.slice(4, 6);
        const day = sDate.slice(6, 8);
        const oDate = new Date(`${year}-${month}-${day}`);
        return oDate.toLocaleDateString();
    }
    ShowError(error) {
        if (error.response) {
            /*
             * The request was made and the server responded with a
             * status code that falls out of the range of 2xx
             */
            let isKnown = false;
            if (error.response.status == 400) {
                if (error.response.data.includes("No status found")) {
                    isKnown = true;
                    this.logError("No live data found on a specified date or no live data reported in the last 7 days when no date parameter is used.");
                }
            }
            else if (error.response.status == 401) {
                if (error.response.data.includes("Inaccessible System ID")) {
                    isKnown = true;
                    this.logError("This error is reported when another system id is requested from an account without donation enabled.");
                }
                else if (error.response.data.includes("Invalid System ID")) {
                    isKnown = true;
                    this.logError("The required parameter X-Pvoutput-SystemId or sid is missing from the request. The sid is a number which identifies a system. The sid can be obtained from the Settings page under Registered Systems");
                }
                else if (error.response.data.includes("Invalid API Key")) {
                    isKnown = true;
                    this.logError("The API key is missing in the header request or the API key is invalid.");
                }
                else if (error.response.data.includes("Disabled API Key")) {
                    isKnown = true;
                    this.logError("The API key has not been enabled in the Settings.");
                }
                else if (error.response.data.includes("Missing, invalid or inactive api key information")) {
                    isKnown = true;
                    this.logError("The sid and key combination is invalid");
                }
                else if (error.response.data.includes("Date") && error.response.data.includes("invalid")) {
                    //write errors
                    isKnown = true;
                    this.logError("The date is incorrectly formatted, expecting yyyymmdd format");
                }
                else if (error.response.data.includes("Date") && error.response.data.includes("too old")) {
                    isKnown = true;
                    this.logError("The date must be after 2000-01-01");
                }
                else if (error.response.data.includes("Date") && error.response.data.includes("too new")) {
                    isKnown = true;
                    this.logError("The date must not be a future date");
                }
                else if (error.response.data.includes("Generation") && error.response.data.includes("too high for system size")) {
                    isKnown = true;
                    this.logError("The generation amount to too high compared to the system size " + error.response.data);
                }
                else if (error.response.data.includes("Export") && error.response.data.includes("too high for system size")) {
                    isKnown = true;
                    this.logError("The export amount to too high compared to the system size " + error.response.data);
                }
                else if (error.response.data.includes("Export") && error.response.data.includes("cannot exceed generation")) {
                    isKnown = true;
                    this.logError("The export amount is too high compared to the generation amount " + error.response.data);
                }
                else if (error.response.data.includes("Consumption") && error.response.data.includes("too high on")) {
                    isKnown = true;
                    this.logError("Consumption exceeded the 999999999Wh limit " + error.response.data);
                }
                else if (error.response.data.includes("Peak power") && error.response.data.includes("too high for system size")) {
                    isKnown = true;
                    this.logError("The peak power is 50% greater than the system size. " + error.response.data);
                }
                else if (error.response.data.includes("Min/Max temp missing on ")) {
                    isKnown = true;
                    this.logError("Both min and max temperature must exist or both should be omitted. " + error.response.data);
                }
            }
            else if (error.response.status == 403) {
                if (error.response.data.includes("Read only key")) {
                    isKnown = true;
                    this.logError("The API key provided is a read only key and cannot access the requested service which updates system data, use the standard key to update system data.");
                }
                else if (error.response.data.includes("Exceeded number requests per hour")) {
                    isKnown = true;
                    this.logError("The maximum number of requests per hour has been reached for the API key. Wait till the next hour before making further requests.");
                }
                else if (error.response.data.includes("Donation Mode")) {
                    isKnown = true;
                    this.logError("Request is only available in Donation mode.");
                }
            }
            else if (error.response.status == 405) {
                if (error.response.data.includes("POST or GET only")) {
                    isKnown = true;
                    this.logError("Data must be sent via the HTTP POST or GET method");
                }
            }
            if (!isKnown) {
                this.logError(error.response.data);
            }
        }
        else if (error.request) {
            /*
             * The request was made but no response was received, `error.request`
             * is an instance of XMLHttpRequest in the browser and an instance
             * of http.ClientRequest in Node.js
             */
            this.logError(error.request);
        }
        else {
            // Something happened in setting up the request and triggered an Error
            this.logError("Error: " + error.message);
        }
    }
    async write() {
        //https://pvoutput.org/help/api_specification.html
        //
        if (this.adapter == null) {
            this.logError("adpater is null");
            return;
        }
        if (this.config.Upload == false) {
            return;
        }
        let sURL = "";
        let data = "";
        try {
            const SystemName = this.config.Name.replace(this.adapter.FORBIDDEN_CHARS, "_");
            //this is live data
            sURL = "https://pvoutput.org/service/r2/addstatus.jsp";
            //sURL += "key=" + system.ApiKey.replace(adapter.FORBIDDEN_CHARS, '_');
            //sURL += "&sid=" + system.SystemId.replace(adapter.FORBIDDEN_CHARS, '_');
            const date = new Date();
            const year = date.getFullYear();
            let month = date.getMonth();
            month = month + 1;
            let sMonth = "";
            if (month < 10) {
                sMonth = "0" + month;
            }
            else {
                sMonth = month.toString();
            }
            const day = date.getDate();
            let sDay = "";
            if (day < 10) {
                sDay = "0" + day;
            }
            else {
                sDay = day.toString();
            }
            const sDate = year.toString() + sMonth + sDay;
            data += "d=" + sDate;
            let sHour = "";
            const hour = date.getHours();
            if (hour < 10) {
                sHour = "0" + hour;
            }
            else {
                sHour = hour.toString();
            }
            let sMinute = "";
            const minute = date.getMinutes();
            if (minute < 10) {
                sMinute = "0" + minute;
            }
            else {
                sMinute = minute.toString();
            }
            const sTime = sHour + ":" + sMinute;
            data += "&t=" + sTime;
            const PowerGeneration = await this.adapter.getStateAsync(SystemName + ".Upload.PowerGeneration");
            const EnergyGeneration = await this.adapter.getStateAsync(SystemName + ".Upload.EnergyGeneration");
            const PowerConsumption = await this.adapter.getStateAsync(SystemName + ".Upload.PowerConsumption");
            const EnergyConsumption = await this.adapter.getStateAsync(SystemName + ".Upload.EnergyConsumption");
            const temperature = await this.adapter.getStateAsync(SystemName + ".Upload.Temperature");
            const voltage = await this.adapter.getStateAsync(SystemName + ".Upload.Voltage");
            if (EnergyGeneration != null && EnergyGeneration.val != null && typeof EnergyGeneration.val === "number" && EnergyGeneration.val > 0) {
                data += "&v1=" + EnergyGeneration.val;
            }
            if (PowerGeneration != null && PowerGeneration.val != null && typeof PowerGeneration.val === "number" && PowerGeneration.val > 0) {
                data += "&v2=" + PowerGeneration.val;
            }
            if (EnergyConsumption != null && EnergyConsumption.val != null && typeof EnergyConsumption.val === "number" && EnergyConsumption.val > 0) {
                data += "&v3=" + EnergyConsumption.val;
            }
            if (PowerConsumption != null && PowerConsumption.val != null && typeof PowerConsumption.val === "number" && PowerConsumption.val > 0) {
                data += "&v4=" + PowerConsumption.val;
            }
            if (temperature != null && temperature.val != null && typeof temperature.val === "number") {
                data += "&v5=" + temperature.val;
            }
            if (voltage != null && voltage.val != null && typeof voltage.val === "number" && voltage.val > 0) {
                data += "&v6=" + voltage.val;
            }
            let CumulativeFlag = this.config.CumulativeFlag;
            if (CumulativeFlag == null || CumulativeFlag < 1 || CumulativeFlag > 3) {
                this.logWarn("unsupported cumulative Flag " + CumulativeFlag + " . set to 1");
                CumulativeFlag = 1;
            }
            data += "&c1=" + CumulativeFlag;
            let NetDataFlag = this.config.NetDataFlag;
            if (NetDataFlag == null || NetDataFlag < 0 || NetDataFlag > 1) {
                this.logWarn("unsupported NetDataFlag " + NetDataFlag + " . set to unchecked (0) ");
                NetDataFlag = 0;
            }
            data += "&n=" + NetDataFlag;
            //to add
            /*
            Extended Value v7
            Extended Value v8
            Extended Value v9
            Extended Value v10
            Extended Value v11
            Extended Value v12
            Text Message 1 30 chars max
            */
            this.logDebug("URL " + sURL.replace(/key=.*&sid=/, "key=******&sid="));
            //let response = await axios.get(sURL, { timeout: 5000 });
            const response = await this.getData(sURL, data);
            if (response != null && response.status == 200) {
                this.logDebug("data written, headers " + JSON.stringify(response.headers));
            }
            else {
                this.logWarn("data not written " + JSON.stringify(response));
            }
        }
        catch (e) {
            this.logError("exception in write [" + String(e) + "] " + sURL + " " + JSON.stringify(data));
        }
    }
    async write_EOD() {
        if (this.adapter == null) {
            this.logError("adpater is null");
            return;
        }
        if (this.config.Upload == false) {
            return;
        }
        //https://pvoutput.org/help/api_specification.html
        //
        let data = "";
        let sURL = "";
        try {
            const SystemName = this.config.Name.replace(this.adapter.FORBIDDEN_CHARS, "_");
            //this is the end of day output
            sURL = "https://pvoutput.org/service/r2/addoutput.jsp";
            //sURL += "key=" + system.ApiKey.replace(adapter.FORBIDDEN_CHARS, '_');
            //sURL += "&sid=" + system.SystemId.replace(adapter.FORBIDDEN_CHARS, '_');
            const date = new Date();
            const year = date.getFullYear();
            let month = date.getMonth();
            month = month + 1;
            let sMonth = "";
            if (month < 10) {
                sMonth = "0" + month;
            }
            else {
                sMonth = month.toString();
            }
            const day = date.getDate();
            let sDay = "";
            if (day < 10) {
                sDay = "0" + day;
            }
            else {
                sDay = day.toString();
            }
            const sDate = year.toString() + sMonth + sDay;
            data += "d=" + sDate;
            const EnergyGeneration = await this.adapter.getStateAsync(SystemName + ".Upload.EnergyGenerationToday");
            const EnergyConsumption = await this.adapter.getStateAsync(SystemName + ".Upload.EnergyExportedToday");
            if (EnergyGeneration != null && EnergyGeneration.val != null && typeof EnergyGeneration.val === "number" && EnergyGeneration.val > 0) {
                data += "&g=" + EnergyGeneration.val;
            }
            if (EnergyConsumption != null && EnergyConsumption.val != null && typeof EnergyConsumption.val === "number" && EnergyConsumption.val > 0) {
                data += "&e=" + EnergyConsumption.val;
            }
            //weather conditions
            /*
            Fine
            Partly Cloudy
            Mostly Cloudy
            Cloudy
            Showers
            Snow
            Hazy
            Fog
            Dusty
            Frost
            Storm
            */
            //direct from DasWetter
            if (this.useWeatherAdapter && this.OID_WeatherConditions.length > 0) {
                const WeatherConditions = await this.adapter.getForeignStateAsync(this.adapter.config.OID_WeatherConditions);
                //exception in write[TypeError: Cannot read properties of null(reading 'val')]https://pvoutput.org/service/r2/addoutput.jsp "d=20220820&g=1116699"
                this.logDebug("use dasWetter " + this.OID_WeatherConditions + " = " + JSON.stringify(WeatherConditions));
                if (WeatherConditions != null && Number(WeatherConditions.val) > 0 && Number(WeatherConditions.val) < 23) {
                    switch (Number(WeatherConditions.val)) {
                        case 1:
                            data += "&cd=fine";
                            break;
                        case 2:
                            data += "&cd=Partly Cloudy";
                            break;
                        case 3:
                            data += "&cd=Mostly Cloudy";
                            break;
                        case 4:
                            data += "&cd=Cloudy";
                            break;
                        case 5:
                            data += "&cd=Showers";
                            break;
                        case 6:
                            data += "&cd=Showers";
                            break;
                        case 7:
                            data += "&cd=Showers";
                            break;
                        case 8:
                            data += "&cd=Showers";
                            break;
                        case 9:
                            data += "&cd=Showers";
                            break;
                        case 10:
                            data += "&cd=Showers";
                            break;
                        case 11:
                            data += "&cd=Showers";
                            break;
                        case 12:
                            data += "&cd=Showers";
                            break;
                        case 13:
                            data += "&cd=Showers";
                            break;
                        case 14:
                            data += "&cd=Showers";
                            break;
                        case 15:
                            data += "&cd=Showers";
                            break;
                        case 16:
                            data += "&cd=Showers";
                            break;
                        case 17:
                            data += "&cd=Snow";
                            break;
                        case 18:
                            data += "&cd=Snow";
                            break;
                        case 19:
                            data += "&cd=Snow";
                            break;
                        case 20:
                            data += "&cd=Snow";
                            break;
                        case 21:
                            data += "&cd=Snow";
                            break;
                        case 22:
                            data += "&cd=Snow";
                            break;
                    }
                }
                else {
                    this.logWarn("unsupported value for weatherconditions : " + JSON.stringify(WeatherConditions) + "! Should be a number between 1 and 22 like daswetter.0.NextDaysDetailed.Location_1.Day_1.symbol_value");
                }
            }
            else {
                const WeatherConditions = await this.adapter.getStateAsync(SystemName + ".Upload.WeatherConditions");
                if (WeatherConditions != null && WeatherConditions.val != null && typeof WeatherConditions.val === "string" && WeatherConditions.val.length > 0) {
                    const conditions = WeatherConditions.val;
                    if (conditions != null && typeof conditions === "string" && conditions.match(/^(Fine|Partly Cloudy|Mostly Cloudy|Cloudy|Showers|Snow|Hazy|Fog|Dusty|Frost|Storm)$/)) {
                        data += "&cd=" + WeatherConditions.val;
                    }
                    else {
                        this.logWarn("weather conditions  " + conditions + " does not macth to one of the following " + "Fine|Partly Cloudy|Mostly Cloudy|Cloudy|Showers|Snow|Hazy|Fog|Dusty|Frost|Storm");
                    }
                }
            }
            //to add
            /*
            Peak Power number watts
            Peak Time hh:mm time
            Condition text See Conditions
            Min Temp decimal celsius
            Max Temp decimal celsius
            Comments text Free text
            Import Peak number watt hours
            Import Off Peak watt hours
            Import Shoulder number watt hours
            Import High Shoulder number watt hours
            Consumption number watt hours
            Export Peak number watt hours
            Export Off-Peak number watt hours
            Export Shoulder number watt hours
            Export High Shoulder number watt hours
            */
            this.logDebug("URL " + sURL.replace(/key=.*&sid=/, "key=******&sid="));
            //let response = await axios.get(sURL, { timeout: 5000 });
            const response = await this.getData(sURL, data);
            if (response != null && response.status == 200) {
                this.logDebug("data written, headers " + JSON.stringify(response.headers));
            }
            else {
                this.logWarn("data not written " + JSON.stringify(response));
            }
        }
        catch (e) {
            this.logError("exception in write EoD [" + String(e) + "] " + sURL + " " + JSON.stringify(data));
        }
    }
    async checkVariables() {
        this.logDebug("init variables ");
        if (this.adapter == null) {
            this.logError("adpater is null");
            return;
        }
        const SystemName = this.config.Name.replace(this.adapter.FORBIDDEN_CHARS, "_");
        let key;
        let obj;
        // Status ====================================
        key = SystemName + ".Status.Date";
        obj = {
            type: "state",
            common: {
                name: "Date",
                type: "string",
                role: "date",
                read: true,
                write: false
            }
        };
        await this.CreateObject(key, obj);
        key = SystemName + ".Status.Time";
        obj = {
            type: "state",
            common: {
                name: "Time",
                type: "string",
                role: "value",
                read: true,
                write: false
            }
        };
        await this.CreateObject(key, obj);
        key = SystemName + ".Status.EnergyGeneration";
        obj = {
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
        await this.CreateObject(key, obj);
        key = SystemName + ".Status.PowerGeneration";
        obj = {
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
        await this.CreateObject(key, obj);
        key = SystemName + ".Status.EnergyConsumption";
        obj = {
            type: "state",
            common: {
                name: "Energy Consumption",
                type: "number",
                role: "value.power.consumption",
                read: true,
                write: false,
                unit: "Wh"
            }
        };
        await this.CreateObject(key, obj);
        key = SystemName + ".Status.PowerConsumption";
        obj = {
            type: "state",
            common: {
                name: "Power Consumption",
                type: "number",
                role: "value.power.consumption",
                read: true,
                write: false,
                unit: "W"
            }
        };
        await this.CreateObject(key, obj);
        key = SystemName + ".Status.NormalisedOutput";
        obj = {
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
        await this.CreateObject(key, obj);
        key = SystemName + ".Status.Temperature";
        obj = {
            type: "state",
            common: {
                name: "Temperature",
                type: "number",
                role: "value.temperature",
                read: true,
                write: false,
                unit: "°C"
            }
        };
        await this.CreateObject(key, obj);
        key = SystemName + ".Status.Voltage";
        obj = {
            type: "state",
            common: {
                name: "Voltage",
                type: "number",
                role: "value.voltage",
                read: true,
                write: false,
                unit: "V"
            }
        };
        await this.CreateObject(key, obj);
        // Statistic ====================================
        key = SystemName + ".Statistic.EnergyGenerated";
        obj = {
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
        await this.CreateObject(key, obj);
        key = SystemName + ".Statistic.EnergyExported";
        obj = {
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
        await this.CreateObject(key, obj);
        key = SystemName + ".Statistic.AverageGeneration";
        obj = {
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
        await this.CreateObject(key, obj);
        key = SystemName + ".Statistic.MinimumGeneration";
        obj = {
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
        await this.CreateObject(key, obj);
        key = SystemName + ".Statistic.MaximumGeneration";
        obj = {
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
        await this.CreateObject(key, obj);
        key = SystemName + ".Statistic.AverageEfficiency";
        obj = {
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
        await this.CreateObject(key, obj);
        key = SystemName + ".Statistic.Outputs";
        obj = {
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
        await this.CreateObject(key, obj);
        key = SystemName + ".Statistic.ActualDateFrom";
        obj = {
            type: "state",
            common: {
                name: "Actual Date From",
                type: "string",
                role: "date",
                read: true,
                write: false,
                unit: ""
            }
        };
        await this.CreateObject(key, obj);
        key = SystemName + ".Statistic.ActualDateTo";
        obj = {
            type: "state",
            common: {
                name: "Actual Date To",
                type: "string",
                role: "date",
                read: true,
                write: false,
                unit: ""
            }
        };
        await this.CreateObject(key, obj);
        key = SystemName + ".Statistic.RecordEfficiency";
        obj = {
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
        await this.CreateObject(key, obj);
        key = SystemName + ".Statistic.RecordDate";
        obj = {
            type: "state",
            common: {
                name: "Record Date",
                type: "string",
                role: "date",
                read: true,
                write: false,
                unit: ""
            }
        };
        await this.CreateObject(key, obj);
        // System ====================================
        key = SystemName + ".System.SystemName";
        obj = {
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
        await this.CreateObject(key, obj);
        key = SystemName + ".System.SystemSize";
        obj = {
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
        await this.CreateObject(key, obj);
        key = SystemName + ".System.Postcode";
        obj = {
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
        await this.CreateObject(key, obj);
        key = SystemName + ".System.Panels";
        obj = {
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
        await this.CreateObject(key, obj);
        key = SystemName + ".System.PanelPower";
        obj = {
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
        await this.CreateObject(key, obj);
        key = SystemName + ".System.PanelBrand";
        obj = {
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
        await this.CreateObject(key, obj);
        key = SystemName + ".System.Inverters";
        obj = {
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
        await this.CreateObject(key, obj);
        key = SystemName + ".System.InverterPower";
        obj = {
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
        await this.CreateObject(key, obj);
        key = SystemName + ".System.InverterBrand";
        obj = {
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
        await this.CreateObject(key, obj);
        key = SystemName + ".System.Orientation";
        obj = {
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
        await this.CreateObject(key, obj);
        key = SystemName + ".System.ArrayTilt";
        obj = {
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
        await this.CreateObject(key, obj);
        key = SystemName + ".System.Shade";
        obj = {
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
        await this.CreateObject(key, obj);
        key = SystemName + ".System.InstallDate";
        obj = {
            type: "state",
            common: {
                name: "Install Date",
                type: "string",
                role: "date",
                read: true,
                write: false,
                unit: ""
            }
        };
        await this.CreateObject(key, obj);
        key = SystemName + ".System.Latitude";
        obj = {
            type: "state",
            common: {
                name: "Latitude",
                type: "number",
                role: "value.gps.latitude",
                read: true,
                write: false,
                unit: ""
            }
        };
        await this.CreateObject(key, obj);
        key = SystemName + ".System.Longitude";
        obj = {
            type: "state",
            common: {
                name: "Longitude",
                type: "number",
                role: "value.gps.longitude",
                read: true,
                write: false,
                unit: ""
            }
        };
        await this.CreateObject(key, obj);
        key = SystemName + ".RateLimit.Remaining";
        obj = {
            type: "state",
            common: {
                name: "The number of requests remaining for the hour",
                type: "number",
                role: "value",
                read: true,
                write: false,
                unit: ""
            }
        };
        await this.CreateObject(key, obj);
        key = SystemName + ".RateLimit.Limit";
        obj = {
            type: "state",
            common: {
                name: "The total request limit for the hour",
                type: "number",
                role: "value",
                read: true,
                write: false,
                unit: ""
            }
        };
        await this.CreateObject(key, obj);
        key = SystemName + ".RateLimit.Reset";
        obj = {
            type: "state",
            common: {
                name: "time when the limit is reset",
                type: "string",
                role: "date",
                read: true,
                write: false,
                unit: ""
            }
        };
        await this.CreateObject(key, obj);
        if (this.config.Upload) {
            key = SystemName + ".Upload.EnergyGeneration";
            obj = {
                type: "state",
                common: {
                    name: "Generated Energy for Upload",
                    type: "number",
                    role: "value",
                    read: true,
                    write: true,
                    unit: "Wh"
                }
            };
            await this.CreateObject(key, obj);
            //for EoD
            key = SystemName + ".Upload.EnergyGenerationToday";
            obj = {
                type: "state",
                common: {
                    name: "Generated Energy today for Upload for EoD",
                    type: "number",
                    role: "value",
                    read: true,
                    write: true,
                    unit: "Wh"
                }
            };
            await this.CreateObject(key, obj);
            key = SystemName + ".Upload.EnergyExportedToday";
            obj = {
                type: "state",
                common: {
                    name: "Exported Energy today for Upload EoD",
                    type: "number",
                    role: "value",
                    read: true,
                    write: true,
                    unit: "Wh"
                }
            };
            await this.CreateObject(key, obj);
            key = SystemName + ".Upload.PowerGeneration";
            obj = {
                type: "state",
                common: {
                    name: "Generated Power for Upload",
                    type: "number",
                    role: "value",
                    read: true,
                    write: true,
                    unit: "W"
                }
            };
            await this.CreateObject(key, obj);
            key = SystemName + ".Upload.EnergyConsumption";
            obj = {
                type: "state",
                common: {
                    name: "Consumed Energy for Upload",
                    type: "number",
                    role: "value",
                    read: true,
                    write: true,
                    unit: "Wh"
                }
            };
            await this.CreateObject(key, obj);
            key = SystemName + ".Upload.PowerConsumption";
            obj = {
                type: "state",
                common: {
                    name: "Consumed Power for Upload",
                    type: "number",
                    role: "value",
                    read: true,
                    write: true,
                    unit: "W"
                }
            };
            await this.CreateObject(key, obj);
            key = SystemName + ".Upload.Temperature";
            obj = {
                type: "state",
                common: {
                    name: "Temperature for Upload",
                    type: "number",
                    role: "value",
                    read: true,
                    write: true,
                    unit: "°C"
                }
            };
            await this.CreateObject(key, obj);
            key = SystemName + ".Upload.Voltage";
            obj = {
                type: "state",
                common: {
                    name: "Voltage for Upload",
                    type: "number",
                    role: "value",
                    read: true,
                    write: true,
                    unit: "V"
                }
            };
            await this.CreateObject(key, obj);
            key = SystemName + ".Upload.WeatherConditions";
            obj = {
                type: "state",
                common: {
                    name: "WeatherConditions for EoD Upload",
                    type: "string",
                    role: "value",
                    read: true,
                    write: true,
                    unit: ""
                }
            };
            await this.CreateObject(key, obj);
        }
    }
}
exports.default = pvoutput;
//# sourceMappingURL=pvoutputorg.js.map