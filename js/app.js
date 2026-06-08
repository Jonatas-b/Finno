import { trocaTela } from "./router.js";

const button = document.getElementById('toggleBg');

button.addEventListener('click', () => {

  const toggle = document.getElementById('slider');

  // Adiciona classe ativa ao butão e slider de troca de tema
  button.classList.toggle('btn-toggle-active');
  toggle.classList.toggle('switch-toggle-active');

  // Muda para as configurações Dark Mode
  document.documentElement.classList.toggle("dark");

  // Muda o nome do tema 
  if (button.classList.contains('btn-toggle-active')) {
    document.getElementById('theme-name').innerText = 'Dark Mode';
  } else {
    document.getElementById('theme-name').innerText = 'Light Mode';
  }
  
  // Muda o ícone do tema
  if (button.classList.contains('btn-toggle-active')) {
    document.getElementById('theme-icon').classList.add('fa-moon');
  } else {
    document.getElementById('theme-icon').classList.remove('fa-moon');
    document.getElementById('theme-icon').classList.add('fa-sun');
  }
});

trocaTela();