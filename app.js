'use strict';

const button = document.querySelector("button");
const SERVICEUUID = '8c850001-0302-41c5-b46e-cf057c562025';// "00001801-0000-1000-8000-00805f9b34fb";
const NOTIFYCHARACTERISTICUUID = '8c850003-0302-41c5-b46e-cf057c562025';
const WRITECHARACTERISTICUUID = '8c850002-0302-41c5-b46e-cf057c562025';


/**
 * 
 * 4A - Battery percentage 8bit
 * 63 - AC Output Power ?? 16bit
 * 1D - Remaining Time 8bit
 * 22 - AC INPUT POWER ?? 16bit
 * 4F - DC INPUT POWER ?? 16bit
 * 6D - INTERNAL TEMPERATURE
 * 33 length - 13 = Car Port on/off
* 33 length - 0f = AC on/off
* 33 length - 1f = screen on/off
 */

//const DCONCOMMAND = [0x01, 0x06, 0x0b, 0xc0, 0x00, 0x01, 0x4a, 0x12];
//const DCOFFCOMMAND = [0x01, 0x06, 0x0b, 0xc0, 0x00, 0x00, 0x8b, 0xd2];
//const ACONCOMMAND = [0106 0BBF 0001 7BCA];
//const ACOFFCOMMAND = [0106 0BBF 0000 BA0A];

let options = {
	acceptAllDevices: true,
	optionalServices: [SERVICEUUID],
};

/**
 * Sends a command to the writeCharacteristic.
 *
 * @param {Object} writeCharacteristic - The writeCharacteristic to send the command to.
 * @param {Array} command - The command to be sent as a Uint8Array.
 * @return {Promise} A promise that resolves when the command is sent successfully or rejects with an error.
 */
const sendCommand = async (writeCharacteristic, command) => {
	try {
		await writeCharacteristic
			.writeValueWithoutResponse(new Uint8Array(command))
			.catch((error) => {
				console.error("Error when writing value", error);
				return Promise.resolve()
					.then(() => sleep(5000))
					.then(() => sendCommand(writeCharacteristic, command));
			});
	} catch (error) {
		console.error("Error when sending command", error);
	}
};


let bluetoothDevice;

/**
 * Executes a function with exponential backoff.
 *
 * @param {number} max - The maximum number of retries.
 * @param {number} delay - The initial delay in seconds.
 * @param {function} toTry - The function to execute.
 * @param {function} success - The success callback.
 * @param {function} fail - The failure callback.
 * @return {void} 
 */
const exponentialBackoff = (max, delay, toTry, success, fail) => {
	toTry()
		.then((result) => success(result))
		.catch((_) => {
			if (max === 0) {
				return fail();
			}
			time("Retrying in " + delay + "s... (" + max + " tries left)");
			setTimeout(function() {
				exponentialBackoff(--max, delay * 2, toTry, success, fail);
			}, delay * 1000);
		});
};

const getViewData = (data, address) => {
	return (data.getUint16(address, false) >> 8) & 0xff;
}


class DeviceField {
	constructor(name, address, size) {
		this.name = name;
		this.address = address;
		this.size = size;
	}

	inRange(value) {
		return true;
	}
}

class SerialNumberField extends DeviceField {
	constructor(name, start, end) {
		super(name, 1, 1);
		this.start = start;
		this.end = end;
	}

	parse(data) {
		let sn = '';
		for (let i = this.start; i < this.end; i++) {
			sn += String.fromCharCode(getViewData(data, i));
		}
		return sn;
	}
}

class DecimalField extends DeviceField {
	constructor(name, address, scale) {
		super(name, address, 1);
		this.scale = scale;
	}

	parse(data) {
		const result = getViewData(data, this.address);
		return result / Math.pow(10, this.scale);
	}
}

class UintField extends DeviceField {
	constructor(name, address) {
		super(name, address, 1);
	}

	parse(data) {
		return getViewData(data, this.address);
	}
}

class BoolField extends DecimalField {
	constructor(name, address) {
		super(name, address);
	}

	parse(data) {
		return getViewData(data, this.address) === 1;
	}
}

class PowerField extends DeviceField {
	constructor(name, address) {
		super(name, address);
	}
	
	parse(data) {
		return data.getUint16(this.address, true)
	}
}


const fields = [
	new UintField('battery', 0x4A),
	new PowerField('ac_output_power', 0x63),
	new DecimalField('time_remaining', 29, 1),
	new PowerField('ac_input_power', 0x22),
	new PowerField('total_dc_input_power', 0x4F),
	new UintField('internal_temperature', 0x6D),
	new SerialNumberField('serial_number', 214, 230),
	new BoolField('car_socket_state', 194),
	new PowerField('total_input_power', 94),
	new PowerField('dc_input_1', 89),
	new PowerField('dc_input_2', 84),
	new BoolField('ac_output_state', 149),
	new BoolField('discharging', 162),
]

