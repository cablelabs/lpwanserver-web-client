import React, {Component} from 'react';
import deviceStore from "../../../stores/DeviceStore";
import { assocPath, find, equals, mergeDeepRight, pathOr } from 'ramda'

// The LoRa device network settings data entry.
//
// Note that the naming of the component is always:
//    {NetworkType.name}DeviceNetworkSettings
class LoRaDeviceNetworkSettings extends Component {
    constructor( props ) {
        super( props );

        // initial state
        let initValue = {
            devEUI: '',
            skipFCntCheck: false
        };
        this.state = {
            enabled: false,
            wasEnabled: false,
            deviceProfileId: '',
            deviceProfileIdOrig: '',
            value: initValue,
            original: initValue,
            rec: null,
            deviceProfileList: [],
            loading: true
        };

        this.select = this.select.bind(this);
        this.deselect = this.deselect.bind(this);
        this.onActivationChange = this.onActivationChange.bind(this);
        this.onSubmit = this.onSubmit.bind( this );
        this.isChanged = this.isChanged.bind( this );
        this.isEnabled = this.isEnabled.bind( this );
    }

    deviceProfile () {
        return find(x => x.id === this.state.deviceProfileId, this.state.deviceProfileList)
    }

    async getDeviceProfiles(appId, netId) {
        try {
            const { records } = await deviceStore.getAllDeviceProfilesForAppAndNetType(appId, netId)
            if (!records.length) throw new Error('No records')
            return records
        } catch (err) {
            console.log( "Error getting device's possible deviceProfiles: " + err );
            return [{ id: 0, name: "(None Available)", networkSettings: {} }]
        }
    }

    async componentDidMount() {
        const { props, state } = this
        const deviceProfileList = await this.getDeviceProfiles(props.referenceDataId, props.netRec.id)
        let { rec, ...rest } = await this.getLinkRecordState(props, deviceProfileList);
        const deviceProfile = find(x => x.id === rest.deviceProfileId, deviceProfileList)
        const networkSettings = rec ? rec.networkSettings : {}
        const valueExt = this.getDeviceKeysOrActivation(deviceProfile, networkSettings, true)
        this.setState(
            {
              ...rest,
              rec,
              value: mergeDeepRight(rest.value || state.value, valueExt),
              deviceProfileList,
              loading: false
            },
            props.onChange
        )
    }

    async getLinkRecordState(props, deviceProfileList) {
        const deviceProfileId = pathOr('', [0, 'id'], deviceProfileList)
        // Skip trying to load new records
        if (!props.parentRec || (!props.parentRec.id || 0 === props.parentRec.id)) {
            // alert(JSON.stringify(props.parentRec))
            return { deviceProfileId }
        }
        try {
            const rec = await deviceStore.getDeviceNetworkTypeLink(props.parentRec.id, props.netRec.id)
            if (!rec) throw new Error('No device network type')
            // Javascript libraries can get whiny with null.
            if ( !rec.networkSettings ) rec.networkSettings = {};
            // We are saying we're enabled based on the database returned
            // data.  Let the parent know that they shoud rerender so show
            // that we are not enabled.  We do this from the setState
            // callback to ensure our state is, in fact, properly set.
            return {
                rec,
                value: rec.networkSettings,
                original: rec.networkSettings,
                enabled: true,
                wasEnabled: true,
                deviceProfileId: rec.deviceProfileId || deviceProfileId,
                deviceProfileIdOrig: rec.deviceProfileId
            }
        } catch (err) {
            console.log( "Failed to get deviceNetworkTypeLink:" + err );
            return { deviceProfileId }
        }
    }

    getDeviceKeys (mac, { deviceKeys = {}, devEUI = '' }) {
        const result = {}
        if (mac >= '1.0.0' && mac <= '1.02.0')   {
            result.appKey = deviceKeys.appKey
        } else if (mac >= '1.1.0' && mac < '1.2.0') {
            result.appKey = deviceKeys.appKey
            result.nwkKey = deviceKeys.nwkKey
        }
        result.devEUI = devEUI
        return result
    }

