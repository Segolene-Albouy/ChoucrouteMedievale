// Create a random between min an max function
function floorRandomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}
