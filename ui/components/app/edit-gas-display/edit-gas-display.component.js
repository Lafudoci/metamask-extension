import React, { useContext, useLayoutEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import BigNumber from 'bignumber.js';
import {
  EDIT_GAS_MODES,
  CUSTOM_GAS_ESTIMATE,
} from '../../../../shared/constants/gas';

import Button from '../../ui/button';
import Typography from '../../ui/typography/typography';
import { getAdvancedInlineGasShown } from '../../../selectors';

import {
  COLORS,
  TYPOGRAPHY,
  FONT_WEIGHT,
} from '../../../helpers/constants/design-system';
import { areDappSuggestedAndTxParamGasFeesTheSame } from '../../../helpers/utils/confirm-tx.util';

import InfoTooltip from '../../ui/info-tooltip';
import ErrorMessage from '../../ui/error-message';
import AdvancedGasControls from '../advanced-gas-controls/advanced-gas-controls.component';
import ActionableMessage from '../../ui/actionable-message/actionable-message';

import { I18nContext } from '../../../contexts/i18n';

export default function EditGasDisplay({
  mode = EDIT_GAS_MODES.MODIFY_IN_PLACE,
  transaction,
  isGasEstimatesLoading,
  gasPrice,
  setGasPrice,
  gasLimit,
  setGasLimit,
  properGasLimit,
  estimateToUse,
  dappSuggestedGasFeeAcknowledged,
  setDappSuggestedGasFeeAcknowledged,
  onManualChange,
  minimumGasLimit,
  balanceError,
  estimatesUnavailableWarning,
  gasErrors,
  hasGasErrors,
  txParamsHaveBeenCustomized,
  isNetworkBusy,
}) {
  const t = useContext(I18nContext);
  const scrollRef = useRef(null);

  const showAdvancedInlineGasIfPossible = useSelector(
    getAdvancedInlineGasShown,
  );

  const showAdvancedForm =
    !estimateToUse || estimateToUse === CUSTOM_GAS_ESTIMATE;

  useLayoutEffect(() => {
    if (showAdvancedForm && scrollRef.current) {
      scrollRef.current.scrollIntoView?.();
    }
  }, [showAdvancedForm]);

  const dappSuggestedAndTxParamGasFeesAreTheSame =
    areDappSuggestedAndTxParamGasFeesTheSame(transaction);

  const requireDappAcknowledgement = Boolean(
    transaction?.dappSuggestedGasFees &&
      !dappSuggestedGasFeeAcknowledged &&
      dappSuggestedAndTxParamGasFeesAreTheSame,
  );

  let warningMessage;
  if (
    gasLimit !== undefined &&
    properGasLimit !== undefined &&
    new BigNumber(gasLimit).lessThan(new BigNumber(properGasLimit))
  ) {
    warningMessage = t('gasLimitRecommended', [properGasLimit]);
  }

  const showTopError =
    (balanceError || estimatesUnavailableWarning) &&
    (!isGasEstimatesLoading || txParamsHaveBeenCustomized);

  let errorKey;
  if (balanceError) {
    errorKey = 'insufficientFunds';
  } else if (estimatesUnavailableWarning) {
    errorKey = 'gasEstimatesUnavailableWarning';
  }

  return (
    <div className="edit-gas-display">
      <div className="edit-gas-display__content">
        {showTopError && (
          <div className="edit-gas-display__warning">
            <ErrorMessage errorKey={errorKey} />
          </div>
        )}
        {warningMessage && (
          <div className="edit-gas-display__warning">
            <ActionableMessage
              className="actionable-message--warning"
              message={warningMessage}
              iconFillColor="var(--color-warning-default)"
              useIcon
            />
          </div>
        )}
        {requireDappAcknowledgement && !isGasEstimatesLoading && (
          <div className="edit-gas-display__dapp-acknowledgement-warning">
            <ActionableMessage
              className="actionable-message--warning"
              message={t('gasDisplayDappWarning', [transaction.origin])}
              iconFillColor="var(--color-warning-default)"
              useIcon
            />
          </div>
        )}
        {isNetworkBusy ? (
          <div className="edit-gas-display__warning">
            <ActionableMessage
              className="actionable-message--warning"
              message={t('networkIsBusy')}
              iconFillColor="var(--color-warning-default)"
              useIcon
            />
          </div>
        ) : null}
        {mode === EDIT_GAS_MODES.SPEED_UP && (
          <div className="edit-gas-display__top-tooltip">
            <Typography
              color={COLORS.TEXT_DEFAULT}
              variant={TYPOGRAPHY.H8}
              fontWeight={FONT_WEIGHT.BOLD}
            >
              {t('speedUpTooltipText')}{' '}
              <InfoTooltip
                position="top"
                contentText={t('speedUpExplanation')}
              />
            </Typography>
          </div>
        )}
        {requireDappAcknowledgement && (
          <Button
            className="edit-gas-display__dapp-acknowledgement-button"
            onClick={() => setDappSuggestedGasFeeAcknowledged(true)}
          >
            {t('gasDisplayAcknowledgeDappButtonText')}
          </Button>
        )}
        {!requireDappAcknowledgement &&
          (showAdvancedForm ||
            hasGasErrors ||
            estimatesUnavailableWarning ||
            showAdvancedInlineGasIfPossible) && (
            <AdvancedGasControls
              gasLimit={gasLimit}
              setGasLimit={setGasLimit}
              gasPrice={gasPrice}
              setGasPrice={setGasPrice}
              onManualChange={onManualChange}
              minimumGasLimit={minimumGasLimit}
              gasErrors={gasErrors}
            />
          )}
      </div>
      <div ref={scrollRef} className="edit-gas-display__scroll-bottom" />
    </div>
  );
}

EditGasDisplay.propTypes = {
  mode: PropTypes.oneOf(Object.values(EDIT_GAS_MODES)),
  gasPrice: PropTypes.string,
  setGasPrice: PropTypes.func,
  gasLimit: PropTypes.number,
  setGasLimit: PropTypes.func,
  properGasLimit: PropTypes.number,
  estimateToUse: PropTypes.string,
  dappSuggestedGasFeeAcknowledged: PropTypes.bool,
  setDappSuggestedGasFeeAcknowledged: PropTypes.func,
  transaction: PropTypes.object,
  onManualChange: PropTypes.func,
  minimumGasLimit: PropTypes.string,
  balanceError: PropTypes.bool,
  estimatesUnavailableWarning: PropTypes.bool,
  hasGasErrors: PropTypes.bool,
  gasErrors: propTypes.object,
  txParamsHaveBeenCustomized: PropTypes.bool,
  isNetworkBusy: PropTypes.bool,
  isGasEstimatesLoading: PropTypes.bool,
};