    getDeviceActivation (mac, { deviceActivation = {}, devEUI = '' }, toClientSchema) {
        const result = {}
        const copy = (key, defaultVal = '', srcKey) => {
            result[key] = deviceActivation[srcKey || key] || defaultVal
        }
        const copyKeys = (xs, defaultVal) => { xs.forEach(x => copy(x, defaultVal)) }
        if (mac >= '1.0.0' && mac <= '1.02.0') {
            copy('appSKey')
            if (toClientSchema) {
                copy('nwkSKey', '', 'sNwkSIntKey')
            } else {
                copy('nwkSEncKey', '', 'nwkSKey')
                copy('sNwkSIntKey', '', 'nwkSKey')
                copy('fNwkSIntKey', '', 'nwkSKey')
            }
        } else if (mac >= '1.1.0' && mac < '1.2.0') {
            copyKeys(['appSKey', 'nwkSEncKey', 'sNwkSIntKey', 'fNwkSIntKey'])
        }
        copy('devAddr')
        copyKeys(['fCntUp', 'aFCntDown'], 0)
        result.devEUI = devEUI
        return result
    }

    getDeviceKeysOrActivation (deviceProfile, ntwkSettings = {}, toClientSchema) {
        const { supportsJoin, macVersion: mac } = deviceProfile.networkSettings
        if (supportsJoin) {
            return { deviceKeys: this.getDeviceKeys(mac, ntwkSettings) }
        }
        return { deviceActivation: this.getDeviceActivation(mac, ntwkSettings, toClientSchema) }
    }

    deselect() {
        let me = this;
        return new Promise( function( resolve, reject ) {
            me.setState( { enabled: false }, () => resolve() );
        });
    }

    select() {
        let me = this;
        return new Promise( function( resolve, reject ) {
            me.setState( { enabled: true }, () => resolve() );
        });
    }

    getEventValue ({ target }) {
        switch (target.type) {
            case 'number': return parseInt(target.value, 10)
            case 'checkbox': return target.checked
            default: return target.value
        }
    }

    onActivationChange( field, e ) {
        e.preventDefault();
        this.setState({
            value: assocPath(field.split('.'), this.getEventValue(e), this.state.value)
        })
    }

    onSelectionChange(field, e) {
        this.setState({ [field]: e.target.value })
    }

    // Not an onSubmit for the framework, but called from the parent component
    // when the submit happens.  Do what needs to be done for this networkType.
    onSubmit = async function () {
        const { props, state } = this
        try {
            // Not enabled and record exists
            if (!state.enabled && state.rec) {
                await deviceStore.deleteDeviceNetworkType(state.rec.id)
                return props.netRec.name + " device deleted."
            }
            // Not Enabled and no record exists
            if (!state.enabled) return props.netRec.name + " is unchanged."
            // Enabled and no record exists
            const networkSettings = {
                ...state.value,
                ...this.getDeviceKeysOrActivation(this.deviceProfile(), state.value, false)
            }
            if (!state.rec) {
                await deviceStore.createDeviceNetworkType(
                    props.parentRec.id,
                    props.netRec.id,
                    state.deviceProfileId,
                    networkSettings
                )
                return props.netRec.name + " device created."
            // Enabled and record exists
            } else if (!equals(state.value, state.original)) {
                var updRec = {
                    id: state.rec.id,
                    networkSettings,
                    deviceProfileId: state.deviceProfileId,
                }
                await deviceStore.updateDeviceNetworkType(updRec)
                return props.netRec.name + " device updated."
            }
        } catch (err) {
            return props.netRec.name + " error: " + err
        }
    }

    isChanged() {
        const { state } = this
        return (state.enabled !== state.wasEnabled) ||
            (!equals(state.value, state.original)) ||
            (state.deviceProfileId !== state.deviceProfileIdOrig)
    }

    isEnabled() {
        return this.state.enabled;
    }

    getRandom( field, size, e ) {
       e.preventDefault();
       let rnd = '';
       const chars = '0123456789abcdef';
       for( let i = 0; i < size; ++i ) {
           rnd += chars.charAt( Math.floor( Math.random() * chars.length ) );
       }
       this.setState({ value: assocPath(field.split('.'), rnd, this.state.value) })
    }