const previousReponse = [];
const previousReponse33 = [];
let result = {};
function parseResponse(response) {
	console.log(response);
	if (response instanceof ArrayBuffer) {
		let view = new DataView(response);
		
		if (view.getUint8(view.byteLength - 1) !== 219) {
			return;
		}

		if (previousReponse.length > 0) {
			for (let j = 0; j < view.byteLength - 1; j++) {
				if (previousReponse[j] != view.getUint16(j, true)) {
					console.log('Response: Index - ' + j + ' Old Data - ' + previousReponse[j] + ' New Data - ' + view.getUint16(j, true));
				}
			}
		}

		for (const f of fields) {
			const value = f.parse(view);

			if (!f.inRange(value)) {
				continue;
			}

			targetProxy[f.name] = value; // + this.unit;
			parsed[f.name] = value;
			window.eventEmitter.emit("update", targetProxy.target);
		}

		for (let i = 0; i < view.byteLength - 1; i++) {
			previousReponse[i] = view.getUint16(i, true);
		}
	} else {
		if (previousReponse33.length > 0) {
			for (let j = 0; j < response.byteLength - 1; j++) {
				if (previousReponse33[j] != response.getUint8(j, true)) {
					result = { ...result, SCREEN_STATE: response.getUint8(31, true) }
					console.log('33 Response: Index - ' + j + ' Old Data - ' + previousReponse33[j] + ' New Data - ' + response.getUint8(j, true));
				}
			}
		}

		for (let i = 0; i < response.byteLength - 1; i++) {
			previousReponse33[i] = response.getUint8(i, true);
		}
	}
}

/**
 * Connects to a Bluetooth device using exponential backoff for retries.
 *
 * @param {number} maxRetries - The maximum number of retries.
 * @param {number} delay - The delay in seconds between retries.
 * @param {function} toTry - The function to try connecting to the Bluetooth device.
 * @param {function} success - The function to run if the connection is successful.
 * @param {function} fail - The function to run if the connection fails.
 */
function connect() {
	exponentialBackoff(
		3 /* max retries */,
		2 /* seconds delay */,
		function toTry() {
			time("Connecting to Bluetooth Device... ");
			if (bluetoothDevice.gatt.connected) {
				return bluetoothDevice.gatt;
			}
			return bluetoothDevice.gatt.connect();
		},
		async function success(server) {
			log("> Bluetooth Device connected. Try disconnect it now.");
			log(`> Server connected: ${server}`);
			const service = await server
				.getPrimaryService(SERVICEUUID)
				.catch((error) => {
					console.error("Error when getting service", error);
				});
			log(`> Service discovered: ${service}`);
			const characteristic = await service.getCharacteristic(
				NOTIFYCHARACTERISTICUUID
			);
			log(`Characteristic discovered: ${characteristic}`);

			await characteristic.startNotifications();
			log(`Notifications started on: ${characteristic.uuid}`);

			const writeCharacteristic = await service.getCharacteristic(
				WRITECHARACTERISTICUUID
			);

			const maxLength = 272;
			let fullResponse = new ArrayBuffer();
			characteristic.addEventListener(
				"characteristicvaluechanged",
				async function onCharacteristicValueChanged(event) {
					/*characteristic.removeEventListener(
					  "characteristicvaluechanged",
					  onCharacteristicValueChanged,
					  false
					);*/
					const response = event.target.value;

					if (response.byteLength == 33) {
						parseResponse(response);
						return;
					}

					if (response.byteLength == 248 || response.byteLength == 24) {
						fullResponse = appendArrayBuffer(fullResponse, event.target.value.buffer);
					}

					if (fullResponse.byteLength >= maxLength) {
						parseResponse(fullResponse);
						fullResponse = new ArrayBuffer();
					}

					//await characteristic.stopNotifications();
					//await sleep(1000);
					//await characteristic.startNotifications();
					//promise.resolve(event.target.value);
				}
			);
		},
		function fail() {
			time("Failed to reconnect.");
		}
	);
}

function formatAMPM(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var seconds = date.getSeconds();
  var ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? "0" + minutes : minutes;
  seconds = seconds < 10 ? "0" + seconds : seconds;
  var strTime = hours + ":" + minutes + ":" + seconds + " " + ampm;
  return strTime;
}

const updateCharts = (data) => {
	const timeNow = new Date();
	const timeStr =
		timeNow.getHours() + ":" + timeNow.getMinutes() + ":" + timeNow.getSeconds();

	acOutputChart.data.datasets[0].data.push(data.ac_output_power);
	acOutputChart.data.labels.push(formatAMPM(timeNow));
	acOutputChart.update();

	solarInputChart.data.datasets[0].data.push(data.total_dc_input_power);
	solarInputChart.data.labels.push(formatAMPM(timeNow));
	solarInputChart.update();

	batteryChart.data.datasets[0].data.push(data.battery);
	batteryChart.data.labels.push(formatAMPM(timeNow));
	batteryChart.update();
}

/**
 * Listen for income data.
 */
window.eventEmitter.on("update", async (data) => {
	if (undefined === data) {
		return;
	}

	updateCharts(data);
	document.querySelector('#details').innerHTML = syntaxHighlight(data);
});



/**
 * Handles the event when a device is disconnected.
 *
 * @param {Object} event - The event object containing information about the disconnection.
 * @return {Promise} A Promise that resolves once the device is reconnected.
 */
const onDisconnected = async (event) => {
	const device = event.target;
	console.log(`Device ${device.name} is disconnected.`);
	connect();
};

button.addEventListener("click", async () => {
	try {
		bluetoothDevice = await navigator.bluetooth.requestDevice(options);
		console.log("Device discovered", bluetoothDevice);
		bluetoothDevice.addEventListener("gattserverdisconnected", onDisconnected);


		log(`> Device: ${bluetoothDevice.name}`);

		connect();
	} catch (error) {
		console.error("Something went wrong", error);
	}
});