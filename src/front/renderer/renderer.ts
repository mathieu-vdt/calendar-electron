const { ipcRenderer } = require("electron");

(async () => {
	
	let currentMonth: number;
	let currentYear: number;
	const monthNames: string[] = [
	  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
	  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
	];
  
	interface CalendarEvent {
		title: string;
		description: string;
		startDate: Date;
		endDate: Date;
	  }
	  
	  const events: CalendarEvent[] = [
		{ 
		  title: 'Événement 1', 
		  description: 'Description de l\'événement 1',
		  startDate: new Date(2023, 6, 1), // Date de début de l'événement (année, mois, jour)
		  endDate: new Date(2023, 6, 1)    // Date de fin de l'événement (année, mois, jour)
		},
		{ 
		  title: 'Événement 2', 
		  description: 'Description de l\'événement 2',
		  startDate: new Date(2023, 6, 3), // Date de début de l'événement (année, mois, jour)
		  endDate: new Date(2023, 6, 7)    // Date de fin de l'événement (année, mois, jour)
		}
	  ];
	  

	const monthElement = document.querySelector('.month') as HTMLElement;
	const daysElement = document.querySelector('.days') as HTMLElement;
	const currentMonthText = document.querySelector('.calendar .month .currentMontText') as HTMLElement;
	const prevMonthBtn = document.getElementById('prevMonthBtn') as HTMLButtonElement;
	const nextMonthBtn = document.getElementById('nextMonthBtn') as HTMLButtonElement;
  
	function updateCalendar() {
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
		const eventsOnCurrentDate = events.filter(event => {
			const eventStartDate = new Date(event.startDate);
			const eventEndDate = new Date(event.endDate);

			// Check if the current date falls within the event's start and end dates
			return currentDate >= eventStartDate && currentDate <= eventEndDate;
		});

		// Add events to the day element
		eventsOnCurrentDate.forEach((event, index) => {
			const eventElement = document.createElement('div');
			eventElement.textContent = event.title;
			eventElement.classList.add('event');
		  
			eventElement.setAttribute('data-event-index', index.toString());
		  
			day.appendChild(eventElement);
		  
			// Event click handler
			eventElement.addEventListener('click', ((eventData: CalendarEvent) => {
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


	function createEventClickHandler(index: number) {
		return (event: MouseEvent) => {
		  const eventIndex = (event.target as HTMLElement).getAttribute('data-event-index');
		  const selectedEvent = events[Number(eventIndex)];
	  
		  // Send the selected event data to the main process
		  ipcRenderer.send('event-data', selectedEvent);
		};
	  }

})()
  
  
