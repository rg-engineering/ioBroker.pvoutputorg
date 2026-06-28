// This file extends the AdapterConfig type from "@types/iobroker"

import type { PvoutputorgConfig } from "./types";




// Augment the globally declared type ioBroker.AdapterConfig
declare global {
	namespace ioBroker {
		interface AdapterConfig {

            timezone: string;
			readInterval: number;
			writeInterval: number;
			GetDataOnlyWhenDaylight: boolean;
            useWeatherAdapter: boolean;
            OID_WeatherConditions: string;

			PVSystems: PvoutputorgConfig[];

		}
	}
}

// this is required so the above AdapterConfig is found by TypeScript / type checking
export {};