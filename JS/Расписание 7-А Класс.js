
const navMenu = document.getElementById('nav-menu'),
      navToggle = document.getElementById('nav-toggle'),
      navClose = document.getElementById('nav-close');

/* Menu show */
if (navToggle) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.add('show-menu');
    });
}

/* Menu hidden */
if (navClose) {
    navClose.addEventListener('click', () => {
        navMenu.classList.remove('show-menu');
    });
}

/*=============== SHADOW HEADER ===============*/
const shadowHeader = () => {
    const header = document.getElementById('header');
    if (header) {
        window.scrollY >= 50 ? header.classList.add('shadow-header') 
                            : header.classList.remove('shadow-header');
    }
};
window.addEventListener('scroll', shadowHeader);

/*=============== CREATE PETALS ===============*/
const createPetal = () => {
    const petal = document.createElement('div');
    petal.className = 'sakura-petal';
    
    // Randomize position and animation duration
    const xPosition = Math.random() * 100; 
    const animationDuration = Math.random() * 5 + 5;
    
    petal.style.left = `${xPosition}vw`;
    petal.style.animationDuration = `${animationDuration}s`;
    
    // Append petal to the container
    const petalContainer = document.querySelector('.sakura-petals');
    if (petalContainer) {
        petalContainer.appendChild(petal);
    }
};

// Create multiple petals
for (let i = 0; i < 50; i++) {
    createPetal();
}

/*=============== ADD BLUR HEADER ===============*/
const blurHeader = () => {
    const header = document.getElementById('header');
    if (header) {
        // Add a class if the bottom offset is greater than 50 of the viewport
        window.scrollY >= 50 ? header.classList.add('blur-header') 
                            : header.classList.remove('blur-header');
    }
};
window.addEventListener('scroll', blurHeader);

/*=============== ScrollReveal  ANIMATION ===============*/
// Инициализация ScrollReveal 
const sr = ScrollReveal({
  duration: 600,     
  delay: 200,        
  easing: 'ease-out' 
});

// Анимации
sr.reveal('.home__img-6, .Пятница', { 
  origin: 'bottom',
  distance: '50px', 
  duration: 600,
  opacity: 0, 
  y: 200
});

sr.reveal('.home__img-3, .home__img-1', { 
  origin: 'left',
  distance: '50px', 
  duration: 600,
  opacity: 0, 
  y: 400
});

sr.reveal('.home__img-5, .Субота', { 
  origin: 'bottom',
  distance: '50px', 
  duration: 600,
  opacity: 0, 
  y: 400
});

sr.reveal('.home__img-2, .Понедельник', { 
  origin: 'left',
  distance: '50px', 
  duration: 600,
  opacity: 0, 
  y: 400
});

sr.reveal('.home__img-4, .home__title', { 
  origin: 'bottom',
  distance: '50px', 
  duration: 600,
  opacity: 0, 
  y: 200
});

sr.reveal('.home__data, .Вторник', { 
  origin: 'bottom',
  distance: '50px', 
  duration: 600,
  opacity: 0, 
  y: -100
});

sr.reveal('.home__latern-1, .Четверг', { 
  origin: 'left', 
  distance: '50px', 
  duration: 600,
  opacity: 0, 
  x: 70
});

sr.reveal('.home__latern-2, .Среда', { 
  origin: 'top', 
  distance: '50px', 
  duration: 600,
  opacity: 0, 
  x: -70
});



const sakura = new Sakura('.sakura-petals');

document.querySelectorAll('.nav__link').forEach(link => {
  link.addEventListener('click', function (event) {
    event.preventDefault();
    
    const targetId = this.getAttribute('href').substring(1);
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      const offset = targetElement.getBoundingClientRect().top + window.pageYOffset;
      const centerOffset = offset - (window.innerHeight / 2) + (targetElement.clientHeight / 2);

      window.scrollTo({
        top: centerOffset,
        behavior: 'smooth'
      });
    }
  });
});

document.addEventListener('DOMContentLoaded', function () {
  const sections = document.querySelectorAll('div[id^="Понедельник"], div[id^="Вторник"], div[id^="Среда"], div[id^="Четверг"], div[id^="Пятница"], div[id^="Субота"]');
  const navLinks = document.querySelectorAll('.nav__link');

  function setActiveLink() {
      let index = sections.length;

      while (--index && window.scrollY + (window.innerHeight / 2) < sections[index].offsetTop) {}

      navLinks.forEach((link) => link.classList.remove('active-link'));
      navLinks[index].classList.add('active-link');
  }

  setActiveLink();
  window.addEventListener('scroll', setActiveLink);
});

function showDay() {
  const today = new Date();
  const days = [
    "Воскресенье",
    "Понедельник",
    "Вторник",
    "Среда",
    "Четверг",
    "Пятница",
    "Суббота"
  ];
  const dayName = days[today.getDay()];
  document.getElementById("today").textContent = "Сегодня: " + dayName;
}

