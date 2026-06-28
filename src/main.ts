/* eslint-disable prefer-template */
/*
 * Created with @iobroker/create-adapter v2.6.5
 */

// https://www.iobroker.net/#en/documentation/dev/adapterdev.md

import * as utils from "@iobroker/adapter-core";

import pvoutput from "./lib/pvoutputorg";

import { CronJob } from 'cron';
import SunCalc from "suncalc";


export class Pvoutputorg extends utils.Adapter {

	private systems: (pvoutput)[] = [];
	cronJobs: CronJob<() => void, null>[] = [];

	readIntervalID: ReturnType<typeof setInterval> | null;
	writeIntervalID: ReturnType<typeof setInterval> | null;
	longit: number;
	latit: number;

	public constructor(options: Partial<utils.AdapterOptions> = {}) {
		super({
			...options,
			name: "pvoutputorg",
		});
		this.readIntervalID = null;
		this.writeIntervalID = null;
		this.longit = 0;
		this.latit = 0;

		this.on("ready", this.onReady.bind(this));
		this.on("stateChange", this.onStateChange.bind(this));
		this.on("objectChange", this.onObjectChange.bind(this));
		this.on("message", this.onMessage.bind(this));
		this.on("unload", this.onUnload.bind(this));
	}

	/**
	 * Wird aufgerufen, wenn die Datenbanken verbunden sind und die Adapter-Konfiguration empfangen wurde.
	 */
	private async onReady(): Promise<void> {
		this.log.debug(JSON.stringify(this.config));

		try {
			if (!Array.isArray(this.config.PVSystems)) {
				this.log.error("no system-config found.");
				return;
			}



			let readInterval = 15;
			if (this.config.readInterval > 0) {
				readInterval = this.config.readInterval;
			} else {
				this.log.warn("read interval not defined");
			}
			this.log.debug("read every  " + readInterval + " minutes");
			this.readIntervalID = setInterval(this.DoRead, readInterval * 60 * 1000);

			//CronCreate(readInterval, DoRead)

			let writeInterval = 15;
			if (this.config.writeInterval == 5
				|| this.config.writeInterval == 10
				|| this.config.writeInterval == 15) {
				writeInterval = this.config.writeInterval;
			} else {
				this.log.warn("write interval not defined, make sure you use the same setting as in PVoutput.org configured");
			}
			this.log.debug("write every  " + writeInterval + " minutes");
			this.writeIntervalID = setInterval(this.DoWrite, writeInterval * 60 * 1000);

			//CronCreate(writeInterval, DoWrite)

			for (let l = 0; l < this.config.PVSystems.length; l++) {
				const config = this.config.PVSystems[l];
				const system = new pvoutput(this, l + 1, config, this.config.useWeatherAdapter, this.config.OID_WeatherConditions);
				await system.Start();
				this.systems.push(system);
			}


			await this.GetSystemDateformat();

			this.CronCreate(-99, this.DoWriteEOD);

			this.CronStatus();

			//read after start
			await this.DoRead();

		} catch (e) {
			this.log.error("Exception in onReady [" + String(e) + "]");
		}
	}

	async DoRead(): Promise<void> {

		this.log.debug("start reading ... ");

		await this.ReadData();
	}

	async DoWrite(): Promise<void> {

		if (this.IsDaylight()) {
			this.log.debug("start writing ... ");

			await this.WriteData();
		}
	}

	async DoWriteEOD(): Promise<void> {

		this.log.debug("start writing end of day ... ");

		await this.WriteEODData();

		await this.CronStop();
		this.CronCreate(-99, this.DoWriteEOD);
	}

	async ReadData(): Promise<void> {
		if (this.IsDaylight()) {
			for (const system of this.systems) {
				await system.read();
			}
		}
		this.log.debug("all systems read");
	}

	async WriteData(): Promise<void> {
		if (this.IsDaylight()) {
			for (const system of this.systems) {

				await system.write()
			}
		}
		this.log.debug("all systems written");
	}

	async WriteEODData(): Promise<void> {
		for (const system of this.systems) {

			await system.write_EOD();

		}
		this.log.debug("all systems written");
	}



