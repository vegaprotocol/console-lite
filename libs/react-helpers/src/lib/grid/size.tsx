import { Side } from '@vegaprotocol/types';
import type { ICellRendererParams } from 'ag-grid-community';
import classNames from 'classnames';
import { addDecimalsFormatNumber } from '../format';
import { negativeClassNames, positiveClassNames } from './cell-class-rules';

export const Size = ({
  value,
  side,
  positionDecimalPlaces = 0,
}: {
  value: string;
  side: Side;
  positionDecimalPlaces?: number;
}) => {
  return (
    <span
      data-testid="size"
      className={classNames('text-right', {
        [positiveClassNames]: side === Side.Buy,
        [negativeClassNames]: side === Side.Sell,
      })}
    >
      {side === Side.Buy ? '+' : side === Side.Sell ? '-' : ''}
      {addDecimalsFormatNumber(value, positionDecimalPlaces)}
    </span>
  );
};

export interface ISizeCellProps extends ICellRendererParams {
  value: number | string;
}

export const SizeCell = ({ value, data }: ISizeCellProps) => {
  if ((!value && value !== 0) || isNaN(Number(value))) {
    return <span data-testid="size">-</span>;
  }
  return (
    <Size
      value={value.toString()}
      side={data.side}
      positionDecimalPlaces={data.positionDecimalPlaces}
    />
  );
};

SizeCell.displayName = 'SizeCell';