    render() {
        const { state } = this
        const deviceProfile = this.deviceProfile() || {}
        let { supportsJoin, macVersion: mac } = deviceProfile.networkSettings || {}
        const isABP = !supportsJoin
        mac = mac || '0.0.0'

        if (this.state.loading) return false

        return !!state.enabled && (
            <div>
                <div className="form-group">
                  <label className="control-label" htmlFor="deviceProfileId">Device Profile</label>
                  <select className="form-control"
                          id="deviceProfileId"
                          required
                          value={state.deviceProfileId}
                          onChange={this.onSelectionChange.bind(this, 'deviceProfileId')}>
                    {state.deviceProfileList.map(x => <option value={x.id} key={"typeSelector" + x.id }>{x.name}</option>)}
                  </select>
                  <p className="help-block">
                    Specifies the Device Profile that defines the communications settings this device will use.
                  </p>
                </div>
                <div className="form-group">
                    <label className="control-label" htmlFor="devEUI">
                        The Device EUI identifying the device on a LoRa network
                    </label>
                    <input type="text"
                           className="form-control"
                           name="devEUI"
                           value={state.value.devEUI}
                           placeholder="0000000000000000"
                           pattern="[0-9a-fA-F]{16}"
                           onChange={this.onActivationChange.bind( this, 'devEUI' )} />
                    <p className="help-block">
                        A 16-hex-digit string used to identify the device
                        on LoRa networks.
                    </p>
                </div>
                {isABP &&
                <div>
                    <div className="form-group">
                        <label className="control-label"
                               htmlFor="devAddr">Device Address</label>
                        &emsp;
                        <button onClick={this.getRandom.bind(this, 'deviceActivation.devAddr', 8 )} className="btn btn-xs">generate</button>
                        <input className="form-control"
                               id="devAddr"
                               type="text"
                               placeholder="00000000"
                               pattern="[a-fA-F0-9]{8}"
                               required={isABP}
                               value={state.value.deviceActivation.devAddr || ''}
                               onChange={this.onActivationChange.bind(this, 'deviceActivation.devAddr')} />
                    </div>
                    { mac >= '1.0.0' && mac <= '1.02.0' &&
                    <div className="form-group">
                        <label className="control-label" htmlFor="nwkSKey">
                        Network session key
                        </label>
                        &emsp;
                        <button onClick={this.getRandom.bind(this, 'deviceActivation.nwkSKey', 32 )} className="btn btn-xs">generate</button>
                        <input className="form-control"
                            id="nwkSKey"
                            type="text"
                            placeholder="00000000000000000000000000000000"
                            pattern="[A-Fa-f0-9]{32}"
                            required={isABP}
                            value={state.value.deviceActivation.nwkSKey || ''}
                            onChange={this.onActivationChange.bind(this, 'deviceActivation.nwkSKey')} />
                    </div>
                    }
                    { mac >= '1.1.0' && mac <= '1.2.0' &&
                    <div>
                        <div className="form-group">
                            <label className="control-label" htmlFor="nwkSEncKey">
                            Network session encryption key
                            </label>
                            &emsp;
                            <button onClick={this.getRandom.bind(this, 'deviceActivation.nwkSEncKey', 32 )} className="btn btn-xs">generate</button>
                            <input className="form-control"
                                id="nwkSEncKey"
                                type="text"
                                placeholder="00000000000000000000000000000000"
                                pattern="[A-Fa-f0-9]{32}"
                                required={isABP}
                                value={state.value.deviceActivation.nwkSEncKey || ''}
                                onChange={this.onActivationChange.bind(this, 'deviceActivation.nwkSEncKey')} />
                        </div>
                        <div className="form-group">
                            <label className="control-label" htmlFor="sNwkSIntKey">
                                Service network session integrity key
                            </label>
                            &emsp;
                            <button onClick={this.getRandom.bind(this, 'deviceActivation.sNwkSIntKey', 32 )} className="btn btn-xs">generate</button>
                            <input className="form-control"
                                    id="sNwkSIntKey"
                                    type="text"
                                    placeholder="00000000000000000000000000000000"
                                    pattern="[A-Fa-f0-9]{32}"
                                    required={isABP}
                                    value={state.value.deviceActivation.sNwkSIntKey || ''}
                                    onChange={this.onActivationChange.bind(this, 'deviceActivation.sNwkSIntKey')} />
                        </div>
                        <div className="form-group">
                            <label className="control-label" htmlFor="fNwkSIntKey">
                                Forwarding network session integrity key
                            </label>
                            &emsp;
                            <button onClick={this.getRandom.bind(this, 'deviceActivation.fNwkSIntKey', 32 )} className="btn btn-xs">generate</button>
                            <input className="form-control"
                                id="fNwkSIntKey"
                                type="text"
                                placeholder="00000000000000000000000000000000"
                                pattern="[A-Fa-f0-9]{32}"
                                required={isABP}
                                value={state.value.deviceActivation.fNwkSIntKey || ''}
                                onChange={this.onActivationChange.bind(this, 'deviceActivation.fNwkSIntKey')} />
                        </div>
                    </div>
                    }
                    <div className="form-group">
                        <label className="control-label"
                               htmlFor="appSKey">Application session key</label>
                        &emsp;
                        <button onClick={this.getRandom.bind(this, 'deviceActivation.appSKey', 32 )} className="btn btn-xs">generate</button>
                        <input className="form-control"
                               id="appSKey"
                               type="text" placeholder="00000000000000000000000000000000"
                               pattern="[A-Fa-f0-9]{32}"
                               required={isABP}
                               value={state.value.deviceActivation.appSKey || ''}
                               onChange={this.onActivationChange.bind(this, 'deviceActivation.appSKey')} />
                    </div>
                    <div className="form-group">
                        <label className="control-label"
                               htmlFor="rx2DR">Uplink frame-counter</label>
                        <input className="form-control"
                               id="fCntUp"
                               type="number"
                               min="0"
                               required={isABP}
                               value={state.value.deviceActivation.fCntUp || 0}
                               onChange={this.onActivationChange.bind(this, 'deviceActivation.fCntUp')} />
                    </div>
                    <div className="form-group">
                        <label className="control-label"
                               htmlFor="rx2DR">Downlink frame-counter</label>
                        <input className="form-control"
                               id="aFCntDown"
                               type="number"
                               min="0"
                               required={isABP}
                               value={state.value.deviceActivation.aFCntDown || 0}
                               onChange={this.onActivationChange.bind(this, 'deviceActivation.aFCntDown')}
                             />
                    </div>
                    <div className="form-group">
                        <label className="control-label"
                               htmlFor="skipFCntCheck">
                            Disable frame-counter validation
                        </label>
                        <div className="checkbox">
                            <label>
                                <input type="checkbox"
                                       name="skipFCntCheck"
                                       id="skipFCntCheck"
                                       checked={!!state.value.skipFCntCheck}
                                       onChange={this.onActivationChange.bind(this, 'skipFCntCheck')}
                                     />
                                     Disable frame-counter validation
                            </label>
                        </div>
                        <p className="help-block">
                            Note that disabling the frame-counter validation
                            will compromise security as it enables people to
                            perform replay-attacks.
                        </p>
                    </div>
                </div>
                }
                {!isABP &&
                <div>
                    <div className="form-group">
                        <label className="control-label" htmlFor="appKey">
                            The Application Encryption Key for this device.
                        </label>
                        &emsp;
                        <button onClick={this.getRandom.bind(this, 'deviceKeys.appKey', 32 )} className="btn btn-xs">generate</button>
                        <input type="text"
                               className="form-control"
                               name="appKey" placeholder="00000000000000000000000000000000"
                               value={state.value.deviceKeys.appKey || ''}
                               pattern="[0-9a-fA-F]{32}"
                               onChange={this.onActivationChange.bind( this, 'deviceKeys.appKey')} />
                        <p className="help-block">
                            A 32-hex-digit string used to identify the device on LoRa networks.
                        </p>
                    </div>
                    { mac >= '1.1.0' && mac <= '1.2.0' &&
                    <div className="form-group">
                        <label className="control-label" htmlFor="nwkKey">
                        Network session key
                        </label>
                        &emsp;
                        <button onClick={this.getRandom.bind(this, 'deviceKeys.nwkKey', 32 )} className="btn btn-xs">generate</button>
                        <input className="form-control"
                            id="nwkKey"
                            type="text"
                            placeholder="00000000000000000000000000000000"
                            pattern="[A-Fa-f0-9]{32}"
                            value={state.value.deviceKeys.nwkKey || ''}
                            onChange={this.onActivationChange.bind(this, 'deviceKeys.nwkKey')} />
                    </div>
                    }
                </div>
                }
            </div>
        );
      }
}

export default LoRaDeviceNetworkSettings;
