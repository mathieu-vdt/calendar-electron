import { IEvent } from '../../interfaces/event';
import { getAll } from '../model/index.js';
const { ipcRenderer } = require("electron");


(async () => {
	const addEventButton = document.getElementById('add-event-button');

	if(addEventButton){
		addEventButton.addEventListener('click', () => {
			ipcRenderer.send('open-add-event-window');
		});

	}
	let currentMonth: number;
	let currentYear: number;
	const monthNames: string[] = [
	  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
	  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
	];
	  

	const monthElement = document.querySelector('.month') as HTMLElement;
	const daysElement = document.querySelector('.days') as HTMLElement;
	const currentMonthText = document.querySelector('.calendar .month .currentMontText') as HTMLElement;
	const prevMonthBtn = document.getElementById('prevMonthBtn') as HTMLButtonElement;
	const nextMonthBtn = document.getElementById('nextMonthBtn') as HTMLButtonElement;
  
	async function updateCalendar() {
	  // Clear the days element
	  daysElement.innerHTML = "";
  
	  // Get the first day of the current month
	  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  
	  // Get the number of days in the current month
	  const numDays = new Date(currentYear, currentMonth + 1, 0).getDate();
		
	  // Update the month and year display
	  currentMonthText.innerHTML = `${monthNames[currentMonth]} ${currentYear}`;
		
	 // Add the weekdays row
	 const weekdaysRow = document.querySelector('.weekdays') as HTMLElement;
	 weekdaysRow.innerHTML = "";
	 const weekdays = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
   
	 // Add empty days before the first day of the month
	 for (let i = 0; i < firstDay; i++) {
	   const emptyDay = document.createElement('div');
	   daysElement.appendChild(emptyDay);
	 }
   
	 // Add the days of the month
	 for (let i = 1; i <= numDays; i++) {
	   const day = document.createElement('div');
	   const text = document.createElement('p');
	   const weekday = document.createElement('p');
	   const eventTest = document.createElement('div');
	   const divInfo = document.createElement('div');
	   text.textContent = i.toString();
	   weekday.textContent = weekdays[(firstDay + i - 2) % 7]; // Calculate the weekday index for the current day
	   day.classList.add('day');
	   divInfo.appendChild(text);
	   divInfo.appendChild(weekday);

	   weekday.classList.add('weekday');
	   divInfo.classList.add('day-info');
	   
	   day.appendChild(divInfo);

	   const currentDate = new Date(currentYear, currentMonth, i);

		// Find events for the current date
		const eventsOnCurrentDate = (await getAll()).filter(event => {
			const eventStartDate = new Date(event.date_deb);
			const eventEndDate = new Date(event.date_fin);

			// Check if the current date falls within the event's start and end dates
			return currentDate >= eventStartDate && currentDate <= eventEndDate;
		});

		// Add events to the day element
		eventsOnCurrentDate.forEach((event: IEvent, index) => {
			const eventElement = document.createElement('div');
			eventElement.textContent = event.titre;
			eventElement.classList.add('event');
		  
			eventElement.setAttribute('data-event-index', index.toString());
		  
			day.appendChild(eventElement);
		  
			// Event click handler
			eventElement.addEventListener('click', ((eventData: IEvent) => {
			  return (event: MouseEvent) => {
				// Send the selected event data to the main process
				ipcRenderer.send('event-data', eventData);
			  };
			})(event));
		  });

	   daysElement.appendChild(day);
	 }
	}
  
	function showPreviousMonth() {
	  currentMonth--;
	  if (currentMonth < 0) {
		currentMonth = 11;
		currentYear--;
	  }
	  updateCalendar();
	}
  
	function showNextMonth() {
	  currentMonth++;
	  if (currentMonth > 11) {
		currentMonth = 0;
		currentYear++;
	  }
	  updateCalendar();
	}
  
	prevMonthBtn.addEventListener('click', showPreviousMonth);
	nextMonthBtn.addEventListener('click', showNextMonth);
  
	// Get the current date
	const currentDate = new Date();
	currentMonth = currentDate.getMonth();
	currentYear = currentDate.getFullYear();
  
	// Initialize the calendar
	updateCalendar();


})()
  
  
