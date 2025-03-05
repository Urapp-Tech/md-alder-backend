async function promiseHandler(promise, onfinally) {
  return promise
    .then((result) => [undefined, result])
    .catch((error) => [error, undefined])
    .finally(onfinally);
}

export default promiseHandler;
