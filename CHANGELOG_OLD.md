# Older changes
## 1.9.3 (2025-06-28)
* (René) update dependencies
* (René) new testing

## 1.9.2 (2025-06-08)
* (René) bug fix date conversion

## 1.9.1 (2025-02-27)
* (René) changes requested by adapter checker
* (René) dependencies updated

## 1.9.0 (2024-12-15)
* (René) see issue #289: test with nodejs@22
* (René) update dependencies
* (René) migration to jsonConfig

## 1.8.13 (2024-08-24)
* (René) update dependencies
* (René) bug fixes based on adapter checker recommendation

## 1.8.12 (2024-05-28)
* (René) change of dependencies
* (René) show cron status after job creation

## 1.8.11 (2024-01-12)
* (René) dependencies updates

## 1.8.10 (2023-11-19)
* (René) dependencies updates

## 1.8.9 (2023-07-30)
* (René) dependencies updates

## 1.8.8 (2023-04-07)
* (René) dependencies updates

## 1.8.7 (2023-01-31)
* (René) dependencies updates

## 1.8.6 (2022-11-29)
* (René) see issue #4 : bug fix negative temperatures

## 1.8.5 (2022-10-01)
* (René) bug fix wrong date

## 1.8.4 (2022-08-21)
* (René) bug fix WeatherConditions
* (René) bug fix EoD upload

## 1.8.0 (2022-08-20)
* (René) WeatherConditions can be used directly from DasWetter adapter

## 1.7.0 (2022-07-17)
* (René) WeatherConditions for upload end of the day (EoD) data added
* (René) write-Interval selectable out of 5, 10 or 15 minutes according PVOutput.org-specification

## 1.6.1 (2022-07-06)
* (René) bug fix date string in write status and end of day data

## 1.6.0 (2022-07-01)
* (René) change back from cron to interval
* (René) end of day data are written 1 hour after sunset
* (René) read and write data only when daylight as an option

## 1.5.0 (2022-04-21)
* (René) datapoint added to show when data uploaded to pvoutput.org

## 1.4.0 (2022-06-01)
* (René) changed to post requests

## 1.3.0 (2022-05-26)
* (René) Upload live data and end-of-day
* (René) better error handling when receiving errors from server
* (René) CumulativeFlag and NetDataFlag added for upload service

## 1.2.0 (2022-05-21)
* (René) IsActive per system added

## 1.1.0 (2022-05-20)
* (René) write data to PvOutput.org added
* (René) change to cron

## 1.0.0 (2022-04-29)
* (René) first official release

## 0.0.1 (2022-04-24)
* (René) initial release
