// --- 1. DEFINICIÓN DE ELEMENTOS ---
const searchButton = document.getElementById('searchButton');
const cocktailNameInput = document.getElementById('cocktailName');
const resultDiv = document.getElementById('result');

// --- 2. Función de búsqueda ---
function fetchCocktail() {
  if (!navigator.onLine) {
    resultDiv.innerHTML = `
      <div class="offline-message">
        <h2>🚫 Estás sin conexión</h2>
        <p>No podemos buscar cócteles en este momento. Revisa tu conexión a internet.</p>
      </div>
    `;
    return;
  }

  const cocktailName = cocktailNameInput.value.trim();
  if (!cocktailName) {
    alert("¡No olvides escribir el nombre de un cóctel!");
    return;
  }

  const url = `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${cocktailName}`;

  resultDiv.innerHTML = '<h2>Cargando...</h2>';

  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error('Respuesta del servidor no válida');
      }
      return response.json();
    })
    .then(data => {
      const cocktail = data.drinks ? data.drinks[0] : null;
      if (!cocktail) {
        resultDiv.innerHTML = `<p>No se encontró el cóctel: <strong>${cocktailName}</strong></p>`;
        return;
      }

      resultDiv.innerHTML = `
        <div class="result-card fade-in">
          <h2>${cocktail.strDrink}</h2>
          <img src="${cocktail.strDrinkThumb}" alt="${cocktail.strDrink}" width="200" height="300">
          <p><strong>Categoría:</strong> ${cocktail.strCategory}</p>
          <p><strong>Instrucciones:</strong> ${cocktail.strInstructions}</p>
          <p><strong>Ingrediente 1:</strong> ${cocktail.strIngredient1}</p>
        </div>
      `;
    })
    .catch(error => {
      resultDiv.innerHTML = `<p style="color: red;">Error al procesar la respuesta: ${error.message}</p>`;
    });
}

// --- 3. Listeners ---
searchButton.addEventListener('click', fetchCocktail);
