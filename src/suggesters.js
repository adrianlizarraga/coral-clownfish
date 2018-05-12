import RandomSuggester from './suggesters/random';
import DumbSuggester from './suggesters/dumb';

// Reference your suggester class here using an import statment like above.

// Add a new instance of your suggester here. It will then show up in game. 
export default [ new RandomSuggester('Scott\'s randomizer'), new DumbSuggester('Dumb thing') ];
