$(document).ready(function () {
  const form = $('#guessSearchForm');
  const buttons = $('.btn-group button');

  function setButtonState($activeButton) {
    buttons.each(function () {
      if ($(this).is($activeButton)) {
        $(this).addClass('btn-primary');
      } else {
        $(this).removeClass('btn-primary');
      }
    });
  }

  buttons.on('click', function (event) {
    event.preventDefault();
    const type = $(this).data('type');
    form.attr('action', `/guess/search/${type}`);
    form.submit();
    setButtonState($(this));
  });

  $(document).on('click', '[data-url]', function(event) {
    event.preventDefault();
    const url = $(this).data('url');
    
    const isAuthenticated = false;

    if (isAuthenticated) {
      window.location.href = url;
    } else {
      window.location.href = '/login';
    }
  });
});
