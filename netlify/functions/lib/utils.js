export function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}