function checkOpeningHours() {
  const now = new Date();
  const mskOffset = 3 * 60 * 60 * 1000; 
  const mskNow = new Date(now.getTime() + mskOffset); 

  const today = new Date(mskNow);
  today.setHours(0, 0, 0, 0); 

  const startRestricted = new Date(today);
  startRestricted.setHours(22, 45, 0, 0); 
  
  const endRestricted = new Date(today);
  endRestricted.setDate(endRestricted.getDate() + 1); 
  endRestricted.setHours(10, 0, 0, 0);
  
  const isRestricted = (mskNow >= startRestricted) && (mskNow < endRestricted);
  
  return !isRestricted;
}

module.exports = checkOpeningHours