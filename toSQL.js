const fs = require('fs');
const path = require('path');

const TABLE_NAME = process.argv[2];
const PATH_TO_INPUT_FILE = process.argv[3];
const PATH_TO_RESULT_FILE = process.argv[4] || `${PATH_TO_INPUT_FILE}.sql`;

const jsonData = require(path.resolve(__dirname, PATH_TO_INPUT_FILE));
const keys = Object.keys(jsonData[0]);

let i = 0;
for (const key of keys) {
  if (!jsonData[0]) {
    console.log(i++, key, jsonData[0][key]);
  }
  if (!jsonData[1]) {
    console.log(i++, key, jsonData[1][key]);
  }
  i++;
}

let resultSQL = `INSERT INTO \`${TABLE_NAME}\`(\`${keys.join('`,`')}\`) VALUES ${jsonData
  .map(
    (values) =>
      '(' +
      Object.values(values)
        .map((v) =>
          typeof v !== 'string'
            ? v
            : v === 'NULL'
            ? 'NULL'
            : '"' + v.replace(/\\\\/g, '\\').replace(/"/g, '\\"') + '"'
        )
        .join(',') +
      ')'
  )
  .join(',')}`;

fs.writeFileSync(PATH_TO_RESULT_FILE, resultSQL);
