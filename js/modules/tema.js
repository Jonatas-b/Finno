import { atualizarTema } from "./usuario.js";

export function toggleTema() {

  const buttonToggleThemeConfig = document.getElementById('buttonToggleThemeConfig');

  buttonToggleThemeConfig.addEventListener('click', () => {

    buttonToggleThemeConfig.classList.toggle('btn-toggle-active');
    document.documentElement.classList.toggle("dark");

    if (buttonToggleThemeConfig.classList.contains('btn-toggle-active')) {
      buttonToggleThemeConfig.innerText = 'Dark Mode';
    } else {
      buttonToggleThemeConfig.innerText = 'Light Mode';
    }

    let temaEscolhido = document.documentElement.className;
    atualizarTema(temaEscolhido);
  });
}