import type { CustomerInfo, PurchasesError, PurchasesPackage } from 'react-native-purchases';

import type { PlusPackage, PlusPackageId, PurchasesSource } from '@/purchases';

/**
 * Compras reales con RevenueCat (StoreKit). Solo en un development build o en
 * la versión de la tienda: en Expo Go no existe el módulo nativo.
 *
 * Configuración en RevenueCat: entitlement `plus`, offering por defecto con
 * los paquetes `$rc_annual` (7 días gratis) y `$rc_monthly`.
 */

const ENTITLEMENT = 'plus';

type RC = typeof import('react-native-purchases').default;

const isPlus = (info: CustomerInfo) => !!info.entitlements.active[ENTITLEMENT];

function trialDays(pkg: PurchasesPackage): number {
  const intro = pkg.product.introPrice;
  if (!intro || intro.price > 0) return 0;
  const perUnit: Record<string, number> = { DAY: 1, WEEK: 7, MONTH: 30, YEAR: 365 };
  return intro.periodNumberOfUnits * (perUnit[intro.periodUnit] ?? 0);
}

export function createRevenueCatPurchases(apiKey: string): PurchasesSource {
  // Carga perezosa: importar el módulo en Expo Go fallaría.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Purchases: RC = require('react-native-purchases').default;
  Purchases.configure({ apiKey });

  const packagesById = new Map<PlusPackageId, PurchasesPackage>();

  return {
    async getOfferings() {
      const offerings = await Purchases.getOfferings();
      const available = offerings.current?.availablePackages ?? [];
      const annual = available.find((p) => p.packageType === 'ANNUAL');
      const monthly = available.find((p) => p.packageType === 'MONTHLY');
      packagesById.clear();
      const result: PlusPackage[] = [];
      if (annual) {
        packagesById.set('annual', annual);
        const perMonth = annual.product.pricePerMonth;
        const savings =
          monthly && perMonth ? Math.round((1 - perMonth / monthly.product.price) * 100) : undefined;
        result.push({
          id: 'annual',
          title: 'Anual',
          price: annual.product.priceString,
          period: 'year',
          trialDays: trialDays(annual),
          perMonth: annual.product.pricePerMonthString ? `${annual.product.pricePerMonthString}/mes` : '',
          savingsPercent: savings && savings > 0 ? savings : undefined,
        });
      }
      if (monthly) {
        packagesById.set('monthly', monthly);
        result.push({
          id: 'monthly',
          title: 'Mensual',
          price: monthly.product.priceString,
          period: 'month',
          trialDays: trialDays(monthly),
          perMonth: `${monthly.product.priceString}/mes`,
        });
      }
      return result;
    },

    async purchase(packageId) {
      const pkg = packagesById.get(packageId);
      if (!pkg) throw new Error(`Paquete no disponible: ${packageId}`);
      try {
        const { customerInfo } = await Purchases.purchasePackage(pkg);
        return isPlus(customerInfo) ? { status: 'purchased' } : { status: 'cancelled' };
      } catch (e) {
        if ((e as PurchasesError).code === Purchases.PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
          return { status: 'cancelled' };
        }
        throw e;
      }
    },

    async restore() {
      return { isPlus: isPlus(await Purchases.restorePurchases()) };
    },

    async getIsPlus() {
      return isPlus(await Purchases.getCustomerInfo());
    },

    onPlusChange(listener) {
      const handler = (info: CustomerInfo) => listener(isPlus(info));
      Purchases.addCustomerInfoUpdateListener(handler);
      return () => void Purchases.removeCustomerInfoUpdateListener(handler);
    },

    async setUser(userId) {
      // Con cuenta, la suscripción queda ligada a ella (y se recupera en otro iPhone).
      if (userId) await Purchases.logIn(userId);
      else if (!(await Purchases.getCustomerInfo()).originalAppUserId.startsWith('$RCAnonymousID')) {
        await Purchases.logOut();
      }
    },
  };
}
