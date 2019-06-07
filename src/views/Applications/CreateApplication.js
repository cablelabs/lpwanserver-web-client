import React, {Component} from "react";
import {withRouter} from 'react-router-dom';
import sessionStore from "../../stores/SessionStore";
import applicationStore from "../../stores/ApplicationStore";
import reportingProtocolStore from "../../stores/ReportingProtocolStore";
import ErrorStore from "../../stores/ErrorStore";
import NetworkSpecificUI from "../NetworkCustomizations/NetworkSpecificUI";
import PropTypes from 'prop-types';
import BreadCrumbs from '../../components/BreadCrumbs';

const breadCrumbs = [
  { to: `/?tab=applications`, text: 'Home' }
];


class CreateApplication extends Component {
    static contextTypes = {
        router: PropTypes.object.isRequired
    };

    constructor() {
        super();
        var isGlobalAdmin = sessionStore.isGlobalAdmin();
        var isAdmin = sessionStore.isAdmin();

        this.state = {
            application: {
                companyId: sessionStore.getUser().companyId,
            },
            isGlobalAdmin: isGlobalAdmin,
            isAdmin: isAdmin,
            filterList: undefined,
            reportingProtocols: [],
        };

        this.onSubmit = this.onSubmit.bind(this);

        this.networkSpecificComps = {};
    }

    async onSubmit (e) {
        e.preventDefault();

        try {
            let app = this.state.application;
            let { id } = await applicationStore.createApplication(app);
            app.id = id
            this.setState({ application: app }, async function () {
                // Handle the network-specific data.
                if (this.networkSpecificComps.onSubmit) {
                    await this.networkSpecificComps.onSubmit();
                }
                else {
                    console.log("No data to update!");
                }
                this.props.history.push('/?tab=applications');
            });
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

    componentWillReceiveProps(nextProps) {

        this.updatePage(nextProps);
    }

    updatePage(props) {
        this.sessionWatch();
    }

    componentDidMount = async function (props) {
        // Check for a user, and redirect to login if none is set.
        let user = sessionStore.getUser();
        if (!user || !user.id || (user.id === 0)) {
            this.props.history.push("/login");
            return;
        }

        sessionStore.on("change", this.sessionWatch);

        reportingProtocolStore.getReportingProtocols()
          .then(records => {
              this.setState({
                  application: { ...this.state.application, reportingProtocolId: records[0].id },
                  reportingProtocols: records
              })
          });
    };


    onChange(field, e) {
        let application = this.state.application;

        if ((e.target.type === "number")) {
            application[field] = parseInt(e.target.value, 10);
        } else if (e.target.type === "checkbox") {
            application[field] = e.target.checked;
        } else {
            application[field] = e.target.value;
        }
        this.setState({application: application});
    }

    render() {
        let me = this;
        if (!this.state.reportingProtocols.length) return false

        return (
          <div>
              <BreadCrumbs trail={breadCrumbs} destination="Create Application" />
              <div className="panel panel-default">
                  <div className="panel-heading">
                      <h3 className="panel-title panel-title-buttons">Create Application</h3>
                  </div>
                  <form onSubmit={this.onSubmit}>
                      <div className="panel-body">
                          <div className="form-group">
                              <label className="control-label" htmlFor="name">Application Name</label>
                              <input className="form-control" id="name" type="text"
                                     placeholder="e.g. 'temperature-sensor'" required
                                     value={this.state.application.name || ''}
                                     onChange={this.onChange.bind(this, 'name')}/>
                          </div>
                          <div className="form-group">
                              <label className="control-label" htmlFor="description">Application Description</label>
                              <input className="form-control" id="description" type="text"
                                     placeholder="e.g. 'Track temperature app'"
                                     value={this.state.application.description || ''}
                                     onChange={this.onChange.bind(this, 'description')}/>
                          </div>
                          <div className="form-group">
                              <label className="control-label" htmlFor="baseUrl">Post URL</label>
                              <input className="form-control" id="baseUrl" type="text"
                                     placeholder="URL to send sensor data to"
                                     required value={this.state.application.baseUrl || ''}
                                     onChange={this.onChange.bind(this, 'baseUrl')}/>
                          </div>

                          <div className="form-group">
                              <label className="control-label" htmlFor="reportingProtocolId">Reporting Protocol</label>
                              <select className="form-control"
                                      id="reportingProtocolId"
                                      required
                                      value={this.state.reportingProtocolId}
                                      onChange={this.onChange.bind(this, 'reportingProtocolId')}
                              >
                                  {this.state.reportingProtocols.map(rprot =>
                                    <option value={rprot.id} key={"typeSelector" + rprot.id}>{rprot.name}</option>
                                  )}
                              </select>
                              <p className="help-block">
                                  Specifies the Network Protocol that this application will use
                                  to communicate with the remote network. The selections here
                                  are limited by the choice of the network type above.
                              </p>
                          </div>

                          <NetworkSpecificUI
                            ref={(comp) => {
                                me.networkSpecificComps = comp;
                            }}
                            dataName="Application"
                            referenceDataId={me.state.application.companyId}
                            dataRec={me.state.application}/>

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

export default withRouter(CreateApplication);
