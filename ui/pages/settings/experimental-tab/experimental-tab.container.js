import { compose } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import {
  setUseCollectibleDetection,
  setOpenSeaEnabled,
  setEIP1559V2Enabled,
  setImprovedTokenAllowanceEnabled,
} from '../../../store/actions';
import {
  getUseCollectibleDetection,
  getOpenSeaEnabled,
  getEIP1559V2Enabled,
  getIsImprovedTokenAllowanceEnabled,
} from '../../../selectors';
import ExperimentalTab from './experimental-tab.component';

const mapStateToProps = (state) => {
  return {
    useCollectibleDetection: getUseCollectibleDetection(state),
    openSeaEnabled: getOpenSeaEnabled(state),
    eip1559V2Enabled: getEIP1559V2Enabled(state),
    improvedTokenAllowanceEnabled: getIsImprovedTokenAllowanceEnabled(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setUseCollectibleDetection: (val) =>
      dispatch(setUseCollectibleDetection(val)),
    setOpenSeaEnabled: (val) => dispatch(setOpenSeaEnabled(val)),
    setEIP1559V2Enabled: (val) => dispatch(setEIP1559V2Enabled(val)),
    setImprovedTokenAllowanceEnabled: (val) =>
      dispatch(setImprovedTokenAllowanceEnabled(val)),
  };
};

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
)(ExperimentalTab);
