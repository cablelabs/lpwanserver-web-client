import React, {Component} from "react";
import PropTypes from 'prop-types';
import sessionStore from "../../stores/SessionStore";
import applicationStore from "../../stores/ApplicationStore";
import deviceStore from '../../stores/DeviceStore'
import BreadCrumbs from '../../components/BreadCrumbs';
import Papa from 'papaparse'
import { dispatch } from '../../dispatcher'
import { plural } from '../../utils/stringUtils'

const breadCrumbs = [
  { to: `/?tab=applications`, text: 'Home' }
];

const devicePlural = plural('device', 'devices')

class ImportDevices extends Component {
  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      application: {},
      deviceProfiles: [],
      isAdmin: sessionStore.isAdmin(),
      deviceProfileId: '',
      parseResult: { data: null, errors: [] },
      importResult: null,
    };

    this.setFormVal = this.setFormVal.bind(this)
    this.selectFile = this.selectFile.bind(this)
    this.importDevices = this.importDevices.bind(this)
  }

  sessionChange() {
    this.setState({ isAdmin: (sessionStore.isAdmin()) });
  }

  async componentDidMount() {
    const [ application, applicationNtls ] = await Promise.all([
      applicationStore.getApplication(this.props.match.params.applicationID),
      applicationStore.getAllApplicationNetworkTypes(this.props.match.params.applicationID)
    ])
    const ntIds = applicationNtls.map(x => x.networkTypeId)
    let { records: deviceProfiles } = await deviceStore.getAllDeviceProfiles()
    deviceProfiles = deviceProfiles.filter(x => ntIds.indexOf(x.networkTypeId) > -1)
    this.setState({
      application,
      deviceProfiles,
      deviceProfileId: (deviceProfiles[0] || {}).id || ''
    })

    this.sessionChange();

    sessionStore.on("change", this.sessionChange );
  }

  componentWillUnmount() {
    sessionStore.removeListener("change", this.sessionChange );
  }

  breadCrumbTrail () {
    const { application: app } = this.state
    return !app
      ? breadCrumbs
      : [ ...breadCrumbs, { to: `/applications/${app.id}`, text: app.name } ]
  }

  setFormVal (evt) {
    this.setState({ [evt.target.name]: evt.target.value })
  }

  selectFile (evt) {
    // Handles FileReader errors

    const error = x => dispatch({ type: 'CREATE_ERROR', error: x })
    // Put parsed data and parse errors in state
    const complete = x => {
      if (x.errors.length) console.log('Parsing Errors ', x.errors)
      this.setState({ parseResult: x })
    }
    // Parse file
    Papa.parse(evt.target.files[0], {
      header: true, delimiter: ",", complete, error, skipEmptyLines: true
    })
  }

  async importDevices () {
    this.setState({ importResult: null })
    try {
      const response = await applicationStore.importDevices({
        applicationId: this.props.match.params.applicationID,
        deviceProfileId: this.state.deviceProfileId,
        devices: this.state.parseResult.data
      })
      this.setState({ importResult: { response, ...this.analyzeImportResponse(response) } })
    }
    catch (err) {
      dispatch({ type: 'CREATE_ERROR', error: err })
    }
  }

  analyzeImportResponse (xs) {
    const errors = xs.filter(x => x.status === 'ERROR')
    const success = xs.filter(x => x.status === 'OK')
    let blob = new Blob([JSON.stringify(xs, null, 2)], { type: "application/json" })
    return { errors, success, url: URL.createObjectURL(blob) }
  }

  render() {
    const { state } = this
    const { importResult, parseResult } = state
    return (
      <div>
        <BreadCrumbs trail={this.breadCrumbTrail()} destination="Import Devices" />
        <div className="panel-body">
          <section>
            <h4>Import Devices</h4>
            <p><strong>Only IP-based devices currently supported for import.</strong></p>
            {importResult &&
              <div>
                {!!importResult.success.length &&
                  <p className="text-primary lead">{importResult.success.length} {devicePlural(importResult.success.length)} imported.</p>
                }
                {!!importResult.errors.length &&
                  <p className="text-danger lead">{importResult.errors.length} {devicePlural(importResult.errors.length)} failed.</p>
                }
                <div className="btn-group">
                  <a href={importResult.url} className="btn btn-default btn-sm" download="device-import.json">
                    Save response to file
                  </a>
                  <button
                    className="btn btn-default btn-sm"
                    onClick={() => this.setState({ importResult: null })}
                  >
                    Import more devices
                  </button>
                </div>
              </div>
            }
          </section>
          {!importResult &&
          <section className="mrg-t-10">
            <div className="form-group">
              <label className="control-label" htmlFor="deviceProfileId"><strong>Device Profile</strong></label>
              <select className="form-control"
                      id="deviceProfileId"
                      required
                      value={state.deviceProfileId}
                      name="deviceProfileId"
                      onChange={this.setFormVal}>
                {state.deviceProfiles.map(x => <option value={x.id} key={"typeSelector" + x.id }>{x.name}</option>)}
              </select>
              <p className="help-block">
                Specifies the Device Profile that defines the communications settings these devices will use.
              </p>
            </div>
          </section>
          }
          {!importResult &&
          <section className="mrg-t-10 pad-t-10 pad-b-10">
            <div className="form-group">
              <label className="control-label" htmlFor="deviceListFileInput"><strong>CSV File</strong></label>
              <p>CSV is required to have a "devEUI" column.  "name", "description", and "deviceModel" columns are optional.</p>
              <input
                type="file"
                className="form-control-file"
                id="deviceListFileInput"
                accept=".csv"
                key={`${!!importResult}`}
                onChange={this.selectFile}
              />
            </div>
            {!!parseResult.errors.length &&
              <div>
                <p className="text-danger"><strong>Errors occured while parsing the file.</strong></p>
                {parseResult.errors.map(x =>
                  <p className="text-danger" key={x.code} title={JSON.stringify(x)}>
                    Row {x.row}: {x.message}
                  </p>
                )}
              </div>
            }
          </section>
          }
          {!importResult &&
          <section className="mrg-t-10">
            <button
              className="btn btn-primary"
              disabled={!parseResult.data || !!parseResult.errors.length || importResult}
              onClick={this.importDevices}
            >
              Import Devices
            </button>
          </section>
          }
        </div>
      </div>
    );
  }
}

export default ImportDevices;
