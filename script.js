// Simple navigation highlight & smooth scroll
const navLinks = document.querySelectorAll('nav a');

navLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    navLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    const target = document.querySelector(link.getAttribute('href'));
    target.scrollIntoView({ behavior: 'smooth' });
  });
});

// Highlight nav on scroll
window.addEventListener('scroll', () => {
  const sections = ['home', 'about', 'why'];
  let scrollPos = window.scrollY + window.innerHeight / 3;
  for (let id of sections) {
    let section = document.getElementById(id);
    if (
      section.offsetTop <= scrollPos &&
      section.offsetTop + section.offsetHeight > scrollPos
    ) {
      navLinks.forEach(l => l.classList.remove('active'));
      document.querySelector(`nav a[href="#${id}"]`).classList.add('active');
    }
  }
});
