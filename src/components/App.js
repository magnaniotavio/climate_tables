import React from 'react';
import SearchInput from './SearchInput';
import axios from 'axios';
import './style.css';

/* Through this app, we can get the Wikipedia climate tables for any city by simply doing a search,
which can include more than one city at once. */

class App extends React.Component{

constructor(props) {
        super(props)
        this.state = {climate_tables: " ", value: 'player', title: " "};
        this.onSearchSubmit = this.onSearchSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.stringCleaner = this.stringCleaner.bind(this);
        this.getWikitables = this.getWikitables.bind(this);
        this.getSectionNumber = this.getSectionNumber.bind(this);
        this.getCleanStringResponse = this.getCleanStringResponse.bind(this);
    }


handleChange(event) {
      this.setState({value: event.target.value});
      console.log(event.target.value)
    }


/* When we get some content from the Wikipedia API, it usually comes in a reader-unfriendly format, containing such
elements as [edit], links, API information, etc. The following function uses the replace function, 
as well as regular expressions, to eliminate this visual polution from the page's HTML. */
stringCleaner(x) {
      return x.
      replaceAll("\\n", " ").replaceAll(/<span\sclass=\\"mw-editsection.*?span>/g, "").replaceAll("href", " ").
      replaceAll(/plainlinks hlist.*?<\/div>/g, "").replaceAll(/cite_note.*?<\/a>/g, "")
   }


/* Uses the "prop = section" parameter of the Wikipedia API, which returns a list of all the section names,
and loops through it in order to find the section whose "anchor" name corresponds to the one we want */
async getSectionNumber(adress, wanted_section) {
  const url = "https://en.wikipedia.org/w/api.php?action=" + adress;
  const response = await fetch(url);
  const result = await response.json(); 
  const errorMessage = 'The search you made has returned no results.'
  let i;
// Checks for when the page doesn't exist.
  if (typeof result.parse === 'undefined') {
    return errorMessage}
// Loops through all the sections, and returns the number of the one we want
  else {
    for (i = 0; i <= result.parse.sections.length; i++) {
      if (result.parse.sections[i].anchor === wanted_section) {
        const number = i+1
        return number }
// Checks for when the page exists, but does not have the specified section.
      else if (i === result.parse.sections.length-1 && result.parse.sections[i].anchor != wanted_section) {
        return errorMessage}
 }}
}


// Uses the "prop = text" parameter to get the text of a section whose number has been specified
async getCleanStringResponse(page, section_number) {
  let apiResponse = await axios.get("https://en.wikipedia.org/w/api.php?action=parse&origin=*&page=" + page + "&section=" + section_number + "&prop=text&formatversion=2&format=json")
// Tunrs the response into a string
  const JSONstring = JSON.stringify(apiResponse)
// Cleans the string
  const cleanString = this.stringCleaner(JSONstring);
  return cleanString
}


// Gets the wikitable for all the entries. 
async getWikitables(entry, section_name) {
// By splitting the entry string into an array separated by commas, we allow many entries to be added at once
    const allEntries = entry.split(",");
// This is the array which will store the results
    const resultsArray = [];
// These are the RegExp specifications for a WikiTable
    const wikitableRegex = new RegExp(/<table\sclass=\\"wikitable.*?table>/g)
// Loops over all the entires
    for (const element of allEntries) {
    const numberOrError = await this.getSectionNumber("parse&origin=*&format=json&page=" + element + "&prop=sections&disabletoc=1", section_name)
// Checks for a number associated with the section, and, upon finding it, gets the section, matches for the Regex, and pushes the wikitable into resultsArray
    if (typeof numberOrError === 'number') {
    const cleanString = await this.getCleanStringResponse(element, numberOrError)
    const wikitable = cleanString.match(wikitableRegex)
    resultsArray.push("<p class=título>" + element + " <p>", wikitable)
  }
// Pushes the error message into the array, in no number was found
    else {resultsArray.push("<p class=título>" + element + " <p>" + "<p>" + numberOrError + "</p>")}
  }
// Sets the array as state, joined by '' so as to prevent the commas between the array elements from showing up on the page
  this.setState({climate_tables: resultsArray.join('')}); 
   }


// Finally, we specify that we want the wikitables for the "Climate" section
async onSearchSubmit(entry){
        this.getWikitables(entry, "Climate")
    }


render(){
        return (
        <div className="body">
        <div className="header">
             <p className="site_title">Search for the climate information of many cities at once!</p>
             <SearchInput onSearchSubmit={this.onSearchSubmit}/>
          </div>
          <div className="search-result-block">
              {<div dangerouslySetInnerHTML={{ __html: this.state.title }} className="title"/>}
              {<div dangerouslySetInnerHTML={{ __html: this.state.climate_tables }} className="search-result"/>}
          </div>
        </div>
        )
    }
}

export default App;



