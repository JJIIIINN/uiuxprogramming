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

/* 5. 물주기 알림 신청 흐름: 시작 → 내 식물 → 알림 받기 → 확인 → 완료 */
const signupForm = document.querySelector('#signup-form');
const flowSteps = document.querySelectorAll('.flow-step');
const progressItems = document.querySelectorAll('.flow-progress li');

const signupName = document.querySelector('#signup-name');
const signupType = document.querySelector('#signup-type');
const signupPlace = document.querySelector('#signup-place');
const signupEmail = document.querySelector('#signup-email');
const signupTime = document.querySelector('#signup-time');
const signupAgree = document.querySelector('#signup-agree');
const restartButton = document.querySelector('#restart-button');

const summaryName = document.querySelector('#summary-name');
const summaryType = document.querySelector('#summary-type');
const summaryPlace = document.querySelector('#summary-place');
const summaryInterval = document.querySelector('#summary-interval');
const summaryEmail = document.querySelector('#summary-email');
const summaryTime = document.querySelector('#summary-time');
const summaryFirst = document.querySelector('#summary-first');
const doneMessage = document.querySelector('#done-message');

const placeNames = {
  window: '햇빛 드는 창가',
  veranda: '바람 통하는 베란다',
  room: '빛이 적은 방 안',
};
const timeNames = { morning: '아침 8시', noon: '낮 12시', evening: '저녁 8시' };

const confirmStep = 3;
const doneStep = 4;
let currentStep = 0;

// 라디오 버튼 묶음에서 고른 값 (고르지 않았으면 빈 문자열)
function getChecked(group) {
  const checked = group.querySelector('input:checked');
  if (checked === null) {
    return '';
  }
  return checked.value;
}

// 해당 단계 화면만 보이고 진행 표시 갱신
function showStep(step) {
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

  flowSteps[step].querySelector('h3').focus();
}

// 항목 아래에 고치는 방법 안내 (message가 빈 문자열이면 오류 지우기)
function setFieldError(control, message) {
  const field = control.closest('.flow-field');
  field.classList.toggle('is-invalid', message !== '');
  field.querySelector('.field-error').textContent = message;
}

// 값이 비어 있으면 오류 안내, 있으면 오류 지우기
function requireValue(control, value, message) {
  if (value === '') {
    setFieldError(control, message);
  } else {
    setFieldError(control, '');
  }
}

// 현재 단계의 필수 입력·선택 확인 (빠진 항목이 있으면 false)
function validateStep(step) {
  if (step === 1) {
    requireValue(signupName, signupName.value.trim(), '식물 이름을 입력해 주세요. 예: 몬스테라 몽이');
    requireValue(signupType, signupType.value, '식물 종류를 골라 주세요. 종류를 모르면 아래 생김새로 찾기를 눌러 보세요.');
    requireValue(signupPlace, getChecked(signupPlace), '식물을 놓아둔 자리를 하나 골라 주세요.');
  }

  if (step === 2) {
    const email = signupEmail.value.trim();

    if (email === '') {
      setFieldError(signupEmail, '알림 받을 이메일 주소를 입력해 주세요.');
    } else if (!signupEmail.checkValidity() || !email.includes('.')) {
      setFieldError(signupEmail, '이메일 주소 형식을 확인해 주세요. 예: green@example.com');
    } else {
      setFieldError(signupEmail, '');
    }

    requireValue(signupTime, getChecked(signupTime), '알림 받을 시간을 하나 골라 주세요.');
  }

  if (step === confirmStep) {
    if (signupAgree.checked) {
      setFieldError(signupAgree, '');
    } else {
      setFieldError(signupAgree, '알림 메일을 받으려면 수신 동의에 체크해 주세요.');
    }
  }

  // 빠진 항목이 있으면 첫 번째 항목으로 커서 이동
  const firstError = flowSteps[step].querySelector('.flow-field.is-invalid');
  if (firstError !== null) {
    firstError.querySelector('input, select').focus();
    return false;
  }
  return true;
}

