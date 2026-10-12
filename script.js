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

/* 1. 주요 기능 탭 */
const tabs = document.querySelectorAll('.tab');
const tabPanels = document.querySelectorAll('.tab-panel');

// 누른 탭만 선택 상태로 바꾸고, 연결된 내용만 보이기
function showTab(event) {
  const selectedTab = event.currentTarget;
  const panelId = selectedTab.getAttribute('aria-controls');

  tabs.forEach(function (tab) {
    const isSelected = tab === selectedTab;
    tab.classList.toggle('is-active', isSelected);
    tab.setAttribute('aria-selected', isSelected);
  });

  tabPanels.forEach(function (panel) {
    panel.hidden = panel.id !== panelId;
  });
}

tabs.forEach(function (tab) {
  tab.addEventListener('click', showTab);
});

/* 2. 물주기 간격 계산 */
const plantTypeSelect = document.querySelector('#plant-type');
const placeSelect = document.querySelector('#plant-place');
const waterButton = document.querySelector('#water-button');
const waterResult = document.querySelector('#water-result');

// 식물별 기본 물주기 간격(일)과 자리별 보정 비율
const waterDays = { monstera: 7, scindapsus: 5, fern: 3, succulent: 14, stuckyi: 21 };
const placeRatio = { window: 0.8, veranda: 1, room: 1.2 };

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

  waterInterval = Math.round(waterDays[plant] * placeRatio[place]);
  waterButton.disabled = false;
  showMessage(
    waterResult,
    waterInterval + '일마다 물을 주면 좋아요. 오늘 물을 줬다면 버튼을 눌러 기록해 주세요.',
    'info'
  );
}

// 물 준 날을 기록하고 다음 물주기 날짜 안내
function handleWater() {
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + waterInterval);

  waterButton.textContent = '물주기 완료';
  waterButton.disabled = true;
  showMessage(
    waterResult,
    '기록했어요! 다음 물주기는 ' + formatDate(nextDate) + '이에요.',
    'success'
  );
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
    text: '건강한 상태예요. 지금처럼 물주기 일정을 지켜 주세요.',
  },
  yellow: {
    type: 'error',
    text: '과습이 의심돼요. 겉흙이 마를 때까지 물을 멈추고 화분 받침의 물을 버려 주세요.',
  },
  brown: {
    type: 'warning',
    text: '물이나 습도가 부족해요. 흙이 말랐는지 손가락으로 확인하고 잎에 분무해 주세요.',
  },
  pale: {
    type: 'warning',
    text: '빛이 부족해요. 창가로 옮겨 하루 4시간 이상 밝은 빛을 받게 해 주세요.',
  },
  bugs: {
    type: 'error',
    text: '해충일 수 있어요. 다른 식물과 떨어뜨리고 젖은 휴지로 잎 앞뒤를 닦아 주세요.',
  },
};

// 고른 증상에 맞는 진단 결과 보여 주기
function handleSymptom(event) {
  const diagnosis = diagnoses[event.target.value];
  showMessage(diagnosisResult, diagnosis.text, diagnosis.type);
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
}

memoInput.addEventListener('input', handleMemoInput);
diaryButton.addEventListener('click', addDiary);

/* 5. 물주기 알림 신청 폼 */
const form = document.querySelector('#subscribe-form');
const plantInput = document.querySelector('#plant-name');
const emailInput = document.querySelector('#email');
const submitButton = document.querySelector('#subscribe-button');
const formMessage = document.querySelector('#form-message');

const buttonText = '물주기 알림 받기';

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
    showMessage(formMessage, '어떤 식물을 키우는지 이름을 알려 주세요.', 'error');
    markInvalid(plantInput);
    return;
  }

  if (email === '') {
    showMessage(formMessage, '일정을 받을 이메일 주소를 입력해 주세요.', 'error');
    markInvalid(emailInput);
    return;
  }

  if (!emailInput.checkValidity() || !email.includes('.')) {
    showMessage(formMessage, '이메일 주소 형식을 확인해 주세요. 예: green@example.com', 'error');
    markInvalid(emailInput);
    return;
  }

  showMessage(
    formMessage,
    plantName + '의 첫 물주기 일정을 ' + email + ' 주소로 보내 드릴게요.',
    'success'
  );
  submitButton.textContent = '신청 완료';
  submitButton.disabled = true;
}

// 다시 입력하면 오류 표시와 버튼 상태 초기화
function handleInput(event) {
  event.target.classList.remove('is-invalid');
  showMessage(formMessage, '', '');
  submitButton.textContent = buttonText;
  submitButton.disabled = false;
}

form.addEventListener('submit', handleSubmit);
plantInput.addEventListener('input', handleInput);
emailInput.addEventListener('input', handleInput);