showDay();

<<<<<<< HEAD
=======

=======
>>>>>>> a0585c1c3ddb53b41906c12a0ba18a79b6653a50
const navMenu = document.getElementById('nav-menu'),
      navToggle = document.getElementById('nav-toggle'),
      navClose = document.getElementById('nav-close');

/* Menu show */
if (navToggle) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.add('show-menu');
    });
}

/* Menu hidden */
if (navClose) {
    navClose.addEventListener('click', () => {
        navMenu.classList.remove('show-menu');
    });
}

/*=============== SHADOW HEADER ===============*/
const shadowHeader = () => {
    const header = document.getElementById('header');
    if (header) {
        window.scrollY >= 50 ? header.classList.add('shadow-header') 
                            : header.classList.remove('shadow-header');
    }
};
window.addEventListener('scroll', shadowHeader);

/*=============== CREATE PETALS ===============*/
const createPetal = () => {
    const petal = document.createElement('div');
    petal.className = 'sakura-petal';
    
    // Randomize position and animation duration
    const xPosition = Math.random() * 100; 
    const animationDuration = Math.random() * 5 + 5;
    
    petal.style.left = `${xPosition}vw`;
    petal.style.animationDuration = `${animationDuration}s`;
    
    // Append petal to the container
    const petalContainer = document.querySelector('.sakura-petals');
    if (petalContainer) {
        petalContainer.appendChild(petal);
    }
};

// Create multiple petals
for (let i = 0; i < 50; i++) {
    createPetal();
}

/*=============== ADD BLUR HEADER ===============*/
const blurHeader = () => {
    const header = document.getElementById('header');
    if (header) {
        // Add a class if the bottom offset is greater than 50 of the viewport
        window.scrollY >= 50 ? header.classList.add('blur-header') 
                            : header.classList.remove('blur-header');
    }
};
window.addEventListener('scroll', blurHeader);

/*=============== ScrollReveal  ANIMATION ===============*/
// Инициализация ScrollReveal 
const sr = ScrollReveal({
  duration: 600,     
  delay: 200,        
  easing: 'ease-out' 
});

// Анимации
sr.reveal('.home__img-6, .Пятница', { 
  origin: 'bottom',
  distance: '50px', 
  duration: 600,
  opacity: 0, 
  y: 200
});

sr.reveal('.home__img-3, .home__img-1', { 
  origin: 'left',
  distance: '50px', 
  duration: 600,
  opacity: 0, 
  y: 400
});

sr.reveal('.home__img-5, .Субота', { 
  origin: 'bottom',
  distance: '50px', 
  duration: 600,
  opacity: 0, 
  y: 400
});

sr.reveal('.home__img-2, .Понедельник', { 
  origin: 'left',
  distance: '50px', 
  duration: 600,
  opacity: 0, 
  y: 400
});

sr.reveal('.home__img-4, .home__title', { 
  origin: 'bottom',
  distance: '50px', 
  duration: 600,
  opacity: 0, 
  y: 200
});

sr.reveal('.home__data, .Вторник', { 
  origin: 'bottom',
  distance: '50px', 
  duration: 600,
  opacity: 0, 
  y: -100
});

sr.reveal('.home__latern-1, .Четверг', { 
  origin: 'left', 
  distance: '50px', 
  duration: 600,
  opacity: 0, 
  x: 70
});

sr.reveal('.home__latern-2, .Среда', { 
  origin: 'top', 
  distance: '50px', 
  duration: 600,
  opacity: 0, 
  x: -70
});



const sakura = new Sakura('.sakura-petals');

document.querySelectorAll('.nav__link').forEach(link => {
  link.addEventListener('click', function (event) {
    event.preventDefault();
    
    const targetId = this.getAttribute('href').substring(1);
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      const offset = targetElement.getBoundingClientRect().top + window.pageYOffset;
      const centerOffset = offset - (window.innerHeight / 2) + (targetElement.clientHeight / 2);

      window.scrollTo({
        top: centerOffset,
        behavior: 'smooth'
      });
    }
  });
});

document.addEventListener('DOMContentLoaded', function () {
  const sections = document.querySelectorAll('div[id^="Понедельник"], div[id^="Вторник"], div[id^="Среда"], div[id^="Четверг"], div[id^="Пятница"], div[id^="Субота"]');
  const navLinks = document.querySelectorAll('.nav__link');

  function setActiveLink() {
      let index = sections.length;

      while (--index && window.scrollY + (window.innerHeight / 2) < sections[index].offsetTop) {}

      navLinks.forEach((link) => link.classList.remove('active-link'));
      navLinks[index].classList.add('active-link');
  }

  setActiveLink();
  window.addEventListener('scroll', setActiveLink);
});

