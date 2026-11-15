import { useState, useEffect, useRef, useReducer, useCallback } from 'react'; 
 
const initialState = { 
 data: [], 
 isLoading: false, 
 isError: false, 
 searchTerm: 'react',
}; 
 
function storiesReducer(state, action) { 
 switch (action.type) { 
   case 'FETCH_INIT': // fetch loading
     return { ...state, isLoading: true, isError: false }; 
   case 'FETCH_SUCCESS': // articles fetched
     return { ...state, isLoading: false, data: action.payload }; 
   case 'FETCH_FAILURE': // fetch failed
     return { ...state, isLoading: false, isError: true }; 
   case 'REMOVE_ITEM': 
     return { ...state, data: state.data.filter(item => item.objectID !== action.payload) }; 
   case 'SET_SEARCH_TERM': 
     return { ...state, searchTerm: action.payload }; 
   default: 
    throw new Error(); 
 } 
} 

// Textbook pg. 86
const DEFAULT_QUERY = 'redux'; // default search is react. called from below
const PATH_BASE = 'https://hn.algolia.com/api/v1'; // main/ starting link
const PATH_SEARCH = '/search'; // sets the endpoint for story/data search
const PARAM_SEARCH = 'query='; // search parameter based on search term

function App() { 
 const inputRef = useRef(); // focuse on search box after page renders. 
 const [state, dispatch] = useReducer(storiesReducer, initialState); 
 // combines the 4 previous const to create a full url thats search based.
 const [url, setUrl] = useState(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${DEFAULT_QUERY}`);
 
 console.log(url); // adds url to the console for debugging
  
 
 
  useEffect (() => {  // fetches data from the url when site is first rendered  
    const fetchData = async () => { 
      const result = await fetch(url); // fetches url + returns promise
      result.json().then(data => {
        dispatch({ type: 'FETCH_SUCCESS', payload: data.hits });
        dispatch({ type: 'FETCH_INIT' }); // fetch is starting = loading
      })
      .catch (error => {
        // when failed log the error in reducer (makes new state)
        dispatch({ type: 'FETCH_FAILURE' });
      });
      fetchData(); 
    }, 
      [url] });
    
      {/* // Testbook pg. 87, 102 + Tutorial: https://youtu.be/ZtFeOiylMr8?si=WvCLnGVEsYXJ5pX9 
      } fetch(url) // url is requested & was already stated/ created in the useState above 
      .then(response => response.json()) // converts from JSON to JSX
      .then(data => {
        // when successful send the articles
        dispatch({ type: 'FETCH_SUCCESS', payload: data.hits });
} ) */}
      

  return ( 
    <div> 
      <h1>My Articles</h1> 
      <div className = "search"> 
          <form onSubmit={event => { // textbook pg. 99
            event.preventDefault(); // prevents page loading when search is clicked
            // how can I call on this in the App funtion above? instead of repeating this line?
            setUrl(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${state.searchTerm}`); 
          }} className="search-form">
            <input
              // react search box
              type="text"
              value={state.searchTerm} // when text values change, state is updated
              // carries data to reducer after every letter input
              onChange={event => // 
                dispatch({ type: 'SET_SEARCH_TERM', payload: event.target.value })}
        
              ref={inputRef} /> {/*calls useRef + text box interactions*/}
          
            <button type= "submit" >
              Search
            </button>
            
          </form>
        </div> 
        {/* returns loading or error states to the user, when applicable. Textbook pg. 115, 116*/}
        {state.isLoading &&<p>Loading...</p>}
        {state.isError && <p>Loading Error!</p>}
        
        <ul className="page">
          {/* runs every article to return a bullet */}
          {state.data.map(item => ( 
            <li key={item.ID}> {/* only changed items rerender*/}
              {item.title} </li>
          ))}
        </ul>
        
        {/* working on adding X button to delete articles. 
        + linking the actual article and redirect to the API from the title */}
    </div> 
  ); 
} 
 
export default App; 
