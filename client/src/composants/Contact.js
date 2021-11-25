import React, { Component } from 'react'

export default class Contact extends Component {
    render() {
        return (
            <div className="card card-body mb-3">
                <h4>{this.props.name}</h4>
                <ul className="list-group">
                    <li className="list-group-item">
                        Adresse: {this.props.adresse}
                    </li>
                </ul>
            </div>
        )
    }
}