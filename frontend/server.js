// const express = require('express');
// const fetch = require('node-fetch');
// const app = express();
// const port = 3000;

// app.use((req, res, next) => {
//     res.header('Access-Control-Allow-Origin', '*');
//     res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
//     next();
// });


// app.get('/api/pokemon', async (req, res) => {
//     try {
//         const response = await fetch('https://www.pokemon.com/us/api/pokedex/kalos');
//         const data = await response.json();
//         res.json(data);
//     } catch (error) {
//         res.status(500).json({ error: 'Failed to fetch data' });
//     }
// });

// app.listen(port, () => {
//     console.log(`Server is running on http://localhost:${port}`);
// });

async function getData(){
const url=`https://www.pokemon.com/us/api/pokedex/kalos`
let headers={
"method":"GET",
"content-type":"application/json",
'Access-Control-Allow-Origin':'*',
'Access-Control-Allow-Headers':'Origin, X-Requested-With, Content-Type, Accept'
}
const response= await fetch('https://www.pokemon.com/us/api/pokedex/kalos', {
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      'Accept': 'application/json, text/javascript, /; q=0.01',
      'Referer': 'https://www.pokemon.com/us/pokedex',
      'Connection': 'keep-alive',
    },
    credentials: 'include', // Enable cookies if needed
  })
    .then(res => res.json())
    .then(data => console.log(data))
    .catch(err => console.error('Error:', err));

console.log("check this->",response);

}

getData();