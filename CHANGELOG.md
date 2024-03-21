# Changelog

All notable changes to this project will be documented in this file. This project uses [Semantic Versioning](https://semver.org/).

## 0.6.9 (2023-03-30)

## [Version 0.6.9](https://github.com/northernman54/homebridge-alexa/compare/v0.6.8...v0.6.9)

#### Changes

- Enables Thermostat type accessory to `Turn Off` and `Turn On` #605 ( Tks @banboobee ).  To preserve existing functionality the inital / default behaviour for the `Turn on Thermostat` command is to return an error message `That command does not work on device` unless the new optional config setting `Thermostat Turn On Behaviour` is set.
- Minor style updates to Config Menu
- Updates to package dependencies

## 0.6.8 (2023-12-13)

## [Version 0.6.8](https://github.com/northernman54/homebridge-alexa/compare/v0.6.7...v0.6.8)

#### Changes

- Fix for issue #591, Window coverings / blinds show as unresponsive in the Alexa App

## 0.6.7 (2023-09-27)

## [Version 0.6.7](https://github.com/northernman54/homebridge-alexa/compare/v0.6.6...v0.6.7)

#### Changes

- Fix for issue #579, AC can't change temperature
  
## 0.6.6 (2023-07-07)

## [Version 0.6.6](https://github.com/northernman54/homebridge-alexa/compare/v0.6.5...v0.6.6)

#### Changes

- Fix for issue #572, Issue with Heater/Cooler devices and alexa status request failing with an error.

## 0.6.5 (2023-01-03)

## [Version 0.6.4](https://github.com/northernman54/homebridge-alexa/compare/v0.6.4...v0.6.5)

#### Changes

- Fix for issue #551, which includes an alternate device naming approach that combines the HomeKit internal services names for an accessory to resolve some issues with duplicate device names.  The new config option `mergeServiceName` enables this feature.  This option if enabled is a break changing for existing implementations, and will cause existing devices to no longer be controllable by Alexa.  You will need to remove the non-functioning devices from the Alexa App and ask Alexa to discover devices again to resolve.

## 0.6.4 (2023-01-03)

## [Version 0.6.4](https://github.com/northernman54/homebridge-alexa/compare/v0.6.3...v0.6.4)

#### Changes

- Fix for issue #564

## 0.6.3 (2023-01-03)

## [Version 0.6.3](https://github.com/northernman54/homebridge-alexa/compare/v0.6.0...v0.6.3)

#### Changes

- Disable support for ipv6, this was problematic for some users #561

## 0.6.0 (2023-01-03)

## [Version 0.6.0](https://github.com/northernman54/homebridge-alexa/compare/v0.5.63...v0.6.0)

#### Changes

- Added additional debug logging to easily determine child bridge address to aid Homebridge Accessory Dumps
- Updates to hap-node-client to better support usage of ipv6 and removal of request dependancy
- Update to gh-md-toc ( generates TOC for README )
- Merge current beta functionality into main code base
- Enable ability to change cloud transport `CloudTransport`, to provide improved connectivity in some setups. Previously these had been available in the beta.
- Removed the Alexa contact sensor ( which shows the status of the connection to the cloud servers ) from the list of devices passed to Alexa.
- Updated and simplified the Homebridge-UI plugin settings menu for homebridge-alexa

## 0.5.63 (2022-04-27)

## [Version 0.5.63](https://github.com/northernman54/homebridge-alexa/compare/v0.5.61...v0.5.63)

#### Changes

- Updates to README in regards to switch to subscription based model for the cloud services.
- Lower default cloud connection keepalive to 5 minutes

## 0.5.61 (2022-03-21)

## [Version 0.5.61](https://github.com/northernman54/homebridge-alexa/compare/v0.5.56...v0.5.61)

#### Changes

- Updates to README in regards to switch to subscription based model for the cloud services.
- Further fixes for #507/#508

## 0.5.56 (2022-03-21)

## [Version 0.5.56](https://github.com/northernman54/homebridge-alexa/compare/v0.5.54...v0.5.56)

#### Changes

- Fix for #507

## 0.5.54 (2022-01-03)

## [Version 0.5.54](https://github.com/northernman54/homebridge-alexa/compare/v0.5.52...v0.5.54)

#### Changes

- Merge current beta into master
- Expose cloud connection keep alive tuning parameter #479
- Extend filtering to routines event registration - Resolve #458 #459 #461 #465
- Reduce amount of logging

## 0.5.37 (2021-06-15)

## [Version 0.5.37](https://github.com/northernman54/homebridge-alexa/compare/v0.5.33...v0.5.37)

#### Changes

- Update event/routine logic to stop sending events for connectivity error #441.  This should reduce the frequency of doorbell events triggered by homebridge restarts.

## 0.5.33 (2021-03-17)

## [Version 0.5.33](https://github.com/northernman54/homebridge-alexa/compare/v0.5.25...v0.5.33)

#### Changes

- Changed blinds, and doors etc to leverage minValue and maxValue from Issue #434
- Updated FANS from SWITCH to FAN display category issue #172

## 0.5.25 (2020-12-28)

## [Version 0.5.25](https://github.com/northernman54/homebridge-alexa/compare/v0.5.21...v0.5.25)

#### Changes

- Prioritize doorbell notification events ( found that they were being queued behind motion alerts when someone walked up to the door and delayed by almost a minute. )
- Fix for Apple TV Remote plugin crashing the Alexa Plugin

## 0.5.21 (2020-12-28)

## [Version 0.5.21](https://github.com/northernman54/homebridge-alexa/compare/v0.5.20...v0.5.21)

#### Changes

- Removed logging of alexaDiscovery response due to issue #402
- MQTT Connection recovery tuning for issue #401

## 0.5.20 (2020-12-27)

## [Version 0.5.20](https://github.com/northernman54/homebridge-alexa/compare/v0.5.17...v0.5.20)

#### Changes

- Updated development work flow to support nodemon.
- Updated description in package.json to better describe this plugin.  Used by plugin search on homebridge.io
- Moved device filtering to before duplicate name check
- When DEBUG is enabled plugin will log the parsed Alexa discovery response ( alexaDiscovery.json ) into current directory.

## 0.5.17 (2020-11-18)

## [Version 0.5.17](https://github.com/northernman54/homebridge-alexa/compare/v0.5.16...v0.5.17)

#### Changes

- Improvements for homebridge-apple-tv-remote behaviour, and removal of the need to create a Pause button in the config

## 0.5.16 (2020-10-18)

## [Version 0.5.16](https://github.com/northernman54/homebridge-alexa/compare/v0.5.14...v0.5.16)

#### Changes

- Fix for issue #374 - Events being sent twice

## 0.5.14 (2020-10-18)

## [Version 0.5.14](https://github.com/northernman54/homebridge-alexa/compare/v0.5.12...v0.5.14)

#### Changes

- Adds filtering ( ignorelist ) of devices from discovery, tks @pwilms

## 0.5.12 (2020-10-07)

## [Version 0.5.12](https://github.com/northernman54/homebridge-alexa/compare/v0.5.11...v0.5.12)

#### Changes

- Fix the Alexa discovery failing for large cookie objects, Alexa spec says max 5k.

## 0.5.11 (2020-09-16)

## [Version 0.5.11](https://github.com/northernman54/homebridge-alexa/compare/v0.4.74...v0.5.11)

#### Changes

- Inputs - Allows creating TV or Entertainment unit input controls
- Channels - Allows changing TV channels
- Blinds / Window Coverings - Support for natural language to control
- Garage Doors Support for natural language to control
- Numerous issue fixes

## 0.4.74 (2020-09-16)

#### Changes

No change log
