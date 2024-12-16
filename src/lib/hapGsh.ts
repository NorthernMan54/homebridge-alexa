import { HapClient, ServiceType } from '@homebridge/hap-client';
import { SmartHomeV1ExecuteRequestCommands, SmartHomeV1ExecuteResponseCommands, SmartHomeV1SyncDevices } from 'actions-on-google';
import { Subject } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';
import { Characteristic } from './hap-types';

import { PluginConfig } from './interfaces';
import { Log } from './logger';
import { Door } from './types/door';

import { Fan } from './types/fan';
import { Fanv2 } from './types/fan-v2';
import { GarageDoorOpener } from './types/garage-door-opener';
import { HeaterCooler } from './types/heater-cooler';
import { HumiditySensor } from './types/humidity-sensor';
import { Lightbulb } from './types/lightbulb';
import { LockMechanism } from './types/lock-mechanism';
import { SecuritySystem } from './types/security-system';
import { Switch } from './types/switch';
import { Television } from './types/television';
import { TemperatureSensor } from './types/temperature-sensor';
import { Thermostat } from './types/thermostat';
import { Window } from './types/window';
import { WindowCovering } from './types/window-covering';
import { createHash } from 'node:crypto';

export class Hap {
  socket;
  log: Log;
  pin: string;
  config: PluginConfig;
  hapClient: HapClient;
  services: ServiceType[] = [];
  private startTimeout: NodeJS.Timeout;
  private discoveryTimeout: NodeJS.Timeout;
  private syncTimeout: NodeJS.Timeout;

  public ready: boolean;

  /* GSH Supported types */
  types = {
    Door: new Door(),
    Fan: new Fan(),
    Fanv2: new Fanv2(),
    GarageDoorOpener: new GarageDoorOpener(),
    HeaterCooler: new HeaterCooler(this),
    HumiditySensor: new HumiditySensor(),
    Lightbulb: new Lightbulb(),
    LockMechanism: new LockMechanism(),
    Outlet: new Switch('action.devices.types.OUTLET'),
    SecuritySystem: new SecuritySystem(),
    Switch: new Switch('action.devices.types.SWITCH'),
    Television: new Television(),
    TemperatureSensor: new TemperatureSensor(this),
    Thermostat: new Thermostat(this),
    Window: new Window(),
    WindowCovering: new WindowCovering(),
  };

  /* event tracking */
  // evInstances: Instance[] = [];
  // evServices: ServiceType[] = [];
  reportStateSubject = new Subject();
  pendingStateReport = [];

  /* types of characteristics to track */
  evTypes = [
    Characteristic.Active,
    Characteristic.On,
    Characteristic.CurrentPosition,
    Characteristic.TargetPosition,
    Characteristic.CurrentDoorState,
    Characteristic.TargetDoorState,
    Characteristic.Brightness,
    Characteristic.HeatingThresholdTemperature,
    Characteristic.Hue,
    Characteristic.Saturation,
    Characteristic.LockCurrentState,
    Characteristic.LockTargetState,
    Characteristic.TargetHeatingCoolingState,
    Characteristic.TargetTemperature,
    Characteristic.CoolingThresholdTemperature,
    Characteristic.CurrentTemperature,
    Characteristic.CurrentRelativeHumidity,
    Characteristic.SecuritySystemTargetState,
    Characteristic.SecuritySystemCurrentState,
  ];

  instanceBlacklist: Array<string> = [];
  accessoryFilter: Array<string> = [];
  accessoryFilterInverse: boolean;
  accessorySerialFilter: Array<string> = [];
  // deviceNameMap: Array<{ replace: string; with: string }> = [];

  constructor(socket, log, pin: string, config: PluginConfig) {
    this.config = config;
    this.socket = socket;
    this.log = log;
    this.pin = pin;

    this.accessoryFilter = config.accessoryFilter || [];
    this.accessoryFilterInverse = config.accessoryFilterInverse || false;
    this.accessorySerialFilter = config.accessorySerialFilter || [];
    this.instanceBlacklist = config.instanceBlacklist || [];

    this.log.debug('Waiting 15 seconds before starting instance discovery...');
    this.startTimeout = setTimeout(() => {
      this.discover();
    }, 15000);

    this.reportStateSubject
      .pipe(
        map((i) => {
          if (!this.pendingStateReport.includes(i)) {
            this.pendingStateReport.push(i);
          }
        }),
        debounceTime(1000),
      )
      .subscribe((data) => {
        const pendingStateReport = this.pendingStateReport;
        this.pendingStateReport = [];
        this.processPendingStateReports(pendingStateReport);
      });
  }

