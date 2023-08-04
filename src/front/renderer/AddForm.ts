import { addEvent } from '../model/index.js';
import { IEvent } from '../../interfaces/event';
const { ipcRenderer } = require('electron');

const submitButton = document.getElementById('submit-button') as HTMLElement;
const eventForm = document.getElementById('event-form') as HTMLElement;

if (submitButton != null) {
  submitButton.addEventListener('click', (event) => {
    event.preventDefault();

    const eventData: IEvent = {
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

    console.log(eventData)

    // Utilisation de la fonction addEvent avec les données de l'événement
    addEvent(eventData)
      .then(() => {
        window.close();
      })
      .catch((error) => {
        console.error('Erreur lors de l\'ajout de l\'événement :', error);
      });

    // ipcRenderer.send('new-event-data', eventData);
  });
}
