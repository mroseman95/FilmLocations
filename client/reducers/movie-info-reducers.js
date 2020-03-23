import * as actions from '../actions';
import initialState from '../state/initial-state.js';

export default function movieInfo(state=initialState.movieInfo, action) {
  switch(action.type) {
    case actions.SET_MOVIE_IDS_SHOWING:
      return {
        ...state,
        movieIdsShowing: action.movieIdsShowing
      }
    case actions.REQUEST_TOP_MOVIES:
      return {
        ...state,
        isLoading: true
      };
    case actions.SET_TOP_MOVIES:
      return {
        ...state,
        isLoading: false,
        topMovies: action.topMovies
      }
    default:
      return state;
  }
}
