const fs = require('fs');

const args = process.argv.slice(2);
if (args[0]) {
  const input = args[0];
  const content = fs.readFileSync(input, { encoding: 'base64' });

  fs.writeFileSync(input + '.base64', content, { encoding: 'utf8', flag: 'w' });
}