const Buffer = require('buffer').Buffer;

class hapToAlexa {
  discoveryTemplate(service) {
    // console.log('hapToAlexa discovery service:', service);


    // Expected - "MUM6MjI6M0Q6RTM6Q0Y6MzQtaG9tZWJyaWRnZS1UYXNtb3RhLVdlc3QgQmVkcm9vbS0wMDAwMDA0My0wMDAwLTEwMDAtODAwMC0wMDI2QkI3NjUyOTE=",
    // 1C:22:3D:E3:CF:34-homebridge-Tasmota-West Bedroom-00000043-0000-1000-8000-0026BB765291

    // Received - MUM6MjI6M0Q6RTM6Q0Y6MzQtaG9tZWJyaWRnZS1UYXNtb3RhLQogICAgV2VzdCBCZWRyb29tLUxpZ2h0YnVsYg==
    // 1C:22:3D:E3:CF:34-homebridge-Tasmota-West Bedroom-Lightbulb

    const endpointReg = /[^\w|_|-|=|#|;|:|?|@|&]/g; // Invalid characters in endpointid
    const endpointID = Buffer.from(`${service.instance.username}-${service.instance.name}-${service.accessoryInformation.Manufacturer}-${service.serviceName}-${service.uuid}`).toString('base64').replace(endpointReg, '#');

    // console.log('hapToAlexa discovery endpointID:', endpointID);
    return {
      endpointId: endpointID,
      friendlyName: service.serviceName,
      description: `${service.instance.name} ${service.serviceName} ${service.humanType}`,
      manufacturerName: service.accessoryInformation.Manufacturer,
      displayCategories: ['LIGHT'],
    }
  }

  createSyncData(service, typeTraits) {
    return {
      id: service.uniqueId,
      ...typeTraits,
      name: {
        defaultNames: [
          ...(service.serviceName ? [service.serviceName] : []),
          ...(service.accessoryInformation.Name ? [service.accessoryInformation.Name] : []),
        ],
        name: service.serviceName || service.accessoryInformation.Name || 'Missing Name',
        nicknames: [],
      },
      willReportState: true,
      deviceInfo: {
        manufacturer: service.accessoryInformation.Manufacturer,
        model: service.accessoryInformation.Model,
      },
      customData: {
        aid: service.aid,
        iid: service.iid,
        instanceUsername: service.instance.username,
        instanceIpAddress: service.instance.ipAddress,
        instancePort: service.instance.port,
      },
    };
  }
}

module.exports = {
  hapToAlexa
}