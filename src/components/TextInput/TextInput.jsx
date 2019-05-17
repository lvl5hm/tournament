import React, { Component } from 'react';
import './TextInput.css';

export default class TextInput extends Component {
  render() {
    return (
      this.props.bool ?
        <input
          type="checkbox"
          checked={Boolean(this.props.value)}
          onChange={e => this.props.onChange(e.target.checked)}
          className="boolInput"
        /> :
        <input
          placeholder={this.props.placeholder}
          value={this.props.value}
          onChange={e => this.props.onChange(e.target.value)}
          type="text"
          className="textInput"
        />
    );
  }
};
