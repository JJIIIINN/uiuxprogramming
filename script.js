// 안내 문구 표시 (type: info, success, warning, error)
function showMessage(target, text, type) {
  target.textContent = text;
  target.className = 'form-message ' + type;
}

// 날짜를 "10월 19일(월)" 형식으로 바꾸기
function formatDate(date) {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return (
    date.getMonth() + 1 + '월 ' + date.getDate() + '일(' + days[date.getDay()] + ')'
  );
}

// 식물별 기본 물주기 간격(일)과 자리별 보정 비율
const waterDays = {
  monstera: 7,
  scindapsus: 5,
  fern: 3,
  succulent: 14,
  stuckyi: 21,
  rubber: 7,
  spathiphyllum: 4,
  cactus: 21,
  foliage: 7,
};
const placeRatio = { window: 0.8, veranda: 1, room: 1.2 };

// 식물 종류와 자리로 물주기 간격(일) 계산 (탭 체험과 신청 흐름에서 함께 사용)
function getWaterInterval(plant, place) {
  return Math.round(waterDays[plant] * placeRatio[place]);
}

// 오늘부터 며칠 뒤의 날짜 구하기
function getDateAfter(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

/* 1. 탭 (12주차: 어느 탭 묶음에도 쓸 수 있는 공통 함수로 정리)
   HTML 약속: role="tablist" 안의 role="tab" 버튼마다 aria-controls로 내용(role="tabpanel")을 연결 */

// 고른 탭만 선택 상태로 바꾸고, 연결된 내용만 보이기
// 선택된 탭만 Tab 키로 들어오고(tabindex 0), 나머지 탭은 방향키로 이동(tabindex -1)
function selectTab(tabs, selectedTab) {
  tabs.forEach(function (tab) {
    const isSelected = tab === selectedTab;
    tab.classList.toggle('is-active', isSelected);
    tab.setAttribute('aria-selected', String(isSelected));
    tab.tabIndex = isSelected ? 0 : -1;
    document.getElementById(tab.getAttribute('aria-controls')).hidden = !isSelected;
  });
}

// ← → 로 이전·다음, Home·End로 처음·마지막 항목의 번호 (해당 키가 아니면 -1)
// 탭과 아코디언이 함께 사용 (아코디언은 ↑ ↓)
function getMoveIndex(key, index, length, prevKey, nextKey) {
  if (key === nextKey) {
    return (index + 1) % length;
  }
  if (key === prevKey) {
    return (index - 1 + length) % length;
  }
  if (key === 'Home') {
    return 0;
  }
  if (key === 'End') {
    return length - 1;
  }
  return -1;
}

function initTabs(tablist) {
  const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));

  tablist.addEventListener('click', function (event) {
    const tab = event.target.closest('[role="tab"]');
    if (tab !== null) {
      selectTab(tabs, tab);
    }
  });

  tablist.addEventListener('keydown', function (event) {
    const index = tabs.indexOf(event.target);
    const next = getMoveIndex(event.key, index, tabs.length, 'ArrowLeft', 'ArrowRight');
    if (index === -1 || next === -1) {
      return;
    }
    event.preventDefault();
    selectTab(tabs, tabs[next]);
    tabs[next].focus();
  });
}

document.querySelectorAll('[role="tablist"]').forEach(initTabs);

/* 2. 물주기 간격 계산 */
const plantTypeSelect = document.querySelector('#plant-type');
const placeSelect = document.querySelector('#plant-place');
const waterButton = document.querySelector('#water-button');
const waterResult = document.querySelector('#water-result');

let waterInterval = 0;

// 식물 종류나 자리를 바꾸면 물주기 간격 다시 계산
function updateWaterPlan() {
  const plant = plantTypeSelect.value;
  const place = placeSelect.value;

  waterButton.textContent = '오늘 물 줬어요';

  if (plant === '' || place === '') {
    waterButton.disabled = true;
    showMessage(waterResult, '식물 종류와 놓아둔 자리를 모두 골라 주세요.', 'info');
    return;
  }

  waterInterval = getWaterInterval(plant, place);
  waterButton.disabled = false;
  showMessage(
    waterResult,
    waterInterval + '일마다 물을 주면 좋아요. 오늘 물을 줬다면 버튼을 눌러 기록해 주세요.',
    'info'
  );
}

// 물 준 날을 기록하고 다음 물주기 날짜 안내
function handleWater() {
  const nextDate = getDateAfter(waterInterval);

  waterButton.textContent = '물주기 완료';
  waterButton.disabled = true;
  showMessage(
    waterResult,
    '기록했어요! 다음 물주기는 ' + formatDate(nextDate) + '이에요.',
    'success'
  );
  waterResult.focus();
}

plantTypeSelect.addEventListener('change', updateWaterPlan);
placeSelect.addEventListener('change', updateWaterPlan);
waterButton.addEventListener('click', handleWater);

/* 3. 잎 상태 진단 */
const symptomGroup = document.querySelector('#symptom-group');
const diagnosisResult = document.querySelector('#diagnosis-result');

const diagnoses = {
  healthy: {
    type: 'success',
    level: '건강',
    text: '건강한 상태예요. 지금처럼 물주기 일정을 지켜 주세요.',
  },
  yellow: {
    type: 'error',
    level: '바로 조치 필요',
    text: '과습이 의심돼요. 겉흙이 마를 때까지 물을 멈추고 화분 받침의 물을 버려 주세요.',
  },
  brown: {
    type: 'warning',
    level: '주의',
    text: '물이나 습도가 부족해요. 흙이 말랐는지 손가락으로 확인하고 잎에 분무해 주세요.',
  },
  pale: {
    type: 'warning',
    level: '주의',
    text: '빛이 부족해요. 창가로 옮겨 하루 4시간 이상 밝은 빛을 받게 해 주세요.',
  },
  bugs: {
    type: 'error',
    level: '바로 조치 필요',
    text: '해충일 수 있어요. 다른 식물과 떨어뜨리고 젖은 휴지로 잎 앞뒤를 닦아 주세요.',
  },
};

// 고른 증상에 맞는 진단 결과 보여 주기 (심각도를 색뿐 아니라 '건강·주의·바로 조치 필요' 문구로도)
function handleSymptom(event) {
  const diagnosis = diagnoses[event.target.value];
  showMessage(diagnosisResult, diagnosis.level + ' · ' + diagnosis.text, diagnosis.type);
}

symptomGroup.addEventListener('change', handleSymptom);

/* 4. 성장 일지 메모 */
const memoInput = document.querySelector('#diary-memo');
const memoCount = document.querySelector('#memo-count');
const diaryButton = document.querySelector('#diary-button');
const diaryMessage = document.querySelector('#diary-message');
const diaryList = document.querySelector('#diary-list');

const memoLimit = 60;

// 입력할 때마다 글자 수와 기록 버튼 상태 바꾸기
function handleMemoInput() {
  const length = memoInput.value.length;
  const isOver = length > memoLimit;

  memoCount.textContent = length + ' / ' + memoLimit + '자';
  memoCount.classList.toggle('is-over', isOver);
  memoInput.classList.toggle('is-invalid', isOver);
  diaryButton.disabled = memoInput.value.trim() === '' || isOver;

  if (isOver) {
    showMessage(diaryMessage, memoLimit + '자 이내로 줄여 주세요.', 'error');
  } else {
    showMessage(diaryMessage, '', '');
  }
}

// 메모를 오늘 날짜와 함께 일지 맨 위에 추가
function addDiary() {
  const item = document.createElement('li');
  const date = document.createElement('span');
  const text = document.createElement('span');

  date.className = 'diary-date';
  date.textContent = formatDate(new Date());
  text.textContent = memoInput.value.trim();
  item.append(date, text);
  diaryList.prepend(item);

  memoInput.value = '';
  handleMemoInput();
  showMessage(diaryMessage, '오늘의 메모를 성장 일지에 남겼어요.', 'success');
  memoInput.focus();
}

memoInput.addEventListener('input', handleMemoInput);
diaryButton.addEventListener('click', addDiary);

/* 5. 물주기 알림 신청 흐름: 시작 → 내 식물 → 알림 받기 → 확인 → 완료 */
const signupForm = document.querySelector('#signup-form');
const flowSteps = document.querySelectorAll('.flow-step');
const progressItems = document.querySelectorAll('.flow-progress li');

const signupName = document.querySelector('#signup-name');
const signupType = document.querySelector('#signup-type');
const signupPlace = document.querySelector('#signup-place');
const signupEmail = document.querySelector('#signup-email');
const signupSms = document.querySelector('#signup-sms');
const signupPhone = document.querySelector('#signup-phone');
const signupTime = document.querySelector('#signup-time');
const signupCustomTime = document.querySelector('#signup-custom-time');
const signupAgree = document.querySelector('#signup-agree');

const smsField = document.querySelector('#sms-field');
const customTimeField = document.querySelector('#custom-time-field');
const nameCount = document.querySelector('#signup-name-count');
const emailCheck = document.querySelector('#signup-email-check');
const phoneCheck = document.querySelector('#signup-phone-check');

const signupSubmit = document.querySelector('#signup-submit');
const confirmPrev = document.querySelector('#confirm-prev');
const submitStatus = document.querySelector('#submit-status');
const submitStatusText = document.querySelector('#submit-status-text');
const submitFix = document.querySelector('#submit-fix');
const restartButton = document.querySelector('#restart-button');

