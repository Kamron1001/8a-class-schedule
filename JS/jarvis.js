// JS/jarvis.js — голосовой ассистент "Нова" (обновлённый)

// элементы страницы
const jarvisBtn = document.getElementById("jarvis-btn");
const todayEl = document.getElementById("today");

// speech
const synth = window.speechSynthesis;
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
let lastAnswer = "";

// флаг: если true — после ответа автоматически снова слушаем (позволяет задать следующий вопрос)
let shouldAutoRestart = false;
// id таймаута авто-стопа прослушивания
let recognitionTimeoutId = null;
// длительность прослушивания в миллисекундах (был 5000, увеличил на +2s по просьбе)
const LISTEN_DURATION = 7000;

// варианты имени активации
const wakeNames = ["нова", "nova", "новва", "новочка", "нов"];

// ======= Utilities =======
function normalizeText(s){
  return (s||"").toLowerCase()
    .replace(/[.,!?;:()"]/g,"")
    .replace(/ё/g,"е")
    .replace(/\s+/g," ")
    .trim();
}

function levenshtein(a,b){
  if(a===b) return 0;
  const al=a.length, bl=b.length;
  if(al===0) return bl;
  if(bl===0) return al;
  const v0 = new Array(bl+1), v1 = new Array(bl+1);
  for(let j=0;j<=bl;j++) v0[j]=j;
  for(let i=0;i<al;i++){
    v1[0]=i+1;
    for(let j=0;j<bl;j++){
      const cost = a[i]===b[j] ? 0 : 1;
      v1[j+1] = Math.min(v1[j]+1, v0[j+1]+1, v0[j]+cost);
    }
    for(let j=0;j<=bl;j++) v0[j]=v1[j];
  }
  return v1[bl];
}
function fuzzyEqual(a,b,thresh=2){
  if(!a || !b) return false;
  a = normalizeText(a);
  b = normalizeText(b);
  const d = levenshtein(a,b);
  return d <= thresh;
}
// Проверка: содержит ли текст хотя бы одно из слов (fuzzy по-словам)
function containsWordFuzzy(text, words){
  if(!text || !words) return false;
  const t = normalizeText(text);
  for(const w of words){
    const nw = normalizeText(w);
    if(nw === "") continue;
    if(t.includes(nw)) return true;
    const parts = t.split(" ");
    for(const p of parts){
      if(fuzzyEqual(p, nw)) return true;
    }
  }
  return false;
}

// ======= Расписание =======
const schedule = {
  "понедельник": ["Час Будущего","Китайский язык","Алгебра","Технология","География","Узбекский язык"],
  "вторник": ["Физкультура","Китайский язык","Геометрия","Химия","Черчение"],
  "среда": ["Русский язык","История","Информатика","Госправо","Физкультура"],
  "четверг": ["Биология","Китайский язык","Физика","Химия","История","Узбекский язык"],
  "пятница": ["Алгебра","Биология","Узбекский язык","Геометрия","Литература","Воспитание"],
  "суббота": ["Русский язык","История","Литература","География","Физика"],
  "воскресенье": ["Выходной"]
};

function getDayName(offset=0){
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const map = ["воскресенье","понедельник","вторник","среда","четверг","пятница","суббота"];
  return map[d.getDay()];
}
function getLessonsArray(day){
  const k = (day||"").toLowerCase();
  return schedule[k] ? schedule[k].slice() : null;
}
function getLessonsText(day){
  const arr = getLessonsArray(day);
  return arr ? arr.join(", ") : null;
}

// Поиск предмета по расписанию — возвращает массив строк вида "понедельник — 2 урок"
function findSubject(subject){
  const normSubj = normalizeText(subject);
  const found = [];
  for(const [day, lessons] of Object.entries(schedule)){
    lessons.forEach((l, idx) => {
      if(normalizeText(l).includes(normSubj) || fuzzyEqual(normalizeText(l).split(" ")[0], normSubj, 2)){
        found.push(`${day} — ${idx+1} урок (${l})`);
      }
    });
  }
  return found;
}

// ======= Голос =======
let preferredVoice = null;
function pickVoice(){
  const voices = synth.getVoices();
  if(!voices || voices.length === 0) return;
  preferredVoice = voices.find(v => v.lang && v.lang.startsWith("ru") &&
    (v.name.toLowerCase().includes("google") ||
     v.name.toLowerCase().includes("svetlana") ||
     v.name.toLowerCase().includes("anna") ||
     v.name.toLowerCase().includes("alyona")));
  if(!preferredVoice) preferredVoice = voices.find(v => v.lang && v.lang.startsWith("ru"));
}
if(typeof speechSynthesis !== "undefined" && speechSynthesis.onvoiceschanged !== undefined){
  speechSynthesis.onvoiceschanged = pickVoice;
}
pickVoice();

function speak(text, opts = {}) {
  if(!text) return;
  lastAnswer = text;
  try { if(synth.speaking) synth.cancel(); } catch(e){}
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "ru-RU";
  if(preferredVoice) u.voice = preferredVoice;
  u.rate = typeof opts.rate === "number" ? opts.rate : 1.02;   // чуть живее
  u.pitch = typeof opts.pitch === "number" ? opts.pitch : 1.05;
  u.volume = typeof opts.volume === "number" ? opts.volume : 1;

  // Когда Нова закончит говорить — если нужно, автоматически снова слушаем
  u.onend = () => {
    // показываем последний ответ в интерфейсе
    if(todayEl) todayEl.textContent = lastAnswer;

    if(shouldAutoRestart){
      // даём короткую паузу перед повторным прослушиванием
      setTimeout(()=>{
        try {
          if(recognition){
            recognition.start();
            // ставим ограничитель прослушивания
            clearTimeout(recognitionTimeoutId);
            recognitionTimeoutId = setTimeout(()=>{
              try{ recognition.stop(); }catch(e){}
            }, LISTEN_DURATION);
          }
        } catch(e){}
      }, 300); // пауза 300ms чтобы микрофон/двойные события не конфликтовали
    }
  };

  synth.speak(u);
  if(todayEl) todayEl.textContent = text;
}

// ======= Основной парсер команд (приоритеты исправлены) =======
function handleCommand(rawText, invokedByButton = false){
  if(!rawText) return;
  let text = normalizeText(rawText);

  // убираем имя активации, если сказали
  for(const n of wakeNames){
    const re = new RegExp("\\b"+n+"\\b","i");
    if(re.test(text)){
      text = text.replace(re,"").trim();
      break;
    }
  }

  if(text.length === 0){
    speak("Я слушаю.");
    return;
  }

  // ключевые наборы слов
  const lessonWords = ["урок","уроки","расписани","занятие","предмет","предметы"];
  const timeWords = ["время","который час","час"];
  const dateWords = ["дата","число","сегодня","день"];
  const tomorrowWords = ["завтра","завтраш"];
  const whenWords = ["когда","в какие","в какие дни","какой день","где","на какой паре","который урок"];

  // если явно спрашивают время
  if(containsWordFuzzy(text, timeWords)){
    const now = new Date();
    speak(`Сейчас ${now.getHours()} часов ${now.getMinutes()} минут.`);
    return;
  }

  // если явно спрашивают дату
  if(containsWordFuzzy(text, dateWords) && !containsWordFuzzy(text, lessonWords)){
    const now = new Date();
    const months = ["января","февраля","марта","апреля","мая","июня","июля","августа","сентября","октября","ноября","декабря"];
    speak(`Сегодня ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()} года.`);
    return;
  }

  // Сначала проверяем — пользователь спрашивает про конкретный предмет (когда/в какие дни)
  // Спектр возможных предметов (можешь дополнять)
  const subjects = [
    "алгебра","геометрия","химия","физика","биология","литература","история",
    "русский","узбекский","китайский","информатика","физкультура","черчение",
    "технология","география","воспитание","час будущего","госправо"
  ];
  for(const subj of subjects){
    if(containsWordFuzzy(text, [subj])){
      // если в запросе есть слова "когда/в какие", то ответим расписанием предмета
      if(containsWordFuzzy(text, whenWords) || containsWordFuzzy(text, ["когда","в какие","когда у нас"])){
        const found = findSubject(subj);
        if(found.length > 0){
          speak(`${capitalize(subj)} проходит: ${found.join("; ")}.`);
        } else {
          speak(`Я не нашла ${subj} в расписании.`);
        }
        return;
      }
      // Иначе: если пользователь просто сказал предмет (например "алгебра"), тоже покажем где он есть
      const found = findSubject(subj);
      if(found.length > 0){
        speak(`${capitalize(subj)}: ${found.join("; ")}.`);
      } else {
        speak(`Не нашла ${subj} в расписании.`);
      }
      return;
    }
  }

  // Теперь — запросы про расписание/уроки с указанием "завтра / сегодня / день недели"
  // 1) если есть и "уроки" и "завтра" -> завтра
  if(containsWordFuzzy(text, lessonWords) && containsWordFuzzy(text, tomorrowWords)){
    const d = getDayName(1);
    const lessons = getLessonsText(d);
    if(lessons) speak(`Завтра (${d}): ${lessons}.`);
    else speak(`Нет данных на ${d}.`);
    return;
  }

  // 2) если есть "уроки" + указание конкретного дня (например "в пятницу" / "в пятницу какие уроки")
  for(const dayKey of Object.keys(schedule)){
    if(containsWordFuzzy(text, [dayKey]) && containsWordFuzzy(text, lessonWords)){
      const lessons = getLessonsText(dayKey);
      if(lessons) speak(`В ${dayKey}: ${lessons}.`);
      else speak(`Нет данных на ${dayKey}.`);
      return;
    }
  }

  // 3) если есть "уроки" + "сегодня" -> сегодня
  if(containsWordFuzzy(text, lessonWords) && containsWordFuzzy(text, ["сегодня","сегодняшн","что сегодня"])){
    const d = getDayName(0);
    const lessons = getLessonsText(d);
    if(lessons) speak(`Сегодня (${d}): ${lessons}.`);
    else speak(`Нет данных на ${d}.`);
    return;
  }

  // 4) если сказали просто "уроки" без дня — по умолчанию показываем сегодня
  if(containsWordFuzzy(text, lessonWords)){
    const d = getDayName(0);
    const lessons = getLessonsText(d);
    if(lessons) speak(`Сегодня (${d}): ${lessons}.`);
    else speak("Не могу найти расписание.");
    return;
  }

  // 5) открыть секцию (если есть слова типа "открой/покажи" + день)
  if(containsWordFuzzy(text, ["открой","покажи","перейди","показать"]) ){
    for(const dayKey of Object.keys(schedule)){
      if(containsWordFuzzy(text, [dayKey])){
        const elIdMap = {
          "понедельник":"Понедельник1",
          "вторник":"Вторник2",
          "среда":"Среда3",
          "четверг":"Четверг4",
          "пятница":"Пятница5",
          "суббота":"Субота6"
        };
        const id = elIdMap[dayKey];
        if(id){
          const el = document.getElementById(id);
          if(el){
            el.scrollIntoView({behavior:"smooth", block:"center"});
            speak(`Открываю ${dayKey}.`);
            return;
          } else {
            speak(`Секция ${dayKey} не найдена на странице.`);
            return;
          }
        }
      }
    }
    speak("К какому дню открыть расписание?");
    return;
  }

  // fallback
  speak("Извини, не поняла. Спроси: «Нова, какие уроки завтра?» или «Нова, когда алгебра?»");
}

// вспомогательные
function capitalize(s){ if(!s) return s; return s.charAt(0).toUpperCase() + s.slice(1); }

// ======= SpeechRecognition =======
function initRecognition(){
  if(!SpeechRecognition){
    alert("Ваш браузер не поддерживает Web Speech API. Откройте сайт в Chrome/Яндекс.");
    return;
  }
  recognition = new SpeechRecognition();
  recognition.lang = "ru-RU";
  recognition.interimResults = false;
  recognition.continuous = false;

  recognition.onstart = () => {
    if(jarvisBtn) jarvisBtn.classList.add("listening");
    if(todayEl) todayEl.textContent = "Слушаю...";
  };

  recognition.onresult = (ev) => {
    // получаем последний распознанный фрагмент
    const text = ev.results[ev.results.length-1][0].transcript;
    console.log("Распознано:", text);
    // остановим авто-стоп (мы уже получили результат)
    clearTimeout(recognitionTimeoutId);
    // Обработаем команду. Ставим shouldAutoRestart = true чтобы после ответа снова слушать
    // (если пользователь нажал кнопку — оставляем авто-повтор включённым)
    handleCommand(text, true);
  };

  recognition.onerror = (err) => {
    console.warn("SpeechRecognition error:", err);
    // показываем ошибку пользователю устно и в поле
    speak("Ошибка распознавания речи. Проверь доступ к микрофону.");
    clearTimeout(recognitionTimeoutId);
  };

  recognition.onend = () => {
    // завершение распознавания (обычно сразу после результата или по таймауту)
    if(jarvisBtn) jarvisBtn.classList.remove("listening");
    // если не было речи (просто таймаут) — обновим UI
    if(todayEl && lastAnswer) todayEl.textContent = lastAnswer;
    // НЕ делаем автоперезапуска здесь — перезапуск выполняется в speak.onend
  };
}

// ======= UI: кнопка =======
document.addEventListener("DOMContentLoaded", () => {
  initRecognition();

  if(!jarvisBtn){
    console.warn("Кнопка #jarvis-btn не найдена");
    return;
  }

  jarvisBtn.addEventListener("click", () => {
    // переключатель: если уже слушаем — остановить и выключить автоперезапуск
    if(jarvisBtn.classList.contains("listening")){
      shouldAutoRestart = false;
      try { recognition.stop(); } catch(e){}
      jarvisBtn.classList.remove("listening");
      if(todayEl && lastAnswer) todayEl.textContent = lastAnswer;
      return;
    }

    // стартуем прослушивание и включаем авто-перезапуск (чтобы после ответа можно было задать следующий вопрос)
    shouldAutoRestart = true;
    try{
      recognition.start();
      // ставим ограничитель прослушивания
      clearTimeout(recognitionTimeoutId);
      recognitionTimeoutId = setTimeout(()=>{
        try{ recognition.stop(); }catch(e){}
      }, LISTEN_DURATION);
    }catch(e){
      // на редких браузерах нужно пересоздать recognition
      initRecognition();
      try{
        recognition.start();
        clearTimeout(recognitionTimeoutId);
        recognitionTimeoutId = setTimeout(()=>{
          try{ recognition.stop(); }catch(e){}
        }, LISTEN_DURATION);
      }catch(err){}
    }
  });

  // подсказка в UI (не голосом) — можно убрать
  // todayEl.textContent = "Нажми микрофон и спроси: Нова, какие уроки завтра?";
});

  // ТЕМЫ
  
  const themeBtn = document.getElementById("theme-btn");
const root = document.documentElement;

// Проверяем сохранённую тему при загрузке
let savedTheme = localStorage.getItem("theme");
if (savedTheme) {
  applyTheme(savedTheme);
} else {
  applyTheme("pink"); // по умолчанию розовая
}

themeBtn.addEventListener("click", () => {
  let currentTheme = localStorage.getItem("theme") || "pink";
  let newTheme = currentTheme === "pink" ? "blue" : "pink";
  applyTheme(newTheme);
  localStorage.setItem("theme", newTheme);
});

function applyTheme(theme) {
  if (theme === "blue") {
    // 💎 Голубая тема
    root.style.setProperty("--gradient-color", "linear-gradient(180deg, hsla(207, 65%, 45%, 1))");
    root.style.setProperty("--first-color", "hsl(207, 90%, 55%)");
    root.style.setProperty("--first-color-dark", "hsl(207, 80%, 40%)");
    root.style.setProperty("--first-color-darken", "hsl(207, 96%, 68%)");
    root.style.setProperty("--second-color", "hsl(207, 87%, 20%)");
    root.style.setProperty("--second-color-dark", "hsl(210, 100%, 25%)");
  } else {
    // 🌸 Розовый рубин
    root.style.setProperty("--gradient-color", "linear-gradient(180deg, hsla(353, 65%, 60%, 1))");
    root.style.setProperty("--first-color", "hsl(353, 98%, 60%)");
    root.style.setProperty("--first-color-dark", "hsl(353, 78%, 47%)");
    root.style.setProperty("--first-color-darken", "hsl(353, 96%, 68%)");
    root.style.setProperty("--second-color", "hsl(353, 87%, 20%)");
    root.style.setProperty("--second-color-dark", "hsl(45, 100%, 20%)");
  }
}

