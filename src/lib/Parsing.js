function parseBoolean(value) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const str = String(value).trim().toLowerCase();

  if (str === 'true' || str === '1' || str === 'on' || str === 'yes') {
    return true;
  }
  if (str === 'false' || str === '0' || str === 'off' || str === 'no') {
    return false;
  }

  throw new Error(`Invalid boolean value: "${value}". Use true/false or 1/0`);
}
module.exports = parseBoolean