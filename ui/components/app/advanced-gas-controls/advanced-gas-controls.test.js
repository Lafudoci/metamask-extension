import React from 'react';
import configureMockStore from 'redux-mock-store';

import { GAS_ESTIMATE_TYPES } from '../../../../shared/constants/gas';
import { renderWithProvider } from '../../../../test/jest/rendering';

import AdvancedGasControls from './advanced-gas-controls.component';

const renderComponent = (props) => {
  const store = configureMockStore([])({
    metamask: { identities: [], provider: {} },
  });
  return renderWithProvider(<AdvancedGasControls {...props} />, store);
};

describe('AdvancedGasControls Component', () => {
  it('should render correctly', () => {
    expect(() => {
      renderComponent();
    }).not.toThrow();
  });

  it('should render maxFee and maxPriorityFee inputs', () => {
    const { queryByText } = renderComponent();
    expect(queryByText('Gas limit')).toBeInTheDocument();
    expect(queryByText('Gas price')).toBeInTheDocument();
  });
});
