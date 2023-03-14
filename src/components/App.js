import React from 'react';
import SearchInput from './SearchInput';
import axios from 'axios';
import './style.css';

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

stringCleaner(x) {
      return x.
      replaceAll("\\n", " ").replaceAll(/<span\sclass=\\"mw-editsection.*?span>/g, "").replaceAll("href", " ").
      replaceAll(/plainlinks hlist.*?<\/div>/g, "").replaceAll(/cite_note.*?<\/a>/g, "")
   }

async getSectionNumber(adress, wanted_section) {
  const url = "https://en.wikipedia.org/w/api.php?action=" + adress;
  const response = await fetch(url);
  const result = await response.json(); 
  const errorMessage = 'The search you made has returned no results.'
  let i;
  if (typeof result.parse === 'undefined') {
    return errorMessage}
  else {
    for (i = 0; i <= result.parse.sections.length; i++) {
      if (result.parse.sections[i].anchor === wanted_section) {
        const number = i+1
        return number }
      else if (i === result.parse.sections.length-1 && result.parse.sections[i].anchor != wanted_section) {
        return errorMessage}
 }}
}

async getCleanStringResponse(page, section) {
  let apiResponse = await axios.get("https://en.wikipedia.org/w/api.php?action=parse&origin=*&page=" + page + "&section=" + section + "&prop=text&formatversion=2&format=json")
  const JSONstring = JSON.stringify(apiResponse)
  const cleanString = this.stringCleaner(JSONstring);
  return cleanString
}

async getWikitables(entry, section_name) {
    const allEntries = entry.split(",");
    const resultsArray = [];
    const wikitableRegex = new RegExp(/<table\sclass=\\"wikitable.*?table>/g)
    for (const element of allEntries) {
    const number = await this.getSectionNumber("parse&origin=*&format=json&page=" + element + "&prop=sections&disabletoc=1", section_name)
    if (typeof number === 'number') {
    const cleanString = await this.getCleanStringResponse(element, number)
    const wikitable = cleanString.match(wikitableRegex)
    resultsArray.push("<p class=título>" + element + " <p>", wikitable)
  }
    else {resultsArray.push("<p class=título>" + element + " <p>" + "<p>" + number + "</p>")}
  }
  this.setState({climate_tables: resultsArray.join('')}); 

   }

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



//replace(/{"data".*extract":"/i, "").//replace(/"}}}},".*request":{}}/i, "").
      //replace(/{"data":.*"text":"/i, "").//replace(/"}},".*request":{}}/i, "").

           // replaceAll(/<img alt=.*?">/g, "").
