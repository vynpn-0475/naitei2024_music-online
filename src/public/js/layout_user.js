$(document).ready(function () {
  $('.like-button').on('click', function () {
    var $icon = $(this).find('i');
    var isLiked = $(this).attr('data-liked') === 'true';
    var songId = $(this).data('song-id');
    var errorAlert = $('#errorAlert');
    var successAlert = $('#successAlert');
    if (isLiked) {
      fetch('/user/liked-songs', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ songId: songId }),
      })
        .then((response) => response.json())
        .then((data) => {
          $(this).attr('data-liked', 'false');
          $icon.removeClass('fas').addClass('far');
          successAlert.text(data.message);
          successAlert.removeClass('d-none').addClass('d-flex');
          setTimeout(() => {
            successAlert.removeClass('d-flex').addClass('d-none');
            location.reload();
          }, 3000);
        })
        .catch((error) => {
          console.error('Error removing song from Liked Song:', error);
          errorAlert.text(data.message);
          errorAlert.removeClass('d-none').addClass('d-flex');
          setTimeout(() => {
            errorAlert.removeClass('d-flex').addClass('d-none');
          }, 3000);
        });
    } else {
      fetch('/user/liked-songs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ songId: songId }),
      })
        .then((response) => response.json())
        .then((data) => {
          $(this).attr('data-liked', 'true');
          $icon.removeClass('far').addClass('fas');
          successAlert.text(data.message);
          successAlert.removeClass('d-none').addClass('d-flex');
          setTimeout(() => {
            successAlert.removeClass('d-flex').addClass('d-none');
          }, 3000);
        })
        .catch((error) => {
          console.error('Error adding song to Liked Song:', error);
          errorAlert.text(data.message);
          errorAlert.removeClass('d-none').addClass('d-flex');
          setTimeout(() => {
            errorAlert.removeClass('d-flex').addClass('d-none');
          }, 3000);
        });
    }
  });
});
