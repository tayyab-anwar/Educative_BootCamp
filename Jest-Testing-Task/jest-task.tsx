import React from 'react';

class Login extends React.Component {
  state = {
    email: '',
    password: '',
    loginMessage: '',
  };

  handleInputChange = (event) => {
    this.setState({
      [event.target.name]: event.target.value,
    });
  };

  handleButtonClick = () => {
    const loginMessage =
      "You're now logged into the account " + this.state.email + '!';
    this.setState({ loginMessage });
  };

  render() {
    return (
      <>
        <div>
          <h1> New Form </h1>
          <form className='login'>
            <label>Username</label>
            <input
              id='email'
              onBlur={this.handleInputChange}
              name='email'
              type='text'
              onChange={() => {}}
              value={this.state.email}
            />
            <label>Password</label>
            <input
              id='password'
              onBlur={this.handleInputChange}
              name='password'
              type='password'
            />
            <button onClick={this.handleButtonClick}>Submit</button>
          </form>
        </div>
        <div id='loginMessage'>
          <h1> {this.state.loginMessage} </h1>
        </div>
      </>
    );
  }
}
export default Login;
