function syntaxHighlight(json) {
  if (typeof json != "string") {
    json = JSON.stringify(json, undefined, 2);
  }
  json = json
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    function (match) {
      var cls = "number";
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = "key";
        } else {
          cls = "string";
        }
      } else if (/true|false/.test(match)) {
        cls = "boolean";
      } else if (/null/.test(match)) {
        cls = "null";
      }
      return '<span class="' + cls + '">' + match + "</span>";
    }
  );
}

function crc16(data) {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i];
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x0001) !== 0) {
        crc >>= 1;
        crc ^= 0xa001;
      } else {
        crc >>= 1;
      }
    }
  }
  return crc;
}

function crc16Buffer(data) {
    const crc = crc16(data);
    const buffer = Buffer.alloc(2);
    buffer.writeUInt16LE(crc, 0);
    return buffer;
}

function crc16String(data) {
    const crc = crc16(data);
    return crc.toString(16);
}

function crc16HexString(data) {
    const crc = crc16(data);
    return crc.toString(16).padStart(4, "0");
}

const sleep = async (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};


/**
 * Converts a DataView to an array.
 *
 * @param {DataView} dataView - The DataView to be converted.
 * @return {Array<number>} The converted array.
 */
function dataViewToArray(dataView) {
  let array = [];
  for (let i = 0; i < dataView.byteLength; i++) {
    array.push(dataView.getUint8(i));
  }
  return array;
}

/**
 * Creates an array of numbers in the specified range.
 *
 * @param {number} start - the start of the range
 * @param {number} end - the end of the range
 * @return {array} the array of numbers in the specified range
 */
function range(start, end) {
  return Array.from({ length: end - start }, (_, i) => i + start);
}

window.parsed = {};
window.targetProxy = new Proxy(parsed, {
  set: function (target, key, value) {
    if (typeof value === "string" && "undefined" != value.substring(0, 9)) {
      target[key] = value;
      console.log(target);
      window.eventEmitter.emit("update", target);
    }
    return true;
  },
});

Promise.timeout = function (promise, timeoutInMilliseconds) {
  return Promise.race([
    promise,
    new Promise(function (_, reject) {
      setTimeout(function () {
        reject("timeout");
      }, timeoutInMilliseconds);
    }),
  ]);
};

/**
 * Logs a message to the console.
 *
 * @param {string} message - The message to be logged.
 * @return {undefined} This function does not return a value.
 */
const log = (message) => {
  console.log(message);
};

/**
 * Logs the given text along with the current time in the format "[HH:mm:ss] text".
 *
 * @param {string} text - The text to be logged.
 */
const time = (text) => {
  const currentTime = new Date().toLocaleTimeString('en-US', {hour12: false});
  log(`[${currentTime}] ${text}`);
};

function hex2a(hex) {
    var str = '';
    for (var i = 0; i < hex.length; i += 2) {
        var v = parseInt(hex.substr(i, 2), 16);
        if (v) str += String.fromCharCode(v);
    }
    return str;
}

/**
 * Append an ArrayBuffer to an existing ArrayBuffer.
 * 
 * @param {ArrayBuffer} existingBuffer - The existing ArrayBuffer.
 * @param {ArrayBuffer} newBuffer - The new ArrayBuffer to be appended.
 * @return {ArrayBuffer} The combined ArrayBuffer.
 */
function appendArrayBuffer(existingBuffer, newBuffer) {
    // Calculate the total length of both buffers
    let totalLength = existingBuffer.byteLength + newBuffer.byteLength;

    // Create a new buffer of the total length
    let result = new Uint8Array(totalLength);

    // Copy the existing buffer to the result buffer
    result.set(new Uint8Array(existingBuffer), 0);

    // Copy the new buffer to the result buffer, offset by the length of the existing buffer
    result.set(new Uint8Array(newBuffer), existingBuffer.byteLength);

    // Return the result buffer
    return result.buffer;
}

function parseHexString(hexString) {
    const result = [];
    while (hexString.length >= 2) {
        result.push(parseInt(hexString.substring(0, 2), 16));
        hexString = hexString.substring(2, hexString.length);
    }
    return result;
}

function createHexString(byteArray) {
    let result = "";
    for (const value of byteArray) {
        let str = value.toString(16);
        str = str.length === 0 ? "00" : str.length === 1 ? "0" + str : str.length === 2 ? str : str.substring(str.length - 2, str.length);
        result += str;
    }
    return result;
}

