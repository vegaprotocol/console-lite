import { useMemo } from 'react';
import classNames from 'classnames';
import { t } from '@vegaprotocol/react-helpers';
import MarketNameRenderer from './simple-market-renderer';
import SimpleMarketPercentChange from './simple-market-percent-change';
import { Icon } from '@vegaprotocol/ui-toolkit';
import type { ValueSetterParams } from 'ag-grid-community';
import { IconNames } from '@blueprintjs/icons';
import { IS_MARKET_TRADABLE, MARKET_STATES_MAP } from '../../constants';
import type { MarketWithCandles as Market } from '@vegaprotocol/market-list';

interface Props {
  isMobile: boolean;
}

const useColumnDefinitions = ({ isMobile }: Props) => {
  const columnDefs = useMemo(() => {
    return [
      {
        colId: 'market',
        headerName: t('Markets'),
        headerClass: 'uppercase',
        minWidth: isMobile ? 160 : 350,
        field: 'tradableInstrument.instrument.name',
        cellClass: 'overflow-visible',
        cellRenderer: ({ data }: { data: Market }) => (
          <MarketNameRenderer market={data} isMobile={isMobile} />
        ),
      },
      {
        colId: 'asset',
        headerName: t(isMobile ? 'Asset' : 'Settlement asset'),
        headerClass: 'uppercase',
        minWidth: isMobile ? 50 : 80,
        cellClass: 'uppercase flex h-full items-center',
        field: 'tradableInstrument.instrument.product.settlementAsset.symbol',
        cellRenderer: ({ data }: { data: Market }) => (
          <div
            className="grid h-full items-center text-center"
            title={
              data.tradableInstrument.instrument.product.settlementAsset.symbol
            }
          >
            <div className="truncate min-w-0">
              {
                data.tradableInstrument.instrument.product.settlementAsset
                  .symbol
              }
            </div>
          </div>
        ),
      },
      {
        colId: 'change',
        headerName: t(isMobile ? '24h' : '24h change'),
        headerClass: 'uppercase',
        field: 'percentChange',
        minWidth: isMobile ? 80 : 100,
        valueSetter: (params: ValueSetterParams): boolean => {
          const { oldValue, newValue, api, data } = params;
          if (oldValue !== newValue) {
            const newdata = { percentChange: newValue, ...data };
            api.applyTransaction({ update: [newdata] });
            return true;
          }
          return false;
        },
        cellRenderer: ({
          data,
          setValue,
        }: {
          data: Market;
          setValue: (arg: unknown) => void;
        }) =>
          data.candles && (
            <SimpleMarketPercentChange
              candles={data.candles}
              marketId={data.id}
              setValue={setValue}
            />
          ),
        comparator: (valueA: number | '-', valueB: number | '-') => {
          if (valueA === valueB) return 0;
          if (valueA === '-') {
            return -1;
          }
          if (valueB === '-') {
            return 1;
          }
          return valueA > valueB ? 1 : -1;
        },
      },
      {
        colId: 'status',
        headerName: t('Status'),
        field: 'state',
        headerClass: 'uppercase',
        minWidth: 100,
        cellRenderer: ({ data }: { data: Market }) => (
          <div className="uppercase flex h-full items-center justify-center">
            <div className="border text-center px-2 md:px-6 leading-4 md:leading-6">
              {MARKET_STATES_MAP[data.state || '']}
            </div>
          </div>
        ),
      },
      {
        colId: 'trade',
        headerName: '',
        headerClass: 'uppercase',
        sortable: false,
        width: isMobile ? 35 : 100,
        cellRenderer: ({ data }: { data: Market }) => (
          <div className="h-full flex h-full items-center justify-end">
            <div className="uppercase text-center pr-2">
              {!isMobile && t('Trade')}
              <Icon
                name={IconNames.ARROW_TOP_RIGHT}
                className={classNames('fill-current ml-5', {
                  'icon-green-hover': IS_MARKET_TRADABLE(data),
                })}
              />
            </div>
          </div>
        ),
      },
    ];
  }, [isMobile]);

  const defaultColDef = useMemo(() => {
    return {
      sortable: true,
      unSortIcon: true,
    };
  }, []);

  return { columnDefs, defaultColDef };
};

export default useColumnDefinitions;
