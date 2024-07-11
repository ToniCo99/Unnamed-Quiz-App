let questions = [];

// Cargar las preguntas desde el archivo JSON
fetch('questions.json')
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    questions = data;
    console.log('Preguntas cargadas:', questions); // Mensaje de depuración
    shuffleArray(questions);
    displayQuestion();
    createQuestionSelector();
  })
  .catch(error => console.error('Error al cargar las preguntas:', error));

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

let currentQuestionIndex = 0;
let score = 0;
let selectedOptions = [];
let respondedQuestions = new Map();
const questionContainer = document.getElementById('question-container');
const optionsContainer = document.getElementById('options-container');
const resultDisplay = document.getElementById('result');
const nextButton = document.getElementById('next-question');
const retryButton = document.getElementById('retry-button');
const resultButton = document.getElementById('result-button');
const selectorContainer = document.getElementById('question-selector');

function displayQuestion() {
  if (questions.length === 0) {
    console.error('No hay preguntas disponibles para mostrar.');
    return;
  }
  const currentQuestion = questions[currentQuestionIndex];
  questionContainer.textContent = `${currentQuestion.id}. ${currentQuestion.question}`;
  optionsContainer.innerHTML = '';
  selectedOptions = [];
  currentQuestion.options.forEach(option => {
    const button = document.createElement('button');
    button.textContent = option;
    button.classList.add('btn', 'option');
    if (currentQuestion.multiple) {
      button.addEventListener('click', () => toggleOption(button, option));
    } else {
      button.addEventListener('click', () => checkAnswer(option));
    }
    optionsContainer.appendChild(button);
  });
}

function toggleOption(button, option) {
  if (selectedOptions.includes(option)) {
    selectedOptions = selectedOptions.filter(item => item !== option);
    button.style.backgroundColor = '';
  } else {
    selectedOptions.push(option);
    button.style.backgroundColor = '#d3d3d3'; // Marcar la opción seleccionada
  }
}

function checkAnswer(selected) {
  const currentQuestion = questions[currentQuestionIndex];
  let correct;
  if (currentQuestion.multiple) {
    correct = JSON.stringify(selectedOptions.sort()) === JSON.stringify(currentQuestion.answer.sort());
  } else {
    correct = currentQuestion.answer === selected;
  }

  if (correct) {
    score++;
    resultDisplay.textContent = '¡Correcto!';
    resultDisplay.style.color = 'green';
    markQuestionAsResponded(currentQuestionIndex, true);
  } else {
    resultDisplay.textContent = `Incorrecto. La respuesta correcta es: ${currentQuestion.answer}`;
    resultDisplay.style.color = 'red';
    markQuestionAsResponded(currentQuestionIndex, false);
  }
  nextButton.style.display = 'block';
  disableOptions();
}

function disableOptions() {
  const optionButtons = document.querySelectorAll('.option');
  optionButtons.forEach(button => {
    button.disabled = true;
  });
}

nextButton.addEventListener('click', () => {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    displayQuestion();
    resultDisplay.textContent = '';
    nextButton.style.display = 'none';
  } else {
    showResult();
  }
  updateResultButtonVisibility();
});

function restartQuiz() {
  shuffleArray(questions);
  currentQuestionIndex = 0;
  score = 0;
  respondedQuestions.clear();
  displayQuestion();
  resultDisplay.textContent = '';
  retryButton.style.display = 'none';
  nextButton.style.display = 'none';
  resultButton.style.display = 'none';
  updateQuestionSelector();
}

function createQuestionSelector() {
  selectorContainer.innerHTML = '';
  questions.forEach((_, index) => {
    const button = document.createElement('button');
    button.textContent = index + 1;
    button.classList.add('not-responded');
    selectorContainer.appendChild(button);
  });
}

function markQuestionAsResponded(index, isCorrect) {
  respondedQuestions.set(index, isCorrect);
  updateQuestionSelector();
  updateResultButtonVisibility();
}

function updateQuestionSelector() {
  const buttons = selectorContainer.querySelectorAll('button');
  buttons.forEach((button, index) => {
    if (respondedQuestions.has(index)) {
      button.classList.remove('not-responded');
      if (respondedQuestions.get(index)) {
        button.classList.add('responded');
        button.classList.remove('incorrect');
      } else {
        button.classList.add('incorrect');
        button.classList.remove('responded');
      }
    } else {
      button.classList.add('not-responded');
      button.classList.remove('responded');
      button.classList.remove('incorrect');
    }
  });
}

function updateResultButtonVisibility() {
  if (respondedQuestions.size === questions.length) {
    resultButton.style.display = 'block';
  } else {
    resultButton.style.display = 'none';
  }
}

function showResult() {
  questionContainer.textContent = `Cuestionario completado. Tu puntuación es: ${score}/${questions.length}`;
  optionsContainer.innerHTML = '';
  nextButton.style.display = 'none';
  retryButton.style.display = 'block';
  resultButton.style.display = 'none';
}

// Escuchar el evento de la tecla espacio para cambiar la pregunta
document.addEventListener('keydown', (event) => {
  if (event.code === 'Space') {
    if (nextButton.style.display === 'block') {
      nextButton.click();
    }
  }
});
