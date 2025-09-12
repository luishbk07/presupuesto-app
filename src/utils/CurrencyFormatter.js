// Currency Formatter Utility - Single Responsibility Principle
class CurrencyFormatter {
  static formatAmount(amount, currency) {
    const currencies = {
      USD: { symbol: '$', locale: 'en-US' },
      DOP: { symbol: 'RD$', locale: 'es-DO' }
    };

    const currencyInfo = currencies[currency] || currencies.USD;
    
    if (currency === 'DOP') {
      return new Intl.NumberFormat(currencyInfo.locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount).replace(/^/, 'RD$');
    }
    
    return new Intl.NumberFormat(currencyInfo.locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  }

  static getCurrencySymbol(currency) {
    const symbols = {
      USD: '$',
      DOP: 'RD$'
    };
    return symbols[currency] || symbols.USD;
  }
}

export default CurrencyFormatter;
