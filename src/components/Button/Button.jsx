import React, { Component } from 'react';
import './Button.css';

export default class TextInput extends Component {
  render() {
    return (
      <button
        type="button"
        onClick={() => this.props.onClick()}
        className={`button ${this.props.className} ${this.props.disabled ? 'disabled' : ''} ${this.props.selected ? 'selected' : ''}`}
        disabled={this.props.disabled}
      >
        {this.props.children}
      </button>
    );
  }
};
TextInput.defaultProps = {
  className: '',
  onClick: () => { },
};