![Logo](admin/pvoutputorg.png)
# ioBroker.pvoutputorg

![Number of Installations](http://iobroker.live/badges/pvoutputorg-installed.svg) ![Number of Installations](http://iobroker.live/badges/pvoutputorg-stable.svg)
[![Downloads](https://img.shields.io/npm/dm/iobroker.pvoutputorg.svg)](https://www.npmjs.com/package/iobroker.pvoutputorg)
[![NPM version](http://img.shields.io/npm/v/iobroker.pvoutputorg.svg)](https://www.npmjs.com/package/iobroker.pvoutputorg)

[![Known Vulnerabilities](https://snyk.io/test/github/rg-engineering/ioBroker.pvoutputorg/badge.svg)](https://snyk.io/test/github/rg-engineering/ioBroker.pvoutputorg)
![GitHub Actions](https://github.com/rg-engineering/ioBroker.pvoutputorg/workflows/Test%20and%20Release/badge.svg)

[![NPM](https://nodei.co/npm/iobroker.pvoutputorg.png?downloads=true)](https://nodei.co/npm/iobroker.pvoutputorg/)


**This adapter uses Sentry libraries to automatically report exceptions and code errors to the developers.** 
For more details and for information how to disable the error reporting see [Sentry-Plugin Documentation](https://github.com/ioBroker/plugin-sentry#plugin-sentry)! Sentry reporting is used starting with js-controller 3.0.


**If you like it, please consider a donation:**
                                                                          
[![paypal](https://www.paypalobjects.com/en_US/DK/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=YBAZTEBT9SYC2&source=url) 

The adapter connects to [PvOutput.org](https://pvoutput.org). System-ID and API-key is used to establish the connection. Both needs to be configured on admin page.
The system, status and statistical data for all configured systems are currently being read and displayed in data points.
The generated energy can be uploaded to PvOutput.org permanantly.

For detailed information please have a look on [pvoutput.org help](https://pvoutput.org/help/overview.html)

If you support pvoutput.org with a donation, additional features will be made available to you. At the moment these are not supported here in the adapter yet.

##System Data

##Status Data

##Statistic Data


##Upload Live Data

###Power and Energy Calculation
Power and energy values can be derived from one another. When a system sends only power values the corresponding energy values are automatically calculated.
Similarly when only energy values are sent, PVOutput will calculate the average power.

###Cumulative Energy
The following values are valid for the Cumulative Flag.
1 = Energy Generation and Energy Consumption values are lifetime energy values. Consumption and generation energy is reset to 0 at the start of the day.
2 - Only Energy Generation generation is a lifetime energy value.
3 - Only Energy Consumption consumption is a lifetime energy value.


##Upload End Of Day Data


## known issues
* please create issues at [github](https://github.com/rg-engineering/ioBroker.pvoutputorg/issues) if you find bugs or whish new features
   
## Changelog

### 1.3.0 (in progress)
* (René) Upload live data and end-of-day
* (René) better error handling when receiving errors from server

### 1.2.0 (2022-05-21)
* (René) IsActive per system added

### 1.1.0 (2022-05-20)
* (René) write data to PvOutput.org added
* (René) change to cron

### 1.0.0 (2022-04-29)
* (René) first official release

### 0.0.1 (2022-04-24)
* (René) initial release

## License
MIT License

Copyright (c) 2022 rg-engineering <info@rg-engineering.eu>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

