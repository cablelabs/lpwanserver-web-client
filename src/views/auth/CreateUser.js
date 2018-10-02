import React, { Component } from "react";
import PropTypes from 'prop-types';
import UserForm from "../../components/UserForm";
import BreadCrumbs from '../../components/BreadCrumbs';

const breadCrumbs = [
  { to: `/?tab=users`, text: 'Home' }
];

class CreateUser extends Component {
  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  constructor() {
    super();
    this.state = {
      user: {},
    };
  }

  render() {
    return (
      <div>
        <BreadCrumbs trail={breadCrumbs} destination="Create User" />
        <div className="panel-body">
          <UserForm user={this.state.user}  update={true} />
        </div>
      </div>
    );
  }
}

export default CreateUser;
