import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';

import { SECONDARY } from '../../helpers/constants/common';
import {
  checkNetworkAndAccountSupports1559,
  getShouldShowFiat,
} from '../../selectors';
import { isLegacyTransaction } from '../../helpers/utils/transactions.util';

import { useUserPreferencedCurrency } from '../useUserPreferencedCurrency';
import { hexWEIToDecGWEI } from '../../../shared/lib/transactions-controller-utils';
import { feeParamsAreCustom, getGasFeeEstimate } from './utils';

const getMaxPriorityFeePerGasFromTransaction = (
  transaction,
  gasFeeEstimates,
) => {
  if (gasFeeEstimates?.[transaction?.userFeeLevel]) {
    return gasFeeEstimates[transaction.userFeeLevel]
      .suggestedMaxPriorityFeePerGas;
  }
  const { maxPriorityFeePerGas, maxFeePerGas, gasPrice } =
    transaction?.txParams || {};
  return Number(
    hexWEIToDecGWEI(maxPriorityFeePerGas || maxFeePerGas || gasPrice),
  );
};

/**
 * @typedef {object} MaxPriorityFeePerGasInputReturnType
 * @property {DecGweiString} [maxPriorityFeePerGas] - the maxPriorityFeePerGas
 *  input value.
 * @property {string} [maxPriorityFeePerGasFiat] - the maxPriorityFeePerGas
 *  converted to the user's preferred currency.
 * @property {(DecGweiString) => void} setMaxPriorityFeePerGas - state setter
 *  method to update the maxPriorityFeePerGas.
 */

/**
 * @param options
 * @param options.supportsEIP1559V2
 * @param options.estimateToUse
 * @param options.gasEstimateType
 * @param options.gasFeeEstimates
 * @param options.gasLimit
 * @param options.transaction
 * @returns {MaxPriorityFeePerGasInputReturnType}
 */
export function useMaxPriorityFeePerGasInput({
  estimateToUse,
  gasEstimateType,
  gasFeeEstimates,
  supportsEIP1559V2,
  transaction,
}) {
  const supportsEIP1559 =
    useSelector(checkNetworkAndAccountSupports1559) &&
    !isLegacyTransaction(transaction?.txParams);

  const { currency: fiatCurrency, numberOfDecimals: fiatNumberOfDecimals } =
    useUserPreferencedCurrency(SECONDARY);

  const showFiat = useSelector(getShouldShowFiat);

  const initialMaxPriorityFeePerGas = supportsEIP1559
    ? getMaxPriorityFeePerGasFromTransaction(transaction, gasFeeEstimates)
    : 0;

  const [maxPriorityFeePerGas, setMaxPriorityFeePerGas] = useState(() => {
    if (initialMaxPriorityFeePerGas && feeParamsAreCustom(transaction)) {
      return initialMaxPriorityFeePerGas;
    }
    return null;
  });

  useEffect(() => {
    if (supportsEIP1559V2 && initialMaxPriorityFeePerGas) {
      setMaxPriorityFeePerGas(initialMaxPriorityFeePerGas);
    }
  }, [initialMaxPriorityFeePerGas, setMaxPriorityFeePerGas, supportsEIP1559V2]);

  const maxPriorityFeePerGasToUse =
    maxPriorityFeePerGas ??
    getGasFeeEstimate(
      'suggestedMaxPriorityFeePerGas',
      gasFeeEstimates,
      gasEstimateType,
      estimateToUse,
      initialMaxPriorityFeePerGas || 0,
    );

  return {
    maxPriorityFeePerGas: maxPriorityFeePerGasToUse,
    setMaxPriorityFeePerGas,
  };
}
