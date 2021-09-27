const fs = require('fs');

const PATH_TO_INPUT_FILE = process.argv[2];
const PATH_TO_RESULT_FILE = process.argv[3] || `${PATH_TO_INPUT_FILE}.json`;

const data = fs.readFileSync(PATH_TO_INPUT_FILE, 'utf-8').replace(/\n|INSERT INTO`([^`].)+`/g, '');

let leftSeek = data.indexOf('(');
let rightSeek = data.indexOf(')', leftSeek);
const keys = data
  .substring(leftSeek + 1, rightSeek)
  .replace(/`|\n|\s+/g, '')
  .split(',');
const records = [];

while (true) {
  leftSeek = data.indexOf('(', rightSeek);
  rightSeek = data.indexOf(')', leftSeek);
  if (!(leftSeek >= 0 && rightSeek >= 0)) {
    break;
  }

  const tmp = data.substring(leftSeek + 1, rightSeek).trim();
  const record = {};

  let value = '';
  let isStringValue = false;
  let seek = -1;
  let keySeek = 0;
  while (++seek < tmp.length) {
    const char = tmp[seek];

    let isEdgeString = char === '"' && (seek < 1 || tmp[seek - 1] !== '\\');
    if (isEdgeString) {
      if (isStringValue) {
        record[`[${keySeek}]:${keys[keySeek++]}`] = value;
        value = '';
      }

      isStringValue = !isStringValue;
      continue;
    }

    if (isStringValue) {
      value += char;
      continue;
    }

    if (!isEmptyChar(char)) {
      if (char !== ',') {
        value += char;
      }

      if (char === ',' || seek === tmp.length - 1) {
        if (!value) {
          continue;
        }

        record[`[${keySeek}]:${keys[keySeek++]}`] = value;
        value = '';
      }
    }
  }

  warningIf(
    keySeek !== keys.length,
    `[row #${records.length}]: values count(${keySeek}) not equal Header count(${keys.length})`
  );

  records.push(record);
}

fs.writeFileSync(PATH_TO_RESULT_FILE, JSON.stringify(records, null, 2));

function isEmptyChar(char) {
  return [' ', '\n'].includes(char);
}

function warningIf(condition, text) {
  if (condition) {
    console.warn(text);
  }
}
