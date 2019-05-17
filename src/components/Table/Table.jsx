import React, { Component } from 'react';
import './Table.css';
import TextInput from '../TextInput/TextInput';
import Button from '../Button/Button';
import store from '../../store';
import time from '../../time';

class Cell extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: this.props.value
    };
  }

  componentWillReceiveProps(props) {
    this.state.value = props.value;
  }

  render() {
    return <td
      onClick={() => {
        if (this.props.onClick) {
          this.props.onClick();
        }
      }}
      className={`cell ${this.props.onChange ? 'input' : ''} ${this.props.sort ? 'sort' : ''}`}
      style={Object.assign({}, this.props.style, { width: this.props.width })}
      colSpan={this.props.colSpan}
      rowSpan={this.props.rowSpan}>
      {this.props.onChange ? <input
        onFocus={(e) => e.target.select()}
        className="cellValue cellInput"
        value={this.state.value}
        onBlur={(e) => {
          this.props.onChange(e.target.value);
        }}
        onChange={(e) => this.setState({ value: e.target.value })}
      /> : <div className="cellValue">{this.state.value}</div>}
    </td>
  }
}

export default class Table extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sortColumn: 0,
      fromMinToMax: true,
    };
  }

  renderRow(row, rowIndex, isTitle) {
    return <tr style={row.style} key={rowIndex} className="row">
      {row.cells.map((cell, cellIndex) => {
        let isSortColumn = isTitle && this.state.sortColumn === cellIndex;

        let onClick = null;
        if (isTitle) {
          onClick = () => {
            if (isSortColumn) {
              this.setState({ fromMinToMax: !this.state.fromMinToMax });
            } else {
              this.setState({ sortColumn: cellIndex, fromMinToMax: true });
            }
          };
        }

        return <Cell sort={isSortColumn} onClick={onClick} isTitle={isTitle} key={cellIndex} {...cell} />;
      })}
    </tr>;
  }

  sort(rows) {
    return rows.slice().sort((a, b) => {
      const aValue = a.cells[this.state.sortColumn].value || 0;
      const bValue = b.cells[this.state.sortColumn].value || 0;

      let result;
      if (this.state.fromMinToMax) {
        result = Number(aValue) - Number(bValue);
      } else {
        result = Number(bValue) - Number(aValue);
      }

      return result;
    });
  }

  sortTime(rows) {
    return rows.slice().sort((a, b) => {
      const aValue = time.parse(a.cells[this.state.sortColumn].value);
      const bValue = time.parse(b.cells[this.state.sortColumn].value);

      let result;
      if (this.state.fromMinToMax) {
        result = time.sort(aValue, bValue);
      } else {
        result = time.sort(bValue, aValue);
      }

      return result;
    });
  }

  render() {
    if (!this.props.rows.length) {
      return 'Не добавлена ни одна команда'
    }

    let sortedRows = this.props.rows.slice();

    const hasPairs = (this.props.rows.length > 1) && (this.props.rows[0].cells.length !== this.props.rows[1].cells.length);
    const isTime = time.isTime(this.props.rows[0].cells[this.state.sortColumn].value);

    if (!hasPairs) {
      if (isTime) {
        sortedRows = this.sortTime(sortedRows);
      } else {
        sortedRows = this.sort(sortedRows);
      }
    } else {
      const even = [];
      for (let i = 0; i < this.props.rows.length; i += 2) {
        even.push(Object.assign({ index: i }, this.props.rows[i]));
      }

      let sortedEven = even;
      if (isTime) {
        sortedEven = this.sortTime(sortedEven);
      } else {
        sortedEven = this.sort(sortedEven);
      }

      sortedRows = [];
      for (let i = 0; i < sortedEven.length; i++) {
        sortedRows.push(sortedEven[i]);
        sortedRows.push(this.props.rows[sortedEven[i].index + 1]);
      }
    }



    return <table className="table">
      <thead>{this.renderRow(this.props.titleRow, 0, true)}</thead>
      <tbody>
        {sortedRows.map((row, i) => this.renderRow(row, i))}
      </tbody>
    </table>
  }
}
