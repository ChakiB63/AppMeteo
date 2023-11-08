import React, { useState, useEffect } from 'react';
import Search from './components/search/search';
import './App.css';
import { WEATHER_API_URL, WEATHER_API_KEY, MyAPI_URL } from './myapi';
import CurrentWeather from './components/weather/current-weather';
import { BsStarFill, BsTrashFill } from 'react-icons/bs';
import { useParams } from 'react-router-dom';


function App() {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [favoriteweathers, setFavoriteweathers] = useState([]);
  //const [favoriteweather, setFavoriteweather] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


 
    useEffect(() => {
     fetchFavorites();
   }, []);
/*
   useEffect(() => {
    console.log(favoriteweather);
  }, [favoriteweather]);
   
useEffect(() => {
    console.log('favorites:',favorites);
    console.log('favoriteweathers:',favoriteweathers);
 }, [favorites]); 

 useEffect(() => {
  console.log('cwState:',currentWeather);
}, [currentWeather]);


const updatefavweathers=() =>{
  console.log('FetchFavoriteweathers lancée 1')
  const nfw=favorites.map((favorite)=>{
  console.log('FetchFavoriteweathers lancée 1')
    fetch(`${MyAPI_URL}/locations/weather/${favorite}`)
    .then((response) => response.json())
    .then((data) => {
      if (data && data.length > 0) {
        console.log('FetchFavoriteweathers lancée')
        return data;
      } else {
        //setFavorites([]);
        console.log('FetchFavoriteweathers lancée');
        return;
    }})
    .catch((error) => {
      console.error('Failed to fetch favorites:', error);
      return;
    });
  })
  setFavoriteweathers(nfw);
  };
  
const weather=(adress)=>{
  console.log('FetchFavoriteweathers lancée');
  fetch(`${MyAPI_URL}/locations/weather/${adress}`)
    .then((response) => response.json())
    .then((data) => {
      if (data && data.length > 0) {
        console.log('FetchFavoriteweathers lancée')
        setFavoriteweather(data);
      } else {
        setFavoriteweather({})
    }})
    .catch((error) => {
      console.error('Failed to fetch favorites:', error);
      setFavoriteweather({})
    });
  }
*/
  

useEffect(() => {
  fetchFavoriteWeathers();
}, [favorites]);

const fetchFavoriteWeathers = () => { 
  const fetchWeather = async (location) => {
    try {
      const response = await fetch(`http://localhost:5000/locations/weather/${location}`);
      const data = await response.json();
      if (data) {
        return { city: location, ...data };
      }
      return null;
    } catch (error) {
      console.error('Failed to fetch weather:', error);
      return null;
    }
  };

  const fetchAllWeather = async () => {
    const weatherPromises = favorites.map((location) => fetchWeather(location));
    const weatherData = await Promise.all(weatherPromises);
    setFavoriteweathers(weatherData.filter((data) => data !== null));
    console.log(favoriteweathers)
  };

  fetchAllWeather();
  
};

const { id_user } = useParams();
  const getUserId = () => {
    // Implement your logic to get the user ID
    return 1;
  };

  

  const fetchFavorites = () => { // S'execute 2 fois
    const userId = getUserId();
    
    fetch(`${MyAPI_URL}/locations/${userId}`)
      .then((response) => response.json())
      .then((data) => {
        if (data?.locations && data.locations.length > 0) {
          setFavorites(data.locations);
          console.log('FetchFavorites lancée')/*
          data.locations.forEach(element => {
            weather(element);
          });*/
          //updatefavweathers();
          //console.log('1');
          //console.log(data.locations);
          //console.log(favorites);
          //console.log('currentWeather', currentWeather);
        } else {
          setFavorites([]);
          console.log('FetchFavorites lancée NN');
          //console.log('2')
          
        }
      })
      .catch((error) => {
        console.error('Failed to fetch favorites:', error);
      });
  };


  const addToFavorites = (city) => {
    
    if (favorites?.includes(city)) {   
      return;
    }
  
    //setFavorites([...(favorites || []), city]);
    //setFavorites((prevFavorites) => [...prevFavorites, city]);

    const requestBody = {
      name: city,
      user_id: getUserId(),
    };
  
    fetch(`${MyAPI_URL}/locations/add`, {
      
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Favorite location added to the database:', data);
        fetchFavorites();
      })
      .catch((error) => {
        console.error('Failed to add favorite location:', error);
      });
  };
  

  const removeFavorite = (city) => {
    //setFavorites(favorites?.filter((favorite) => favorite !== city));
  
    const user_id = getUserId();
  
    fetch(`${MyAPI_URL}/locations/${city}/${user_id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Favorite location removed from the database:', data);
        fetchFavorites();
      })
      .catch((error) => {
        console.error('Failed to remove favorite location:', error);
      });
  };
  


  const handleOnSearchChange = (searchData) => {
    const [lat, lon] = searchData.value.split(' ');
    setLoading(true);
    setError(null);

    fetch(`${WEATHER_API_URL}/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}`)
      .then((response) => response.json())
      .then((data) => {
        setCurrentWeather({ city: searchData.label, ...data });
        //console.log(currentWeather)
        addToFavorites(searchData.label);
        
      })
      .catch((error) => {
        console.error('Failed to fetch weather data:', error);
        setError('Failed to fetch weather data');
      })
      .finally(() => {
        setLoading(false);
        console.log('handle on search successful')

      });
  };


  
 // fetchFavorites();
  return (
    <div className="container">
      <Search onSearchChange={handleOnSearchChange} addToFavorites={addToFavorites} />
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : currentWeather ? (
        <CurrentWeather data={currentWeather} />
      ) : null}
      <div className="favorites">
        <h2>
          <BsStarFill className="favorites-icon" />
          My List
        </h2>
        {favorites?.map((favorite) => (
          <div  className="favorite-item">
            <CurrentWeather data={favoriteweathers[favorites.indexOf(favorite)]} />
            <BsTrashFill className="trash-icon" onClick={() => removeFavorite(favorite)} />
          </div>
        ))}
      </div>
    </div>
  );
        }

export default App;