// 지금 입력·선택된 값으로 확인 화면 채우기
function fillSummary() {
  const plant = signupType.value;
  const place = getChecked(signupPlace);
  const time = getChecked(signupTime);
  const interval = getWaterInterval(plant, place);

  summaryName.textContent = signupName.value.trim();
  summaryType.textContent = signupType.options[signupType.selectedIndex].text;
  if (foundPlant !== '' && foundPlant !== 'foliage' && plant === foundPlant) {
    summaryType.textContent += ' (생김새로 찾음)';
  }
  summaryPlace.textContent = placeNames[place];
  summaryInterval.textContent = interval + '일마다';
  summaryEmail.textContent = signupEmail.value.trim();
  summaryTime.textContent = timeNames[time];
  summaryFirst.textContent = formatDate(getDateAfter(interval)) + ' ' + timeNames[time];
}

// 다음·알림 신청하기 버튼(또는 Enter)으로 제출했을 때
function handleFlowSubmit(event) {
  event.preventDefault();

  // 식물 찾기 입력창에서 누른 Enter는 다음 단계가 아니라 검색으로 처리
  if (document.activeElement === finderInput) {
    return;
  }

  if (!validateStep(currentStep)) {
    return;
  }

  if (currentStep === confirmStep) {
    doneMessage.textContent =
      summaryName.textContent + '의 첫 물주기 알림을 ' + summaryFirst.textContent +
      '에 ' + summaryEmail.textContent + ' 주소로 보내 드릴게요.';
    showStep(doneStep);
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
  if (button === null) {
    return;
  }
  showStep(Number(button.dataset.goto));
}

// 오류가 표시된 항목을 고치면 그 항목의 오류 안내 지우기
function clearFieldError(event) {
  const field = event.target.closest('.flow-field');
  if (field !== null && field.classList.contains('is-invalid')) {
    setFieldError(event.target, '');
  }
}

// 처음부터 다시: 입력·선택·오류·확인 내용·진행 상태 모두 초기화
function restartSignup() {
  signupForm.reset();

  signupForm.querySelectorAll('.flow-field').forEach(function (field) {
    field.classList.remove('is-invalid');
    field.querySelector('.field-error').textContent = '';
  });

  signupForm.querySelectorAll('.summary dd').forEach(function (item) {
    item.textContent = '';
  });
  doneMessage.textContent = '';
  resetFinder();

  showStep(0);
}

signupForm.addEventListener('submit', handleFlowSubmit);
signupForm.addEventListener('click', handleFlowClick);
signupForm.addEventListener('input', clearFieldError);
signupForm.addEventListener('change', clearFieldError);
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

function openFinder() {
  finder.hidden = false;
  finderToggle.setAttribute('aria-expanded', 'true');
  finderInput.focus();
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
}

function toggleFinder() {
  if (finder.hidden) {
    openFinder();
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
}

// 한글 입력 중(조합 중) Enter는 무시하고, 입력이 끝난 Enter로 검색
function handleFinderKey(event) {
  if (event.key === 'Enter' && !event.isComposing) {
    event.preventDefault();
    searchPlants();
  }
}

// 고른 식물을 신청 흐름의 식물 종류에 반영하고 찾기 닫기
function pickPlant(value) {
  signupType.value = value;
  foundPlant = value;
  setFieldError(signupType, '');
  closeFinder();

  if (value === 'foliage') {
    setTypeNote('목록에 없는 식물이라 기타 관엽식물(기본 7일마다)로 등록했어요.', 'success');
  } else {
    const plantName = signupType.options[signupType.selectedIndex].text;
    setTypeNote(
      '생김새로 찾은 식물: ' + plantName + ' · 기본 ' + waterDays[value] + '일마다 물주기',
      'success'
    );
  }
  signupType.focus();
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
