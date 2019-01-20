import React, {Component} from 'react';

export default class extends Component {
    render(){
        return(
            <button type={this.props.type} className={this.props.className} > {this.props.texto} </button>
        )
    }
}