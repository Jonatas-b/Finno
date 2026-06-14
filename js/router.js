export function trocaTela() {
  const atalho = document.querySelectorAll('.links div.atalho');
  const sections = document.querySelectorAll('section');

  atalho.forEach(shortcut => {
    shortcut.addEventListener('click', (elemento) => {
      const idElement = elemento.currentTarget.dataset.target;

      atalho.forEach(at => {
        at.classList.remove('active');
      })
      sections.forEach(secao => {
        secao.classList.remove('active');
      })

      document.querySelector('#' + idElement).classList.add('active');

      elemento.currentTarget.classList.add('active');
    })
  });
}
