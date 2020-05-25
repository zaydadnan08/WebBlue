var bluetoothDevice;
var batteryLevelCharacteristic;

let stringOut = "";


function onReadBatteryLevelButtonClick() {
  return (bluetoothDevice ? Promise.resolve() : requestDevice())
  .then(connectDeviceAndCacheCharacteristics)
 // .then(_ => {
 //   log('Reading Battery Level...');
 //   return batteryLevelCharacteristic.readValue();
 // })
  .catch(error => {
    log('Argh! ' + error);
  });
}

function requestDevice() {
  log('Requesting any Bluetooth Device...');
  return navigator.bluetooth.requestDevice({
   // filters: [...] <- Prefer filters to save energy & show relevant devices.
      acceptAllDevices: true,
      optionalServices: ['battery_service']})
  .then(device => {
    bluetoothDevice = device;
    bluetoothDevice.addEventListener('gattserverdisconnected', onDisconnected);
  });
}

function connectDeviceAndCacheCharacteristics() {
  if (bluetoothDevice.gatt.connected && batteryLevelCharacteristic) {
    return Promise.resolve();
  }

  log('Connecting to GATT Server...');
  return bluetoothDevice.gatt.connect()
  .then(server => {
    log('Getting Service...');
    return server.getPrimaryService('battery_service');
  })
  .then(service => {
    log('Getting Characteristic...');
    return service.getCharacteristic('battery_level');
  })
  .then(characteristic => {
    batteryLevelCharacteristic = characteristic;
    batteryLevelCharacteristic.addEventListener('characteristicvaluechanged',
       handleBatteryLevelChanged);
    document.querySelector('#startNotifications').disabled = false;
    document.querySelector('#stopNotifications').disabled = true;
  });
}

/* This function will be called when `readValue` resolves and
 * characteristic value changes since `characteristicvaluechanged` event
 * listener has been added. */
function handleBatteryLevelChanged(event) {
  let batteryLevel = event.target.value.getUint8(0);
    stringOut += (String.fromCharCode(batteryLevel));
}

function onStartNotificationsButtonClick() {
  log('Starting Notifications...');
  batteryLevelCharacteristic.startNotifications()
  .then(_ => {
    log('> Notifications started');
    document.querySelector('#startNotifications').disabled = true;
    document.querySelector('#stopNotifications').disabled = false;
  })
  .catch(error => {
    log('Argh! ' + error);
  });
}

function onStopNotificationsButtonClick() {
  log('Stopping Notifications...');
  batteryLevelCharacteristic.stopNotifications()
  .then(_ => {
    log('> Notifications stopped');
    document.querySelector('#startNotifications').disabled = false;
    document.querySelector('#stopNotifications').disabled = true;
  })
  .catch(error => {
    log('Argh! ' + error);
  });
}

function onResetButtonClick() {
  if (batteryLevelCharacteristic) {
    batteryLevelCharacteristic.removeEventListener('characteristicvaluechanged',
        handleBatteryLevelChanged);
    batteryLevelCharacteristic = null;
  }
  // Note that it doesn't disconnect device.
  bluetoothDevice = null;
  log('> Bluetooth Device reset');
}

function onDisconnected() {
  log('> Bluetooth Device disconnected');
  connectDeviceAndCacheCharacteristics()
  .catch(error => {
    log('Argh! ' + error);
  });
  }


  function onImageButtonClick() {
    var driverImg= document.getElementById('driverl');
    log(stringOut);
    driverImg.src = stringOut; 
    stringOut = ""; 
  }
