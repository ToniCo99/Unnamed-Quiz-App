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
const questionContainer = document.getElementById('question-container');
const optionsContainer = document.getElementById('options-container');
const resultDisplay = document.getElementById('result');
const nextButton = document.getElementById('next-question');
const retryButton = document.getElementById('retry-button');

function displayQuestion() {
  if (questions.length === 0) {
    console.error('No hay preguntas disponibles para mostrar.');
    return;
  }
  const currentQuestion = questions[currentQuestionIndex];
  questionContainer.textContent = `${currentQuestion.id}. ${currentQuestion.question}`;
  optionsContainer.innerHTML = '';
  currentQuestion.options.forEach(option => {
    const button = document.createElement('button');
    button.textContent = option;
    button.classList.add('btn');
    button.addEventListener('click', () => checkAnswer(option));
    optionsContainer.appendChild(button);
  });
}

function checkAnswer(selected) {
  const correct = questions[currentQuestionIndex].answer === selected;
  if (correct) {
    score++;
    resultDisplay.textContent = '¡Correcto!';
    resultDisplay.style.color = 'green';
  } else {
    resultDisplay.textContent = `Incorrecto. La respuesta correcta es: ${questions[currentQuestionIndex].answer}`;
    resultDisplay.style.color = 'red';
  }
  nextButton.style.display = 'block';
}

nextButton.addEventListener('click', () => {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    displayQuestion();
    resultDisplay.textContent = '';
    nextButton.style.display = 'none';
  } else {
    questionContainer.textContent = `Cuestionario completado. Tu puntuación es: ${score}/${questions.length}`;
    optionsContainer.innerHTML = '';
    nextButton.style.display = 'none';
    retryButton.style.display = 'block';
  }
});

function restartQuiz() {
  shuffleArray(questions);
  currentQuestionIndex = 0;
  score = 0;
  displayQuestion();
  resultDisplay.textContent = '';
  retryButton.style.display = 'none';
  nextButton.style.display = 'none';
}

// Escuchar el evento de la tecla espacio para cambiar la pregunta
document.addEventListener('keydown', (event) => {
  if (event.code === 'Space') {
    if (nextButton.style.display === 'block') {
      nextButton.click();
    }
  }
});
