import React, {Component} from "react";
import {withRouter} from 'react-router-dom';
import deviceStore from "../../stores/DeviceStore";
import ErrorStore from "../../stores/ErrorStore";
import applicationStore from '../../stores/ApplicationStore'
import NetworkSpecificUI from "../NetworkCustomizations/NetworkSpecificUI";
import PropTypes from 'prop-types';
import BreadCrumbs from '../../components/BreadCrumbs';
import connect from '../../utils/connectStore'
import {compose} from 'ramda'

class CreateDevice extends Component {
  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      device: {
          name: "",
          description: "",
          deviceModel: "",
          applicationId: props.match.params.applicationID,
      },
    };

    this.networkSpecificComps = {};

    this.onSubmit = this.onSubmit.bind(this);
  }

  componentDidMount () {
      const { application, match } = this.props
      if (!application) applicationStore.getApplication(match.params.applicationID)
  }

  onSubmit = async function(e) {
      e.preventDefault();
      let me = this;

      try {
          let id = await deviceStore.createDevice( this.state.device );
          // Need to update the ID so the app links can get created
          let dev = this.state.device;
          dev.id = id.id;
          this.setState( { device: dev }, async function() {
              try {
                  // Handle the network-specific data.
                  if ( me.networkSpecificComps.onSubmit ) {
                    await me.networkSpecificComps.onSubmit();
                  }
                  else {
                    console.log("No data to update!" );
                  }
                  me.props.history.push('/applications/' + me.props.match.params.applicationID );
              }
              catch( err ) {
                  ErrorStore.createError( err );
              }
          });
      }
      catch( err ) {
          ErrorStore.createError( err );
      }
  }

   onChange(field, e) {
    let device = this.state.device;

    if (e.target.type === "number") {
      device[field] = parseInt(e.target.value, 10);
    } else if (e.target.type === "checkbox") {
      device[field] = e.target.checked;
    } else {
      device[field] = e.target.value;
    }
    this.setState({device: device});
  }

  render() {
    const { props, state } = this
    const breadCrumbs = [
        { to: `/?tab=applications`, text: 'Home' },
        { to: `/applications/${props.application.id}`, text: props.application.name }
    ];
    return (
        <div>
            <BreadCrumbs trail={breadCrumbs} destination="Create Device" />
            <div className="panel panel-default">
                <div className="panel-heading">
                    <h3 className="panel-title panel-title-buttons">Create Device</h3>
                </div>
                <form onSubmit={this.onSubmit}>
                    <div className="panel-body">
                        <div className="form-group">
                            <label className="control-label" htmlFor="name">Device Name</label>
                            <input className="form-control"
                                   id="name"
                                   type="text"
                                   placeholder="e.g. 'Weather Station 1'"
                                   required
                                   value={this.state.device.name || ''}
                                   onChange={this.onChange.bind(this, 'name')}/>

                        </div>
                        <div className="form-group">
                            <label className="control-label" htmlFor="description">Device Description</label>
                            <input className="form-control"
                                   id="description"
                                   type="text"
                                   placeholder="e.g. 'Station on the roof'"
                                   required
                                   value={this.state.device.description || ''}
                                   onChange={this.onChange.bind(this, 'description')}/>

                        </div>
                        <div className="form-group">
                            <label className="control-label" htmlFor="deviceModel">Device Model</label>
                            <input className="form-control"
                                   id="deviceModel"
                                   type="text"
                                   placeholder="e.g. 'Release 1'"
                                   required
                                   value={this.state.device.deviceModel || ''}
                                   onChange={this.onChange.bind(this, 'deviceModel')}/>
                        </div>

                        <NetworkSpecificUI
                            ref={ (comp) => { this.networkSpecificComps = comp; }}
                            dataName="Device"
                            referenceDataId={state.device.applicationId}
                            dataRec={state.device} />

                        <hr/>
                        <div className="btn-toolbar pull-right">
                            <button type="submit" className="btn btn-primary">Submit</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
  }
}

export default compose(
    withRouter,
    connect({
        state: {
            application: {
                stream: props =>
                    applicationStore.applications.findOne(props.match.params.applicationID),
                map: val => val || {}
            }
        }
    })
)(CreateDevice)
