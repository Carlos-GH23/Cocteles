// --- 1. DEFINICIÓN DE ELEMENTOS (GLOBALES) ---
// Los sacamos de la función para que todos puedan usarlos
const searchButton = document.getElementById('searchButton');
const cocktailNameInput = document.getElementById('cocktailName');
const resultDiv = document.getElementById('result');

// --- 2. FUNCIONES DE ESTADO DE RED ---

// Función para mostrar que estamos SIN conexión
function mostrarEstadoOffline() {
    resultDiv.innerHTML = `
        <div class="offline-message">
            <h2>🚫 Estás sin conexión</h2>
            <p>No podemos buscar cócteles en este momento. Revisa tu conexión a internet.</p>
        </div>
    `;
    searchButton.disabled = true; // Deshabilitar el botón
    cocktailNameInput.disabled = true; // Deshabilitar el campo de texto
}

// Función para mostrar que estamos CON conexión
function mostrarEstadoOnline() {
    resultDiv.innerHTML = '<p>Escribe el nombre de un cóctel y presiona "Buscar".</p>';
    searchButton.disabled = false; // Habilitar el botón
    cocktailNameInput.disabled = false; // Habilitar el campo de texto
}

// --- 3. EVENT LISTENERS (ESCUCHADORES) ---

// A. Al cargar la página, comprueba el estado
window.addEventListener('load', () => {
    if (navigator.onLine) {
        mostrarEstadoOnline();
    } else {
        mostrarEstadoOffline(); // <-- ESTO ES LO QUE QUERÍAS
    }
});

// B. Escucha cambios de red (si te conectas/desconectas)
window.addEventListener('online', mostrarEstadoOnline);
window.addEventListener('offline', mostrarEstadoOffline);

// C. Escucha el clic en el botón (Este es tu listener original)
searchButton.addEventListener('click', fetchCocktail);


// --- 4. FUNCIÓN DE BÚSQUEDA (Tu función original) ---
// (Modificada ligeramente para usar las variables globales)
function fetchCocktail() {
    // Ya no necesitamos definir 'inputElement' o 'resultDiv' aquí
    
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
            
            // Renderiza el resultado (incluyendo el fallback del SW si es necesario)
            resultDiv.innerHTML = `
                <h2>${cocktail.strDrink}</h2>
                <img src="${cocktail.strDrinkThumb}" alt="${cocktail.strDrink}" width="200" height="300">
                <p><strong>Categoría:</strong> ${cocktail.strCategory}</p>
                <p><strong>Instrucciones:</strong> ${cocktail.strInstructions}</p>
                <p><strong>Ingrediente 1:</strong> ${cocktail.strIngredient1}</p>
            `;
        })
        .catch(error => {
            // Este catch se activa si el SW falla o hay un error de JSON
            resultDiv.innerHTML = `<p style="color: red;">Error al procesar la respuesta: ${error.message}</p>`;
        });
}