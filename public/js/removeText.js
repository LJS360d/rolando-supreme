function removeText(text, index, lang) {
  fetch(`/data/${lang}?text=${text}`, {
    method: 'DELETE'
  })
    .then((response) => {
      if (response.status == 204) {
        document.getElementById(`media-${index}`)
          .remove();
        showSnackbar("Removed text from training storage!", "alert-success")
        return;
      }
      showSnackbar("You are not authorized to perform this action!", "alert-error")
    })
    .catch((error) => {
      showSnackbar(`Something went wrong! ${JSON.stringify(error)}`, "alert-error")
    })
}