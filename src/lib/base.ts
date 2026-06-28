/* eslint-disable prefer-template */

import type { Pvoutputorg } from "../main";

import type { iobObject, PvoutputorgConfig } from "./types";



export default class Base {

    public adapter: Pvoutputorg | null;
    id: number;
    name: string;

    sVersion: string;
    constructor(adapter: Pvoutputorg | null, id: number,  config: PvoutputorgConfig) {

        if (adapter != null) {
            this.adapter = adapter;
        } else {
            this.adapter = null;
        }
        this.id = id;
        this.name = config.Name || "Unknown";

        this.sVersion = "";

        

        this.logDebug("instance created");

    }

    GetVersion(): string {
        return this.name + ": " + this.sVersion + " ";
    }


    GetForbiddenChars(): RegExp {
        if (this.adapter == null) {
            return new RegExp("");
        } else {
            if (this.adapter.FORBIDDEN_CHARS !== undefined && this.adapter.FORBIDDEN_CHARS != null) {
                return this.adapter.FORBIDDEN_CHARS;
            } else {
                return new RegExp("");
            }
        }
    }

     async Start(): Promise<void> {
        this.logDebug("start  ");
         await Promise.resolve();


        //read all data
        //await this.ReadData();




    }

    async Stop(): Promise<void> {
        
        
    }

    async Do(): Promise<void> {

        this.logDebug("starting ... ");

        await this.ReadData();

        //to do
        //await WriteData();
    }


    async ReadData(): Promise<void> {
        //do nothing    here, just for overwriting in the child class

    }

    public logDebug(message: string): void {
        if (this.adapter != null) {
            this.adapter.log.debug(this.name + ": " + message);
        }
    }
    public logInfo(message: string): void {
        if (this.adapter != null) {
            this.adapter.log.info(this.name + ": " + message);
        }
    }
    public logError(message: string): void {
        if (this.adapter != null) {
            this.adapter.log.error(this.name + ": " + message);
        }
    }
    public logWarn(message: string): void {
        if (this.adapter != null) {
            this.adapter.log.warn(this.name + ": " + message);
        }
    }


    async CreateObject(key: string, obj: iobObject): Promise<void> {

        await this.CreateDatapoint(
            key,
            obj.common.name,
            obj.type,
            obj.common.role,
            obj.common.type,
            obj.common.unit,
            obj.common.read,
            obj.common.write,
            obj.common.desc
        );

    }

    async CreateDatapoint(key: string, name: string | undefined, type: any, common_role: string | undefined, common_type: string, common_unit: string | undefined, common_read: boolean, common_write: boolean, common_desc: ioBroker.StringOrTranslated | undefined): Promise<void> {


        if (this.adapter == null) {
            return;
        }

        let objName = "";
        if (name === undefined) {
            const names = key.split(".");
            let idx = names.length;
            objName = key;
            if (idx > 0) {
                idx--;
                objName = names[idx];
            }
        } else {
            objName = name;
        }

        await this.adapter.setObjectNotExistsAsync(key, {
            type: type,
            common: {
                name: objName,
                role: common_role,
                type: common_type,
                unit: common_unit ? common_unit : "",
                read: common_read,
                write: common_write,
                desc: common_desc
            },
            native: { id: key }
        });

        const obj = await this.adapter.getObjectAsync(key);

        if (obj != null) {

            if (obj.common.role != common_role
                || obj.common.type != common_type
                || obj.common.unit != common_unit
                || obj.common.read != common_read
                || obj.common.write != common_write
                || obj.common.name != name
                || obj.common.desc != common_desc
            ) {
                await this.adapter.extendObject(key, {
                    common: {
                        name: name,
                        role: common_role,
                        type: common_type,
                        unit: common_unit ? common_unit : "",
                        read: common_read,
                        write: common_write,
                        desc: common_desc
                    }
                });
            }
        }
    }

    async SetDefault(key: string, value: any): Promise<void> {

        if (this.adapter == null) {
            return;
        }

        const current = await this.adapter.getStateAsync(key);
        //set default only if nothing was set before
        if (current === null || current === undefined || current.val === undefined) {
            this.logInfo("set default " + key + " to " + value);
            await this.adapter.setState(key, { ack: true, val: value });
        }
    }

    async SetState(key: string,
        ack: boolean,
        val: string | number | boolean

    ): Promise<void> {

        if (this.adapter == null) {
            return;
        }

        await this.adapter.setState(key, { ack: ack, val: val });
    }


    

}