const summaryName = document.querySelector('#summary-name');
const summaryType = document.querySelector('#summary-type');
const summaryPlace = document.querySelector('#summary-place');
const summaryInterval = document.querySelector('#summary-interval');
const summaryEmail = document.querySelector('#summary-email');
const summarySms = document.querySelector('#summary-sms');
const summaryTime = document.querySelector('#summary-time');
const summaryFirst = document.querySelector('#summary-first');
const doneMessage = document.querySelector('#done-message');

const placeNames = {
  window: '햇빛 드는 창가',
  veranda: '바람 통하는 베란다',
  room: '빛이 적은 방 안',
};
const timeNames = { morning: '아침 8시', noon: '낮 12시', evening: '저녁 8시' };

const nameMin = 2;
const nameMax = 20;
const confirmStep = 3;
const doneStep = 4;
let currentStep = 0;
let isSubmitting = false;
let isRestoring = false; // 13주차: 새로고침 뒤 복구하는 동안에는 임시 보관을 다시 하지 않음
let draftRestored = false; // 13주차: 복구 안내를 보여 주는 중인지

// 라디오 버튼 묶음에서 고른 값 (고르지 않았으면 빈 문자열)
function getChecked(group) {
  const checked = group.querySelector('input:checked');
  if (checked === null) {
    return '';
  }
  return checked.value;
}

// 숫자만 남기기 (휴대폰 번호의 - 와 공백 지우기)
function onlyDigits(text) {
  return text.replace(/[^0-9]/g, '');
}

// "01012345678" → "010-1234-5678"
function formatPhone(digits) {
  if (digits.length < 4) {
    return digits;
  }
  if (digits.length < 8) {
    return digits.slice(0, 3) + '-' + digits.slice(3);
  }
  return digits.slice(0, 3) + '-' + digits.slice(3, 7) + '-' + digits.slice(7);
}

// "07:30" → "오전 7시 30분"
function formatTime(value) {
  const hour = Number(value.slice(0, 2));
  const minute = Number(value.slice(3, 5));
  let text = (hour < 12 ? '오전 ' : '오후 ') + (hour % 12 === 0 ? 12 : hour % 12) + '시';
  if (minute > 0) {
    text += ' ' + minute + '분';
  }
  return text;
}

function isValidEmail() {
  const email = signupEmail.value.trim();
  const domain = email.slice(email.indexOf('@') + 1);
  return email !== '' && signupEmail.checkValidity() && domain.includes('.');
}

function isValidPhone() {
  const digits = onlyDigits(signupPhone.value);
  return digits.length === 11 && digits.startsWith('010');
}

function getTimeLabel() {
  const time = getChecked(signupTime);
  if (time === 'custom') {
    return formatTime(signupCustomTime.value);
  }
  return timeNames[time];
}

// 항목별 검사: 문제가 있으면 무엇을 어떻게 고칠지, 없으면 빈 문자열
const validators = {
  name: function () {
    const length = signupName.value.trim().length;
    if (length === 0) {
      return '식물 이름을 입력해 주세요. 예: 몬스테라 몽이';
    }
    if (length < nameMin) {
      return '식물 이름이 너무 짧아요. ' + nameMin + '자 이상으로 입력해 주세요.';
    }
    if (length > nameMax) {
      return '식물 이름이 ' + (length - nameMax) + '자 넘쳐요. ' + nameMax + '자 이하로 줄여 주세요.';
    }
    return '';
  },
  type: function () {
    if (signupType.value === '') {
      return '식물 종류를 골라 주세요. 종류를 모르면 아래 생김새로 찾기를 눌러 보세요.';
    }
    return '';
  },
  place: function () {
    if (getChecked(signupPlace) === '') {
      return '식물을 놓아둔 자리를 하나 골라 주세요.';
    }
    return '';
  },
  email: function () {
    if (signupEmail.value.trim() === '') {
      return '알림 받을 이메일 주소를 입력해 주세요.';
    }
    if (!isValidEmail()) {
      return '이메일 주소 형식을 확인해 주세요. 예: green@example.com';
    }
    return '';
  },
  phone: function () {
    if (onlyDigits(signupPhone.value) === '') {
      return '문자 알림을 받을 휴대폰 번호를 입력해 주세요. 문자가 필요 없으면 위의 체크를 풀어 주세요.';
    }
    if (!isValidPhone()) {
      return '010으로 시작하는 11자리 번호를 입력해 주세요. 예: 010-1234-5678';
    }
    return '';
  },
  time: function () {
    if (getChecked(signupTime) === '') {
      return '알림 받을 시간을 하나 골라 주세요.';
    }
    return '';
  },
  customTime: function () {
    const time = signupCustomTime.value;
    if (time === '') {
      return '알림 받을 시간을 입력해 주세요. 예: 오전 7:30';
    }
    if (time < '06:00' || time > '22:00') {
      return '이른 새벽이나 늦은 밤은 피해 주세요. 오전 6시부터 밤 10시 사이로 정해 주세요.';
    }
    return '';
  },
  agree: function () {
    if (!signupAgree.checked) {
      return '알림을 받으려면 수신 동의에 체크해 주세요.';
    }
    return '';
  },
};

// 해당 단계 화면만 보이고 진행 표시 갱신
// moveFocus가 false면 초점을 옮기지 않음 (13주차: 새로고침 뒤 복구할 때)
function showStep(step, moveFocus) {
  currentStep = step;

  flowSteps.forEach(function (panel, index) {
    panel.hidden = index !== step;
  });

  progressItems.forEach(function (item, index) {
    const itemStep = index + 1;
    item.classList.toggle('is-done', itemStep < step || step === doneStep);
    item.classList.toggle('is-current', itemStep === step && step !== doneStep);

    if (itemStep === step) {
      item.setAttribute('aria-current', 'step');
    } else {
      item.removeAttribute('aria-current');
    }
  });

  const alertBox = flowSteps[step].querySelector('.step-alert');
  if (alertBox !== null) {
    alertBox.textContent = '';
  }

  if (moveFocus !== false) {
    flowSteps[step].querySelector('h3').focus();
  }

  // 13주차: 단계가 바뀔 때마다 임시 보관하고, 복구 안내는 다른 단계로 넘어가면 접음
  if (!isRestoring) {
    draftRestored = false;
    saveDraft();
  }
}

// 단계 아래 안내: 수정이 필요한 항목의 개수와 이름 (show가 false면 이미 보일 때만 갱신)
function updateStepAlert(show) {
  const alertBox = flowSteps[currentStep].querySelector('.step-alert');
  if (alertBox === null || (!show && alertBox.textContent === '')) {
    return;
  }

  const labels = [];
  flowSteps[currentStep].querySelectorAll('.flow-field.is-invalid').forEach(function (field) {
    labels.push(field.dataset.label);
  });

  if (labels.length === 0) {
    alertBox.textContent = '';
  } else {
    alertBox.textContent =
      '수정이 필요한 항목 ' + labels.length + '개: ' + labels.join(', ') + '. 빨간 안내를 보고 고쳐 주세요.';
  }
}

// 항목 아래에 고치는 방법 안내 (message가 빈 문자열이면 오류 해제)
function setFieldError(control, message) {
  const field = control.closest('.flow-field');
  field.classList.toggle('is-invalid', message !== '');
  field.querySelector('.field-error').textContent = message;
  updateStepAlert(false);
}

function validateField(field) {
  const message = validators[field.dataset.field]();
  setFieldError(field, message);
  return message === '';
}

// 현재 단계의 보이는 항목을 모두 검사 (숨겨진 조건부 영역은 빼고)
function validateStep(step) {
  let firstError = null;

  flowSteps[step].querySelectorAll('.flow-field').forEach(function (field) {
    if (field.hidden) {
      return;
    }
    field.dataset.touched = 'true';
    if (!validateField(field) && firstError === null) {
      firstError = field;
    }
  });

  updateStepAlert(true);

  if (firstError !== null) {
    firstError.querySelector('input, select').focus();
    return false;
  }
  return true;
}

// 입력 중 표시 (색과 함께 문구로도 상태를 구분)
function setCheck(target, text, state) {
  target.textContent = text;
  target.className = 'field-check ' + state;
}

function updateNameCount() {
  const length = signupName.value.trim().length;
  let text = length + ' / ' + nameMax + '자';
  let state = '';

  if (length > nameMax) {
    text += ' · ' + (length - nameMax) + '자 초과';
    state = 'is-over';
  } else if (length >= nameMin) {
    text += ' · 조건 충족';
    state = 'is-ok';
  } else if (length > 0) {
    text += ' · ' + (nameMin - length) + '자 더 필요';
    state = 'is-short';
  }

  nameCount.textContent = text;
  nameCount.className = 'char-count ' + state;
}

function updateEmailCheck() {
  if (signupEmail.value.trim() === '') {
    setCheck(emailCheck, '', '');
  } else if (isValidEmail()) {
    setCheck(emailCheck, '✓ 올바른 이메일 형식이에요.', 'is-ok');
  } else {
    setCheck(emailCheck, '확인 중: 아직 이메일 형식이 아니에요. @와 도메인까지 입력해 주세요.', 'is-pending');
  }
}

