import React, { Component } from 'react';
import Contact from './Contact'

export default class Contacts extends Component {

    state = {
        contacts: [
            {
                id:1,
                adresse:'0x0'
            }
        ]
    }

    render() {
        return (
            <div>
                {this.state.contacts.map(contact => (
                    <Contact
                        key={contact.id}
                        name={contact.id}
                        adresse={contact.adresse}
                    />
                ))}
            </div>
        )
    }
}