import { Characteristic } from '../hap-types';
import { HapService, AccessoryTypeExecuteResponse } from '../interfaces';

export class GarageDoorOpener {
  sync(service: HapService) {
    return {
      id: service.uniqueId,
      type: 'action.devices.types.GARAGE',
      traits: [
        'action.devices.traits.OpenClose',
      ],
      name: {
        defaultNames: [
          service.serviceName,
          service.accessoryInformation.Name,
        ],
        name: service.serviceName,
        nicknames: [],
      },
      willReportState: true,
      attributes: {
        openDirection: ['UP', 'DOWN'],
      },
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

  query(service: HapService) {
    /**
     * GSH impliments garrage door as an open percentage, while HomeKit impliments it as open/closed/opening/closing
     * To work around this we just set the values to something that works.
     */
    const currentDoorState = service.characteristics.find(x => x.type === Characteristic.CurrentDoorState).value;
    // open, closed, opening, closing, stopped
    const openPercent = [100, 0, 50, 50, 50, 50][currentDoorState];

    return {
      on: true,
      online: true,
      openPercent,
    } as any;
  }

  execute(service: HapService, command): AccessoryTypeExecuteResponse {
    if (!command.execution.length) {
      return { payload: { characteristics: [] } };
    }

    switch (command.execution[0].command) {
      case ('action.devices.commands.OpenClose'): {
        const payload = {
          characteristics: [{
            aid: service.aid,
            iid: service.characteristics.find(x => x.type === Characteristic.TargetDoorState).iid,
            value: command.execution[0].params.openPercent ? 0 : 1,
          }],
        };
        return { payload };
      }
    }
  }

}