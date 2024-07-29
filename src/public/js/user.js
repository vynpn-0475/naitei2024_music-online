document.addEventListener('DOMContentLoaded', function () {
  const emailInput = document.getElementById('email');
  const emailHelp = document.getElementById('emailHelp');

  emailInput.addEventListener('change', function () {
    // Kiểm tra định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput.value)) {
      // Hiển thị thông báo lỗi nếu email không hợp lệ
      emailHelp.style.display = 'block';
    } else {
      emailHelp.style.display = 'none';
    }
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form'); // Thay đổi nếu cần
  const passwordInput = document.getElementById('password');
  const confirmPasswordInput = document.getElementById('confirmPassword');
  const passwordError = document.getElementById('passwordError');

  form.addEventListener('submit', (event) => {
    if (passwordInput.value !== confirmPasswordInput.value) {
      event.preventDefault(); // Ngăn chặn gửi biểu mẫu
      passwordError.style.display = 'block'; // Hiển thị thông báo lỗi
    } else {
      passwordError.style.display = 'none'; // Ẩn thông báo lỗi
    }
  });
});

document.addEventListener('DOMContentLoaded', function () {
  const errorAlert = document.getElementById('errorAlert');
  if (errorAlert) {
    // Hiển thị thông báo lỗi
    errorAlert.style.display = 'block';
    // Ẩn thông báo lỗi sau 2 giây (2000ms)
    setTimeout(() => {
      errorAlert.style.display = 'none';
    }, 3000);
  }
});
