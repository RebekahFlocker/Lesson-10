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
      dispatch({ type: 'FETCH_INIT' }); // fetch is starting = loading
      
      try {
      const result = await fetch(url); // fetches url + returns promise
      if (!result.ok) { // (!)not ok? / if failed then throw error
        throw new Error('Failed to Fetch Articles'); // does this call from the default in the reducer?
      }
      const data = await result.json();
        dispatch({ type: 'FETCH_SUCCESS', payload: data.hits });
      } 
      catch (error) {
        console.error (error); // log error
        // when failed, state the error in reducer (makes new state)
        dispatch({ type: 'FETCH_FAILURE' });
      }};
      fetchData(); 
    }, 
      [url]); 
      

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
            <li key={item.objectID}> {/* only changed items rerender + I added object because thats what makes the ID unique*/}
              <a href={item.url}> {/* I forgot to add this herf attribute to link the url to the title */}
            {item.title} </a>
              <button onClick={() => 
                dispatch({ type: 'REMOVE_ITEM', payload: item.objectID })}> {/*} inline handler */}
                  X
                </button> </li>
          ))}
        </ul>
        
        
    </div> 
  ); 
} 
 
export default App; 
