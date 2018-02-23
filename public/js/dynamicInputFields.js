var countBox = 2;

function addExp() {
	document.getElementById("countexp").value = countBox;

	var newChild = document.createElement("tr");
	document.getElementById("countexp").value = countBox;

	// Create an empty <tr> element and add it to the 1st position of the table:
	var row = document.getElementById("exp").insertRow(-1);

	// Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
	var cell1 = row.insertCell(0);
	var cell2 = row.insertCell(1);
	var cell3 = row.insertCell(2);
	var cell4 = row.insertCell(3);

	// Add some text to the new cells:
	cell1.innerHTML = "Objekt";
	cell2.innerHTML = "<input type='text' id='role" + countBox + "' name='role" + countBox + "'/>";
	cell3.innerHTML = "Preis";
	cell4.innerHTML = "<input type='text' name='comp" + countBox + "'id='comp" + countBox + "''/>";



	countBox += 1;
}