  /**
   * Homebridge Instance Discovery
   */

  async discover() {
    this.hapClient = new HapClient({
      config: this.config,
      pin: this.pin,
      logger: this.log,
    });

    this.waitForNoMoreDiscoveries();
    this.hapClient.on('instance-discovered', this.waitForNoMoreDiscoveries);

    this.hapClient.on('hapEvent', (event) => {
      this.handleHapEvent(event);
    });
  }

  waitForNoMoreDiscoveries = () => {
    // Clear any existing timeout
    if (this.discoveryTimeout) {
      clearTimeout(this.discoveryTimeout);
    }

    // Set up the timeout
    this.discoveryTimeout = setTimeout(() => {
      this.log.debug('No more instances discovered, publishing services');
      this.hapClient.removeListener('instance-discovered', this.waitForNoMoreDiscoveries);
      this.start();
      this.requestSync();
      this.hapClient.on('instance-discovered', this.requestSync);  // Request sync on new instance discovery
    }, 5000);
  };

  /**
   * Start processing
   */
  async start() {
    this.services = await this.loadAccessories();
    this.log.info(`Discovered ${this.services.length} accessories`);
    this.ready = true;
    await this.buildSyncResponse();
    const evServices: ServiceType[] = this.services.filter(x => this.evTypes.some(uuid => x.serviceCharacteristics.find(c => c.uuid === uuid)));
    this.log.debug(`Monitoring ${evServices.length} services for changes`);

    const monitor = await this.hapClient.monitorCharacteristics(evServices);
    monitor.on('service-update', (services) => {
      this.reportStateSubject.next(services[0].uniqueId);
    });
  }

  /**
   * Build Google SYNC intent payload
   */
  async buildSyncResponse(): Promise<SmartHomeV1SyncDevices[]> {
    const devices = this.services.map((service) => {
      if (!this.types[service.type]) {
        // this.log.debug(`Unsupported service type ${service.type}`);
        return;
      }
      // console.log('buildSyncResponse', service);
      return this.types[service.type].sync(service);
    });
    return devices;
  }