function updatePhoneCheck() {
  const digits = onlyDigits(signupPhone.value);

  if (digits === '') {
    setCheck(phoneCheck, '', '');
  } else if (isValidPhone()) {
    setCheck(phoneCheck, '✓ 휴대폰 번호 11자리를 확인했어요.', 'is-ok');
  } else if (digits.length >= 3 && !digits.startsWith('010')) {
    setCheck(phoneCheck, '확인 중: 010으로 시작하는 번호만 받을 수 있어요.', 'is-pending');
  } else {
    setCheck(phoneCheck, '확인 중: 지금 ' + digits.length + '자리 · ' + (11 - digits.length) + '자리 더 입력해 주세요.', 'is-pending');
  }
}

// 입력하는 동안: 글자 수·조건 표시를 갱신하고, 한 번 검사한 항목은 바로 다시 검사
function handleLiveInput(event) {
  if (event.target === signupName) {
    updateNameCount();
  }
  if (event.target === signupEmail) {
    updateEmailCheck();
  }
  if (event.target === signupPhone) {
    signupPhone.value = formatPhone(onlyDigits(signupPhone.value).slice(0, 11));
    updatePhoneCheck();
  }

  const field = event.target.closest('.flow-field');
  if (field !== null && field.dataset.touched === 'true') {
    validateField(field);
  }

  // 13주차: 값을 입력하거나 고를 때마다 임시 보관
  saveDraft();
}

// 입력칸을 벗어날 때: 값을 입력한 글자 입력칸은 그때부터 검사
function handleFieldBlur(event) {
  const field = event.target.closest('.flow-field');
  const isTextInput = event.target.matches(
    'input[type="text"], input[type="email"], input[type="tel"], input[type="time"]'
  );

  if (field === null || !isTextInput || event.target.value.trim() === '') {
    return;
  }
  field.dataset.touched = 'true';
  validateField(field);
}

// 조건부 입력 영역: 보이면 입력 가능, 숨기면 disabled로 입력·검사·제출에서 빼고 오류도 지움
function setConditional(field, show) {
  field.hidden = !show;
  field.querySelectorAll('input').forEach(function (input) {
    input.disabled = !show;
  });

  if (!show) {
    field.dataset.touched = '';
    setFieldError(field, '');
  }
}

// 문자 알림 체크박스와 '직접 정하기' 라디오 선택에 따라 영역 전환
function updateConditionalFields() {
  setConditional(smsField, signupSms.checked);
  setConditional(customTimeField, getChecked(signupTime) === 'custom');
}

// 지금 입력·선택된 값으로 확인 화면 채우기
function fillSummary() {
  const plant = signupType.value;
  const place = getChecked(signupPlace);
  const interval = getWaterInterval(plant, place);

  summaryName.textContent = signupName.value.trim();
  summaryType.textContent = signupType.options[signupType.selectedIndex].text;
  if (foundPlant !== '' && foundPlant !== 'foliage' && plant === foundPlant) {
    summaryType.textContent += ' (생김새로 찾음)';
  }
  summaryPlace.textContent = placeNames[place];
  summaryInterval.textContent = interval + '일마다';
  summaryEmail.textContent = signupEmail.value.trim();
  summarySms.textContent = signupSms.checked ? signupPhone.value : '받지 않음';
  summaryTime.textContent = getTimeLabel();
  summaryFirst.textContent = formatDate(getDateAfter(interval)) + ' ' + getTimeLabel();

  hideSubmitStatus();
}

/* 신청 기록: 서버 대신 브라우저 localStorage에 저장 (프로토타입) */
const storageKey = 'chorok-signups';

function loadSignups() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (Array.isArray(saved)) {
      return saved;
    }
  } catch (error) {
    // 저장소를 쓸 수 없거나 내용이 깨졌으면 빈 목록으로 처리
  }
  return [];
}

// 같은 이메일로 같은 이름의 식물을 이미 신청했는지 (띄어쓰기는 무시)
function isRegistered(email, name) {
  const plantName = removeSpaces(name);
  return loadSignups().some(function (signup) {
    return signup.email === email && removeSpaces(signup.name) === plantName;
  });
}

function saveSignupList(signups) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(signups));
    return true;
  } catch (error) {
    return false;
  }
}

function saveSignup(record) {
  const signups = loadSignups();
  signups.push(record);
  return saveSignupList(signups);
}

function showSubmitStatus(text, state, showFix) {
  submitStatus.hidden = false;
  submitStatus.className = 'submit-status ' + state;
  submitStatusText.textContent = text;
  submitFix.hidden = !showFix;
}

function hideSubmitStatus() {
  submitStatus.hidden = true;
  submitStatusText.textContent = '';
  submitFix.hidden = true;
}

// 제출 중: 버튼을 비활성화하고 진행 문구를 보여 중복 제출 막기
function setSubmitting(on) {
  isSubmitting = on;
  signupSubmit.disabled = on;
  signupSubmit.classList.toggle('is-loading', on);
  confirmPrev.disabled = on;
  signupAgree.disabled = on;
  flowSteps[confirmStep].querySelectorAll('.edit-button').forEach(function (button) {
    button.disabled = on;
  });
  signupForm.setAttribute('aria-busy', String(on));
  // 13주차: 신청하는 중에는 '처음부터 다시 작성'도 잠금 (보내는 중에 값이 지워져 빈 신청이 저장되지 않게)
  draftRestart.disabled = on;

  if (on) {
    signupSubmit.textContent = '신청하는 중…';
  }
}

function getDoneMessage() {
  let message =
    summaryName.textContent + '의 첫 물주기 알림을 ' + summaryFirst.textContent + '에 ' +
    summaryEmail.textContent + ' 주소';
  if (signupSms.checked) {
    message += '와 ' + signupPhone.value + ' 문자';
  }
  return message + '로 보내 드릴게요.';
}

// 신청 보내기: 1.5초 동안 '신청하는 중' 상태를 보여 준 뒤 결과 처리
function sendSignup() {
  setSubmitting(true);
  showSubmitStatus('신청 내용을 보내는 중이에요. 잠시만 기다려 주세요.', 'is-progress', false);
  submitStatus.focus();
  setTimeout(finishSignup, 1500);
}

// 결과 처리: 실패하면 입력 내용을 그대로 두고 다시 신청할 수 있게
function finishSignup() {
  const email = signupEmail.value.trim().toLowerCase();
  setSubmitting(false);
  signupSubmit.textContent = '다시 신청하기';

  // 실패 1: 인터넷 연결이 끊김
  if (!navigator.onLine) {
    showSubmitStatus(
      '인터넷에 연결되어 있지 않아 신청하지 못했어요. 입력한 내용은 그대로 있어요. 연결을 확인한 뒤 다시 신청해 주세요.',
      'is-error',
      false
    );
    signupSubmit.focus();
    return;
  }

  // 실패 2: 같은 이메일로 같은 이름의 식물을 이미 신청함 (이 브라우저에 저장된 신청 기준)
  if (isRegistered(email, signupName.value.trim())) {
    showSubmitStatus(
      '‘' + signupName.value.trim() + '’ 식물은 이 이메일로 이미 알림을 신청했어요. 식물 이름이나 이메일을 바꾼 뒤 다시 신청해 주세요.',
      'is-error',
      true
    );
    submitFix.focus();
    return;
  }

  // 실패 3: 브라우저에 저장할 수 없음 (저장소 차단·용량 부족)
  const place = getChecked(signupPlace);
  const saved = saveSignup({
    id: 'p-' + Date.now(),
    email: email,
    name: signupName.value.trim(),
    plant: signupType.value,
    place: place,
    interval: getWaterInterval(signupType.value, place),
    phone: signupSms.checked ? signupPhone.value : '',
    time: getTimeLabel(),
    createdAt: new Date().toISOString(),
    lastWatered: toDateKey(new Date()),
  });
  if (!saved) {
    showSubmitStatus(
      '신청 내용을 저장하지 못했어요. 입력한 내용은 그대로 있어요. 잠시 후 다시 신청해 주세요.',
      'is-error',
      false
    );
    signupSubmit.focus();
    return;
  }

  hideSubmitStatus();
  signupSubmit.textContent = '알림 신청하기';
  doneMessage.textContent = getDoneMessage();

  // 내 식물 목록에 바로 반영 (새 식물이 보이도록 전체 보기로)
  currentFilter = 'all';
  renderPlantList();
  setPlantMessage('‘' + signupName.value.trim() + '’ 식물을 목록에 추가했어요.', 'is-success');

  // 13주차: 저장에 성공했으므로 임시 보관한 내용과 입력칸을 비움
  // (완료 화면에서 새로고침해도 끝난 신청이 작성 중으로 되살아나지 않게)
  clearDraft();
  clearSignupInputs();

  showStep(doneStep);
}

// 다음·알림 신청하기 버튼(또는 Enter)으로 제출했을 때
function handleFlowSubmit(event) {
  event.preventDefault();

  // 식물 찾기 입력창에서 누른 Enter는 다음 단계가 아니라 검색으로 처리
  if (document.activeElement === finderInput) {
    return;
  }

  // 신청하는 중에는 다시 제출하지 않음
  if (isSubmitting) {
    return;
  }

  if (!validateStep(currentStep)) {
    return;
  }

  if (currentStep === confirmStep) {
    sendSignup();
    return;
  }

  if (currentStep + 1 === confirmStep) {
    fillSummary();
  }
  showStep(currentStep + 1);
}

