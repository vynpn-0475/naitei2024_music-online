$(document).ready(function () {
  $('#showModal').click(function (event) {
    event.preventDefault();
    console.log('Button clicked');
    $('#accountModal').modal('show');
  });
});
