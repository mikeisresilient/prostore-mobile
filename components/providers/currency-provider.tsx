import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import { API_BASE_URL } from '@/lib/api';

export type Currency = 'USD' | 'NGN';

type CurrencyContextValue = {
  currency: Currency;
  exchangeRate: number;
  loading: boolean;
  setCurrency: (currency: Currency) => void;
  formatPrice: (usdAmount: number) => string;
};

const CurrencyContext =
  createContext<CurrencyContextValue | undefined>(
    undefined
  );

const CURRENCY_STORAGE_KEY = 'prostore-mobile-currency';

export function CurrencyProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [currency, setCurrencyState] =
    useState<Currency>('USD');

  const [exchangeRate, setExchangeRate] =
    useState(1);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadCurrency() {
      try {
        const storedCurrency =
          await AsyncStorage.getItem(
            CURRENCY_STORAGE_KEY
          );

        if (
          storedCurrency === 'USD' ||
          storedCurrency === 'NGN'
        ) {
          setCurrencyState(storedCurrency);
        }
      } catch (error) {
        console.error(
          'Failed to load currency:',
          error
        );
      }
    }

    loadCurrency();
  }, []);

  useEffect(() => {
    async function fetchExchangeRate() {
      if (currency === 'USD') {
        setExchangeRate(1);
        return;
      }

      try {
        setLoading(true);

        const response = await fetch(
          `${API_BASE_URL}/api/exchange-rate?currency=${currency}`
        );

        if (!response.ok) {
          throw new Error(
            'Failed to fetch exchange rate'
          );
        }

        const data: {
          baseCurrency: string;
          currency: Currency;
          rate: number;
        } = await response.json();

        setExchangeRate(data.rate);
      } catch (error) {
        console.error(
          'Exchange rate error:',
          error
        );

        setExchangeRate(1);
      } finally {
        setLoading(false);
      }
    }

    fetchExchangeRate();
  }, [currency]);

  async function setCurrency(currency: Currency) {
    setCurrencyState(currency);

    try {
      await AsyncStorage.setItem(
        CURRENCY_STORAGE_KEY,
        currency
      );
    } catch (error) {
      console.error(
        'Failed to save currency:',
        error
      );
    }
  }

  function formatPrice(usdAmount: number) {
    const amount =
      currency === 'USD'
        ? usdAmount
        : usdAmount * exchangeRate;

    return new Intl.NumberFormat(
      currency === 'NGN' ? 'en-NG' : 'en-US',
      {
        style: 'currency',
        currency,
        maximumFractionDigits: 2,
      }
    ).format(amount);
  }

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        exchangeRate,
        loading,
        setCurrency,
        formatPrice,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);

  if (!context) {
    throw new Error(
      'useCurrency must be used within a CurrencyProvider'
    );
  }

  return context;
}