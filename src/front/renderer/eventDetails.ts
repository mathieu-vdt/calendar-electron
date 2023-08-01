import { updEvent, delEvent } from '../model/index.js';
import { IEvent } from '../../interfaces/event';
const { ipcRenderer } = require('electron');

    ipcRenderer.on('event-data', (event: Event, eventData: IEvent) => {
      // Access the event data and update the HTML content accordingly
      const eventDetailsContainer = document.getElementById('event-details') as HTMLElement;
      eventDetailsContainer.innerHTML = '';

      const titleElement = document.createElement('h2');
      titleElement.textContent = eventData.titre;
      eventDetailsContainer.appendChild(titleElement);

      const descriptionElement = document.createElement('p');
      descriptionElement.textContent = eventData.description;
      eventDetailsContainer.appendChild(descriptionElement);

	  const dateDebut = eventData.date_deb.toLocaleDateString()
	  const dateFin = eventData.date_fin.toLocaleDateString()

      const startDateElement = document.createElement('p');
      startDateElement.textContent = `Start Date: ${dateDebut}`;
      eventDetailsContainer.appendChild(startDateElement);

      const endDateElement = document.createElement('p');
      endDateElement.textContent = `End Date: ${dateFin}`;
      eventDetailsContainer.appendChild(endDateElement);


      // Formulaire de modification
      (document.querySelector('[name="id"]') as HTMLInputElement).value = `${eventData.id}`;
      (document.querySelector('[name="titre"]') as HTMLInputElement).value = eventData.titre;
      (document.getElementById('description-input') as HTMLInputElement).value = eventData.description;
      (document.querySelector('[name="date_deb"]') as HTMLInputElement).value = eventData.date_deb.toISOString().split('T')[0];
      (document.querySelector('[name="date_fin"]') as HTMLInputElement).value = eventData.date_fin.toISOString().split('T')[0];

      const editBtn = document.getElementById('edit') as HTMLElement;
      editBtn.addEventListener('click', function(){
        const form = document.getElementById("edit-form") as HTMLElement;

        if(form.style.display == 'none'){
          eventDetailsContainer.style.display = 'none'
          form.style.display = 'block'
          editBtn.innerHTML = 'Annuler la modification'
        }else{
          form.style.display = 'none'
          eventDetailsContainer.style.display = 'block'
          editBtn.innerHTML = 'Modifier'
        }
      })

	  const saveBtn = document.getElementById('save-btn') as HTMLElement;
	  saveBtn.addEventListener('click', function(){
		const eventEdit: IEvent = {
			id: parseInt((document.querySelector('[name="id"]') as HTMLInputElement).value),
			titre: (document.querySelector('[name="titre"]') as HTMLInputElement).value,
			description: (document.getElementById('description-input') as HTMLInputElement).value,
			date_deb: new Date((document.querySelector('[name="date_deb"]') as HTMLInputElement).value),
			date_fin: new Date((document.querySelector('[name="date_fin"]') as HTMLInputElement).value),
			location: '',
			statut: '',
			categorie: '',
			transparence: '',
			nbMaj: 0,
		  };
		  
		  updEvent(eventEdit)
			.then(() => {
				const form = document.getElementById("edit-form") as HTMLElement;
				form.style.display = 'none'
				eventDetailsContainer.style.display = 'block'
				editBtn.innerHTML = 'Modifier'

			})
			.catch((error) => {
				console.error('Erreur lors de la modification de l\'événement :', error);
			});
	  })

	  const deleteBtn = document.getElementById('delete') as HTMLElement;
	  deleteBtn.addEventListener('click', function(){
		delEvent(parseInt((document.querySelector('[name="id"]') as HTMLInputElement).value))
		.then(() => {
			alert('Supprimé !')

		})
		.catch((error) => {
			alert('Erreur lors de la suppression de l\'événement');
		});
	  })

    });
