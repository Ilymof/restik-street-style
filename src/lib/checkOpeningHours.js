const db = require('../db')
const config = db('config')


let cached = null;
let cachedAt = 0;

// Вспомогательная функция: "10:00:00" → 600 минут
function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

async function checkOpeningHours() {
  const now = Date.now();

  if (cached !== null && now - cachedAt < 5 * 60 * 1000) {
    return cached;
  }

  try {
    const nowInMoscow = new Date().toLocaleString("en-US", {
    timeZone: "Europe/Moscow",
    hour12: false,
    hour: "2-digit",
    minute: "2-digit"
  });

  const [hours, minutes] = nowInMoscow.split(":").map(Number);
  const currentMinutes = hours * 60 + minutes;
    

    const res = await config.query('SELECT opens_at, closes_at FROM config WHERE id = 1');

    if (res.rows.length === 0) {
      cached = false;
      cachedAt = now;
      return false;
    }

    const formatTime = (t) => {
      const str = t.toString().trim();
      const parts = str.split(':');
      const h = parts[0].padStart(2, '0');
      const m = parts[1].padStart(2, '0');
      return `${h}:${m}`;
    };

    const opensStr  = formatTime(res.rows[0].opens_at);   
    const closesStr = formatTime(res.rows[0].closes_at);

    const openMin  = timeToMinutes(opensStr);
    const closeMin = timeToMinutes(closesStr);
    console.log(openMin + "and" + closeMin);
    

    let isOpen;
    if (closeMin <= openMin) {
      isOpen = currentMinutes >= openMin || currentMinutes < closeMin;
    } else {
      isOpen = currentMinutes >= openMin && currentMinutes < closeMin;
    }

    cached = isOpen;
    cachedAt = now;
    console.log(isOpen);
    
    return isOpen;

  } catch (err) {
    console.error('checkOpeningHours error:', err);
    return false;
  }
}

function invalidateOpeningHoursCache() {
  cached = null;
  cachedAt = 0;
  console.log('кэш очищен');
  
}

module.exports = {checkOpeningHours, invalidateOpeningHoursCache}
