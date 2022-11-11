import React from 'react';
import configureMockStore from 'redux-mock-store';

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
});
