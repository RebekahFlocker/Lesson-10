import { useEffect, useRef, useReducer } from 'react';
import './App.css';

// useReducer + article content
const initialState = {
  data: [],
  isLoading: false,
  isError: false,
  searchTerm: 'react',
  url: 'https://hn.algolia.com/api/v1/search?query=react',
};

// Reducer function + state 
function storiesReducer(state, action) {
  switch (action.type) {
    case 'FETCH_INIT':
      return { 
        ...state, 
        isLoading: true, 
        isError: false 
      };
    case 'FETCH_SUCCESS':
      return { 
        ...state, 
        isLoading: false, 
        isError: false,
        data: action.payload 
      };
    case 'FETCH_FAILURE':
      return { 
        ...state, 
        isLoading: false, 
        isError: true 
      };
    case 'REMOVE_ITEM':
      return { 
        ...state, 
        data: state.data.filter((item) => item.objectID !== action.payload) 
      };
    case 'SET_SEARCH_TERM':
      return { 
        ...state, 
        searchTerm: action.payload 
      };
    case 'SET_URL':
      return { 
        ...state, 
        url: action.payload 
      };
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
}

function App() {
  // React input
  const inputRef = useRef();

  const [state, dispatch] = useReducer(storiesReducer, initialState);

  // Data fetching
  useEffect(() => {
    let isSubscribed = true; // Prevents state updates on unmounted components

    const fetchStories = async () => {
      dispatch({ type: 'FETCH_INIT' });

      try {
        const response = await fetch(state.url);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const result = await response.json();
        
        if (isSubscribed) {
          dispatch({ 
            type: 'FETCH_SUCCESS', 
            payload: result.hits 
          });
        }
      } catch (error) {
        if (isSubscribed) {
          dispatch({ type: 'FETCH_FAILURE' });
        }
      }
    };

    fetchStories();

    return () => {
      isSubscribed = false;
    };
  }, [state.url]);

  // Form handler search
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    dispatch({
      type: 'SET_URL',
      payload: `https://hn.algolia.com/api/v1/search?query=${state.searchTerm}`,
    });
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>My Articles</h1>

      {/* Search Form */}
      <form onSubmit={handleSearchSubmit} style={{ marginBottom: '20px' }}>
        <input
          ref={inputRef} // Imperative DOM access
          type="text"
          value={state.searchTerm}
          onChange={(e) =>
            dispatch({ type: 'SET_SEARCH_TERM', payload: e.target.value })
          }
          placeholder="Search articles..."
        />
        
        <button
          type="submit"
          onClick={() => {
            if (inputRef.current) {
              inputRef.current.focus();
            }
          }}
          style={{ marginLeft: '8px' }}
        >
          Search
        </button>
      </form>

      {/* Loading + errors */}
      {state.isError && (
        <p style={{ color: 'red' }}>Something went wrong while fetching articles...</p>
      )}

      {state.isLoading ? (
        <p>Loading articles...</p>
      ) : (
        // dismissal
        <ul>
          {state.data.map((item) => (
            <li key={item.objectID} style={{ marginBottom: '8px' }}>
              <a href={item.url} target="_blank" rel="noopener noreferrer">
                {item.title || item.story_title || 'Untitled Article'}
              </a>
              
              <button
                onClick={() =>
                  dispatch({ type: 'REMOVE_ITEM', payload: item.objectID })
                }
                style={{ marginLeft: '10px' }}
              >
                Dismiss
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;