// 시작·이전·수정 버튼: data-goto에 적힌 단계로 이동 (입력값은 그대로 유지)
function handleFlowClick(event) {
  const button = event.target.closest('[data-goto]');
  if (button === null || isSubmitting) {
    return;
  }
  showStep(Number(button.dataset.goto));
}

// 입력값·오류 안내·조건부 영역·글자 수·식물 찾기를 처음 상태로 (다시 시작할 때와 신청에 성공했을 때 함께 사용)
function clearSignupInputs() {
  signupForm.reset();

  signupForm.querySelectorAll('.flow-field').forEach(function (field) {
    field.dataset.touched = '';
    setFieldError(field, '');
  });
  signupForm.querySelectorAll('.step-alert').forEach(function (alertBox) {
    alertBox.textContent = '';
  });
  updateConditionalFields();
  updateNameCount();
  setCheck(emailCheck, '', '');
  setCheck(phoneCheck, '', '');
  resetFinder();
}

// 처음부터 다시: 입력값·안내 문구·버튼 상태·조건부 영역·진행 상태·임시 보관한 내용 모두 초기화
function restartSignup() {
  clearDraft();
  clearSignupInputs();

  hideSubmitStatus();
  signupSubmit.textContent = '알림 신청하기';
  signupForm.querySelectorAll('.summary dd').forEach(function (item) {
    item.textContent = '';
  });
  doneMessage.textContent = '';

  showStep(0);
}

signupForm.addEventListener('submit', handleFlowSubmit);
signupForm.addEventListener('click', handleFlowClick);
signupForm.addEventListener('input', handleLiveInput);
signupForm.addEventListener('change', handleLiveInput);
signupForm.addEventListener('focusout', handleFieldBlur);
signupSms.addEventListener('change', updateConditionalFields);
signupTime.addEventListener('change', updateConditionalFields);
restartButton.addEventListener('click', restartSignup);

/* 6. 생김새로 식물 찾기: 신청 흐름 '내 식물' 단계에서 종류를 모를 때 */
const finderToggle = document.querySelector('#finder-toggle');
const finder = document.querySelector('#plant-finder');
const finderInput = document.querySelector('#finder-input');
const finderButton = document.querySelector('#finder-button');
const finderClose = document.querySelector('#finder-close');
const finderError = document.querySelector('#finder-error');
const finderStatus = document.querySelector('#finder-status');
const finderResults = document.querySelector('#finder-results');
const finderEmpty = document.querySelector('#finder-empty');
const typeNote = document.querySelector('#type-note');

// 식물별 생김새와 검색어
const plantGuide = [
  {
    value: 'monstera',
    name: '몬스테라',
    look: '넓은 잎에 구멍이 나거나 깊게 갈라져요',
    keywords: ['구멍', '갈라진 잎', '찢어진 잎', '넓은 잎'],
  },
  {
    value: 'scindapsus',
    name: '스킨답서스',
    look: '하트 모양 잎이 덩굴로 길게 늘어져요',
    keywords: ['덩굴', '하트', '늘어지는', '행잉', '포토스'],
  },
  {
    value: 'fern',
    name: '보스턴고사리',
    look: '가늘고 촘촘한 잎이 깃털처럼 풍성해요',
    keywords: ['고사리', '깃털', '가는 잎', '풍성', '촘촘'],
  },
  {
    value: 'succulent',
    name: '다육이',
    look: '작고 통통한 잎이 꽃잎처럼 겹겹이 모여 있어요',
    keywords: ['통통', '두툼', '다육', '작은 잎', '로제트'],
  },
  {
    value: 'stuckyi',
    name: '스투키',
    look: '단단한 막대 모양 잎이 위로 곧게 솟아 있어요',
    keywords: ['막대', '원통', '기둥', '산세베리아', '곧게'],
  },
  {
    value: 'rubber',
    name: '고무나무',
    look: '두껍고 반짝이는 타원형 잎이 굵은 줄기에 달려요',
    keywords: ['광택', '반짝', '두꺼운 잎', '타원', '나무'],
  },
  {
    value: 'spathiphyllum',
    name: '스파티필름',
    look: '진한 초록 잎 사이로 하얀 꽃이 피어요',
    keywords: ['꽃', '하얀', '흰', '처지는 잎'],
  },
  {
    value: 'cactus',
    name: '선인장',
    look: '가시가 있고 몸통이 둥글거나 길쭉해요',
    keywords: ['가시', '선인장', '둥근 몸통'],
  },
];

let foundPlant = ''; // 찾기로 고른 식물 종류 (확인 화면 표시에 사용)

// 식물 종류 선택창 아래 안내 (type: success 또는 info)
function setTypeNote(text, type) {
  typeNote.textContent = text;
  typeNote.className = 'field-note ' + type;
}

// 띄어쓰기를 지워서 "구멍 난 잎"과 "구멍난잎"을 같게 비교
function removeSpaces(text) {
  return text.split(' ').join('');
}

// 검색어가 이름·생김새·검색어 목록과 겹치는 식물 찾기
function findPlants(query) {
  const word = removeSpaces(query);

  return plantGuide.filter(function (plant) {
    const texts = [plant.name, plant.look].concat(plant.keywords);
    return texts.some(function (text) {
      const target = removeSpaces(text);
      return target.includes(word) || word.includes(target);
    });
  });
}

// moveFocus가 false면 초점을 옮기지 않음 (13주차: 새로고침 뒤 복구할 때)
function openFinder(moveFocus) {
  finder.hidden = false;
  finderToggle.setAttribute('aria-expanded', 'true');
  if (moveFocus !== false) {
    finderInput.focus();
  }
  saveDraft();
}

function closeFinder() {
  finder.hidden = true;
  finderToggle.setAttribute('aria-expanded', 'false');
}

// 닫기(취소): 식물 종류는 바꾸지 않고 다음 행동 안내
function cancelFinder() {
  closeFinder();
  setTypeNote('식물 찾기를 닫았어요. 식물 종류는 그대로예요. 목록에서 고르거나 다시 찾아보세요.', 'info');
  finderToggle.focus();
  saveDraft();
}

function toggleFinder() {
  if (finder.hidden) {
    openFinder(true);
  } else {
    cancelFinder();
  }
}

function clearFinderError() {
  finderInput.classList.remove('is-invalid');
  finderError.textContent = '';
}

// 검색 결과 목록 또는 결과 없음 안내 표시
function showResults(query, matches) {
  finderResults.textContent = '';
  finderEmpty.hidden = matches.length > 0;
  finderStatus.classList.toggle('is-empty', matches.length === 0);

  if (matches.length === 0) {
    finderStatus.textContent = '‘' + query + '’ 검색 결과가 없어요.';
    return;
  }

  finderStatus.textContent =
    '‘' + query + '’ 검색 결과 ' + matches.length + '개 · 키우는 식물을 골라 주세요.';

  matches.forEach(function (plant) {
    const item = document.createElement('li');
    const info = document.createElement('div');
    const name = document.createElement('strong');
    const look = document.createElement('span');
    const pick = document.createElement('button');

    name.textContent = plant.name;
    look.textContent = plant.look + ' · 기본 ' + waterDays[plant.value] + '일마다 물주기';
    pick.type = 'button';
    pick.className = 'pick-button';
    pick.dataset.plant = plant.value;
    pick.textContent = '이 식물로 선택';

    info.append(name, look);
    item.append(info, pick);
    finderResults.append(item);
  });
}

// 찾기 버튼·Enter·예시 검색어로 검색
function searchPlants() {
  const query = finderInput.value.trim();

  if (query === '') {
    finderInput.classList.add('is-invalid');
    finderError.textContent = '찾을 식물의 이름이나 생김새를 입력해 주세요. 예: 구멍 난 잎';
    finderStatus.textContent = '';
    finderResults.textContent = '';
    finderEmpty.hidden = true;
    finderInput.focus();
    return;
  }

  clearFinderError();
  showResults(query, findPlants(query));
  saveDraft();
}

// 한글 입력 중(조합 중) Enter는 무시하고, 입력이 끝난 Enter로 검색
function handleFinderKey(event) {
  if (event.key === 'Enter' && !event.isComposing) {
    event.preventDefault();
    searchPlants();
  }
}

// 식물 종류 아래에 '생김새로 찾은 식물' 안내 (찾기로 골랐을 때와 새로고침 뒤 복구할 때 함께 사용)
function showFoundNote(value) {
  if (value === 'foliage') {
    setTypeNote('목록에 없는 식물이라 기타 관엽식물(기본 7일마다)로 등록했어요.', 'success');
  } else {
    const plantName = signupType.options[signupType.selectedIndex].text;
    setTypeNote(
      '생김새로 찾은 식물: ' + plantName + ' · 기본 ' + waterDays[value] + '일마다 물주기',
      'success'
    );
  }
}

// 고른 식물을 신청 흐름의 식물 종류에 반영하고 찾기 닫기
function pickPlant(value) {
  signupType.value = value;
  foundPlant = value;
  setFieldError(signupType, '');
  closeFinder();
  showFoundNote(value);
  signupType.focus();
  saveDraft();
}

