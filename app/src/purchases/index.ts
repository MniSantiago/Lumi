/**
 * Compras de Lumi Plus. La app solo conoce esta interfaz.
 *
 * - `mockPurchases` (ahora): precios fijos y compras que salen bien tras
 *   ~800 ms. Funciona en Expo Go y no cobra nada.
 * - RevenueCat (pendiente): `react-native-purchases`, que trae código nativo y
 *   por tanto necesita development build (`npx expo run:ios` o
 *   `eas build --profile development`). `getOfferings` saldrá de
 *   `Purchases.getOfferings()` (offering "default", paquetes `$rc_annual` y
 *   `$rc_monthly`), con los precios ya localizados por la App Store.
 *   Entonces `settings.isPlus` dejará de ser un ajuste guardado: vendrá del
 *   entitlement "plus" de `CustomerInfo` (y de su listener), no de la pantalla.
 *
 * Las chispas nunca se venden: aquí solo hay suscripciones a Plus.
 */

export type PlusPackageId = 'annual' | 'monthly';

export type PlusPackage = {
  id: PlusPackageId;
  /** "Anual", "Mensual". */
  title: string;
  /** Precio tal como lo da la tienda, ya formateado ("49,99 $"). */
  price: string;
  period: 'year' | 'month';
  /** Días de prueba gratis (0 si no tiene). */
  trialDays: number;
  /** Equivalente al mes ("4,17 $/mes"). */
  perMonth: string;
  /** Ahorro frente a pagar mes a mes, en % (solo el anual). */
  savingsPercent?: number;
};

export type PurchaseResult = { status: 'purchased' } | { status: 'cancelled' };
export type RestoreResult = { isPlus: boolean };

export interface PurchasesSource {
  getOfferings(): Promise<PlusPackage[]>;
  /** Lanza un error si la tienda falla; si el usuario cancela, devuelve `cancelled`. */
  purchase(packageId: PlusPackageId): Promise<PurchaseResult>;
  restore(): Promise<RestoreResult>;
}

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function createMockPurchases(): PurchasesSource {
  const packages: PlusPackage[] = [
    {
      id: 'annual',
      title: 'Anual',
      price: '49,99 $',
      period: 'year',
      trialDays: 7,
      perMonth: '4,17 $/mes',
      savingsPercent: 40,
    },
    { id: 'monthly', title: 'Mensual', price: '6,99 $', period: 'month', trialDays: 0, perMonth: '6,99 $/mes' },
  ];
  // Solo en memoria: lo que "compras" en esta sesión se puede restaurar.
  let purchased = false;

  return {
    async getOfferings() {
      await wait(150);
      return packages;
    },
    async purchase() {
      await wait(800);
      purchased = true;
      return { status: 'purchased' };
    },
    async restore() {
      await wait(800);
      return { isPlus: purchased };
    },
  };
}

export const purchases: PurchasesSource = createMockPurchases();
