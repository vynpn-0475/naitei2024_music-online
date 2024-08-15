$('#image').on('change', function (event) {
  var input = event.target;
  var file = input.files[0];
  var reader = new FileReader();

  reader.onload = function (e) {
    var $img = $('#current-image');
    if ($img.length) {
      $img.attr('src', e.target.result);
    } else {
      $img = $('<img>', {
        id: 'current-image',
        alt: t('songs.message.currentAvatar'),
        width: 100,
        src: e.target.result,
      });
      $img.insertAfter($(input).next());
    }
  };
  if (file) {
    reader.readAsDataURL(file);
  }
});
