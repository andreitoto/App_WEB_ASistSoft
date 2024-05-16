<script>
	let name = "";
	let type = "client"; // sau "company"
	let results = "";
	let dataToSave = "";

	// Funcție pentru a citi datele
	async function readData() {
	  const response = await fetch('http://localhost:3002/read');
	  const text = await response.text();
	  results = text;
	}

	// Funcție pentru a scrie datele
	async function writeData() {
	  const response = await fetch('http://localhost:3002/write', {
		method: 'POST',
		headers: {
		  'Content-Type': 'application/json'
		},
		body: JSON.stringify({ data: dataToSave })
	  });
	  const text = await response.text();
	  alert(text); // Poți folosi o modalitate mai elegantă de a afișa răspunsurile
	}

	// Fetch data based on type
	async function fetchData() {
	  const response = await fetch(`http://localhost:3000/search/${type}`, {
		method: 'POST',
		headers: {
		  'Content-Type': 'application/json'
		},
		body: JSON.stringify({ name })
	  });
	  results = await response.json();
	}
</script>

<main>
	<h1>Căutare Informații</h1>
	<input type="text" bind:value={name} placeholder="Introduceți numele">
	<select bind:value={type}>
	  <option value="client">Client</option>
	  <option value="company">Companie</option>
	</select>
	<button on:click={fetchData}>Caută</button>
	<input type="text" bind:value={dataToSave} placeholder="Data to save">
	<button on:click={writeData}>Salvează Date</button>
	<button on:click={readData}>Încarcă Date</button>
	{#if results}
	  <pre>{JSON.stringify(results, null, 2)}</pre>
	{/if}
</main>

<style>
	main {
	  text-align: center;
	  margin-top: 50px;
	}
	input, select, button {
	  margin: 10px;
	  padding: 8px;
	  font-size: 16px;
	}
	pre {
	  text-align: left;
	  background-color: #f4f4f4;
	  padding: 15px;
	  border: 1px solid #ccc;
	  overflow: auto;
	}
</style>
