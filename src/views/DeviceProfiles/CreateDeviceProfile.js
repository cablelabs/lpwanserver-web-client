import React, {Component} from "react";
import {withRouter} from 'react-router-dom';
import sessionStore from "../../stores/SessionStore";
import ErrorStore from "../../stores/ErrorStore";
import NetworkSpecificUI from "../NetworkCustomizations/NetworkSpecificUI";
import PropTypes from 'prop-types';
import BreadCrumbs from '../../components/BreadCrumbs';

const breadCrumbs = [
  { to: `/?tab=deviceProfiles`, text: 'Home' }
];

class CreateDeviceProfile extends Component {
    static contextTypes = {
        router: PropTypes.object.isRequired
    };

    constructor() {
        super();
        let isGlobalAdmin = sessionStore.isGlobalAdmin();
        let isAdmin = sessionStore.isAdmin();
        this.state = {
            deviceProfile: {
                name: "",
                description: "",
                companyId: sessionStore.getUser().companyId
            },
            isGlobalAdmin: isGlobalAdmin,
            isAdmin: isAdmin,
            filterList: undefined
        };
        this.onSubmit = this.onSubmit.bind(this);

        this.networkTypeLinksComp = {};

    }

    onSubmit = async function (e) {
        e.preventDefault();
        let me = this;

        try {
            if (me.networkTypeLinksComp.onSubmit) {
                var ret = await me.networkTypeLinksComp.onSubmit();
                console.log("CreateDeviceProfile returns", ret);
            }
            else {
                console.log("No data to update!");
            }
            this.props.history.push('/applications');
        }
        catch (err) {
            ErrorStore.createError(err);
        }
    }

    sessionWatch() {
        this.setState({
            isGlobalAdmin: sessionStore.isGlobalAdmin(),
        });
    }

    componentWillMount() {
    }

    componentDidMount = async function (props) {
        // Check for a user, and redirect to login if none is set.
        let user = sessionStore.getUser();
        if (!user || !user.id || (user.id === 0)) {
            this.props.history.push("/login");
            return;
        }

        sessionStore.on("change", this.sessionWatch);
    };

    onChange(field, e) {
        let deviceProfile = this.state.deviceProfile;
        if ((e.target.type === "number") || (e.target.type === "select-one")) {
            deviceProfile[field] = parseInt(e.target.value, 10);
        } else if (e.target.type === "checkbox") {
            deviceProfile[field] = e.target.checked;
        } else {
            deviceProfile[field] = e.target.value;
        }
        this.setState({deviceProfile: deviceProfile});
    }

    render() {
        let me = this;

        return (
          <div>
              <BreadCrumbs trail={breadCrumbs} destination="Create Device Profile" />
              <div className="panel panel-default">
                  <div className="panel-heading">
                      <h3 className="panel-title panel-title-buttons">Create Device Profile</h3>
                  </div>
                  <form onSubmit={this.onSubmit}>
                      <div className="panel-body">
                          <div className="form-group">
                              <label className="control-label" htmlFor="name">Device Profile Name</label>
                              <input className="form-control" id="name" type="text"
                                     placeholder="e.g. 'temperature-sensors'" required
                                     value={this.state.deviceProfile.name || ''}
                                     onChange={this.onChange.bind(this, 'name')}/>
                          </div>

                          <div className="form-group">
                              <label className="control-label" htmlFor="description">Device Profile Description</label>
                              <input className="form-control" id="description" type="text"
                                     placeholder="e.g. 'IoT-Co LoRa temperature sensors'" required
                                     value={this.state.deviceProfile.description || ''}
                                     onChange={this.onChange.bind(this, 'description')}/>
                          </div>

                          <NetworkSpecificUI
                            ref={(comp) => {
                                me.networkTypeLinksComp = comp;
                            }}
                            dataName="DeviceProfile"
                            parentDataId={0}
                            referenceDataId={me.state.deviceProfile.companyId}
                            dataRec={me.state.deviceProfile}/>

                          <hr/>
                          <div className="btn-toolbar pull-right">
                              <button type="submit" className="btn btn-primary">Submit</button>
                          </div>
                      </div>
                  </form>

              </div>
          </div>
        )
          ;
    }
}

export default withRouter(CreateDeviceProfile);
