let editingPlantId = null;

async function loadPlants() {

    const response = await fetch('/plants');

    const plants = await response.json();

    const container = document.getElementById('plants-container');

    container.innerHTML = '';

    plants.forEach(plant => {

        const card = document.createElement('div');

        card.classList.add('card');

        card.innerHTML = `
        
            <img src="${plant.image_url}">

            <h3>${plant.name}</h3>

            <p>💥 ${plant.damage}</p>

            <p>🌞 ${plant.sun_cost}</p>

            <div class="card-buttons">

                <button 
                    class="edit-btn"
                    onclick="editPlant(${plant.id})"
                >
                    Editar
                </button>

                <button 
                    class="delete-btn"
                    onclick="deletePlant(${plant.id})"
                >
                    Eliminar
                </button>

            </div>
        `;

        container.appendChild(card);

    });

}

async function addPlant() {

    const name = document.getElementById('name').value;

    const damage = document.getElementById('damage').value;

    const sun_cost = document.getElementById('sun_cost').value;

    const description = document.getElementById('description').value;

    const image_url = document.getElementById('image_url').value;

    const url = editingPlantId ? '/plants/' + editingPlantId : '/plants'; 


    const method = editingPlantId
        ? 'PUT'
        : 'POST';

    await fetch(url, {

        method,

        headers: {
            'Content-Type': 'application/json'
        },

        body: JSON.stringify({
            name,
            damage,
            sun_cost,
            description,
            image_url
        })

    });

    editingPlantId = null;

    document.getElementById('name').value = '';

    document.getElementById('damage').value = '';

    document.getElementById('sun_cost').value = '';

    document.getElementById('description').value = '';

    document.getElementById('image_url').value = '';

    document.getElementById('submit-btn').innerText =
        'Agregar Planta';

    loadPlants();

}

async function deletePlant(id) {

    
    await fetch('/plants/' + id, { method: 'DELETE' });


    loadPlants();

}

async function editPlant(id) {

    const response = await fetch('/plants');

    const plants = await response.json();

    const plant = plants.find(p => p.id === id);

    editingPlantId = id;

    document.getElementById('submit-btn').innerText =
        'Guardar Cambios';

    document.getElementById('name').value = plant.name;

    document.getElementById('damage').value = plant.damage;

    document.getElementById('sun_cost').value = plant.sun_cost;

    document.getElementById('description').value = plant.description;

    document.getElementById('image_url').value = plant.image_url;

}

loadPlants();