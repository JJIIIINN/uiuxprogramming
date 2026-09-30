// 물주기 알림 신청 폼
const form = document.querySelector('#subscribe-form');
const plantInput = document.querySelector('#plant-name');
const emailInput = document.querySelector('#email');
const submitButton = document.querySelector('#subscribe-button');
const message = document.querySelector('#form-message');

const buttonText = '물주기 알림 받기';

// 안내 문구 표시 (type: error 또는 success)
function showMessage(text, type) {
  message.textContent = text;
  message.className = 'form-message ' + type;
}

// 입력칸을 오류 상태로 표시하고 커서 이동
function markInvalid(input) {
  input.classList.add('is-invalid');
  input.focus();
}

// 폼 제출 시 입력값 확인
function handleSubmit(event) {
  event.preventDefault();

  const plantName = plantInput.value.trim();
  const email = emailInput.value.trim();

  if (plantName === '') {
    showMessage('어떤 식물을 키우는지 이름을 알려 주세요.', 'error');
    markInvalid(plantInput);
    return;
  }

  if (email === '') {
    showMessage('일정을 받을 이메일 주소를 입력해 주세요.', 'error');
    markInvalid(emailInput);
    return;
  }

  if (!emailInput.checkValidity() || !email.includes('.')) {
    showMessage('이메일 주소 형식을 확인해 주세요. 예: green@example.com', 'error');
    markInvalid(emailInput);
    return;
  }

  showMessage(
    plantName + '의 첫 물주기 일정을 ' + email + ' 주소로 보내 드릴게요.',
    'success'
  );
  submitButton.textContent = '신청 완료';
  submitButton.disabled = true;
}

// 다시 입력하면 오류 표시와 버튼 상태 초기화
function handleInput(event) {
  event.target.classList.remove('is-invalid');
  showMessage('', '');
  submitButton.textContent = buttonText;
  submitButton.disabled = false;
}

form.addEventListener('submit', handleSubmit);
plantInput.addEventListener('input', handleInput);
emailInput.addEventListener('input', handleInput);
