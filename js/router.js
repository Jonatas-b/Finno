export function trocaTela() {
  const links = document.querySelectorAll('.links div');
  const sections = document.querySelectorAll('section');
  
  links.forEach(link => {
    link.addEventListener('click', () => {
      link.classList.toggle('active');
    });
  });
}