	/**
	 * Wird aufgerufen, wenn der Adapter heruntergefahren wird - Callback MUSS unter allen Umständen aufgerufen werden!
	 */
	private async onUnload(callback: () => void): Promise<void> {
		try {
			// Hier müssen alle Timeouts oder Intervalle gelöscht werden, die noch aktiv sein könnten
			for (let n = 0; n < this.systems.length; n++) {
				await this.systems[n].Stop();
			}

			await this.CronStop();
			if (this.readIntervalID) {
				clearInterval(this.readIntervalID);
				this.readIntervalID = null;
			}
			if (this.writeIntervalID) {
				clearInterval(this.writeIntervalID);
				this.writeIntervalID = null;
			}
			this.log.info("cleaned everything up...");
			callback();


			callback();
		} catch (e) {
			this.log.error("Exception in onUnload " + String(e));
			callback();
		}
	}

	/**
	 * Wird aufgerufen, wenn ein abonniertes Objekt geändert wird
	 */
	private onObjectChange(id: string, obj: ioBroker.Object | null | undefined): void {
		if (obj) {
			this.log.info(`Objekt ${id} geändert: ${JSON.stringify(obj)}`);
		} else {
			this.log.info(`Objekt ${id} gelöscht`);
		}
	}

	/**
	 * Wird aufgerufen, wenn ein abonnierter State geändert wird
	 */
	private onStateChange(id: string, state: ioBroker.State | null | undefined): void {
		if (state) {
			// State wurde geändert
		} else {
			this.log.info(`State ${id} gelöscht`);
		}
	}

	/**
	 * Nachrichtenbehandlung
	 */
	private async onMessage(obj: ioBroker.Message): Promise<void> {
		this.log.info("on message " + JSON.stringify(obj));

		await Promise.resolve();

		if (typeof obj === "object" && obj.command) {

			switch (obj.command) {

				case "checkCurrentVersion":
					this.CheckVersion("current", obj);
					break;
			}
		}
	}


	CheckVersion(version: string, msg: ioBroker.Message): void {

		if (version == "installable") {
			const version = "";
			this.sendTo(msg.from, msg.command, version, msg.callback);
		} else if (version == "current") {
			const version = "";
			this.sendTo(msg.from, msg.command, version, msg.callback);
		} else if (version == "supported") {
			this.sendTo(msg.from, msg.command, "", msg.callback);
		}
	}


	//===============================================================================
	//cron functions

	async CronStop(): Promise<void> {
		if (this.cronJobs.length > 0) {
			this.log.debug("delete " + this.cronJobs.length + " cron jobs");
			//cancel all cron jobs...
			const start = this.cronJobs.length - 1;
			for (let n = start; n >= 0; n--) {
				await this.cronJobs[n].stop();
			}
			this.cronJobs = [];
		}
	}

	/*
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
	*/

	CronCreate(Minute: number, callback: () => void): void {

		try {

			const timezone = this.config.timezone || "Europe/Berlin";

			let cronString = "";
			//https://crontab-generator.org/
			if (Minute == -99) {
				//every day after sunset

				const times = SunCalc.getTimes(new Date(), this.latit, this.longit);


				let hour = 22;
				let minute = 55;
				if (times.sunset) {
					// format sunset/sunrise time from the Date object
					const sunsetStr = ("0" + times.sunset.getHours()).slice(-2) + ":" + ("0" + times.sunset.getMinutes()).slice(-2);
					this.log.debug(" sunset " + sunsetStr);

					hour = times.sunset.getHours() + 1;
					minute = times.sunset.getMinutes();
				}

				cronString = minute + " " + hour + " * * *";
				//just for logging
				//Minute = "sunsetStr";
			} else {

				cronString = "*/" + Minute + " * * * * ";
			}

			const nextCron = this.cronJobs.length;

			this.log.debug("create cron job #" + nextCron + " every " + Minute + " string: " + cronString + " " + timezone);

			//details see https://www.npmjs.com/package/cron
			this.cronJobs[nextCron] = new CronJob(cronString,
				() => callback(),
				() => this.log.debug("cron job stopped"), // This function is executed when the job stops
				true,
				timezone
			);

		} catch (e) {
			this.log.error("exception in CronCreate [" + String(e) + "]");
		}
	}

