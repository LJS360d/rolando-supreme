async function pruneMedia() {
  let deletionCounter = 0;
  const containers = document.querySelectorAll('.media-container');
  const fetchPromises = [];
  for (const container of containers) {
    const url = container.getElementsByClassName('media')[0].getAttribute('src');
    const fetchPromise = fetch(url, { method: 'HEAD' })
      .then((res) => {
        if (res.status < 400) return;
        container.remove();
        return removeMedia(url, deletionCounter);
      })
      .catch(() => {
        // Ignore Cors/Corb errors
      });

    fetchPromises.push(fetchPromise);

  };
  Promise.all(fetchPromises)
    .then(() => {
      showSnackbar(`Removed ${deletionCounter} unresponsive media`, "alert-success");
    })
    .catch(() => {
      showSnackbar(`Removed ${deletionCounter} unresponsive media`, "alert-error");
    })
}

async function removeMedia(text, counter) {
  return fetch(`/data?text=${text}`, {
    method: 'DELETE'
  }).then((delRes) => {
    if (delRes.status == 204) {
      counter++;
    }
  });
}
