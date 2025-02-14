async function getData() {
    const url = "https://www.pokemon.com/us/api/pokedex/kalos";
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Accept": "application/json"
        }
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log("Fetched Pokémon Data:", data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }
  
  getData();
  