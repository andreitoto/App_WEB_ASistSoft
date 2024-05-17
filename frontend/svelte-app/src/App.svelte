<script>
	import { writable } from "svelte/store";

	let name = writable(""); // This makes the input reactive
	let type = writable("client"); // Default to 'client', and it's reactive too
	let results = writable(null); // This will hold the JSON results

	// Fetch data based on type
	async function handleSearch() {
		const nameValue = $name; // Using the reactive variable
		const typeValue = $type; // Using the reactive variable
		const response = await fetch(
			`http://localhost:3000/search/${typeValue}?name=${nameValue}`,
		);
		if (response.ok) {
			if (response.status === 204) {
				results.set("Nu s-a găsit niciun rezultat în baza de date.");
				return;
			}
			const json = await response.json();
			results.set(json); // Update the Svelte store
		} else {
			results.set(null); // Clear previous results on error
			console.error("Failed to fetch:", response.statusText);
		}
	}
</script>

<main>
	<h1>Căutare Informații</h1>
	<input type="text" bind:value={$name} placeholder="Introduceți numele" />
	<select bind:value={$type}>
		<option value="client">Client</option>
		<option value="company">Companie</option>
	</select>
	<button on:click={handleSearch}>Caută</button>
	{#if $results}
		<pre>{JSON.stringify($results, null, 2)}</pre>
	{/if}
</main>

<style>
	main {
		text-align: center;
		margin-top: 50px;
	}
	input,
	select,
	button {
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
