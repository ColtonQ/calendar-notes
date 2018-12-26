$(function(){
	var gridList = [];
	var noteDateList = [];
	var gridSpacesList = [];
	var colourList = ["#e50000", "#f36870", "#ff0d14", "#f7cc2f", "#00ca7c", "#009148",
		"#0085e3", "#5700b2", "#8369c8", "#a200a6", "#616161"];
	var dayList = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
	var colourButtonList = [];
	var sYear = null;
	var sMonth = null;
	var sDate = null;
	var sIndex = null;
	var currMonth, currYear;
	var gridWidth = 185.7;
	var gridHeight = 150;
	var gridHeightFirst = 166;
	var fillerText = "-";

	class NoteDate {
		constructor(y,m,d) {
			this.year = y;
			this.month = m;
			this.date = d;
			this.noteList = [];
		}

		addNote(n) {
			this.noteList.push(n);
		}

		getYear() {
			return this.year;
		}

		getMonth() {
			return this.month;
		}

		getDate() {
			return this.date;
		}

		getNoteList() {
			return this.noteList;
		}

		setNoteList(noteList) {
			this.noteList = noteList;
		}

		isSameDate(y, m, d) {
			return y == this.getYear() && m == this.getMonth() && d == this.getDate();
		}
	}

	class Note {
		constructor(t, c, desc) {
			this.text = t;
			this.colour = c;
			this.desc = desc;
		}

		getText() {
			return this.text;
		}

		getColour() {
			return this.colour;
		}

		getDesc() {
			return this.desc;
		}
	}

	class GridDate {
		constructor(y,m,d,day) {
			this.year = y;
			this.month = m;
			this.date = d;
			this.day = day;
		}

		getYear() {
			return this.year;
		}

		getMonth() {
			return this.month;
		}

		getDate() {
			return this.date;
		}

		getDay() {
			return this.day
		}
	}

	//make grid boxes for calendar
	function makeGrids() {
		for (i=0; i<42; i++) {
			let gString = "<div id=g" + i.toString() + " class='grid-item'></div>";
			$("#calendar-grid").append(gString);

			let g = document.getElementById("g" + i.toString());

			let gridSpaces = [];
			for (j=0; j<6; j++) {
				let space = document.createElement("h3");
				$("#g"+i.toString()).append(space);
				gridSpaces.push(space);
				space.id = i.toString() + j.toString();
				space.style.color = "#FFFFFF";
				space.style.backgroundColor = "#FFFFFF";
				space.style.margin = "0px";
				if (j == 0)
					space.style.padding = "10px 0px 5px 10px";
				else if (j == 5)
					space.style.padding = "5px 0px 10px 10px";
				else 
					space.style.padding = "5px 0px 5px 10px";
				let $space = $("#g" + i.toString());
				$space.css("white-space", "nowrap");
				space.innerHTML = fillerText;

				space.addEventListener("click", gridSpaceItemClick.bind(null, i, j));

			}
			gridSpacesList.push(gridSpaces);
		}


	}

	// handle grid space item click, make edit panel appear
	function gridSpaceItemClick(i, j) {
		removeExpandPanel();
		let dateSpace = gridSpacesList[i][0];
		if (dateSpace.style.color != "rgb(255, 255, 255)") {	
			let dateString = dateSpace.innerHTML;
			if (dateString.length > 2)
			  dateString = dateString.charAt(dateString.length - 1).toString();
			let date = parseInt(dateString);
			let space = gridSpacesList[i][j];
			if (j == 0 || (space.style.backgroundColor == "rgb(255, 255, 255)"
				&& space.style.color != "rgb(0, 0, 0)")) {
				updateSIndex(currYear, currMonth, date, 0);
				let note = addNote(date);
				updateCalendarNotes();
				let noteDate = getNoteDate(currYear, currMonth, date);
				let noteList = noteDate.getNoteList();
				insertEditPanel(i, currYear, currMonth, date, noteList);
				noteElementClick(currYear, currMonth, date, note, 0);
			} else {
				let noteDate = getNoteDate(currYear, currMonth, date);
				let noteList = noteDate.getNoteList();
				if (j == gridSpacesList[i].length - 2
					&& noteList.length > gridSpacesList[i].length - 2) {
					insertExpandPanel(i, currYear, currMonth, date, noteList);
				} else {
					updateSIndex(currYear, currMonth, date, j-1);
					let note = noteList[j-1];
					insertEditPanel(i, currYear, currMonth, date, noteList);
					noteElementClick(currYear, currMonth, date, note, j-1);
				}
			}
			let noteDate = getNoteDate(currYear, currMonth, date);
			let noteList = noteDate.getNoteList();
		}
	}

	// make edit and expand panels disappear upon html body click
	$("#filler").click(function() {
		removeExpandPanel();
		removeEditPanel();
	});

	// make edit and expand panels disappear upon title container click
	$("#titleContainer").click(function() {
		removeExpandPanel();
		removeEditPanel();
	});

	// make expand panel appear
	function insertExpandPanel(i, y, m, d, noteList) {
		removeExpandPanel();
		removeEditPanel();
		createExpandPanel(i);
		addNotesToExpandPanel(y, m, d, noteList, i);
	}

	// create expand panel and set its styles
	function createExpandPanel(i) {
		let cal = document.getElementById("calendar-grid");
		let rect = cal.getBoundingClientRect();
		let calPadding = 0;
		let lMargin = rect.left + calPadding;
		let tMargin = rect.top + calPadding;
		let expandPanel = document.createElement("div");
		expandPanel.id = "expandPanel";

		expandPanel.style.left = (lMargin + ((i % 7) * gridWidth)).toString() + "px";
		if (Math.floor(i/7) == 0)
		  expandPanel.style.top = (tMargin).toString() + "px";
		else
		  expandPanel.style.top = (tMargin + ((Math.floor(i/7) - 1) * gridHeight) + gridHeightFirst).toString() + "px";
 
		expandPanel.style.position = "absolute";
		expandPanel.style.width = (gridWidth).toString() + "px";
		expandPanel.style.boxShadow = "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)";
		expandPanel.style.backgroundColor = "#FFFFFF";
		document.getElementById("container").insertAdjacentElement("afterbegin", expandPanel);
	}

	// make edit panel appear
	function insertEditPanel(i, y, m, d, noteList) {
		removeEditPanel();
		createEditPanel(i);
	}

	// add notes to edit panel
	function addNotesToExpandPanel(y, m, d, noteList, j) {
		let expandPanel = document.getElementById("expandPanel");
		expandPanel.style.border = "1px solid #000000";
		let dateElement = document.createElement("h3");
		dateElement.innerHTML = d.toString();

		let today = new Date();
		if (d == today.getDate() & today.getMonth() == currMonth & today.getFullYear() == currYear)
		  dateElement.style.color = "#0085e3";
		else
		  dateElement.style.color = "#000000";
		dateElement.style.backgroundColor = "#FFFFFF";
		dateElement.style.fontSize = "11.7px";
		dateElement.style.padding = "10px 0px 5px 10px";
		dateElement.style.margin = "0px 0px 0px 0px";
		expandPanel.append(dateElement);

		for (i=0; i<noteList.length; i++) {
			let note = noteList[i];
			let noteElement = document.createElement("div");
			let noteTextElement = document.createElement("h3");

			let text = note.getText();
			if (text == "")
			  noteTextElement.innerHTML = "(No title)";
			else
			  noteTextElement.innerHTML = note.getText();
			noteElement.append(noteTextElement);
			noteElement.style.color = "#FFFFFF";
			noteElement.style.backgroundColor = note.getColour();
			noteElement.style.fontSize = "10px";
			noteTextElement.style.padding = "5px 0px 5px 10px";
			noteTextElement.style.margin = "0px 0px 0px 0px";
			expandPanel.append(noteElement);
			noteElement.addEventListener("click",
				noteElementClick.bind(null, y, m, d, note, i, j));			
		}
	}

	// remove expand panel if it exists
	function removeExpandPanel() {
		if (document.getElementById("expandPanel") != null)
		  document.getElementById("expandPanel").remove();
	}

	// remove edit panel if it exists
	function removeEditPanel() {
		if (document.getElementById("editPanel") != null)
		  document.getElementById("editPanel").remove();
	}

	// create edit panel and set its styles
	function createEditPanel(i) {
		let cal = document.getElementById("calendar-grid");
		let rect = cal.getBoundingClientRect();
		let calPadding = 0;
		let lMargin = rect.left + calPadding;
		let tMargin = rect.top + calPadding;
		let editPanel = document.createElement("div");
		editPanel.id = "editPanel";
		console.log(rect.left, rect.right, rect.top, rect.bottom);

		if (!(i % 7 == 5 | i % 7 == 6)) {
			editPanel.style.left = (lMargin + (((i+1) % 7) * gridWidth)).toString() + "px";
		} else {
			editPanel.style.left = (lMargin + (((i-2) % 7) * gridWidth)).toString() + "px";
		}

		if (Math.floor(i/7) == 0)
		  editPanel.style.top = (tMargin).toString() + "px";
		else if (Math.floor(i/7) == 5 | Math.floor(i/7) == 4)
		  editPanel.style.top = ((tMargin + 2 * gridHeight) + gridHeightFirst).toString() + "px";
		else 
		  editPanel.style.top = (tMargin + ((Math.floor(i/7) - 1) * gridHeight) + gridHeightFirst).toString() + "px";

		editPanel.style.position = "absolute";
		editPanel.style.width = (gridWidth * 2 - 10).toString() + "px";
		editPanel.style.height = (gridHeight * 2 + 60).toString() + "px";
		editPanel.style.boxShadow = "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)";
		editPanel.style.backgroundColor = "#FFFFFF";
		document.getElementById("container").insertAdjacentElement("afterbegin", editPanel);
	
		let textInput = document.createElement("input");
		textInput.id = "textInput";
		textInput.placeholder = "Title";
		textInput.style.fontSize = "25px";
		textInput.style.border = "none";
		textInput.style.borderBottom = "1px solid grey";
		textInput.style.margin = "20px 20px 5px 20px";
		editPanel.append(textInput);

		let descInput = document.createElement("textarea");
		descInput.id = "descInput";
		descInput.placeholder = "Add description";
		descInput.cols = "37";
		descInput.rows = "8";
		descInput.style.fontFamily = "Arial";
		descInput.style.margin = "20px 20px 5px 20px";
		editPanel.append(descInput);

		let yearInput = document.createElement("input");
		yearInput.id = "yearInput";
		yearInput.placeholder = "YYYY";
		yearInput.size = "2";
		yearInput.style.border = "none";
		yearInput.style.borderBottom = "1px solid grey";
		yearInput.style.margin = "20px 5px 20px 20px";
		editPanel.append(yearInput);

		let monthInput = document.createElement("input");
		monthInput.id = "monthInput";
		monthInput.placeholder = "MM";
		monthInput.size = "1";
		monthInput.style.border = "none";
		monthInput.style.borderBottom = "1px solid grey";
		monthInput.style.margin = "20px 5px 20px 5px";
		editPanel.append(monthInput);

		let dateInput = document.createElement("input");
		dateInput.id = "dateInput";
		dateInput.placeholder = "DD";
		dateInput.size = "1";
		dateInput.style.border = "none";
		dateInput.style.borderBottom = "1px solid grey";
		dateInput.style.margin = "20px 20px 20px 5px";
		editPanel.append(dateInput);

		let colourButtonContainer = document.createElement("div");
		editPanel.append(colourButtonContainer);
		
		colourButtonList = [];
		for (i=0; i<colourList.length; i++) {
			let colourButton = document.createElement("p");
			colourButtonList.push(colourButton);
			colourButton.style.width = "20px";
			colourButton.style.height = colourButton.style.width;
			colourButton.style.backgroundColor = colourList[i];
			colourButton.style.border = "none";
			if (i == 0) {
				colourButton.style.margin = "5px 5px 5px 20px";
			} else if (i == colourList.length - 1) {
				colourButton.style.margin = "5px 20px 5px 5px";
			} else {
				colourButton.style.margin = "5px 5px 5px 5px";
			}
			colourButton.style.display = "inline-block";
			colourButtonContainer.append(colourButton);
			colourButton.addEventListener("click",
			function () {
				colourInput.value = colourButton.style.backgroundColor;
				updateColourButtons(colourButton.style.backgroundColor);
			});
		}

		let buttonContainer = document.createElement("div");
		editPanel.append(buttonContainer);
	
		let colourInput = document.createElement("input");
		colourInput.id = "colourInput";
		colourInput.placeholder = "Colour";
		colourInput.style.visibility = "hidden";
		buttonContainer.append(colourInput);


		let editButton = document.createElement("button");
		editButton.appendChild(document.createTextNode("Save"));
		editButton.id = "editButton";
		editButton.style.float = "right";
		editButton.style.margin = "20px 20px 20px 5px";
		editButton.addEventListener("click", editButtonOnClick.bind(null, editButton));
		buttonContainer.append(editButton);

		let removeButton = document.createElement("button");
		removeButton.appendChild(document.createTextNode("Delete"));
		removeButton.id = "removeButton";
		removeButton.style.float = "right";
		removeButton.style.margin = "20px 5px 20px 20px";
		removeButton.addEventListener("click", removeButtonOnClick.bind(null, removeButton));
		buttonContainer.append(removeButton);
	}

	function rgbToHex(r, g, b) {
    		return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
	}

	// refresh calendar and insert dates in calendar
	function insertCalendarDates() {
		let today = new Date();
		for (i=0; i<gridSpacesList.length; i++) {
			gridSpacesList[i][0].innerHTML = fillerText;
			gridSpacesList[i][0].style.color = "#FFFFFF";
		}

		let dList = makeDaysForMonth();
		let k = dList[0].getDay();
		for (i=0; i<dList.length; i++) {
			let j = i + 1;
			gridSpacesList[k][0].innerHTML = j.toString();
			if (j == today.getDate() & today.getMonth() == currMonth & today.getFullYear() == currYear)
			  gridSpacesList[k][0].style.color = "#0085e3";
			else
			  gridSpacesList[k][0].style.color = "#000000";
			k++;
		}

		for (i=0; i<7; i++) {
			let day = document.createElement("h3");
			day.innerHTML = dayList[i];
			day.style.textAlign = "center";
			day.style.paddingRight = "10px";
			day.style.margin = "0px";
			day.style.color = "#bfbfbf";
			gridSpacesList[i][0].insertAdjacentElement("afterbegin", day);
		}
	}


	// generate list of days for current month
	function makeDaysForMonth() {
		dList = [];

		counter = 1;
		while (true) {
			let d = new Date();
			d.setFullYear(currYear);
			d.setMonth(currMonth);
			d.setDate(counter);
			if (d.getMonth() != currMonth) break;
			dList.push(d);
			counter++;
		}

		return dList;
	}

	// set currMonth to next month, and add 1 to currYear if necessary, update month title
	$("#nextMonth").click(function() {
		currMonth = (currMonth + 1) % 12;
		if (currMonth == 0) {
			currYear ++;
		}
		updateCalendar();
		setMonthYearTitle(currMonth, currYear);
	});

	// set currMonth to prev month, and sub 1 to currYear if necessary, update month title
	$("#prevMonth").click(function() {
		currMonth = (currMonth - 1) % 12;
		if (currMonth == -1) {
			currMonth = 11;
			currYear --;
		}
		updateCalendar();
		setMonthYearTitle(currMonth, currYear);
	});

	// update calendar dates and notes
	function updateCalendar() {
		insertCalendarDates();
		updateCalendarNotes();
	}

	// make note item container under grid
	function makeNoteContainer() {
		let calendar = document.getElementById("calendar-grid");
		let noteContainer = document.createElement("div");
		noteContainer.id = "note-container";
		calendar.insertAdjacentElement("afterend", noteContainer);
	}

	// update calendar with notes
	function updateCalendarNotes() {
		clearCalendar();
		let date = new Date();
		let y = currYear;
		let m = currMonth;
		for (j=0; j<42; j++) {
			
			let dateStr = gridSpacesList[j][0].innerHTML;
			if (dateStr.length > 2)
			  dateStr = dateStr.charAt(dateStr.length - 1).toString();
			if (!(isNaN(parseInt(dateStr)))) {
				let d = parseInt(dateStr);
				let noteDate = getNoteDate(y, m, d);
				if (noteDate != null) {
					let noteList = noteDate.getNoteList();
					for (k=0; k<noteList.length; k++) {
						let space = gridSpacesList[j][k+1];
						let gSLL = gridSpacesList[j].length;
						
						if (k + 1 == gSLL - 2 && noteList.length > gSLL - 2) {
							let diff = noteList.length - (gSLL - 1) + 2;
							space.innerHTML = diff.toString() + " more";
							space.style.color = "#000000";
							space.style.backgroundColor = "#FFFFFF";
							break;
						}
						let text = noteList[k].getText();
						if (text == "")
						  space.innerHTML = "(No title)";
						else
						  space.innerHTML = noteList[k].getText();
						space.style.color = "#FFFFFF";
						space.style.backgroundColor = noteList[k].getColour();
					}
				}
			}
		}
	}

		

	// clear calendar items
	function clearCalendar() {
		for (i=0; i<gridSpacesList.length; i++) {
			for (j=1; j<gridSpacesList[i].length; j++) {
				let space = gridSpacesList[i][j];
				space.innerHTML = fillerText;
				space.style.color = "#FFFFFF";
				space.style.backgroundColor = "#FFFFFF";
			}
		}
	}

	// handle note element click
	function noteElementClick(y, m, d, note, i, j) {
		if (typeof j != "undefined") {
			removeExpandPanel();
			insertEditPanel(j);
		}
		updateInputs(y, m, d, note);
		updateSIndex(y, m, d, i);
		updateColourButtons(note.getColour());
	}

	// add border to selected colour button
	function updateColourButtons(c) {
		let borderSize = 2;
		for (i=0; i<colourButtonList.length; i++) {
			let colourButton = colourButtonList[i];
			let cBWString = colourButton.style.width.toString();
			if (colourButton.style.backgroundColor == c && colourButton.style.border == "none") {
				colourButton.style.width 
				  = (parseInt(cBWString.substring(0, cBWString.length - 2)) - (borderSize * 2)).toString() + "px";
				colourButton.style.height = colourButton.style.width;
				colourButton.style.border = borderSize.toString() + "px solid black";
			} else if (colourButton.style.backgroundColor != c && colourButton.style.border != "none") {
				colourButton.style.width 
				  = (parseInt(cBWString.substring(0, cBWString.length - 2)) + (borderSize * 2)).toString() + "px";
				colourButton.style.height = colourButton.style.width;
				colourButton.style.border = "none";
			}
		}
	}

	// update inputs with note data
	function updateInputs(y, m, d, note) {
		let m1 = m + 1;
		let colourString = note.getColour();
		document.getElementById("yearInput").value = y.toString();
		document.getElementById("monthInput").value = m1.toString();
		document.getElementById("dateInput").value = d.toString();
		document.getElementById("textInput").value = note.getText();
		document.getElementById("colourInput").value = colourString;
		document.getElementById("descInput").value = note.getDesc();
	}

	// update selected note data
	function updateSIndex(y, m, d, i) {
		sYear = y;
		sMonth = m;
		sDate = d;
		sIndex = i;
	}

	// remove all children of note container
	function clearNoteContainer(noteContainer) {
		while (noteContainer.firstChild) {
			noteContainer.removeChild(noteContainer.firstChild);
		}
	}

	// insert first element after second element
	function insertAfter(child, id) {
		$(id).parentNode.insertBefore(child, $(id).nextSibling);
	}

	// handle remove button click
	$("#removeButton").click(function() {
		removeNote();
		updateCalendarNotes();
	});
	
	// handle edit button click
	$("#editButton").click(function() {
		editNote();
	});

	// edit selected note on edit button click
	function editButtonOnClick() {
		editNote();
		removeEditPanel();
		removeExpandPanel();
	}

	//remove selected note on remove button click
	function removeButtonOnClick() {
		removeNote();
		updateCalendarNotes();
		removeEditPanel();
		removeExpandPanel();
	}

	// remove selected note
	function removeNote() {
		if (sIndex != null) {
			let noteDate = getNoteDate(sYear, sMonth, sDate);
			if (noteDate != null) {
				let noteList = noteDate.getNoteList();
				noteList.splice(sIndex, 1);
			}
		}
		chrome.storage.sync.set({"noteDateList": noteDateList}, function(){});
	}

	// remove old note, then add new note, and at sIndex if date is unchanged
	function editNote() {
		removeNote();
		addNote(null);
		updateCalendarNotes();
	}

	// add new note with inputted data
	function addNote(clickedDate) {
		let y,m,d,t,c,desc;
		if (clickedDate == null) {
		y = document.getElementById("yearInput").value;
		m = document.getElementById("monthInput").value;
		let mInt = parseInt(m);
		mInt--;
		m = mInt.toString();
		d = document.getElementById("dateInput").value;
		t = document.getElementById("textInput").value;
		let cString = document.getElementById("colourInput").value;
		c = cString;
		desc = document.getElementById("descInput").value;
		} else {
			y = currYear;
			m = currMonth;
			d = clickedDate;
			t = "";
			c = "rgb(0, 133, 227)";
			desc = "";
		}

		
		let noteDate = getNoteDate(y, m, d);
		if (noteDate == null) {
			noteDate = new NoteDate(y, m, d);
			noteDateList.push(noteDate);
		}
		let note = new Note(t, c, desc);
		
		if (parseInt(y) == sYear && parseInt(m) == sMonth && parseInt(d) == sDate) {
			noteDate.getNoteList().splice(sIndex, 0, note);
		} else {
			noteDate.addNote(note);
		}

		chrome.storage.sync.set({"noteDateList": noteDateList}, function(){});
		return note;
	}

	// returns matching note date, returns null otherwise
	function getNoteDate(y, m, d) {
		for (i=0; i<noteDateList.length; i++) {
			if (noteDateList[i].isSameDate(y,m,d)) return noteDateList[i];
		}
		return null;
	}

	// initialize the current month and year to today's month, year, set month title text
	function initCurrMY() {
		let d = new Date();
		currMonth = d.getMonth();
		currYear = d.getFullYear();
		setMonthYearTitle(currMonth, currYear);
	}

	// set month title text
	function setMonthYearTitle(m, y) {
		let monthNames = ["January", "February", "March", "April", "May", "June",
  			"July", "August", "September", "October", "November", "December"];
		document.getElementById("monthTitle").innerHTML = monthNames[m];
		document.getElementById("yearTitle").innerHTML = y.toString();
	}

	// retrieve saved note date list
	function getSavedNoteDateList() {
	  let result = [];
	  chrome.storage.sync.get("noteDateList", function(obj) {
	    let ndl = obj.noteDateList;
	      for (i=0; i<ndl.length; i++) {
	        let noteDate = new NoteDate(ndl[i]["year"], ndl[i]["month"], ndl[i]["date"]);
		noteDate.setNoteList(createNoteList(ndl[i]["noteList"]));
		result.push(noteDate);
	      }
	    noteDateList = result;
	    updateCalendarNotes();
	  });
	}

	// create note list from saved note list object
	function createNoteList(nl) {
	  let result = [];
	  for (j=0; j<nl.length; j++) {
	    let note = new Note(nl[j]["text"], nl[j]["colour"], nl[j]["desc"]);
	    result.push(note);
	  }
	  return result;
	}

	// clear note date list upon clicking clear button
	$("#clear").click(function() {
	  noteDateList = [];
	  updateCalendarNotes();
	  chrome.storage.sync.set({"noteDateList": []}, function() {});
	});

	// run the initial methods
	function run() {
		initCurrMY();
		makeGrids();
		insertCalendarDates();
		makeNoteContainer();
		getSavedNoteDateList();
	}

	run();
});