	CronStatus(): void {
		let n = 0;
		let length = 0;
		try {
			if (this.cronJobs !== undefined && this.cronJobs != null) {

				length = this.cronJobs.length;
				//adapter.log.debug("cron jobs");
				for (n = 0; n < length; n++) {
					if (this.cronJobs[n] !== undefined && this.cronJobs[n] != null) {
						this.log.debug("cron status = " + this.cronJobs[n].isActive + " next event: " + this.timeConverter("DE", this.cronJobs[n].nextDate().toJSDate()));
					}
				}

				if (length > 500) {
					this.log.warn("more then 500 cron jobs existing for this adapter, this might be a configuration error! (" + length + ")");
				} else {
					this.log.info(length + " cron job(s) created");
				}
			}
		} catch (e) {
			this.log.error("exception in getCronStat [" + String(e) + "] : " + n + " of " + length);
		}
	}

	timeConverter(SystemLanguage: string, time: Date, timeonly = false): string {

		let a;

		if (time != null) {
			a = new Date(time);
		} else {
			a = new Date();
		}
		let months;

		if (SystemLanguage === "de") {
			months = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
		} else if (SystemLanguage === "en") {
			months = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
		} else {
			months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
		}

		const year = a.getFullYear();
		const month = months[a.getMonth()];
		const date = a.getDate();
		const sdate = date < 10 ? " " + date.toString() : date.toString();
		const hour = a.getHours();
		const shour = hour < 10 ? "0" + hour.toString() : hour.toString();
		const min = a.getMinutes();
		const smin = min < 10 ? "0" + min.toString() : min.toString();
		const sec = a.getSeconds();
		const ssec = sec < 10 ? "0" + sec.toString() : sec.toString();

		let sRet = "";
		if (timeonly) {
			sRet = shour + ":" + smin + ":" + ssec;
		} else {
			sRet = sdate + " " + month + " " + year.toString() + " " + shour + ":" + smin + ":" + ssec;
		}

		return sRet;
	}

	IsDaylight(): boolean {
		let daylight = true;

		if (this.config.GetDataOnlyWhenDaylight) {

			const times = SunCalc.getTimes(new Date(), this.latit, this.longit);

			if (times.sunrise && times.sunset) {

				// format sunset/sunrise time from the Date object
				const sunsetStr = ("0" + times.sunset.getHours()).slice(-2) + ":" + ("0" + times.sunset.getMinutes()).slice(-2);
				const sunriseStr = ("0" + times.sunrise.getHours()).slice(-2) + ":" + ("0" + times.sunrise.getMinutes()).slice(-2);

				this.log.debug("sunrise " + sunriseStr + " sunset " + sunsetStr + " " + this.config.GetDataOnlyWhenDaylight);

				const now = new Date();

				if ((now.getHours() > times.sunrise.getHours() || (now.getHours() == times.sunrise.getHours() && now.getMinutes() > times.sunrise.getMinutes()))
					&& (now.getHours() < times.sunset.getHours() || (now.getHours() == times.sunset.getHours() && now.getMinutes() < times.sunset.getMinutes()))) {
					daylight = true;
				}
			} else {
				this.log.debug("sunrise or sunset not available, daylight = true");
			}
		}

		return daylight;
	}

	async GetSystemDateformat(): Promise<void> {
		try {
			const ret = await this.getForeignObjectAsync("system.config");

			if (ret !== undefined && ret != null && ret.common.longitude != null && ret.common.latitude != null) {
				//dateformat = ret.common.dateFormat;
				this.longit = ret.common.longitude;
				this.latit = ret.common.latitude;
				this.log.debug("system: longitude " + this.longit + " latitude " + this.latit);
			} else {
				this.log.error("system.config not available. longitude and latitude set to Berlin");
				this.longit = 52.520008;
				this.latit = 13.404954;
			}
		} catch (e) {
			this.log.error("exception in GetSystemDateformat [" + String(e) + "]");
		}
	}
}

if (require.main !== module) {
	// Exportiere den Konstruktor im Kompaktmodus
	module.exports = (options: Partial<utils.AdapterOptions> | undefined) => new Pvoutputorg(options);
} else {
	// Starte die Instanz direkt
	(() => new Pvoutputorg())();
}