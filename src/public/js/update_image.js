document.getElementById('image').addEventListener('change', function(event) {
  var input = event.target;
  var file = input.files[0];
  var reader = new FileReader();
  
  reader.onload = function(e) {
    var img = document.getElementById('current-image');
    if (img) {
      img.src = e.target.result;
    } else {
      img = document.createElement('img');
      img.id = 'current-image';
      img.alt = t('songs.message.currentAvatar');
      img.width = 100;
      img.src = e.target.result;
      document.querySelector('.form-group').insertBefore(img, input.nextSibling);
    }
  }
  
  if (file) {
    reader.readAsDataURL(file);
  }
});
