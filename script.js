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
const quizContainer = document.getElementById('quiz-container');
const finalResultContainer = document.getElementById('final-result-container');
const finalResultDisplay = document.getElementById('final-result');

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
      button.addEventListener('click', () => checkAnswer(option, button));
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

  // Verificar si todas las opciones correctas están seleccionadas
  const currentQuestion = questions[currentQuestionIndex];
  if (currentQuestion.multiple) {
    const correctOptions = currentQuestion.answer;
    const allCorrectSelected = correctOptions.every(opt => selectedOptions.includes(opt));
    const anyIncorrectSelected = selectedOptions.some(opt => !correctOptions.includes(opt));
    if (allCorrectSelected || anyIncorrectSelected) {
      checkMultipleAnswer(currentQuestion);
    }
  }
}

function checkAnswer(selected, button) {
  const currentQuestion = questions[currentQuestionIndex];
  if (currentQuestion.multiple) {
    checkMultipleAnswer(currentQuestion);
  } else {
    checkSingleAnswer(selected, button, currentQuestion);
  }
}

function checkSingleAnswer(selected, button, currentQuestion) {
  let correct = currentQuestion.answer === selected;

  const optionButtons = document.querySelectorAll('.option');
  optionButtons.forEach(btn => {
    if (btn.textContent === currentQuestion.answer) {
      if (correct) {
        btn.classList.add('correct');
      } else {
        btn.classList.add('correct-border');
      }
    } else if (btn === button && !correct) {
      btn.classList.add('incorrect');
    } else {
      btn.classList.add('neutral');
    }
  });

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

function checkMultipleAnswer(currentQuestion) {
  const correctOptions = currentQuestion.answer;
  const allCorrectSelected = correctOptions.every(option => selectedOptions.includes(option));
  const anyIncorrectSelected = selectedOptions.some(option => !correctOptions.includes(option));

  const optionButtons = document.querySelectorAll('.option');
  optionButtons.forEach(btn => {
    if (correctOptions.includes(btn.textContent)) {
      if (allCorrectSelected && !anyIncorrectSelected) {
        btn.classList.add('correct');
      } else {
        btn.classList.add('correct-border');
      }
    } else if (selectedOptions.includes(btn.textContent)) {
      btn.classList.add('incorrect');
    } else {
      btn.classList.add('neutral');
    }
  });

  if (allCorrectSelected && !anyIncorrectSelected) {
    score++;
    resultDisplay.textContent = '¡Correcto!';
    resultDisplay.style.color = 'green';
    markQuestionAsResponded(currentQuestionIndex, true);
  } else if (anyIncorrectSelected) {
    resultDisplay.textContent = `Incorrecto. Seleccionaste una opción incorrecta.`;
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
  if (currentQuestionIndex < questions.length - 1) {
    currentQuestionIndex++;
  } else {
    currentQuestionIndex = getFirstUnansweredQuestion();
  }
  displayQuestion();
  resultDisplay.textContent = '';
  nextButton.style.display = 'none';
  updateResultButtonVisibility();
});

function restartQuiz() {
  currentQuestionIndex = 0;
  score = 0;
  respondedQuestions.clear();
  displayQuestion();
  resultDisplay.textContent = '';
  retryButton.style.display = 'none';
  nextButton.style.display = 'none';
  resultButton.style.display = 'none';
  finalResultContainer.classList.add('hidden');
  quizContainer.classList.remove('hidden');
  updateQuestionSelector();
}

function createQuestionSelector() {
  selectorContainer.innerHTML = '';
  questions.forEach((question) => {
    const button = document.createElement('button');
    button.textContent = question.id;
    button.classList.add('not-responded');
    button.addEventListener('click', () => goToQuestion(question.id - 1));
    selectorContainer.appendChild(button);
  });
}

function goToQuestion(index) {
  currentQuestionIndex = index;
  displayQuestion();
  resultDisplay.textContent = '';
  nextButton.style.display = 'none';
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

function getFirstUnansweredQuestion() {
  for (let i = 0; i < questions.length; i++) {
    if (!respondedQuestions.has(i)) {
      return i;
    }
  }
  return 0; // Por seguridad, pero no debería llegar aquí si se llama correctamente
}

function updateResultButtonVisibility() {
  if (respondedQuestions.size === questions.length) {
    showResult();
  }
}

function showResult() {
  quizContainer.classList.add('hidden');
  finalResultContainer.classList.remove('hidden');
  finalResultDisplay.textContent = `Cuestionario completado. Tu puntuación es: ${score}/${questions.length}`;
}

// Escuchar el evento de la tecla espacio para cambiar la pregunta
document.addEventListener('keydown', (event) => {
  if (event.code === 'Space') {
    if (nextButton.style.display === 'block') {
      nextButton.click();
    }
  }
});