// 찾기 영역 안의 예시 검색어·선택 버튼 처리
function handleFinderClick(event) {
  const keyword = event.target.closest('[data-keyword]');
  const pick = event.target.closest('[data-plant]');

  if (keyword !== null) {
    finderInput.value = keyword.dataset.keyword;
    searchPlants();
  }
  if (pick !== null) {
    pickPlant(pick.dataset.plant);
  }
}

// 목록에서 직접 종류를 바꾸면 찾기 결과 안내 지우기
function handleTypeChange() {
  foundPlant = '';
  setTypeNote('', '');
}

// 신청을 처음부터 다시 하면 찾기 상태도 초기화 (검색어는 form.reset()이 지움)
function resetFinder() {
  closeFinder();
  clearFinderError();
  finderStatus.textContent = '';
  finderStatus.classList.remove('is-empty');
  finderResults.textContent = '';
  finderEmpty.hidden = true;
  setTypeNote('', '');
  foundPlant = '';
}

finderToggle.addEventListener('click', toggleFinder);
finderClose.addEventListener('click', cancelFinder);
finderButton.addEventListener('click', searchPlants);
finderInput.addEventListener('keydown', handleFinderKey);
finderInput.addEventListener('input', clearFinderError);
finder.addEventListener('click', handleFinderClick);
signupType.addEventListener('change', handleTypeChange);

/* 7. 상단 메뉴: 현재 위치 표시와 모바일 메뉴 열기·닫기 */
const topbar = document.querySelector('.topbar');
const menuToggle = document.querySelector('#menu-toggle');
const menuLabel = menuToggle.querySelector('.menu-label');
const menuLinks = document.querySelectorAll('.menu a');
const menuSections = [];
const wideScreen = window.matchMedia('(min-width: 769px)');

menuLinks.forEach(function (link) {
  menuSections.push(document.querySelector(link.getAttribute('href')));
});

