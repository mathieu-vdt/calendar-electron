document.addEventListener("DOMContentLoaded", () => {
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
	 const weekdaysRow = document.querySelector('.weekdays');
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

	   eventTest.textContent = 'La belle voitureaaaaaaaaaaaaaaaaaaa';
	   eventTest.classList.add('event');

	   weekday.classList.add('weekday');
	   divInfo.classList.add('day-info');
	   
	   day.appendChild(divInfo);

	   day.appendChild(eventTest);

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
  });
  