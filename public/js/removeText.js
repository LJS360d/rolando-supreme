function removeText(text, index) {
  fetch(`/data?text=${text}`, {
    method: 'DELETE'
  }).then((response) => {
    if (response.status == 204) {
      document.getElementById(`media-${index}`)
        .remove();
      showSnackbar("Removed text from training storage!", "alert-success")
      return;
    }
    showSnackbar("You are not authorized to perform this action!", "alert-error")
  })
}