// 화면 위에서 35% 지점을 지난 마지막 섹션을 현재 위치로 보고, 그 메뉴에만 aria-current 표시
function updateCurrentMenu() {
  const line = window.innerHeight * 0.35;
  let currentIndex = -1;

  menuSections.forEach(function (section, index) {
    if (section.getBoundingClientRect().top <= line) {
      currentIndex = index;
    }
  });

  // 12주차: 페이지 맨 아래까지 내리면 마지막 영역(자주 묻는 질문)이 35% 지점에 닿지 못해도 현재 위치로
  const atBottom =
    window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
  if (atBottom && menuSections[menuSections.length - 1].getBoundingClientRect().top < window.innerHeight) {
    currentIndex = menuSections.length - 1;
  }

  menuLinks.forEach(function (link, index) {
    if (index === currentIndex) {
      link.setAttribute('aria-current', 'location');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

// 스크롤 중에는 화면을 그리기 직전에 한 번만 계산
let menuFrame = 0;
function requestMenuUpdate() {
  if (menuFrame !== 0) {
    return;
  }
  menuFrame = requestAnimationFrame(function () {
    menuFrame = 0;
    updateCurrentMenu();
  });
}

// 좁은 화면 메뉴: 실제 표시 상태, 버튼 문구, aria-expanded를 함께 변경
function setMenuOpen(open) {
  topbar.classList.toggle('is-menu-open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  menuLabel.textContent = open ? '메뉴 닫기' : '메뉴 열기';
}

function toggleMenu() {
  setMenuOpen(menuToggle.getAttribute('aria-expanded') !== 'true');
}

// 메뉴에서 목적지를 고르면 메뉴를 닫고 그 위치로 이동 (이동은 링크 기본 동작)
function handleMenuClick(event) {
  if (event.target.closest('a') !== null) {
    setMenuOpen(false);
  }
}

// Esc 키나 메뉴 바깥을 누르면 닫기
function handleMenuKey(event) {
  if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
    setMenuOpen(false);
    menuToggle.focus();
  }
}

function handleOutsideClick(event) {
  if (menuToggle.getAttribute('aria-expanded') === 'true' && !topbar.contains(event.target)) {
    setMenuOpen(false);
  }
}

// 넓은 화면으로 바뀌면 열림 상태를 초기화 (넓은 화면에서는 메뉴가 항상 보임)
function handleScreenChange() {
  if (wideScreen.matches) {
    setMenuOpen(false);
  }
}

menuToggle.addEventListener('click', toggleMenu);
document.querySelector('.menu').addEventListener('click', handleMenuClick);
document.addEventListener('keydown', handleMenuKey);
document.addEventListener('click', handleOutsideClick);
wideScreen.addEventListener('change', handleScreenChange);

// 스크롤, 메뉴 이동(hash 변경), 뒤로 가기, 새로고침 뒤에도 실제 화면 기준으로 다시 계산
window.addEventListener('scroll', requestMenuUpdate, { passive: true });
window.addEventListener('resize', requestMenuUpdate);
window.addEventListener('hashchange', requestMenuUpdate);
window.addEventListener('popstate', requestMenuUpdate);
window.addEventListener('pageshow', requestMenuUpdate);
window.addEventListener('load', requestMenuUpdate);
updateCurrentMenu();

/* 8. 내 식물 목록: 저장된 신청을 물 줄 때로 걸러 보기 */
const plantList = document.querySelector('#plant-list');
const plantSummary = document.querySelector('#plant-summary');
const plantMessage = document.querySelector('#plant-message');
const plantsNone = document.querySelector('#plants-none');
const plantsNoMatch = document.querySelector('#plants-no-match');
const noMatchName = document.querySelector('#no-match-name');
const filterButtons = document.querySelectorAll('.filter-button');
const sampleButton = document.querySelector('#sample-button');
const showAllButton = document.querySelector('#show-all-button');

const filterNames = {
  all: '전체',
  due: '오늘 물 줄 식물',
  week: '7일 안에',
  later: '여유 있음',
};
let currentFilter = 'all';

// 날짜를 "2026-11-03" 형태로 (저장용, 내 컴퓨터 날짜 기준)
function toDateKey(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return date.getFullYear() + '-' + month + '-' + day;
}

function fromDateKey(key) {
  const parts = key.split('-');
  return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
}

// 마지막으로 물 준 날과 간격으로 다음 물주기 날짜·남은 날·필터 묶음 계산
function getPlantStatus(record) {
  const interval = record.interval || waterDays[record.plant] || 7;
  const lastWatered = record.lastWatered || toDateKey(new Date(record.createdAt));
  const nextDate = fromDateKey(lastWatered);
  nextDate.setDate(nextDate.getDate() + interval);

  const today = fromDateKey(toDateKey(new Date()));
  const daysLeft = Math.round((nextDate - today) / 86400000);

  let group = 'later';
  if (daysLeft <= 0) {
    group = 'due';
  } else if (daysLeft <= 7) {
    group = 'week';
  }

  let text = daysLeft + '일 뒤 · ' + formatDate(nextDate);
  if (daysLeft < 0) {
    text = '물 줄 날이 ' + -daysLeft + '일 지났어요';
  } else if (daysLeft === 0) {
    text = '오늘 물 주는 날이에요';
  }

  return { interval: interval, nextDate: nextDate, daysLeft: daysLeft, group: group, text: text };
}

function getPlantTypeName(plant) {
  const option = signupType.querySelector('option[value="' + plant + '"]');
  if (option === null) {
    return '식물';
  }
  return option.text;
}

// 목록 한 칸 만들기
function createPlantItem(record, status) {
  const item = document.createElement('li');
  const info = document.createElement('div');
  const statusText = document.createElement('p');
  const name = document.createElement('h3');
  const meta = document.createElement('p');
  const notice = document.createElement('p');
  const actions = document.createElement('div');
  const waterAction = document.createElement('button');
  const removeAction = document.createElement('button');

  item.className = 'plant-item is-' + status.group;
  info.className = 'plant-info';
  statusText.className = 'plant-status';
  statusText.textContent = status.text;
  name.className = 'plant-name';
  name.textContent = record.name;
  if (record.sample) {
    const tag = document.createElement('span');
    tag.className = 'sample-tag';
    tag.textContent = '예시';
    name.append(' ', tag);
  }

  meta.className = 'plant-meta';
  meta.textContent =
    getPlantTypeName(record.plant) + ' · ' + (placeNames[record.place] || '자리 정보 없음') +
    ' · ' + status.interval + '일마다';
  notice.className = 'plant-meta';
  notice.textContent = '알림 ' + record.time + ' · ' + record.email + (record.phone ? ' · 문자 ' + record.phone : '');

  actions.className = 'plant-actions';
  waterAction.type = 'button';
  waterAction.className = 'pick-button';
  waterAction.dataset.action = 'water';
  waterAction.dataset.id = record.id;
  waterAction.textContent = '오늘 물 줬어요';
  waterAction.setAttribute('aria-label', record.name + ' 오늘 물 줬어요');
  removeAction.type = 'button';
  removeAction.className = 'finder-close';
  removeAction.dataset.action = 'remove';
  removeAction.dataset.id = record.id;
  removeAction.dataset.name = record.name;
  removeAction.setAttribute('aria-haspopup', 'dialog');
  removeAction.textContent = '삭제';
  removeAction.setAttribute('aria-label', record.name + ' 목록에서 삭제');

  info.append(statusText, name, meta, notice);
  actions.append(waterAction, removeAction);
  item.append(info, actions);
  return item;
}

// 예전에 저장한 기록에 id가 없으면 붙여서 다시 저장
function loadPlantRecords() {
  const records = loadSignups();
  let changed = false;

  records.forEach(function (record, index) {
    if (!record.id) {
      record.id = 'old-' + index + '-' + Date.parse(record.createdAt);
      changed = true;
    }
  });
  if (changed) {
    saveSignupList(records);
  }
  return records;
}

// 목록 다시 그리기: 필터 버튼 선택 표시·개수, 목록, 결과 안내를 함께 갱신
function renderPlantList() {
  const plants = loadPlantRecords().map(function (record) {
    return { record: record, status: getPlantStatus(record) };
  });
  plants.sort(function (a, b) {
    return a.status.daysLeft - b.status.daysLeft;
  });

  const counts = { all: plants.length, due: 0, week: 0, later: 0 };
  plants.forEach(function (plant) {
    counts[plant.status.group] += 1;
  });

  filterButtons.forEach(function (button) {
    const isSelected = button.dataset.filter === currentFilter;
    button.classList.toggle('is-active', isSelected);
    button.setAttribute('aria-pressed', String(isSelected));
    // 숫자 뒤 '개'는 화면 낭독기에만 읽힘 (예: "오늘 물 줄 식물 2개")
    const count = button.querySelector('.filter-count');
    const unit = document.createElement('span');
    unit.className = 'sr-only';
    unit.textContent = '개';
    count.textContent = counts[button.dataset.filter];
    count.append(unit);
  });

  const shown = plants.filter(function (plant) {
    return currentFilter === 'all' || plant.status.group === currentFilter;
  });

  plantList.textContent = '';
  shown.forEach(function (plant) {
    plantList.append(createPlantItem(plant.record, plant.status));
  });

  // 결과 안내: 전체 목록이 없는 경우와 조건에 맞는 결과만 없는 경우를 나눔
  plantList.hidden = shown.length === 0;
  plantsNone.hidden = plants.length > 0;
  plantsNoMatch.hidden = plants.length === 0 || shown.length > 0;
  noMatchName.textContent = filterNames[currentFilter];

  if (plants.length === 0) {
    plantSummary.textContent = '등록한 식물 0개';
  } else if (currentFilter === 'all') {
    plantSummary.textContent =
      '전체 ' + plants.length + '개 식물을 물 줄 날이 가까운 순서로 보여 주고 있어요.';
  } else {
    plantSummary.textContent =
      '전체 ' + plants.length + '개 중 ‘' + filterNames[currentFilter] + '’ ' + shown.length + '개를 보여 주고 있어요.';
  }
}

function setPlantMessage(text, state) {
  plantMessage.textContent = text;
  plantMessage.className = 'plant-message ' + state;
}

function selectFilter(filter) {
  currentFilter = filter;
  setPlantMessage('', '');
  renderPlantList();
}

function handleFilterClick(event) {
  selectFilter(event.currentTarget.dataset.filter);
}

// 저장 목록에서 id로 기록을 찾아 바꾸고 저장 (change가 돌려준 문구를 성공 안내로 표시)
function updatePlantRecord(id, change) {
  const records = loadPlantRecords();
  const index = records.findIndex(function (record) {
    return record.id === id;
  });
  if (index === -1) {
    return;
  }

  const message = change(records, index);

  if (!saveSignupList(records)) {
    setPlantMessage('변경 내용을 저장하지 못했어요. 잠시 후 다시 눌러 주세요.', 'is-error');
    plantMessage.focus();
    return;
  }

  renderPlantList();
  setPlantMessage(message, 'is-success');
  plantMessage.focus();
}

function waterPlant(records, index) {
  const record = records[index];
  record.lastWatered = toDateKey(new Date());
  return (
    '‘' + record.name + '’ 물 준 날을 오늘로 기록했어요. 다음 물주기는 ' +
    formatDate(getPlantStatus(record).nextDate) + '이에요.'
  );
}

function removePlant(records, index) {
  const record = records.splice(index, 1)[0];
  return '‘' + record.name + '’ 식물을 목록에서 삭제했어요.';
}

// 이름 끝 글자의 받침에 맞는 조사 고르기 (예: 몽이 → 를, 몬스테라 몽 → 을)
function pickJosa(word, withFinal, withoutFinal) {
  const code = word.charCodeAt(word.length - 1) - 0xac00;
  if (code < 0 || code > 11171) {
    return withFinal + '(' + withoutFinal + ')'; // 한글이 아니면 둘 다 표시
  }
  return code % 28 === 0 ? withoutFinal : withFinal;
}

// 목록의 '오늘 물 줬어요'는 바로 기록, '삭제'는 되돌릴 수 없으므로 확인 모달을 먼저 띄움
function handlePlantAction(event) {
  const button = event.target.closest('[data-action]');
  if (button === null) {
    return;
  }

  const id = button.dataset.id;

  if (button.dataset.action === 'water') {
    updatePlantRecord(id, waterPlant);
    return;
  }

  const name = button.dataset.name;
  askConfirm({
    opener: button,
    title: '‘' + name + '’' + pickJosa(name, '을', '를') + ' 목록에서 삭제할까요?',
    text: '삭제하면 이 식물의 물주기 알림과 물 준 기록이 함께 사라지고 되돌릴 수 없어요.',
    okText: '삭제하기',
    closeLabel: '삭제 확인 창 닫기',
    onConfirm: function () {
      updatePlantRecord(id, removePlant);
    },
    onCancel: function () {
      setPlantMessage(
        '삭제를 취소했어요. ‘' + name + '’' + pickJosa(name, '은', '는') + ' 목록에 그대로 있어요.',
        'is-info'
      );
    },
  });
}

// 목록이 비었을 때: 물 줄 때가 서로 다른 예시 식물 4개 넣기
function addSamplePlants() {
  const samples = [
    { name: '덩굴이', plant: 'scindapsus', place: 'veranda', daysAgo: 6 },
    { name: '풍성이', plant: 'fern', place: 'window', daysAgo: 2 },
    { name: '몽이', plant: 'monstera', place: 'window', daysAgo: 2 },
    { name: '뚜기', plant: 'stuckyi', place: 'room', daysAgo: 3 },
  ];
  const records = loadPlantRecords();

  samples.forEach(function (sample, index) {
    const watered = new Date();
    watered.setDate(watered.getDate() - sample.daysAgo);
    records.push({
      id: 'sample-' + Date.now() + '-' + index,
      sample: true,
      email: 'sample@chorok.kr',
      name: sample.name,
      plant: sample.plant,
      place: sample.place,
      interval: getWaterInterval(sample.plant, sample.place),
      phone: '',
      time: '아침 8시',
      createdAt: new Date().toISOString(),
      lastWatered: toDateKey(watered),
    });
  });

  if (!saveSignupList(records)) {
    setPlantMessage('예시 식물을 저장하지 못했어요. 잠시 후 다시 눌러 주세요.', 'is-error');
    return;
  }

  currentFilter = 'all';
  renderPlantList();
  setPlantMessage('예시 식물 4개를 넣었어요. 위의 버튼을 눌러 물 줄 때별로 골라 보세요.', 'is-success');
  plantMessage.focus();
}

filterButtons.forEach(function (button) {
  button.addEventListener('click', handleFilterClick);
});
plantList.addEventListener('click', handlePlantAction);
sampleButton.addEventListener('click', addSamplePlants);
showAllButton.addEventListener('click', function () {
  selectFilter('all');
});
// 다른 탭에서 신청 기록이 바뀌면 목록도 갱신
window.addEventListener('storage', renderPlantList);
renderPlantList();

/* 9. 모달 (12주차 공통 컴포넌트)
   HTML 약속: <dialog class="modal">, 여는 버튼에 data-modal-open="모달 id",
   닫는 버튼에 data-modal-close, 처음 초점을 받을 요소에 data-modal-focus
   - showModal()로 열어 모달 바깥은 클릭·Tab 이동이 막힘(inert)
   - Esc, 닫기 버튼, 바깥 어두운 영역 클릭으로 닫힘
   - 닫히면 모달을 연 버튼으로 초점이 돌아감 */
function openModal(modal, opener) {
  modal.returnValue = '';
  modal.returnFocus = opener || document.activeElement;
  modal.showModal();
  document.body.classList.add('is-modal-open');

  const first = modal.querySelector('[data-modal-focus]') || modal.querySelector('[data-modal-close]');
  first.focus();
}

// result: 어떤 버튼으로 닫았는지 ('ok' 또는 빈 문자열)
function closeModal(modal, result) {
  modal.close(result || '');
}

// 모든 모달이 함께 쓰는 닫힘 처리: 초점 복귀 → 모달별 후속 동작(afterClose) 실행
function handleModalClose(event) {
  const modal = event.currentTarget;
  document.body.classList.remove('is-modal-open');

  if (modal.returnFocus && modal.returnFocus.isConnected) {
    modal.returnFocus.focus();
  }
  modal.returnFocus = null;

  if (typeof modal.afterClose === 'function') {
    const afterClose = modal.afterClose;
    modal.afterClose = null;
    afterClose(modal.returnValue);
  }
}

// 모달 안: 닫기 버튼 / 바깥 어두운 영역(dialog 자신)을 누르면 닫기
function handleModalClick(event) {
  const modal = event.currentTarget;
  if (event.target === modal || event.target.closest('[data-modal-close]') !== null) {
    closeModal(modal);
  }
}

// 페이지 어디서든 data-modal-open 버튼을 누르면 해당 모달 열기 (이벤트 위임)
function handleModalOpen(event) {
  const opener = event.target.closest('[data-modal-open]');
  if (opener !== null) {
    openModal(document.getElementById(opener.dataset.modalOpen), opener);
  }
}

document.querySelectorAll('.modal').forEach(function (modal) {
  modal.addEventListener('click', handleModalClick);
  modal.addEventListener('close', handleModalClose);
});
document.addEventListener('click', handleModalOpen);

// 확인 모달: 제목·설명·확인 버튼 문구를 바꿔 여러 곳에서 다시 쓸 수 있게
const confirmModal = document.querySelector('#confirm-modal');
const confirmTitle = document.querySelector('#confirm-modal-title');
const confirmText = document.querySelector('#confirm-modal-text');
const confirmOk = document.querySelector('#confirm-modal-ok');
const confirmClose = document.querySelector('#confirm-modal-close');

function askConfirm(options) {
  confirmTitle.textContent = options.title;
  confirmText.textContent = options.text;
  confirmOk.textContent = options.okText;
  confirmClose.setAttribute('aria-label', options.closeLabel || '확인 창 닫기'); // 13주차: 무엇을 닫는지도 쓰는 곳마다 다르게
  confirmModal.afterClose = function (result) {
    if (result === 'ok') {
      options.onConfirm();
    } else if (options.onCancel) {
      options.onCancel();
    }
  };
  openModal(confirmModal, options.opener);
}

confirmOk.addEventListener('click', function () {
  closeModal(confirmModal, 'ok');
});

// 계산 기준 모달의 표: 신청 폼의 식물 목록과 계산 함수로 채움 (값을 두 번 적지 않도록)
function fillIntervalTable() {
  const body = document.querySelector('#interval-table');

  Object.keys(waterDays).forEach(function (plant) {
    const row = document.createElement('tr');
    const name = document.createElement('th');
    name.scope = 'row';
    name.textContent = getPlantTypeName(plant);
    row.append(name);

    [waterDays[plant], getWaterInterval(plant, 'window'), getWaterInterval(plant, 'veranda'), getWaterInterval(plant, 'room')]
      .forEach(function (days) {
        const cell = document.createElement('td');
        cell.textContent = days + '일';
        row.append(cell);
      });
    body.append(row);
  });
}

fillIntervalTable();

/* 10. 아코디언 (12주차 공통 컴포넌트)
   HTML 약속: data-accordion 묶음 안에 .accordion-trigger 버튼(aria-expanded, aria-controls)과
   .accordion-panel(hidden), 상태 문구 .accordion-status, 모두 펼치기 버튼 data-accordion-all
   - 질문을 누르면(Enter·Space 포함) 펼침 ↔ 접힘
   - ↑ ↓ Home End로 질문 사이 이동
   - 펼친 개수와 '모두 펼치기/모두 접기' 문구가 함께 바뀜 */
function setAccordionItem(trigger, open) {
  trigger.setAttribute('aria-expanded', String(open));
  trigger.closest('.accordion-item').classList.toggle('is-open', open);
  trigger.querySelector('.accordion-state').textContent = open ? '접기' : '펼치기';
  document.getElementById(trigger.getAttribute('aria-controls')).hidden = !open;
}

function updateAccordionStatus(accordion) {
  const triggers = accordion.querySelectorAll('.accordion-trigger');
  const openCount = accordion.querySelectorAll('.accordion-trigger[aria-expanded="true"]').length;
  const allButton = accordion.querySelector('[data-accordion-all]');
  const status = accordion.querySelector('.accordion-status');

  if (status !== null) {
    status.textContent = '질문 ' + triggers.length + '개 중 ' + openCount + '개 펼침';
  }
  if (allButton !== null) {
    allButton.textContent = openCount === triggers.length ? '모두 접기' : '모두 펼치기';
  }
}

function initAccordion(accordion) {
  const triggers = Array.from(accordion.querySelectorAll('.accordion-trigger'));

  accordion.addEventListener('click', function (event) {
    const trigger = event.target.closest('.accordion-trigger');
    const allButton = event.target.closest('[data-accordion-all]');

    if (trigger !== null) {
      setAccordionItem(trigger, trigger.getAttribute('aria-expanded') !== 'true');
    } else if (allButton !== null) {
      const openAll = allButton.textContent.trim() === '모두 펼치기';
      triggers.forEach(function (item) {
        setAccordionItem(item, openAll);
      });
    } else {
      return;
    }
    updateAccordionStatus(accordion);
  });

  accordion.addEventListener('keydown', function (event) {
    const index = triggers.indexOf(event.target.closest('.accordion-trigger'));
    const next = getMoveIndex(event.key, index, triggers.length, 'ArrowUp', 'ArrowDown');
    if (index === -1 || next === -1) {
      return;
    }
    event.preventDefault();
    triggers[next].focus();
  });

  triggers.forEach(function (trigger) {
    setAccordionItem(trigger, trigger.getAttribute('aria-expanded') === 'true');
  });
  updateAccordionStatus(accordion);
}

document.querySelectorAll('[data-accordion]').forEach(initAccordion);

/* 11. 작성 중인 신청 임시 보관과 복구 (13주차)
   - 입력값·선택값·진행 단계를 sessionStorage에 보관: 같은 탭을 새로고침하면 남고, 탭을 닫으면 지워짐
   - 페이지를 열 때 보관한 내용이 있으면 작성 중이던 단계 화면과 안내를 복구
   - 신청에 성공하거나 처음부터 다시 작성하면 임시값 삭제 (신청 기록은 localStorage에 따로 저장) */
const draftKey = 'chorok-signup-draft';
const draftVersion = 1;

const draftBar = document.querySelector('#draft-bar');
const draftRestoredText = document.querySelector('#draft-restored');
const draftSavedText = document.querySelector('#draft-saved');
const draftContinue = document.querySelector('#draft-continue');
const draftRestart = document.querySelector('#draft-restart');

let draftSavedAt = ''; // 마지막으로 임시 보관한 시각
let draftCleared = false; // 방금 '처음부터 다시 작성'으로 지웠는지 (지웠다는 안내를 보여 주는 중)

// 지금 화면의 입력값·선택값·진행 단계 모으기
function collectDraft() {
  return {
    version: draftVersion,
    step: currentStep,
    name: signupName.value,
    type: signupType.value,
    place: getChecked(signupPlace),
    email: signupEmail.value,
    sms: signupSms.checked,
    phone: signupPhone.value,
    time: getChecked(signupTime),
    customTime: signupCustomTime.value,
    agree: signupAgree.checked,
    foundPlant: foundPlant,
    finderOpen: !finder.hidden,
    finderQuery: finderInput.value,
    finderSearched: finderStatus.textContent !== '',
    savedAt: new Date().toISOString(),
  };
}

// 입력하거나 고른 값이 하나라도 있는지 (진행 단계는 빼고)
function hasDraftValues(draft) {
  return (
    draft.name !== '' || draft.type !== '' || draft.place !== '' || draft.email !== '' ||
    draft.phone !== '' || draft.time !== '' || draft.customTime !== '' || draft.sms || draft.agree
  );
}

// 보관한 내용 읽기 (없거나 깨졌으면 null)
function readDraft() {
  let draft = null;
  try {
    draft = JSON.parse(sessionStorage.getItem(draftKey));
  } catch (error) {
    // 저장소를 쓸 수 없거나 내용이 깨졌으면 보관한 내용이 없는 것으로 처리
  }
  if (draft === null || typeof draft !== 'object' || draft.version !== draftVersion) {
    return null;
  }
  return draft;
}

// "2026-11-23T05:10:00.000Z" → "오후 2시 10분" (날짜가 아니면 빈 문자열)
function formatSavedTime(savedAt) {
  const date = new Date(savedAt);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return formatTime(hour + ':' + minute);
}

// 문구가 바뀔 때만 다시 써서 화면 낭독기가 같은 안내를 되풀이해 읽지 않게
function setText(target, text) {
  if (target.textContent !== text) {
    target.textContent = text;
  }
}

// 임시 보관 표시줄 갱신. state: 'saved'(보관됨) · 'off'(보관할 수 없음) · ''(보관한 내용 없음 → 숨김)
// 복구 직후(draftRestored)에는 복구 안내와 '안내 닫기' 버튼을 함께 보여 줌
// 방금 지운 직후(draftCleared)에는 숨기는 대신 지웠다는 안내를 보여 줌 (사용자 테스트 1차 뒤 추가)
function updateDraftBar(state) {
  const time = formatSavedTime(draftSavedAt);
  let savedText = '';

  let noticeText = ''; // role="status" 문단에 넣어 화면 낭독기도 읽게 하는 안내

  if (state === '' && draftCleared) {
    state = 'cleared';
    noticeText = '작성하던 내용을 모두 지웠어요. 처음부터 다시 작성할 수 있어요. 신청을 끝낸 식물은 내 식물 목록에 그대로 있어요.';
  }

  if (state === 'saved') {
    savedText =
      '임시 보관됨' + (time === '' ? '' : ' · ' + time) +
      ' · 이 탭을 새로고침해도 이어서 작성할 수 있어요.';
  } else if (state === 'off') {
    savedText =
      '이 브라우저에서는 작성 내용을 임시 보관할 수 없어요. 새로고침하거나 탭을 닫으면 입력한 내용이 사라져요.';
  }

  const showRestored = draftRestored && state === 'saved';
  draftBar.hidden = state === '';
  draftBar.className = 'draft-bar' + (state === '' ? '' : ' is-' + state) + (showRestored ? ' is-restored' : '');
  setText(draftSavedText, savedText);
  draftContinue.hidden = !showRestored;
  draftRestart.hidden = state === 'cleared'; // 지운 직후에는 다시 지울 내용이 없음
  if (!showRestored) {
    setText(draftRestoredText, noticeText);
  }
}

// 임시 보관: 값을 입력·선택하거나 단계가 바뀔 때마다 호출
function saveDraft() {
  if (isRestoring) {
    return;
  }

  const draft = collectDraft();

  // 완료 화면이거나 아무것도 입력·선택하지 않았으면 보관할 내용이 없음
  // (사용자 테스트 1차 뒤 변경: 빈 화면에 '임시 보관됨'이 떠서 무엇이 보관됐는지 헷갈리지 않게)
  if (currentStep === doneStep || !hasDraftValues(draft)) {
    clearDraft();
    return;
  }

  try {
    sessionStorage.setItem(draftKey, JSON.stringify(draft));
  } catch (error) {
    // 저장소 차단·용량 부족: 보관하지 못한다는 것을 알림
    draftCleared = false;
    updateDraftBar('off');
    return;
  }
  draftSavedAt = draft.savedAt;
  draftCleared = false; // 새로 입력하기 시작하면 지웠다는 안내 대신 보관 표시
  updateDraftBar('saved');
}

// 임시값 삭제: 신청에 성공했을 때와 처음부터 다시 작성할 때
function clearDraft() {
  try {
    sessionStorage.removeItem(draftKey);
  } catch (error) {
    // 저장소를 쓸 수 없으면 지울 내용도 없음
  }
  draftSavedAt = '';
  draftRestored = false;
  if (currentStep === doneStep) {
    draftCleared = false; // 완료 화면에서는 지웠다는 안내를 남기지 않음
  }
  updateDraftBar('');
}

// 보관한 값이 글자가 아니거나 너무 길면 걸러 냄
function draftText(value, max) {
  if (typeof value !== 'string') {
    return '';
  }
  return value.slice(0, max);
}

// 라디오 버튼 묶음에서 값이 같은 항목을 선택 (없는 값이면 아무것도 선택하지 않음)
function setChecked(group, value) {
  group.querySelectorAll('input[type="radio"]').forEach(function (input) {
    input.checked = input.value === value;
  });
}

// 그 단계의 보이는 항목이 모두 조건에 맞는지 (오류 표시는 하지 않고 확인만)
function isStepComplete(step) {
  return Array.from(flowSteps[step].querySelectorAll('.flow-field')).every(function (field) {
    return field.hidden || validators[field.dataset.field]() === '';
  });
}

// 페이지를 열 때: 보관한 내용이 있으면 입력값·선택값·진행 단계·안내를 복구
function restoreDraft() {
  const draft = readDraft();
  if (draft === null) {
    clearDraft();
    return;
  }

  isRestoring = true;

  // 입력값·선택값 (선택 항목은 화면에 있는 값일 때만)
  const type = draftText(draft.type, 20);
  const hasType = Array.from(signupType.options).some(function (option) {
    return option.value === type;
  });
  signupName.value = draftText(draft.name, 60);
  signupType.value = hasType ? type : '';
  setChecked(signupPlace, draft.place);
  signupEmail.value = draftText(draft.email, 254);
  signupSms.checked = draft.sms === true;
  signupPhone.value = formatPhone(onlyDigits(draftText(draft.phone, 20)).slice(0, 11));
  setChecked(signupTime, draft.time);
  signupCustomTime.value = draftText(draft.customTime, 5);
  signupAgree.checked = draft.agree === true;

  // 값에 따라 달라지는 화면: 조건부 입력 영역, 글자 수, 입력 확인 문구
  updateConditionalFields();
  updateNameCount();
  updateEmailCheck();
  updatePhoneCheck();

  // 생김새로 찾기: 찾아서 고른 식물 안내, 열려 있던 찾기 영역과 검색 결과
  if (signupType.value !== '' && draft.foundPlant === signupType.value) {
    foundPlant = signupType.value;
    showFoundNote(foundPlant);
  }
  finderInput.value = draftText(draft.finderQuery, 40);
  if (draft.finderOpen === true) {
    openFinder(false);
    if (draft.finderSearched === true && finderInput.value.trim() !== '') {
      searchPlants();
    }
  }

  // 진행 단계: 앞 단계에 빈 칸이나 오류가 있으면 그 단계부터 (보관한 내용이 깨졌어도 빈 확인 화면이 열리지 않게)
  let step = 0;
  if (Number.isInteger(draft.step) && draft.step >= 0 && draft.step <= confirmStep) {
    step = draft.step;
  }
  for (let before = 1; before < step; before += 1) {
    if (!isStepComplete(before)) {
      step = before;
      break;
    }
  }
  if (step === confirmStep) {
    fillSummary();
  }
  showStep(step, false);

  isRestoring = false;

  // 안내: 무엇을 불러왔는지, 아직 신청 전이라는 것, 어디서부터 이어서 하면 되는지
  const plantName = signupName.value.trim();
  let message = '작성 중이던 ' + (plantName === '' ? '' : '‘' + plantName + '’ ') + '알림 신청을 불러왔어요. 아직 신청이 끝나지 않았어요. ';
  if (step === 0) {
    message += '‘등록 시작하기’를 누르면 입력한 내용이 그대로 있어요.';
  } else if (step === confirmStep) {
    // 확인 단계는 더 입력할 것이 없으므로 다음에 누를 버튼을 알려 줌 (사용자 테스트 1차 뒤 변경)
    message += '내용을 확인하고 아래 ‘' + signupSubmit.textContent.trim() + '’를 누르면 신청이 끝나요.';
  } else {
    message += step + '단계 ‘' + progressItems[step - 1].textContent.trim() + '’부터 이어서 작성해 주세요.';
  }

  draftSavedAt = draftText(draft.savedAt, 30);
  draftRestored = true;
  updateDraftBar('saved');
  setText(draftRestoredText, message);
}

// 복구한 직후: 신청 영역을 보고 있었다면 복구 안내가 보이게 하고 초점을 안내로 옮김
// (다른 영역을 보다가 새로고침했다면 보던 위치를 그대로 둠)
function revealDraftBar() {
  // 이미 안내로 옮겼거나 사용자가 다른 곳을 조작하기 시작했으면 건드리지 않음
  if (!draftRestored || document.activeElement !== document.body) {
    return;
  }

  const area = signupForm.getBoundingClientRect();
  if (area.bottom <= 0 || area.top >= window.innerHeight) {
    return;
  }

  draftRestoredText.focus({ preventScroll: true });

  const bar = draftBar.getBoundingClientRect();
  if (bar.top < topbar.offsetHeight || bar.bottom > window.innerHeight) {
    draftBar.scrollIntoView({ block: 'start', behavior: 'instant' });
  }
}

// '안내 닫기': 복구 안내를 접고 작성 중이던 단계 제목으로 초점 이동 (누르지 않아도 그대로 이어서 작성할 수 있음)
function continueDraft() {
  draftRestored = false;
  updateDraftBar('saved');
  flowSteps[currentStep].querySelector('h3').focus();
}

// '처음부터 다시 작성': 입력한 값이 있으면 지우기 전에 확인 모달을 먼저 띄움
function askRestart() {
  // 신청하는 중에는 지우지 않음
  if (isSubmitting) {
    return;
  }

  if (!hasDraftValues(collectDraft())) {
    restartSignup();
    return;
  }

  askConfirm({
    opener: draftRestart,
    title: '작성하던 내용을 지우고 처음부터 다시 할까요?',
    text: '지금 작성하던 식물 정보와 알림 설정(이메일·전화번호·시간)이 모두 지워지고 되돌릴 수 없어요. 이미 신청을 끝낸 식물은 내 식물 목록에 그대로 남아요.',
    okText: '지우고 다시 시작',
    closeLabel: '다시 작성 확인 창 닫기',
    onConfirm: function () {
      draftCleared = true; // 시작 화면에 지웠다는 안내를 보여 줌
      restartSignup();
    },
  });
}

draftContinue.addEventListener('click', continueDraft);
draftRestart.addEventListener('click', askRestart);

restoreDraft();

// 브라우저가 새로고침 전 스크롤 위치를 되돌린 다음에 복구 안내 위치를 확인
// (스크롤 위치를 조금 늦게 되돌리는 경우를 위해 잠시 뒤 한 번 더 확인)
window.addEventListener('pageshow', function (event) {
  if (draftRestored && !event.persisted) {
    requestAnimationFrame(revealDraftBar);
    setTimeout(revealDraftBar, 400);
  }
});
