import {Component} from 'react';
import {Button} from 'reactstrap';
import Papa from 'papaparse'
import './App.css';

const GIVEAWAY_NAME = "Shake It";
const NUM_WINNERS = 1;
const ENTRIES_PER_STORY = 5;

class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      data: {}
    };

    this.getData = this.getData.bind(this);
  }

  componentDidMount() {
    this.getCsvData();
  }

  async fetchCsv() {
    const response = await fetch('https://kevhuyn-personal-data.s3-us-west-2.amazonaws.com/giveaway.csv');
    let reader = response.body.getReader();
    let decoder = new TextDecoder('utf-8');
    const result = await reader.read();
    return decoder.decode(result.value);
  }

  getData(result) {
    this.setState({data: result.data});
  }
  
  setAmountEntries() {
    let result = []
    this.state.data.forEach(user => {
      if (user[0].length > 0) {
        let item = [];
        item.push(user[0])
        item.push(user[1])
        item.push(user[2])

        if (user[0] !== 'username') {
          let comments = user[1];
          let story = user[2] === 'yes' ? ENTRIES_PER_STORY : 0;
          let total = parseInt(comments) + story;
          item.push(total)

        } else {
          item.push('total entries');
        }

        result.push(item);
      }
    });

    this.setState({data: result});
  }

  async getCsvData() {
    let csvData = await this.fetchCsv();

    Papa.parse(csvData, {
      complete: (results) => {
        this.getData(results);
      }
    })

    this.setAmountEntries();
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1>Instagram Giveaway Selector</h1>
          <hr/>
        </header>
        <div className="row row-1">
          <div className="col-md-4">
            <h2 className="post-title">{GIVEAWAY_NAME + " Post"}</h2>
            <img src="https://scontent-sea1-1.cdninstagram.com/v/t51.2885-15/e35/p1080x1080/131624716_181282537050771_43133989346128728_n.jpg?_nc_ht=scontent-sea1-1.cdninstagram.com&_nc_cat=103&_nc_ohc=Q3rqaFFubA4AX-vT6Jo&tp=1&oh=bfa0079cbd2abf0812d31124ceee5f50&oe=600D1661" alt="Instagram Giveaway"/>
          </div>
          <div className="col-md-4">
            <SelectWinner entries={this.state.data}/>
          </div>
          <div className="col-md-4">
            <EntryTable entries={this.state.data}/>
          </div>
        </div>
      </div>
    )
  }
}

class EntryTable extends Component {

  render() {
    let entries = this.props.entries;


    if (entries && Object.keys(entries).length !== 0) {
      let header = entries[0]
      entries = entries.slice(1)

      return (
        <div className="container">
          <h2>{'Entries for ' + GIVEAWAY_NAME + '!'}</h2>
          <table cellSpacing="0" cellPadding="5" border="1" width="450">
            <thead>
              <th>{header[0]}</th>
              <th>{header[1]}</th>
              <th>{header[2]}</th>
              <th>{header[3]}</th>
            </thead>
            <tbody>
              {
                entries.map((entry, i) => {
                  return (
                    <tr key={i}>
                      <th>{entry[0]}</th>
                      <th>{entry[1]}</th>
                      <th>{entry[2]}</th>
                      <th>{entry[3]}</th>
                    </tr>
                  )
                })
              }
            </tbody>
          </table>
        </div>
      )
    } else {
      return <div></div>;
    }
  }
}

class SelectWinner extends Component {
  constructor(props) {
    super(props);

    this.state = {
      winners: []
    }
  }

  getWinner(entries) {
    let winners = [];
    let numberOfWinners = NUM_WINNERS;
    let usernamePerEntry= [];

    // Add username times the number of total entries
    entries.forEach((user) => {
      for (let i = 0; i < user[3]; i++) {
        usernamePerEntry.push(user[0])
      }
    })

    // Select winners, winners can only win once
    while (numberOfWinners > 0) {
      let pick = Math.floor(Math.random() * usernamePerEntry.length);
      let winner = usernamePerEntry[pick];

      usernamePerEntry = usernamePerEntry.filter(username => username !== winner);

      winners.push(winner);
      numberOfWinners--;
    }

    this.setState({winners: winners});
  }

  render() {
    return (
      <div className="container">
        <h2>{'Select the winner(s) for ' + GIVEAWAY_NAME + '!'}</h2>
        <Button onClick={() => this.getWinner(this.props.entries)}>Select Winner(s)</Button>
        <hr/>
        {
          this.state.winners.map((winner) => {
            return (
              <h3 className="winner">{winner}</h3>
            )
          })
        }
      </div>
    );
  }
}

export default App;