  /**
   * Ask google to send a sync request
   */
  async requestSync() {
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout);
    }
    this.syncTimeout = setTimeout(() => {
      this.log.info('Sending Sync Request');
      this.socket.sendJson({
        type: 'request-sync',
      });
    }, 15000);
  }

  /**
   * Process the QUERY intent
   * @param devices
   */
  async query(devices) {
    // console.log('query', devices);
    const response = {};

    for (const device of devices) {
      const service = this.services.find(x => x.uniqueId === device.id);
      if (service) {
        await this.getStatus(service);
        response[device.id] = this.types[service.type].query(service);
      } else {
        response[device.id] = {};
      }
    }

    return response;
  }

  /**
   * Process the EXECUTE intent
   * @param commands
   */
  async execute(commands: SmartHomeV1ExecuteRequestCommands[]): Promise<SmartHomeV1ExecuteResponseCommands[]> {
    const response: SmartHomeV1ExecuteResponseCommands[] = [];

    for (const command of commands) {
      for (const device of command.devices) {
        const service = this.services.find(x => x.uniqueId === device.id);
        this.log.debug(`Processing command ${command.execution[0].command} for ${device.id} and ${service}`);
        if (service) {
          // check if two factor auth is required, and if we have it
          if (this.config.twoFactorAuthPin && this.types[service.type].twoFactorRequired
            && this.types[service.type].is2faRequired(command)
            && !(command.execution.length && command.execution[0].challenge
              && command.execution[0].challenge.pin === this.config.twoFactorAuthPin.toString()
            )
          ) {
            this.log.info('Requesting Two Factor Authentication Pin');
            response.push({
              ids: [device.id],
              status: 'ERROR',
              errorCode: 'challengeNeeded',
              challengeNeeded: {
                type: 'pinNeeded',
              },
            });
          } else {
            // process the request
            try {
              response.push(await this.types[service.type].execute(service, command));
            } catch (error) {
              this.log.error(`Error executing command: ${error.message}`);
              response.push({
                ids: [device.id],
                status: 'ERROR',
                debugString: error.message,
              });
            }
          }
        } else {
          this.log.error(`Device not found: ${device.id}`);
          response.push({
            ids: [device.id],
            status: 'OFFLINE',
            errorCode: 'deviceNotFound',
          });
        }
      }
    }
    return response;
  }

  /**
   * Request a status update from an accessory
   * @param service
   */
  async getStatus(service: ServiceType) {
    return await service.refreshCharacteristics();
  }

  /**
   * Load all the accessories from Homebridge
   */
  public async loadAccessories(): Promise<ServiceType[]> {
    return this.hapClient.getAllServices().then((services) => {

      const fs = require('fs');
      const storagePath = '/Users/sgracey/Desktop/homebridge-gsh-services.json';
      //  this.log.warn("Writing Alexa Discovery Response to", storagePath);
      fs.writeFileSync(storagePath, JSON.stringify(services, null, 2));

      services = services.filter(x => this.types[x.type] !== undefined);
      this.log.debug(`Loaded ${services.length} accessories from Homebridge - pre filter`);
      if (this.accessoryFilterInverse) {
        services = services.filter(x => this.accessoryFilter.includes(x.serviceName));
      } else {
        services = services.filter(x => !this.accessoryFilter.includes(x.serviceName));
      }
      services = services.filter(x => !this.accessorySerialFilter.includes(x.accessoryInformation['Serial Number']));
      // if 2fa is forced for this service type, but a pin has not been set ignore the service
      services = services.filter(x => {
        if (this.types[x.type].twoFactorRequired && !this.config.twoFactorAuthPin && !this.config.disablePinCodeRequirement) {
          this.log.warn(`Not registering ${x.serviceName} - Pin code has not been set and is required for secure ` +
            `${x.type} accessory types. See https://git.io/JUQWX`);
          return false;
        } else {
          return true;
        }
      });

      services = services.map(service => {
        return {
          ...service,
          uniqueId: createHash('sha256')
            .update(`${service.instance.username}${service.aid}${service.iid}${service.uuid}`)
            .digest('hex'),
        };
      });      // The embeded uniqueId formula is different with Hap Client
      this.log.debug(`Returned ${services.length} accessories from Homebridge - post filter`);
      return services;
    }).catch((e) => {
      if (e.response?.status === 401) {
        this.log.warn('Homebridge must be running in insecure mode to view and control accessories from this plugin.');
      } else {
        this.log.error(`Failed load accessories from Homebridge: ${e.message}`);
      }
      return [];
    });
  }

  /**
   * Handle events from HAP
   * @param event
   */
  async handleHapEvent(events) {
    for (const event of events) {
      const index = this.services.findIndex(item => item.uniqueId === event.uniqueId);
      if (index === -1) {
        this.log.debug(`[handleHapEvent] Service not found in services list ${event}`);
        return;
      } else {
        this.services[index] = event;
        this.reportStateSubject.next(event.uniqueId);
      }
    }
  }

  /**
   * Generate a state report from the list pending
   * @param pendingStateReport
   */
  async processPendingStateReports(pendingStateReport) {
    const states = {};

    for (const uniqueId of pendingStateReport) {
      const service = this.services.find(x => x.uniqueId === uniqueId);
      states[service.uniqueId] = this.types[service.type].query(service);
    }

    return await this.sendStateReport(states);
  }

  async sendFullStateReport() {
    const states = {};

    // don't report state if there are no services
    if (!this.services.length) {
      return;
    }
    this.services.map((service) => {
      if (!this.types[service.type]) {
        return;
      }
      return states[service.uniqueId] = this.types[service.type].query(service);
    });
    return await this.sendStateReport(states);
  }

  /**
   * Send the state report back to Google
   * @param states
   * @param requestId
   */
  async sendStateReport(states, requestId?) {
    const payload = {
      requestId,
      type: 'report-state',
      body: states,
    };
    this.log.debug('Sending State Report');
    this.log.debug(JSON.stringify(payload, null, 2));
    this.socket.sendJson(payload);
  }

  /**
   * Close the HAP connection, used for testing
   */
  public async destroy() {
    // console.log('destroy');
    if (this.startTimeout) {
      clearTimeout(this.startTimeout);
    }
    if (this.discoveryTimeout) {
      clearTimeout(this.discoveryTimeout);
    }
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout);
    }
    if (this.hapClient) {
      this.hapClient.destroy();
    }
  }
}
