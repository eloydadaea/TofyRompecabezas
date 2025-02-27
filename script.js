const puzzleContainer = document.getElementById('puzzle-container');
const originalImage = new Image();
const confettiContainer = document.getElementById('confetti-container');
const referenceImage = document.getElementById('reference-image');
const selectionScreen = document.getElementById('selection-screen');
const puzzleScreen = document.getElementById('puzzle-screen');
let pieces = [];

function startPuzzle(imageSrc) {
  selectionScreen.style.display = 'none';
  puzzleScreen.style.display = 'block';

  // Ocultar el modal de felicitaciones al iniciar un nuevo rompecabezas
  const modal = document.getElementById('congrats-modal');
  modal.style.display = 'none';

  // Obtener la dificultad seleccionada
  const difficulty = parseInt(document.getElementById('difficulty').value);
  const rows = difficulty;
  const cols = difficulty;

  originalImage.src = imageSrc;
  referenceImage.src = imageSrc;

  puzzleContainer.innerHTML = '';
  pieces = [];
  confettiContainer.innerHTML = '';

  originalImage.onload = () => {
    const imgWidth = Math.min(originalImage.width, window.innerWidth * 0.8);
    const imgHeight = Math.min(originalImage.height, window.innerHeight * 0.8);

    puzzleContainer.style.width = `${imgWidth}px`;
    puzzleContainer.style.height = `${imgHeight}px`;

    const pieceWidth = imgWidth / cols;
    const pieceHeight = imgHeight / rows;

    // Ajustar el fondo del contenedor del rompecabezas
    puzzleContainer.style.backgroundImage = `
      linear-gradient(to right, #ccc 1px, transparent 1px),
      linear-gradient(to bottom, #ccc 1px, transparent 1px)
    `;
    puzzleContainer.style.backgroundSize = `${pieceWidth}px ${pieceHeight}px`;

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const piece = document.createElement('div');
        piece.className = 'puzzle-piece';
        piece.style.width = `${pieceWidth}px`;
        piece.style.height = `${pieceHeight}px`;
        piece.style.backgroundImage = `url('${originalImage.src}')`;
        piece.style.backgroundPosition = `-${j * pieceWidth}px -${i * pieceHeight}px`;

        piece.style.top = `${Math.random() * (puzzleContainer.offsetHeight - pieceHeight)}px`;
        piece.style.left = `${Math.random() * (puzzleContainer.offsetWidth - pieceWidth)}px`;
        piece.dataset.expectedRow = i;
        piece.dataset.expectedCol = j;
        puzzleContainer.appendChild(piece);
        pieces.push(piece);
      }
    }

    makePiecesDraggable();
  };
}

function resetPuzzle() {
  startPuzzle(originalImage.src);
}

function returnToMain() {
  puzzleScreen.style.display = 'none';
  selectionScreen.style.display = 'block';
  const modal = document.getElementById('congrats-modal');
  modal.style.display = 'none';
}

function makePiecesDraggable() {
  pieces.forEach(piece => {
    piece.addEventListener('mousedown', startDrag);
    piece.addEventListener('touchstart', startDrag, { passive: false });
  });
}

let selectedPiece = null;

function startDrag(e) {
  e.preventDefault();
  selectedPiece = e.target;
  document.addEventListener('mousemove', dragPiece);
  document.addEventListener('touchmove', dragPiece, { passive: false });
  document.addEventListener('mouseup', stopDrag);
  document.addEventListener('touchend', stopDrag);
}

function dragPiece(e) {
  if (selectedPiece) {
    const containerRect = puzzleContainer.getBoundingClientRect();
    const pieceWidth = selectedPiece.offsetWidth;
    const pieceHeight = selectedPiece.offsetHeight;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    let newTop = clientY - containerRect.top - pieceHeight / 2;
    let newLeft = clientX - containerRect.left - pieceWidth / 2;

    newTop = Math.max(0, Math.min(newTop, containerRect.height - pieceHeight));
    newLeft = Math.max(0, Math.min(newLeft, containerRect.width - pieceWidth));

    selectedPiece.style.top = `${newTop}px`;
    selectedPiece.style.left = `${newLeft}px`;
  }
}

function stopDrag() {
  if (selectedPiece) {
    snapToGrid(selectedPiece);
    selectedPiece = null;
  }
  document.removeEventListener('mousemove', dragPiece);
  document.removeEventListener('touchmove', dragPiece);
  document.removeEventListener('mouseup', stopDrag);
  document.removeEventListener('touchend', stopDrag);
  checkPuzzle();
}

function snapToGrid(piece) {
  const pieceWidth = piece.offsetWidth;
  const pieceHeight = piece.offsetHeight;

  const currentTop = parseFloat(piece.style.top);
  const currentLeft = parseFloat(piece.style.left);

  const row = Math.round(currentTop / pieceHeight);
  const col = Math.round(currentLeft / pieceWidth);

  const expectedTop = row * pieceHeight;
  const expectedLeft = col * pieceWidth;

  piece.style.top = `${expectedTop}px`;
  piece.style.left = `${expectedLeft}px`;

  piece.dataset.row = row;
  piece.dataset.col = col;
}

function checkPuzzle() {
  let isComplete = true;
  pieces.forEach(piece => {
    const expectedRow = parseInt(piece.dataset.expectedRow);
    const expectedCol = parseInt(piece.dataset.expectedCol);
    const currentRow = parseInt(piece.dataset.row);
    const currentCol = parseInt(piece.dataset.col);

    if (currentRow !== expectedRow || currentCol !== expectedCol) {
      isComplete = false;
    }
  });

  if (isComplete) {
    showConfetti(50);
    showModal();
  }
}

function showConfetti(amount = 100) {
  for (let i = 0; i < amount; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = `${Math.random() * 100}vw`;
    confetti.style.animationDuration = `${Math.random() * 2 + 1}s`;
    confettiContainer.appendChild(confetti);
  }
}

function showModal() {
  const modal = document.getElementById('congrats-modal');
  modal.style.display = 'flex';
}

// Cerrar el modal al hacer clic en la "X"
document.querySelector('.close-modal').addEventListener('click', () => {
  const modal = document.getElementById('congrats-modal');
  modal.style.display = 'none';
});

// Cerrar el modal al hacer clic fuera del contenido
window.addEventListener('click', (event) => {
  const modal = document.getElementById('congrats-modal');
  if (event.target === modal) {
    modal.style.display = 'none';
  }
});