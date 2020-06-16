import React , { Component }  from 'react';
import './App.css';

class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
     isTimerShow: false,
     time:0,
     trigger:false
    };

    this.runTimer = this.runTimer.bind(this);
    this.stopTimer = this.stopTimer.bind(this);
    this.hideTimer = this.hideTimer.bind(this);
    this.updateTime = this.updateTime.bind(this);
    
  }

  runTimer() {
    this.setState({ time: 0 });
    if(!this.state.trigger){
      this.interval= setInterval(()=>this.updateTime(),1000);
      this.setState({trigger:true});
    }
  }

  stopTimer() {
    if(this.state.trigger){
      clearInterval(this.interval);
      this.setState({trigger:false});
    }
  }

  updateTime(){
    this.setState((prevState, props) => {
      return { time: (prevState.time)+1};
    });
  }

  hideTimer() {
    this.setState({ isTimerShow: !this.state.isTimerShow});
    
  }
  render() {
    return (
      <div className="App">
        <h1>
          Hello How are you?
        </h1>
         <button onClick={this.runTimer}>
          Run Timer
        </button>
        <button onClick={this.stopTimer}>
          Stop Timer
        </button>
        <br></br>
        <br></br>
        <label>Show Elapsed Time</label><input type="checkbox" onClick={this.hideTimer} />
        <div>
          <br></br>
          {
            this.state.isTimerShow && 'Elapse Time is : ' + this.state.time + ' Sec'
      
          }
        </div>
      </div>
    );
  }
}


export default App;
